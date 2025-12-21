import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import ConversationsList from "../components/DashboardComponents/MessageComponents/ConversationsList"
import ChatWindow from "../components/DashboardComponents/MessageComponents/ChatWindow"
import { useAuth } from "@clerk/clerk-react"
import { getOrCreateConversation } from "../services/messagingService"

const MessagesLayout: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const location = useLocation();
  const { getToken, userId: myClerkId } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resolveConversation = async () => {
      const params = new URLSearchParams(location.search);
      const otherUserId = params.get('otherUserId');
      
      if (otherUserId) {
        const parsed = Number(otherUserId);
        if (!Number.isNaN(parsed)) {
          setSelectedConversation(parsed);
          return;
        }
      }

      // Check for clerkId params
      const prospectClerkId = params.get('prospectClerkId');
      const agentClerkId = params.get('agentClerkId');
      const rdvId = params.get('rdvId');

      if (prospectClerkId && agentClerkId) {
        setLoading(true);
        try {
          const token = await getToken();
          const conv = await getOrCreateConversation(
            prospectClerkId,
            agentClerkId,
            rdvId ? Number(rdvId) : undefined,
            token || undefined
          );
          
          if (conv) {
            // conv.senderId is prospect, conv.receiverId is agent
            // We want the one that is NOT us
            const otherDbId = myClerkId === prospectClerkId ? conv.receiverId : conv.senderId;
            setSelectedConversation(otherDbId);
          }
        } catch (err) {
          console.error("Error resolving conversation:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    resolveConversation();
  }, [location.search, getToken, myClerkId]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Desktop layout : 2 colonnes */}
      <div className="hidden md:flex w-1/3 border-r border-gray-200">
        <ConversationsList onSelectConversation={setSelectedConversation} />
      </div>

      <div className="hidden md:flex flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            Sélectionnez une conversation
          </div>
        )}
      </div>

      {/* Mobile layout : soit liste, soit chat */}
      <div className="flex md:hidden flex-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        {selectedConversation === null ? (
          <ConversationsList onSelectConversation={setSelectedConversation} />
        ) : (
          <ChatWindow
            conversationId={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        )}
      </div>
    </div>
  )
}

export default MessagesLayout


// const MessagesLayout: React.FC = () => {
  
//   return (
//     <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
//       {/* Sidebar - Conversations */}
//       <div className="hidden md:flex w-1/3 border-r bg-white">
//         <ConversationsList />
//       </div>

//       {/* Chat window */}
//       <div className="flex-1">
//         <ChatWindow />
//       </div>
//     </div>
//   )
// }

// export default MessagesLayout
