export default function LessonPage({ params }: { params: { slug: string } }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <button className="text-purple-600 hover:text-purple-700 font-medium">
            ← Retour au parcours
          </button>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Précédent
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90">
              Suivant
            </button>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Leçon: {params.slug}</h1>
        <p className="text-gray-600 mb-6">Module 2 - Leçon 3</p>
        
        <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-6 flex items-center justify-center">
          <span className="text-gray-500">Lecteur vidéo / Contenu de la leçon</span>
        </div>
        
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-4">Description de la leçon</h2>
          <p className="text-gray-600">
            Le contenu détaillé de la leçon sera affiché ici. Incluant les objectifs d'apprentissage,
            les points clés à retenir et les ressources complémentaires.
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Exercices pratiques</h3>
        <p className="text-gray-600">Les exercices et quiz seront affichés ici...</p>
      </div>
    </div>
  )
}
