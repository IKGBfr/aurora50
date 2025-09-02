# Rapport de Correction : Affichage de la Progression Réelle

## 1. Problème
Les cartes dans "Mes Piliers Actifs" sur la page de profil affichaient toujours "0% complété • 0/X leçons", même si l'utilisateur avait progressé.

## 2. Analyse
Le problème venait du fait que l'affichage se basait sur un calcul simple à partir du `progress_percentage` de la table `user_courses`, qui n'était pas toujours synchronisé avec le nombre réel de leçons complétées dans `user_lesson_progress`.

## 3. Solution Implémentée

### 3.1 Modification de l'interface `Course`
J'ai ajouté un champ optionnel `completedLessons` pour stocker le nombre réel de leçons complétées :
```typescript
interface Course {
  id: string
  title: string
  progress: number
  totalLessons: number
  completedLessons?: number
  currentLesson: string
  thumbnail: string
}
```

### 3.2 Mise à jour de la fonction `loadUserCourses`
La fonction a été entièrement réécrite pour :
1. Récupérer les cours de l'utilisateur depuis `user_courses`.
2. Pour chaque cours, faire une requête sur la table `lessons` pour obtenir le nombre total de leçons.
3. Faire une seconde requête sur `user_lesson_progress` pour obtenir le nombre de leçons avec le statut `completed`.
4. Calculer le `progressPercentage` basé sur ces données réelles.
5. Retourner un objet `Course` complet avec ces informations.

```typescript
const loadUserCourses = async (userId: string) => {
  const { data: userCourses } = await supabase
    .from('user_courses')
    .select('*')
    .eq('user_id', userId)
    .order('last_accessed_at', { ascending: false })

  if (userCourses && userCourses.length > 0) {
    const coursesWithProgress = await Promise.all(
      userCourses.map(async (course) => {
        const { data: courseLessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', course.course_id)
        
        const totalLessons = courseLessons?.length || course.total_lessons || 0
        
        const { data: completedLessons } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('status', 'completed')
          .in('lesson_id', courseLessons?.map(l => l.id) || [])
        
        const completedCount = completedLessons?.length || 0
        const progressPercentage = totalLessons > 0 
          ? Math.round((completedCount / totalLessons) * 100)
          : 0
        
        return {
          id: course.id,
          title: course.course_title || 'Cours',
          progress: progressPercentage,
          totalLessons: totalLessons,
          completedLessons: completedCount,
          currentLesson: `Leçon ${course.current_lesson || 1}`,
          thumbnail: course.course_thumbnail || ''
        }
      })
    )
    
    setRealCourses(coursesWithProgress)
  }
}
```

### 3.3 Mise à jour du JSX
L'affichage a été corrigé pour utiliser `completedLessons` s'il est disponible :
```typescript
<CourseProgress>
  <span>{course.progress}% complété</span>
  <span>•</span>
  <span>
    {course.completedLessons ?? Math.floor(course.totalLessons * course.progress / 100)}/{course.totalLessons} leçons
  </span>
</CourseProgress>
```

## 4. Résultat
Les cartes dans "Mes Piliers Actifs" affichent maintenant la progression exacte, par exemple "20% complété • 1/5 leçons", reflétant fidèlement les données de la base de données.
