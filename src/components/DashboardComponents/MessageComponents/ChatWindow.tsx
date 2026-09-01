import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import MessageInput from "./MessageInput"
import { useAuth } from "@clerk/clerk-react"
import { getConversationMessages, getMe, sendMessage, getUserById, type MessageDto } from "../../../services/messagingService"

interface Message {
  id: number
  sender: string
  text: string
  isCurrentUser: boolean
}

type Props = {
  conversationId: number // here: other user's DB id
  onBack: () => void
}

const ChatWindow: React.FC<Props> = ({ conversationId, onBack }) => {
  const { t } = useTranslation()
  const { getToken } = useAuth();
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<any>(null);

  const otherUserId = conversationId;

  const canLoad = useMemo(() => myUserId !== null && otherUserId !== null, [myUserId, otherUserId]);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const me = await getMe(token);
        setMyUserId(me.id);
      } catch (e) {
        console.error('Erreur chargement profil:', e);
      }
    };

    loadMe();
  }, [getToken]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!canLoad || myUserId === null) return;
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getConversationMessages(myUserId, otherUserId, token);
        const mapped = (data as MessageDto[]).map((m) => ({
          id: m.id,
          sender: m.senderId === myUserId ? t('messages.chat.you', 'Moi') : t('messages.chat.other', 'Interlocuteur'),
          text: m.content,
          isCurrentUser: m.senderId === myUserId,
        }));
        setMessages(mapped);
      } catch (e) {
        console.error('Erreur chargement conversation:', e);
      }
    };

    loadConversation();
  }, [canLoad, myUserId, otherUserId, t, getToken]);

  useEffect(() => {
    const loadOtherUser = async () => {
      if (!otherUserId) return;
      try {
        const token = await getToken();
        if (!token) return;
        const user = await getUserById(otherUserId, token);
        setOtherUser(user);
      } catch (e) {
        console.error('Erreur chargement interlocuteur:', e);
      }
    };
    loadOtherUser();
  }, [otherUserId, getToken]);

  const handleSendMessage = async (text: string) => {
    if (myUserId === null) return;
    try {
      const token = await getToken();
      if (!token) return;
      const saved = await sendMessage(myUserId, otherUserId, text, token);
      const newMessage: Message = {
        id: saved.id,
        sender: t('messages.chat.you', 'Moi'),
        text: saved.content,
        isCurrentUser: true,
      };
      setMessages((prev) => [...prev, newMessage]);
    } catch (e) {
      console.error('Erreur envoi message:', e);
    }
  }

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="md:hidden mr-2 text-blue-600 font-semibold"
            aria-label={t('messages.chat.backButton', 'Retour')}
          >
            ← {t('messages.chat.backButton', 'Retour')}
          </button>
          <h2 className="font-semibold">
            {t('messages.chat.conversation', 'Conversation avec')} {otherUser?.firstname || conversationId}
          </h2>
        </div>
        <div className="text-sm text-gray-500">
          {t('messages.status.online', 'En ligne')}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.isCurrentUser
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-800"
                }`}
            >
              {!msg.isCurrentUser && (
                <p className="font-semibold text-sm mb-1">{msg.sender}</p>
              )}
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t">
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}

export default ChatWindow


// import React from "react"
// import { useParams } from "react-router-dom"
// import MessageInput from "../MessageComponents/MessageInput"

// const mockMessages = [
//   { id: 1, sender: "me", text: "Bonjour 👋" },
//   { id: 2, sender: "them", text: "Salut ! Disponible pour une visite ?" },
//   { id: 3, sender: "me", text: "Oui, quand seriez-vous dispo ?" },
// ]

// const ChatWindow: React.FC = () => {
//   const { id } = useParams()

//   return (
//     <div className="flex flex-col h-full">
//       {/* Header */}
//       <div className="p-4 border-b bg-white">
//         <h2 className="font-semibold">Conversation #{id}</h2>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
//         {mockMessages.map(msg => (
//           <div
//             key={msg.id}
//             className={`max-w-xs p-2 rounded-lg ${
//               msg.sender === "me"
//                 ? "bg-blue-500 text-white self-end"
//                 : "bg-gray-200 text-gray-800 self-start"
//             }`}
//           >
//             {msg.text}
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <MessageInput />
//     </div>
//   )
// }

// export default ChatWindow
