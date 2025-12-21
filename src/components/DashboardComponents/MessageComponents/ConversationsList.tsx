import React from "react"
import { useTranslation } from "react-i18next"
import { useAuth } from "@clerk/clerk-react"
import { getUserConversations } from "../../../services/messagingService"

type Props = {
  onSelectConversation: (id: number) => void
}

const ConversationsList: React.FC<Props> = ({ onSelectConversation }) => {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const [conversations, setConversations] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadConversations = async () => {
      try {
        const token = await getToken()
        if (!token) return
        const data = await getUserConversations(token)
        setConversations(data)
      } catch (err) {
        console.error("Error loading conversations:", err)
        setError(t('messages.conversations.error', 'Erreur lors du chargement des conversations'))
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [getToken, t])

  return (
    <div className="w-full h-full overflow-y-auto bg-white">
      <h2 className="text-lg font-semibold p-4 border-b">
        {t('messages.conversations.title', 'Conversations')}
      </h2>
      {loading ? (
        <p className="p-4 text-gray-500 text-center">{t('common.loading', 'Chargement...')}</p>
      ) : error ? (
        <p className="p-4 text-red-500 text-center">{error}</p>
      ) : conversations.length === 0 ? (
        <p className="p-4 text-gray-500 text-center">
          {t('messages.conversations.noConversations', 'Aucune conversation')}
        </p>
      ) : (
        conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
            aria-label={`${t('messages.conversations.conversationWith', 'Conversation avec')} ${conv.otherUser.firstname}`}
          >
            <div className="flex items-center space-x-3">
              {conv.otherUser.avatar ? (
                <img src={conv.otherUser.avatar} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {conv.otherUser.firstname.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{conv.otherUser.firstname}</p>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
              </div>
            </div>
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
