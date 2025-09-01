#!/usr/bin/env tsx

/**
 * Script pour insérer les données de base des cours
 * Version simplifiée sans les colonnes avancées
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

async function seedCourses() {
  console.log('🌱 Insertion des données de cours MVP...\n')

  try {
    // 1. Nettoyer les données existantes
    console.log('🧹 Nettoyage des données existantes...')
    
    // Supprimer toutes les leçons existantes
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Supprimer tous les cours existants
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 2. Insérer les cours (version basique)
    console.log('\n📚 Insertion des 2 piliers pilotes...')
    
    const course1Data = {
      title: 'Libération Émotionnelle',
      description: 'Libérez-vous des blocages invisibles qui vous retiennent depuis des années. Ce pilier fondamental vous guide à travers un processus de guérison profonde pour retrouver votre liberté intérieure et votre joie de vivre.'
    }

    const { data: course1, error: error1 } = await supabase
      .from('courses')
      .insert(course1Data)
      .select()
      .single()

    if (error1) {
      console.log('  ❌ Erreur insertion Pilier 1:', error1.message)
    } else {
      console.log('  ✅ Pilier 1 créé:', course1.title)
    }

    const course3Data = {
      title: 'Renaissance Professionnelle',
      description: 'Réinventez votre carrière et découvrez vos talents cachés après 50 ans. Ce pilier vous accompagne dans votre transformation professionnelle avec des stratégies concrètes et adaptées à votre expérience unique.'
    }

    const { data: course3, error: error3 } = await supabase
      .from('courses')
      .insert(course3Data)
      .select()
      .single()

    if (error3) {
      console.log('  ❌ Erreur insertion Pilier 3:', error3.message)
    } else {
      console.log('  ✅ Pilier 3 créé:', course3.title)
    }

    // 3. Insérer les leçons (version basique)
    console.log('\n📝 Insertion des leçons...')

    if (course1) {
      const lessons1 = [
        {
          course_id: course1.id,
          title: 'Comprendre ses blocages invisibles',
          content: 'Dans cette première leçon gratuite, nous allons explorer ensemble les mécanismes cachés qui vous empêchent d\'avancer.',
          release_day_offset: 0
        },
        {
          course_id: course1.id,
          title: 'Guérir la petite fille intérieure',
          content: 'Cette leçon vous guide dans un processus de reconnexion avec votre enfant intérieur.',
          release_day_offset: 7
        },
        {
          course_id: course1.id,
          title: 'Pardonner (aux autres et à soi)',
          content: 'Le pardon n\'est pas pour l\'autre, c\'est pour vous.',
          release_day_offset: 14
        },
        {
          course_id: course1.id,
          title: 'Technique EFT adaptée 50+',
          content: 'L\'EFT (Emotional Freedom Technique) spécialement conçue pour les femmes de plus de 50 ans.',
          release_day_offset: 21
        },
        {
          course_id: course1.id,
          title: 'Rituel de libération du passé',
          content: 'Un rituel puissant pour marquer votre renaissance.',
          release_day_offset: 28
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
          title: 'Identifier ses talents cachés',
          content: 'Dans cette leçon gratuite, vous allez découvrir vos talents uniques grâce à notre méthode exclusive.',
          release_day_offset: 0
        },
        {
          course_id: course3.id,
          title: 'Vaincre le syndrome de l\'imposteur',
          content: 'Libérez-vous définitivement du syndrome de l\'imposteur.',
          release_day_offset: 7
        },
        {
          course_id: course3.id,
          title: 'LinkedIn pour les 50+',
          content: 'Optimisez votre profil LinkedIn pour attirer les bonnes opportunités.',
          release_day_offset: 14
        },
        {
          course_id: course3.id,
          title: 'Lancer une activité solo',
          content: 'Tout ce que vous devez savoir pour lancer votre activité en solo après 50 ans.',
          release_day_offset: 21
        },
        {
          course_id: course3.id,
          title: 'Négocier sa valeur',
          content: 'Apprenez à négocier ce que vous valez vraiment.',
          release_day_offset: 28
        },
        {
          course_id: course3.id,
          title: 'Transmission et mentorat',
          content: 'Transformez votre expérience en valeur pour les autres.',
          release_day_offset: 35
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

    // 4. Vérification finale
    console.log('\n🔍 Vérification finale...')
    
    const { data: finalCourses, error: finalError } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (*)
      `)

    if (finalCourses) {
      console.log(`\n✅ Seed réussi !`)
      console.log(`  - ${finalCourses.length} piliers créés`)
      
      finalCourses.forEach(course => {
        console.log(`  - ${course.title}: ${course.lessons?.length || 0} leçons`)
      })
    }

    console.log('\n📝 Prochaines étapes:')
    console.log('  1. Ajouter les colonnes avancées dans Supabase (pillar_number, slug, etc.)')
    console.log('  2. Créer les composants React')
    console.log('  3. Tester sur http://localhost:3000/cours')

  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message)
    process.exit(1)
  }
}

// Exécuter
seedCourses()
