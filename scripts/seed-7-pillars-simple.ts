#!/usr/bin/env tsx

/**
 * Script simplifié pour insérer les 7 piliers d'Aurora50
 * Version sans les colonnes avancées (à ajouter manuellement dans Supabase)
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

async function seed7Pillars() {
  console.log('🌱 Insertion des 7 piliers Aurora50 (version simplifiée)...\n')

  try {
    // 1. Nettoyer les données existantes
    console.log('🧹 Nettoyage des données existantes...')
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // 2. Définir les 7 piliers (version simplifiée)
    const pillars = [
      {
        title: '🦋 Libération Émotionnelle',
        description: 'Libérez-vous des blocages invisibles qui vous retiennent depuis des années. Ce pilier fondamental vous guide à travers un processus de guérison profonde pour retrouver votre liberté intérieure et votre joie de vivre.'
      },
      {
        title: '🌸 Reconquête du Corps',
        description: 'Réconciliez-vous avec votre corps et retrouvez votre vitalité. Apprenez à aimer et honorer votre temple sacré avec des pratiques douces et puissantes adaptées aux femmes de plus de 50 ans.'
      },
      {
        title: '💼 Renaissance Professionnelle',
        description: 'Réinventez votre carrière et découvrez vos talents cachés après 50 ans. Ce pilier vous accompagne dans votre transformation professionnelle avec des stratégies concrètes et adaptées à votre expérience unique.'
      },
      {
        title: '💖 Relations Authentiques',
        description: 'Créez des liens profonds et nourrissants qui vous élèvent. Apprenez à établir des frontières saines, à communiquer avec authenticité et à attirer les bonnes personnes dans votre vie.'
      },
      {
        title: '🎨 Créativité Débridée',
        description: 'Libérez votre potentiel créatif endormi et exprimez votre art intérieur. Découvrez comment la créativité peut devenir votre superpouvoir après 50 ans.'
      },
      {
        title: '💎 Liberté Financière',
        description: 'Construisez votre indépendance financière et créez l\'abondance dans votre vie. Apprenez à gérer, investir et multiplier vos ressources avec sagesse et confiance.'
      },
      {
        title: '⭐ Mission de Vie',
        description: 'Découvrez votre ikigai et votre raison d\'être profonde. Ce pilier culminant vous guide vers votre mission unique et la création de votre héritage.'
      }
    ]

    // 3. Insérer les piliers
    console.log('📚 Insertion des 7 piliers...')
    const { data: insertedCourses, error: coursesError } = await supabase
      .from('courses')
      .insert(pillars)
      .select()

    if (coursesError) {
      console.error('❌ Erreur insertion piliers:', coursesError)
      return
    }

    console.log(`✅ ${insertedCourses?.length || 0} piliers créés`)

    // 4. Définir les leçons pour chaque pilier
    const lessonsData: any[] = []

    // Leçons pour chaque pilier
    const lessonsByPillar = [
      // Pilier 1 - Libération Émotionnelle
      [
        { title: 'Comprendre ses blocages invisibles', content: 'Dans cette première leçon gratuite, nous allons explorer ensemble les mécanismes cachés qui vous empêchent d\'avancer.', release_day_offset: 0 },
        { title: 'Guérir la petite fille intérieure', content: 'Cette leçon vous guide dans un processus de reconnexion avec votre enfant intérieur.', release_day_offset: 7 },
        { title: 'Pardonner (aux autres et à soi)', content: 'Le pardon n\'est pas pour l\'autre, c\'est pour vous.', release_day_offset: 14 },
        { title: 'Technique EFT adaptée 50+', content: 'L\'EFT (Emotional Freedom Technique) spécialement conçue pour les femmes de plus de 50 ans.', release_day_offset: 21 },
        { title: 'Rituel de libération du passé', content: 'Un rituel puissant pour marquer votre renaissance.', release_day_offset: 28 }
      ],
      // Pilier 2 - Reconquête du Corps
      [
        { title: 'Réconciliation avec votre corps', content: 'Première leçon gratuite : apprenez à faire la paix avec votre corps tel qu\'il est aujourd\'hui.', release_day_offset: 0 },
        { title: 'Yoga doux pour 50+', content: 'Séquences de yoga spécialement adaptées pour retrouver souplesse et vitalité.', release_day_offset: 7 },
        { title: 'Nutrition intuitive', content: 'Libérez-vous des régimes et retrouvez une relation saine avec la nourriture.', release_day_offset: 14 },
        { title: 'Rituel beauté sacrée', content: 'Créez votre propre rituel de soin pour honorer votre beauté unique.', release_day_offset: 21 },
        { title: 'Danse de la déesse', content: 'Reconnectez avec votre sensualité à travers le mouvement libre.', release_day_offset: 28 }
      ],
      // Pilier 3 - Renaissance Professionnelle
      [
        { title: 'Identifier ses talents cachés', content: 'Dans cette leçon gratuite, vous allez découvrir vos talents uniques grâce à notre méthode exclusive.', release_day_offset: 0 },
        { title: 'Vaincre le syndrome de l\'imposteur', content: 'Libérez-vous définitivement du syndrome de l\'imposteur.', release_day_offset: 7 },
        { title: 'LinkedIn pour les 50+', content: 'Optimisez votre profil LinkedIn pour attirer les bonnes opportunités.', release_day_offset: 14 },
        { title: 'Lancer une activité solo', content: 'Tout ce que vous devez savoir pour lancer votre activité en solo après 50 ans.', release_day_offset: 21 },
        { title: 'Négocier sa valeur', content: 'Apprenez à négocier ce que vous valez vraiment.', release_day_offset: 28 },
        { title: 'Transmission et mentorat', content: 'Transformez votre expérience en valeur pour les autres.', release_day_offset: 35 }
      ],
      // Pilier 4 - Relations Authentiques
      [
        { title: 'Établir des frontières saines', content: 'Leçon gratuite : apprenez à dire non avec grâce et fermeté.', release_day_offset: 0 },
        { title: 'Communication non-violente', content: 'Maîtrisez l\'art de communiquer avec authenticité et bienveillance.', release_day_offset: 7 },
        { title: 'Attirer les bonnes personnes', content: 'Créez un cercle social qui vous nourrit et vous élève.', release_day_offset: 14 },
        { title: 'Guérir les relations toxiques', content: 'Libérez-vous des schémas relationnels destructeurs.', release_day_offset: 21 },
        { title: 'L\'amour après 50 ans', content: 'Ouvrez-vous à l\'amour sous toutes ses formes.', release_day_offset: 28 }
      ],
      // Pilier 5 - Créativité Débridée
      [
        { title: 'Réveiller l\'artiste en vous', content: 'Leçon gratuite : découvrez votre potentiel créatif endormi.', release_day_offset: 0 },
        { title: 'Journal créatif', content: 'Explorez votre monde intérieur à travers l\'écriture et le dessin.', release_day_offset: 7 },
        { title: 'Photographie intuitive', content: 'Capturez la beauté du monde avec votre regard unique.', release_day_offset: 14 },
        { title: 'Créer votre œuvre', content: 'Donnez vie à votre projet créatif personnel.', release_day_offset: 21 }
      ],
      // Pilier 6 - Liberté Financière
      [
        { title: 'Mindset d\'abondance', content: 'Leçon gratuite : transformez votre relation avec l\'argent.', release_day_offset: 0 },
        { title: 'Budget et planification', content: 'Créez un plan financier solide pour votre nouvelle vie.', release_day_offset: 7 },
        { title: 'Investir après 50 ans', content: 'Stratégies d\'investissement adaptées à votre situation.', release_day_offset: 14 },
        { title: 'Créer des revenus passifs', content: 'Générez des revenus qui travaillent pour vous.', release_day_offset: 21 }
      ],
      // Pilier 7 - Mission de Vie
      [
        { title: 'Découvrir votre ikigai', content: 'Leçon gratuite : trouvez votre raison d\'être profonde.', release_day_offset: 0 },
        { title: 'Clarifier votre vision', content: 'Créez une vision claire de votre futur idéal.', release_day_offset: 7 },
        { title: 'Plan d\'action aligné', content: 'Développez un plan concret pour réaliser votre mission.', release_day_offset: 14 },
        { title: 'Créer votre héritage', content: 'Construisez quelque chose qui vous survivra.', release_day_offset: 21 },
        { title: 'Célébration et intégration', content: 'Célébrez votre transformation et ancrez vos apprentissages.', release_day_offset: 28 }
      ]
    ]

    // Créer les leçons pour chaque pilier
    insertedCourses?.forEach((course, index) => {
      const lessons = lessonsByPillar[index] || []
      lessons.forEach(lesson => {
        lessonsData.push({
          course_id: course.id,
          ...lesson
        })
      })
    })

    // 5. Insérer toutes les leçons
    if (lessonsData.length > 0) {
      console.log('📝 Insertion des leçons...')
      const { data: insertedLessons, error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonsData)
        .select()

      if (lessonsError) {
        console.error('❌ Erreur insertion leçons:', lessonsError)
      } else {
        console.log(`✅ ${insertedLessons?.length || 0} leçons créées`)
      }
    }

    // 6. Vérification finale
    console.log('\n🔍 Vérification finale...')
    const { data: finalCourses } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (*)
      `)

    if (finalCourses) {
      console.log(`\n✅ Migration réussie !`)
      console.log(`  - ${finalCourses.length} piliers créés`)
      finalCourses.forEach((course, index) => {
        const emoji = ['🦋', '🌸', '💼', '💖', '🎨', '💎', '⭐'][index] || '🌿'
        console.log(`  - ${emoji} ${course.title}: ${course.lessons?.length || 0} leçons`)
      })
    }

    console.log('\n🎉 Les 7 piliers sont maintenant disponibles sur http://localhost:3000/cours')
    console.log('\n📝 Note: Pour le design complet, ajoutez les colonnes suivantes dans Supabase:')
    console.log('  - pillar_number (integer)')
    console.log('  - slug (text)')
    console.log('  - duration_weeks (integer)')
    console.log('  - emoji (text)')
    console.log('  - color_gradient (text)')
    console.log('  - order_index (integer)')
    console.log('  - is_published (boolean)')
    console.log('  - short_description (text)')
    console.log('\nPuis exécutez le script SQL: scripts/add-courses-columns.sql')

  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message)
    process.exit(1)
  }
}

// Exécuter
seed7Pillars()
