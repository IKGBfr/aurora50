export default function ProfilePage({ params }: { params: { username: string } }) {
  const isOwnProfile = params.username === 'moi'
  
  const profileData = {
    name: isOwnProfile ? 'Mon Profil' : `Profil de ${params.username}`,
    avatar: '👤',
    level: 12,
    points: 850,
    joinDate: 'Janvier 2024',
    bio: 'Passionnée par l\'apprentissage et le développement personnel. En route vers mes 50 ans avec sagesse et sérénité.',
    achievements: [
      { id: 1, title: 'Première connexion', icon: '🎯' },
      { id: 2, title: '7 jours consécutifs', icon: '🔥' },
      { id: 3, title: 'Module 1 complété', icon: '✅' },
      { id: 4, title: 'Participante active', icon: '💬' },
    ],
    stats: {
      lessonsCompleted: 23,
      studyTime: '45h 30min',
      streak: 7,
      rank: 15,
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-6">
          <div className="text-6xl">{profileData.avatar}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{profileData.name}</h1>
                <p className="text-gray-600">Membre depuis {profileData.joinDate}</p>
              </div>
              {isOwnProfile && (
                <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90">
                  Modifier le profil
                </button>
              )}
            </div>
            <div className="mt-4 flex gap-6">
              <div>
                <span className="text-2xl font-bold text-purple-600">{profileData.level}</span>
                <p className="text-sm text-gray-600">Niveau</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-pink-600">{profileData.points}</span>
                <p className="text-sm text-gray-600">Points</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-purple-600">{profileData.stats.streak}</span>
                <p className="text-sm text-gray-600">Jours consécutifs</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold mb-2">À propos</h3>
          <p className="text-gray-600">{profileData.bio}</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{profileData.stats.lessonsCompleted}</p>
            <p className="text-sm text-gray-600">Leçons complétées</p>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <p className="text-2xl font-bold text-pink-600">{profileData.stats.studyTime}</p>
            <p className="text-sm text-gray-600">Temps d'étude</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">#{profileData.stats.rank}</p>
            <p className="text-sm text-gray-600">Classement</p>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <p className="text-2xl font-bold text-pink-600">4</p>
            <p className="text-sm text-gray-600">Badges</p>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profileData.achievements.map(achievement => (
            <div key={achievement.id} className="text-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <p className="text-sm font-medium">{achievement.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
