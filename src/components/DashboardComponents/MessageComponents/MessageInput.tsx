import React, { useState } from "react"
import { useTranslation } from "react-i18next"

interface MessageInputProps {
  onSendMessage?: (message: string) => void
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const { t } = useTranslation()
  const [message, setMessage] = useState("")

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage) return
    
    console.log("Message envoyé:", trimmedMessage)
    if (onSendMessage) {
      onSendMessage(trimmedMessage)
    }
    setMessage("")
  }

  return (
    <form onSubmit={handleSend} className="flex items-center p-3 border-t bg-white">
      <input
        type="text"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={t('messages.chat.typeMessage', 'Écrire un message...')}
        className="flex-1 px-4 py-2 border rounded-lg mr-2 focus:outline-none focus:ring focus:ring-blue-300"
        aria-label={t('messages.chat.typeMessage', 'Écrire un message...')}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        aria-label={t('messages.actions.sendMessage', 'Envoyer le message')}
      >
        {t('messages.actions.send', 'Envoyer')}
      </button>
    </form>
  )
}

export default MessageInput
