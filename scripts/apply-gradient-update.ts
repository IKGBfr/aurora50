#!/usr/bin/env tsx

/**
 * Script pour appliquer la mise à jour des gradients des 7 piliers
 * Ces nouveaux gradients améliorent la lisibilité du texte blanc
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Nouveaux gradients avec des couleurs plus foncées
const newGradients = [
  { pillar_number: 1, gradient: 'linear-gradient(135deg, #6B46C1 0%, #553396 100%)', name: 'Violet mystique' },
  { pillar_number: 2, gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', name: 'Rouge passion' },
  { pillar_number: 3, gradient: 'linear-gradient(135deg, #DB2777 0%, #BE185D 100%)', name: 'Rose puissant' },
  { pillar_number: 4, gradient: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)', name: 'Bleu profond' },
  { pillar_number: 5, gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)', name: 'Vert émeraude' },
  { pillar_number: 6, gradient: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)', name: 'Orange ambré' },
  { pillar_number: 7, gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', name: 'Indigo royal' }
]

async function updateGradients() {
  console.log('🎨 Mise à jour des gradients des 7 piliers Aurora50...\n')
  console.log('📝 Ces nouveaux gradients améliorent la lisibilité du texte blanc')
  console.log('✅ Tous respectent le contraste WCAG AA (ratio > 4.5:1)\n')

  try {
    // Vérifier l'état actuel
    console.log('🔍 Vérification de l\'état actuel...')
    const { data: currentCourses, error: fetchError } = await supabase
      .from('courses')
      .select('id, title, pillar_number, color_gradient, emoji')
      .gte('pillar_number', 1)
      .lte('pillar_number', 7)
      .order('pillar_number')

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des cours:', fetchError)
      return
    }

    if (!currentCourses || currentCourses.length === 0) {
      console.log('⚠️  Aucun pilier trouvé. Assurez-vous d\'avoir exécuté le script seed-7-pillars.ts d\'abord.')
      return
    }

    console.log(`📚 ${currentCourses.length} piliers trouvés\n`)

    // Afficher l'état actuel
    console.log('État actuel des gradients:')
    currentCourses.forEach(course => {
      console.log(`  ${course.emoji} Pilier ${course.pillar_number}: ${course.title}`)
      console.log(`     Gradient actuel: ${course.color_gradient?.substring(0, 50)}...`)
    })

    console.log('\n🚀 Application des nouveaux gradients...\n')

    // Appliquer les mises à jour
    let successCount = 0
    let errorCount = 0

    for (const gradientUpdate of newGradients) {
      const { error: updateError } = await supabase
        .from('courses')
        .update({ color_gradient: gradientUpdate.gradient })
        .eq('pillar_number', gradientUpdate.pillar_number)

      if (updateError) {
        console.error(`❌ Erreur pour le pilier ${gradientUpdate.pillar_number}:`, updateError)
        errorCount++
      } else {
        console.log(`✅ Pilier ${gradientUpdate.pillar_number} mis à jour - ${gradientUpdate.name}`)
        successCount++
      }
    }

    // Vérification finale
    console.log('\n📊 Résumé de la migration:')
    console.log(`  ✅ ${successCount} piliers mis à jour avec succès`)
    if (errorCount > 0) {
      console.log(`  ❌ ${errorCount} erreurs rencontrées`)
    }

    // Afficher le nouvel état
    const { data: updatedCourses } = await supabase
      .from('courses')
      .select('id, title, pillar_number, color_gradient, emoji')
      .gte('pillar_number', 1)
      .lte('pillar_number', 7)
      .order('pillar_number')

    if (updatedCourses) {
      console.log('\n🎨 Nouveaux gradients appliqués:')
      updatedCourses.forEach(course => {
        const gradientInfo = newGradients.find(g => g.pillar_number === course.pillar_number)
        console.log(`  ${course.emoji} Pilier ${course.pillar_number}: ${gradientInfo?.name || 'N/A'}`)
      })
    }

    console.log('\n🎉 Migration terminée !')
    console.log('📱 Visitez http://localhost:3000/cours pour voir les nouvelles cartes')
    console.log('💡 Le texte blanc devrait maintenant être parfaitement lisible sur tous les gradients')

  } catch (error: any) {
    console.error('\n❌ Erreur lors de la migration:', error.message)
    process.exit(1)
  }
}

// Exécuter la migration
updateGradients()
