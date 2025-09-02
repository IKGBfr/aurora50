import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    // Récupérer les données du cours
    const { courseId, courseTitle, totalLessons, courseThumbnail } = await request.json()
    
    if (!courseId || !courseTitle) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }
    
    // Vérifier si le cours n'est pas déjà commencé
    const { data: existing } = await supabase
      .from('user_courses')
      .select('*')
      .match({
        user_id: user.id,
        course_id: courseId
      })
      .single()
    
    if (existing) {
      // Cours déjà commencé, mettre à jour last_accessed_at
      const { error: updateError } = await supabase
        .from('user_courses')
        .update({
          last_accessed_at: new Date().toISOString()
        })
        .match({
          user_id: user.id,
          course_id: courseId
        })
      
      if (updateError) {
        console.error('Erreur mise à jour last_accessed_at:', updateError)
      }
      
      return NextResponse.json({ 
        success: true, 
        alreadyStarted: true,
        data: existing 
      })
    }
    
    // Utiliser upsert pour éviter les erreurs de duplication
    const { data, error } = await supabase
      .from('user_courses')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        course_title: courseTitle,
        course_thumbnail: courseThumbnail || null,
        total_lessons: totalLessons || 0,
        current_lesson: 1,
        progress_percentage: 0,
        started_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,course_id',
        ignoreDuplicates: false
      })
      .select()
      .single()
    
    if (error) {
      console.error('Erreur création user_courses:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Créer une activité pour tracer le début du cours (si elle n'existe pas déjà récemment)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { data: recentActivity } = await supabase
      .from('user_activities')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'course_started')
      .eq('description', courseTitle)
      .gte('created_at', oneHourAgo)
      .single()
      
    if (!recentActivity) {
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          type: 'course_started',
          title: 'Nouveau pilier commencé',
          description: courseTitle,
          icon: '🚀',
          metadata: { courseId, courseTitle }
        })
    }
    
    // Optionnel : Mettre à jour les stats utilisateur
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (!stats) {
      // Créer les stats si elles n'existent pas
      await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          points: 10, // Points pour avoir commencé un cours
          level: 1,
          streak_days: 1
        })
    } else {
      // Ajouter des points pour avoir commencé un nouveau cours
      await supabase
        .from('user_stats')
        .update({
          points: (stats.points || 0) + 10,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
    }
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Pilier activé avec succès'
    })
    
  } catch (error) {
    console.error('Erreur start course:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
