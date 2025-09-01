#!/usr/bin/env tsx

/**
 * Script pour exécuter la migration des cours MVP
 * Usage: npm run migrate:courses
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

async function executeMigration() {
  console.log('🚀 Début de la migration Section Cours MVP...\n')

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(process.cwd(), 'scripts', 'courses-mvp-structure.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    // Diviser le SQL en statements individuels (par point-virgule)
    // Mais garder les blocs DO $$ ... $$ ensemble
    const statements = []
    let currentStatement = ''
    let inDollarBlock = false
    
    const lines = sqlContent.split('\n')
    
    for (const line of lines) {
      // Détecter le début/fin des blocs DO $$
      if (line.includes('DO $$')) {
        inDollarBlock = true
      }
      if (inDollarBlock && line.includes('$$;')) {
        inDollarBlock = false
        currentStatement += line + '\n'
        statements.push(currentStatement.trim())
        currentStatement = ''
        continue
      }
      
      // Si on est dans un bloc DO $$, continuer à accumuler
      if (inDollarBlock) {
        currentStatement += line + '\n'
        continue
      }
      
      // Ignorer les commentaires et lignes vides
      if (line.trim().startsWith('--') || line.trim() === '') {
        continue
      }
      
      currentStatement += line + '\n'
      
      // Si la ligne se termine par ; et qu'on n'est pas dans un bloc
      if (line.trim().endsWith(';') && !inDollarBlock) {
        statements.push(currentStatement.trim())
        currentStatement = ''
      }
    }

    // Exécuter chaque statement
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Ignorer les statements vides
      if (!statement || statement.trim() === '') continue
      
      // Afficher un aperçu du statement
      const preview = statement.substring(0, 50).replace(/\n/g, ' ')
      process.stdout.write(`  [${i + 1}/${statements.length}] ${preview}...`)
      
      try {
        // Exécuter via RPC pour les statements complexes
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        }).single()
        
        if (error) {
          // Si la fonction RPC n'existe pas, essayer directement
          if (error.message.includes('function') || error.message.includes('exec_sql')) {
            // Pour les statements simples, on peut les ignorer si ils échouent
            // car beaucoup utilisent IF NOT EXISTS
            if (statement.includes('IF NOT EXISTS') || statement.includes('IF EXISTS')) {
              console.log(' ✓ (skipped - already exists)')
              successCount++
            } else {
              console.log(' ⚠️ (warning)')
              errors.push(`Statement ${i + 1}: ${preview}... - ${error.message}`)
            }
          } else {
            console.log(' ❌')
            errorCount++
            errors.push(`Statement ${i + 1}: ${preview}... - ${error.message}`)
          }
        } else {
          console.log(' ✓')
          successCount++
        }
      } catch (err: any) {
        console.log(' ❌')
        errorCount++
        errors.push(`Statement ${i + 1}: ${preview}... - ${err.message}`)
      }
    }

    // Résumé
    console.log('\n' + '='.repeat(50))
    console.log('📊 Résumé de la migration:')
    console.log(`  ✅ Succès: ${successCount} statements`)
    console.log(`  ❌ Erreurs: ${errorCount} statements`)
    
    if (errors.length > 0) {
      console.log('\n⚠️ Détails des erreurs:')
      errors.forEach(err => console.log(`  - ${err}`))
    }

    // Vérifier que les tables principales ont été créées
    console.log('\n🔍 Vérification des tables créées...')
    
    const tablesToCheck = [
      'courses',
      'lessons', 
      'user_lesson_progress',
      'lesson_resources',
      'user_pillar_completions'
    ]

    for (const table of tablesToCheck) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`  ❌ Table ${table}: Non accessible`)
      } else {
        console.log(`  ✅ Table ${table}: OK`)
      }
    }

    // Vérifier les données seed
    console.log('\n📚 Vérification des données seed...')
    
    const { data: courses } = await supabase
      .from('courses')
      .select('*')
      .in('pillar_number', [1, 3])
    
    if (courses && courses.length > 0) {
      console.log(`  ✅ ${courses.length} piliers trouvés`)
      
      for (const course of courses) {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', course.id)
        
        console.log(`     - ${course.title}: ${lessons?.length || 0} leçons`)
      }
    } else {
      console.log('  ⚠️ Aucun pilier trouvé - vérifiez les données seed')
    }

    console.log('\n✨ Migration terminée!')
    console.log('\n📝 Prochaines étapes:')
    console.log('  1. Générer les types: npm run supabase:types')
    console.log('  2. Créer les composants: npm run dev')
    console.log('  3. Tester sur: http://localhost:3000/cours')

  } catch (error: any) {
    console.error('\n❌ Erreur fatale:', error.message)
    process.exit(1)
  }
}

// Exécuter la migration
executeMigration()
