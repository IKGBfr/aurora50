#!/usr/bin/env tsx

/**
 * Script alternatif pour appliquer la migration des cours
 * Utilise l'API Supabase directement sans RPC
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('🚀 Application de la migration Section Cours MVP...\n')

  try {
    // 1. Vérifier et créer les nouvelles tables
    console.log('📦 Création des nouvelles tables...')
    
    // Note: Les CREATE TABLE IF NOT EXISTS ont déjà été exécutés
    // On va vérifier leur existence et insérer les données

    // 2. Nettoyer les données existantes
    console.log('\n🧹 Nettoyage des données existantes...')
    
    // D'abord récupérer les IDs des cours à supprimer
    const { data: coursesToDelete } = await supabase
      .from('courses')
      .select('id')
      .in('pillar_number', [1, 3])
    
    if (coursesToDelete && coursesToDelete.length > 0) {
      // Supprimer les leçons de ces cours
      const courseIds = coursesToDelete.map(c => c.id)
      const { error: deleteLessonsError } = await supabase
        .from('lessons')
        .delete()
        .in('course_id', courseIds)
      
      if (deleteLessonsError) {
        console.log('  ⚠️ Erreur suppression leçons:', deleteLessonsError.message)
      }
    }
    
    // Supprimer les cours piliers 1 et 3
    const { error: deleteCoursesError } = await supabase
      .from('courses')
      .delete()
      .in('pillar_number', [1, 3])
    
    if (deleteCoursesError) {
      console.log('  ⚠️ Erreur suppression cours:', deleteCoursesError.message)
    }

    // 3. Insérer les nouveaux piliers
    console.log('\n📚 Insertion des 2 piliers pilotes...')
    
    const pilier1 = {
      title: 'Libération Émotionnelle',
      description: 'Libérez-vous des blocages invisibles qui vous retiennent depuis des années. Ce pilier fondamental vous guide à travers un processus de guérison profonde pour retrouver votre liberté intérieure et votre joie de vivre.',
      pillar_number: 1,
      slug: 'liberation-emotionnelle',
      duration_weeks: 4,
      emoji: '🦋',
      color_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      order_index: 1,
      is_published: true,
      short_description: 'Guérir et pardonner pour renaître',
      thumbnail_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800'
    }

    const { data: course1, error: error1 } = await supabase
      .from('courses')
      .insert(pilier1)
      .select()
      .single()

    if (error1) {
      console.log('  ❌ Erreur insertion Pilier 1:', error1.message)
    } else {
      console.log('  ✅ Pilier 1 créé:', course1.title)
    }

    const pilier3 = {
      title: 'Renaissance Professionnelle',
      description: 'Réinventez votre carrière et découvrez vos talents cachés après 50 ans. Ce pilier vous accompagne dans votre transformation professionnelle avec des stratégies concrètes et adaptées à votre expérience unique.',
      pillar_number: 3,
      slug: 'renaissance-professionnelle',
      duration_weeks: 6,
      emoji: '💼',
      color_gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      order_index: 2,
      is_published: true,
      short_description: 'Vos talents valent de l\'or',
      thumbnail_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800'
    }

    const { data: course3, error: error3 } = await supabase
      .from('courses')
      .insert(pilier3)
      .select()
      .single()

    if (error3) {
      console.log('  ❌ Erreur insertion Pilier 3:', error3.message)
    } else {
      console.log('  ✅ Pilier 3 créé:', course3.title)
    }

    // 4. Insérer les leçons
    console.log('\n📝 Insertion des leçons...')

    if (course1) {
      const lessons1 = [
        {
          course_id: course1.id,
          lesson_number: 1,
          title: 'Comprendre ses blocages invisibles',
          slug: 'blocages-invisibles',
          is_free: true,
          youtube_video_id: 'dQw4w9WgXcQ',
          duration_minutes: 12,
          lesson_type: 'video',
          markdown_content: `# Comprendre ses blocages invisibles

## Introduction

Dans cette première leçon gratuite, nous allons explorer ensemble les mécanismes cachés qui vous empêchent d'avancer.

## Les 3 types de blocages

### 1. Blocages émotionnels
Ces blocages sont souvent liés à des expériences passées non résolues.

### 2. Blocages mentaux
Les croyances limitantes qui se sont installées au fil des années.

### 3. Blocages énergétiques
Les tensions accumulées dans le corps qui bloquent votre énergie vitale.

## Exercice pratique

Prenez un moment pour identifier vos propres blocages...`,
          preview_text: 'Cette leçon gratuite vous révèle les mécanismes cachés qui vous empêchent d\'avancer et vous donne les clés pour commencer votre libération.'
        },
        {
          course_id: course1.id,
          lesson_number: 2,
          title: 'Guérir la petite fille intérieure',
          slug: 'guerir-enfant-interieur',
          is_free: false,
          youtube_video_id: 'VIDEO_ID_2',
          duration_minutes: 15,
          lesson_type: 'video',
          markdown_content: `# Guérir la petite fille intérieure

## Retrouver l'enfant en vous

Cette leçon vous guide dans un processus de reconnexion avec votre enfant intérieur...`,
          preview_text: 'Apprenez à reconnaître et guérir les blessures de votre enfant intérieur pour libérer votre potentiel.'
        },
        {
          course_id: course1.id,
          lesson_number: 3,
          title: 'Pardonner (aux autres et à soi)',
          slug: 'pardon-liberation',
          is_free: false,
          youtube_video_id: 'VIDEO_ID_3',
          duration_minutes: 14,
          lesson_type: 'video',
          markdown_content: `# Le pouvoir du pardon

## Pourquoi le pardon est essentiel

Le pardon n'est pas pour l'autre, c'est pour vous...`,
          preview_text: 'Le pardon est la clé de votre libération. Découvrez comment pardonner vraiment et définitivement.'
        },
        {
          course_id: course1.id,
          lesson_number: 4,
          title: 'Technique EFT adaptée 50+',
          slug: 'eft-technique',
          is_free: false,
          youtube_video_id: 'VIDEO_ID_4',
          duration_minutes: 18,
          lesson_type: 'video',
          markdown_content: `# EFT pour les 50+

## Une méthode adaptée à vos besoins

L'EFT (Emotional Freedom Technique) spécialement conçue pour les femmes de plus de 50 ans...`,
          preview_text: 'L\'EFT spécialement conçu pour les femmes 50+ : libérez vos émotions en douceur.'
        },
        {
          course_id: course1.id,
          lesson_number: 5,
          title: 'Rituel de libération du passé',
          slug: 'rituel-liberation',
          is_free: false,
          youtube_video_id: 'VIDEO_ID_5',
          duration_minutes: 20,
          lesson_type: 'video',
          markdown_content: `# Rituel de libération

## Créer votre cérémonie personnelle

Un rituel puissant pour marquer votre renaissance...`,
          preview_text: 'Un rituel transformateur pour clôturer le passé et accueillir votre nouvelle vie.'
        }
      ]

      const { data: insertedLessons1, error: lessonsError1 } = await supabase
        .from('lessons')
        .insert(lessons1)
        .select()

      if (lessonsError1) {
        console.log('  ❌ Erreur insertion leçons Pilier 1:', lessonsError1.message)
      } else {
        console.log(`  ✅ ${insertedLessons1?.length || 0} leçons créées pour Pilier 1`)
      }
    }

    if (course3) {
      const lessons3 = [
        {
          course_id: course3.id,
          lesson_number: 1,
          title: 'Identifier ses talents cachés',
          slug: 'talents-caches',
          is_free: true,
          youtube_video_id: 'jNQXAC9IVRw',
          duration_minutes: 15,
          lesson_type: 'video',
          markdown_content: `# Identifier vos talents cachés

## Test de découverte

Dans cette leçon gratuite, vous allez découvrir vos talents uniques grâce à notre méthode exclusive.

## Les 4 catégories de talents

### 1. Talents naturels
Ce que vous faites sans effort

### 2. Talents acquis
Vos compétences développées au fil des années

### 3. Talents dormants
Ce que vous avez mis de côté

### 4. Talents émergents
Ce qui commence à se révéler

## Votre test personnalisé

Répondez aux questions suivantes pour identifier vos talents...`,
          preview_text: 'Découvrez gratuitement vos talents uniques grâce à notre test exclusif et commencez votre renaissance professionnelle.'
        },
        {
          course_id: course3.id,
          lesson_number: 2,
          title: 'Vaincre le syndrome de l\'imposteur',
          slug: 'syndrome-imposteur',
          is_free: false,
          youtube_video_id: 'VIDEO_ID_7',
          duration_minutes: 13,
          lesson_type: 'video',
          markdown_content: `# Vaincre le syndrome de l'imposteur

## Vous méritez votre succès

Libérez-vous définitivement du syndrome de l'imposteur...`,
          preview_text: 'Libérez-vous du syndrome de l\'imposteur et osez enfin briller à votre juste valeur.'
        },
        {
          course_id: course3.id,
          lesson_number: 3,
          title: 'LinkedIn pour les 50+',
          slug: 'linkedin-50plus',
          is_free: false,
          youtube_video_id: 'VIDEO_ID_8',
          duration_minutes: 16,
          lesson_type: 'video',
          markdown_content: `# LinkedIn stratégique pour les 50+

## Votre vitrine professionnelle

Optimisez votre profil LinkedIn pour attirer les bonnes opportunités...`,
          preview_text: 'Maîtrisez LinkedIn pour valoriser votre expérience et attirer les opportunités.'
        },
        {
          course_id: course3.id,
          lesson_number: 4,
          title: 'Lancer une activité solo',
          slug: 'activite-solo',
          is_free: false,
          youtube_video_id: 'VIDEO_ID_9',
          duration_minutes: 18,
          lesson_type: 'video',
          markdown_content: `# Lancer votre activité solo

## Le guide complet

Tout ce que vous devez savoir pour lancer votre activité en solo après 50 ans...`,
          preview_text: 'Tout pour lancer votre activité solo : statuts, stratégie, premiers clients.'
        },
        {
          course_id: course3.id,
          lesson_number: 5,
          title: 'Négocier sa valeur',
          slug: 'negocier-valeur',
          is_free: false,
          youtube_video_id: 'VIDEO_ID_10',
          duration_minutes: 14,
          lesson_type: 'video',
          markdown_content: `# Négocier votre juste valeur

## Techniques de négociation

Apprenez à négocier ce que vous valez vraiment...`,
          preview_text: 'Apprenez à négocier ce que vous valez vraiment, sans complexe ni culpabilité.'
        },
        {
          course_id: course3.id,
          lesson_number: 6,
          title: 'Transmission et mentorat',
          slug: 'transmission-mentorat',
          is_free: false,
          youtube_video_id: 'VIDEO_ID_11',
          duration_minutes: 17,
          lesson_type: 'video',
          markdown_content: `# Devenir mentor

## Transmettre votre savoir

Transformez votre expérience en valeur pour les autres...`,
          preview_text: 'Transformez votre expérience en source de revenus grâce au mentorat.'
        }
      ]

      const { data: insertedLessons3, error: lessonsError3 } = await supabase
        .from('lessons')
        .insert(lessons3)
        .select()

      if (lessonsError3) {
        console.log('  ❌ Erreur insertion leçons Pilier 3:', lessonsError3.message)
      } else {
        console.log(`  ✅ ${insertedLessons3?.length || 0} leçons créées pour Pilier 3`)
      }
    }

    // 5. Vérification finale
    console.log('\n🔍 Vérification finale...')
    
    const { data: finalCourses, error: finalError } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (*)
      `)
      .in('pillar_number', [1, 3])

    if (finalCourses) {
      console.log(`\n✅ Migration réussie !`)
      console.log(`  - ${finalCourses.length} piliers créés`)
      
      finalCourses.forEach(course => {
        console.log(`  - ${course.title}: ${course.lessons?.length || 0} leçons`)
      })
    }

    console.log('\n📝 Prochaines étapes:')
    console.log('  1. Créer les composants React')
    console.log('  2. Implémenter les pages')
    console.log('  3. Tester sur http://localhost:3000/cours')

  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message)
    process.exit(1)
  }
}

// Exécuter
applyMigration()
