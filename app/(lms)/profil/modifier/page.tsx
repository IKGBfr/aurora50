'use client'

import { useState } from 'react'

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: 'Marie Dupont',
    email: 'marie.dupont@email.com',
    bio: 'Passionnée par l\'apprentissage et le développement personnel. En route vers mes 50 ans avec sagesse et sérénité.',
    birthYear: '1974',
    interests: 'Méditation, Yoga, Lecture',
    notifications: true,
    emailUpdates: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Modifier Mon Profil
      </h1>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <form className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="text-6xl">👤</div>
            <button type="button" className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50">
              Changer l'avatar
            </button>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-1">
                Année de naissance
              </label>
              <input
                type="text"
                id="birthYear"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                Centres d'intérêt
              </label>
              <input
                type="text"
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                placeholder="Séparez par des virgules"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Notifications Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Préférences de notification</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleInputChange}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span>Notifications push</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="emailUpdates"
              checked={formData.emailUpdates}
              onChange={handleInputChange}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span>Mises à jour par email</span>
          </label>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Confidentialité</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Profil visible par les autres membres</span>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>Afficher ma progression</span>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90">
          Enregistrer les modifications
        </button>
        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Annuler
        </button>
      </div>
    </div>
  )
}
