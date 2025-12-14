import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import ConversationsList from "../components/DashboardComponents/MessageComponents/ConversationsList"
import ChatWindow from "../components/DashboardComponents/MessageComponents/ChatWindow"

const MessagesLayout: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const otherUserId = params.get('otherUserId');
    if (otherUserId) {
      const parsed = Number(otherUserId);
      if (!Number.isNaN(parsed)) {
        setSelectedConversation(parsed);
      }
    }
  }, [location.search]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Desktop layout : 2 colonnes */}
      <div className="hidden md:flex w-1/3 border-r border-gray-200">
        <ConversationsList onSelectConversation={setSelectedConversation} />
      </div>

      <div className="hidden md:flex flex-1">
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
      <div className="flex md:hidden flex-1">
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
