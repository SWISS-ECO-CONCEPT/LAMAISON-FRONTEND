import React from "react"
import { useTranslation } from "react-i18next"

type Props = {
  onSelectConversation: (id: number) => void
}

const ConversationsList: React.FC<Props> = ({ onSelectConversation }) => {
  const { t } = useTranslation()
  
  const mockConversations = [
    { 
      id: 1, 
      name: t('messages.mockData.agent1', 'Agence Dupont'), 
      lastMessage: t('messages.mockData.message1', 'Bonjour, intéressé par l\'annonce ?') 
    },
    { 
      id: 2, 
      name: t('messages.mockData.agent2', 'Prospect Martin'), 
      lastMessage: t('messages.mockData.message2', 'Merci pour la visite !') 
    },
    { 
      id: 3, 
      name: t('messages.mockData.admin', 'Admin'), 
      lastMessage: t('messages.mockData.message3', 'Rappel: vos annonces expirent bientôt') 
    },
  ]

  return (
    <div className="w-full h-full overflow-y-auto bg-white">
      <h2 className="text-lg font-semibold p-4 border-b">
        {t('messages.conversations.title', 'Conversations')}
      </h2>
      {mockConversations.length === 0 ? (
        <p className="p-4 text-gray-500">
          {t('messages.conversations.noConversations', 'Aucune conversation')}
        </p>
      ) : (
        mockConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className="p-4 border-b hover:bg-gray-50 cursor-pointer"
            aria-label={`${t('messages.conversations.conversationWith', 'Conversation avec')} ${conv.name}`}
          >
            <p className="font-medium">{conv.name}</p>
            <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default ConversationsList

// import React from "react"
// import { Link } from "react-router-dom"

// const mockConversations = [
//   { id: 1, name: "Agent Immobilier A", lastMessage: "Bonjour, dispo pour visiter ?", time: "14:20" },
//   { id: 2, name: "Prospect B", lastMessage: "Merci pour l’info !", time: "Hier" },
//   { id: 3, name: "Admin", lastMessage: "Votre annonce est validée ✅", time: "2j" },
// ]

// const ConversationsList: React.FC = () => {
//   return (
//     <div className="h-full overflow-y-auto">
//       <h2 className="p-4 font-bold text-lg">Conversations</h2>
//       <ul>
//         {mockConversations.map(conv => (
//           <li key={conv.id}>
//             <Link
//               to={`/dashboard/messages/${conv.id}`}
//               className="flex items-center justify-between p-4 hover:bg-gray-100 border-b"
//             >
//               <div>
//                 <p className="font-semibold">{conv.name}</p>
//                 <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
//               </div>
//               <span className="text-xs text-gray-400">{conv.time}</span>
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }

// export default ConversationsList
