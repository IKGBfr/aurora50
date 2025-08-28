'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function LMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/dashboard', label: 'Tableau de Bord', icon: '🏠' },
    { href: '/cours', label: 'Mon Parcours', icon: '📚' },
    { href: '/chat', label: 'Salle de Chat', icon: '💬' },
    { href: '/messages', label: 'Messages', icon: '✉️' },
    { href: '/membres', label: 'Membres', icon: '👥' },
    { href: '/profil/moi', label: 'Mon Profil', icon: '👤' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-purple-50 to-pink-50 border-r border-purple-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Aurora50 LMS
          </h1>
        </div>
        <nav className="px-4 pb-6">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all ${
                pathname === item.href
                  ? 'bg-white shadow-md text-purple-700'
                  : 'hover:bg-white/50 text-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
          <div className="text-gray-600">
            Bienvenue dans votre espace d'apprentissage
          </div>
          <button className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity">
            Se déconnecter
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
