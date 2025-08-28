'use client'

import { useState } from 'react'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(1)
  
  const conversations = [
    { id: 1, name: 'Sigrid (Coach)', lastMessage: 'N\'oubliez pas votre exercice...', time: '14:30', unread: 2, avatar: '👩‍🏫' },
    { id: 2, name: 'Marie Dupont', lastMessage: 'Merci pour ton aide !', time: 'Hier', unread: 0, avatar: '👩' },
    { id: 3, name: 'Jean Martin', lastMessage: 'On se retrouve demain ?', time: 'Lun', unread: 1, avatar: '👨' },
  ]

  const messages = [
    { id: 1, sender: 'Sigrid', content: 'Bonjour ! Comment avancez-vous sur le module 2 ?', time: '14:20', isMe: false },
    { id: 2, sender: 'Moi', content: 'Bonjour Sigrid ! J\'ai terminé les 3 premières leçons.', time: '14:25', isMe: true },
    { id: 3, sender: 'Sigrid', content: 'Excellent ! N\'oubliez pas votre exercice de méditation quotidienne.', time: '14:30', isMe: false },
  ]

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Messagerie Privée
      </h1>
      
      <div className="flex-1 bg-white rounded-xl shadow-sm flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="overflow-y-auto">
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedConversation === conv.id ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{conv.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500">{conv.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👩‍🏫</span>
              <div>
                <h2 className="font-semibold">Sigrid (Coach)</h2>
                <p className="text-xs text-green-600">En ligne</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md px-4 py-2 rounded-lg ${
                  msg.isMe 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.isMe ? 'text-purple-100' : 'text-gray-500'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
