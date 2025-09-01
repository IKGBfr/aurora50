'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'

interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  started_at?: string
  completed_at?: string
  last_video_position: number
  completion_percentage: number
  watch_time_seconds: number
  created_at: string
  updated_at: string
}

export function useLessonProgress(lessonId: string | undefined) {
  const supabase = createClient()
  const { user } = useAuth()
  const [progress, setProgress] = useState<LessonProgress | null>(null)
  const [loading, setLoading] = useState(true)

  // Récupérer la progression existante
  useEffect(() => {
    if (!user || !lessonId) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('user_lesson_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Erreur lors de la récupération de la progression:', error)
        }
        
        if (data) {
          setProgress(data)
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [user, lessonId, supabase])

  // Marquer comme commencé
  const startLesson = async () => {
    if (!user || !lessonId) return null

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'in_progress',
          started_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Erreur lors du démarrage de la leçon:', error)
        return null
      }

      if (data) {
        setProgress(data)
      }
      return data
    } catch (error) {
      console.error('Erreur:', error)
      return null
    }
  }

  // Sauvegarder la position vidéo
  const saveVideoPosition = async (position: number, duration: number) => {
    if (!user || !lessonId || !duration) return

    const percentage = Math.round((position / duration) * 100)
    const isCompleted = percentage >= 90
    
    try {
      const updateData: any = {
        user_id: user.id,
        lesson_id: lessonId,
        last_video_position: Math.floor(position),
        completion_percentage: percentage,
        watch_time_seconds: Math.floor(position),
        status: isCompleted ? 'completed' : 'in_progress'
      }

      if (isCompleted) {
        updateData.completed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert(updateData, {
          onConflict: 'user_id,lesson_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de la sauvegarde de la position:', error)
        return
      }

      // Si complété et pas déjà marqué comme tel, attribuer les points
      if (isCompleted && progress?.status !== 'completed') {
        await addPoints(10)
        await addActivity('lesson_completed', lessonId)
      }

      if (data) {
        setProgress(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Marquer comme complété manuellement
  const completeLesson = async () => {
    if (!user || !lessonId) return

    try {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'completed',
          completion_percentage: 100,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de la complétion de la leçon:', error)
        return
      }

      // Attribuer 10 points si pas déjà fait
      if (progress?.status !== 'completed') {
        await addPoints(10)
        await addActivity('lesson_completed', lessonId)
      }
      
      if (data) {
        setProgress(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Ajouter des points à l'utilisateur
  const addPoints = async (points: number) => {
    if (!user) return

    try {
      // Récupérer les stats actuelles
      const { data: stats, error: fetchError } = await supabase
        .from('user_stats')
        .select('points, total_lessons_completed')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erreur lors de la récupération des stats:', fetchError)
        return
      }

      const currentPoints = stats?.points || 0
      const currentLessons = stats?.total_lessons_completed || 0

      // Mettre à jour ou créer les stats
      const { error: updateError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          points: currentPoints + points,
          total_lessons_completed: currentLessons + 1
        }, {
          onConflict: 'user_id'
        })

      if (updateError) {
        console.error('Erreur lors de la mise à jour des points:', updateError)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  // Ajouter une activité
  const addActivity = async (type: string, lessonId: string) => {
    if (!user) return

    try {
      // Récupérer les infos de la leçon
      const { data: lesson } = await supabase
        .from('lessons')
        .select('title')
        .eq('id', lessonId)
        .single()

      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          type: type,
          title: 'Leçon complétée',
          description: lesson?.title || 'Une leçon a été complétée',
          icon: '✅',
          metadata: { lesson_id: lessonId }
        })
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'activité:', error)
    }
  }

  return {
    progress,
    loading,
    startLesson,
    saveVideoPosition,
    completeLesson,
    isCompleted: progress?.status === 'completed',
    completionPercentage: progress?.completion_percentage || 0,
    lastVideoPosition: progress?.last_video_position || 0
  }
}
