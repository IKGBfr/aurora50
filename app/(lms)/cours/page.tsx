export default function CoursPage() {
  const modules = [
    { id: 1, title: "Module 1 : Introduction", progress: 100, lessons: 5 },
    { id: 2, title: "Module 2 : Les fondamentaux", progress: 60, lessons: 8 },
    { id: 3, title: "Module 3 : Approfondissement", progress: 0, lessons: 6 },
    { id: 4, title: "Module 4 : Pratique avancée", progress: 0, lessons: 10 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Mon Parcours
      </h1>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Progression générale</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full" style={{width: '40%'}}></div>
        </div>
        <p className="text-sm text-gray-600">40% du parcours complété</p>
      </div>

      <div className="space-y-4">
        {modules.map(module => (
          <div key={module.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold">{module.title}</h3>
              <span className="text-sm text-gray-500">{module.lessons} leçons</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all" 
                style={{width: `${module.progress}%`}}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{module.progress}% complété</p>
          </div>
        ))}
      </div>
    </div>
  )
}
