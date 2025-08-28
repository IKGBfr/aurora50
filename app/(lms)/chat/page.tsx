'use client'

import { useState } from 'react'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  
  const messages = [
    { id: 1, user: 'Marie', message: 'Bonjour tout le monde !', time: '10:30', avatar: '👩' },
    { id: 2, user: 'Jean', message: 'Salut Marie ! Comment vas-tu ?', time: '10:32', avatar: '👨' },
    { id: 3, user: 'Sophie', message: 'Quelqu\'un a terminé le module 3 ?', time: '10:35', avatar: '👩‍🦰' },
  ]

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-8rem)]">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Salle de Chat
      </h1>
      
      <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold">Chat Général Aurora50</h2>
              <p className="text-sm text-gray-600">23 membres en ligne</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                🔔
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className="flex gap-3">
              <div className="text-2xl">{msg.avatar}</div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{msg.user}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <p className="text-gray-700">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
  )
}
