'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'

export default function MembresPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const members = [
    { id: 'member-1', name: 'Marie Dupont', role: 'Étudiante', level: 'Niveau 12', status: 'En ligne' },
    { id: 'member-2', name: 'Jean Martin', role: 'Étudiant', level: 'Niveau 8', status: 'En ligne' },
    { id: 'member-3', name: 'Sophie Bernard', role: 'Étudiante', level: 'Niveau 15', status: 'Hors ligne' },
    { id: 'member-4', name: 'Pierre Durand', role: 'Étudiant', level: 'Niveau 6', status: 'En ligne' },
    { id: 'member-5', name: 'Lucie Moreau', role: 'Étudiante', level: 'Niveau 10', status: 'En ligne' },
    { id: 'member-6', name: 'Sigrid Larsen', role: 'Coach', level: 'Expert', status: 'En ligne' },
  ]

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Annuaire des Membres
      </h1>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              <span className="font-semibold text-purple-600">{members.length}</span> membres dans la communauté
            </p>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un membre..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <Avatar 
                  userId={member.id}
                  fullName={member.name}
                  size="medium"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                  <p className="text-sm text-purple-600 font-medium">{member.level}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      member.status === 'En ligne' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-gray-500">{member.status}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Classement de la semaine</h2>
        <div className="space-y-3">
          {members.slice(0, 5).map((member, index) => (
            <div key={member.id} className="flex items-center gap-4">
              <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                #{index + 1}
              </span>
              <Avatar 
                userId={member.id}
                fullName={member.name}
                size="small"
              />
              <div className="flex-1">
                <p className="font-medium">{member.name}</p>
              </div>
              <span className="text-purple-600 font-semibold">
                {450 - index * 50} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
