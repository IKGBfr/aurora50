export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Tableau de Bord
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
          <h3 className="text-lg font-semibold mb-2">Progression</h3>
          <p className="text-3xl font-bold text-purple-600">45%</p>
          <p className="text-sm text-gray-600">Du parcours complété</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
          <h3 className="text-lg font-semibold mb-2">Temps d'étude</h3>
          <p className="text-3xl font-bold text-pink-600">12h 30min</p>
          <p className="text-sm text-gray-600">Cette semaine</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
          <h3 className="text-lg font-semibold mb-2">Points</h3>
          <p className="text-3xl font-bold text-purple-600">850</p>
          <p className="text-sm text-gray-600">Points d'expérience</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Prochaines leçons</h2>
        <p className="text-gray-600">Vos prochaines leçons s'afficheront ici...</p>
      </div>
    </div>
  )
}
