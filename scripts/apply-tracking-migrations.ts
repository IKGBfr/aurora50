#!/usr/bin/env tsx

/**
 * Script pour appliquer les migrations de tracking de progression
 * Aurora50 - Système de tracking des leçons
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(sqlFile: string, description: string) {
  console.log(`\n📦 ${description}...`)
  
  try {
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, sqlFile)
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Exécuter la migration
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single()
    
    if (error) {
      // Si la fonction n'existe pas, essayer directement
      const { error: directError } = await supabase.from('_migrations').select('*').limit(1)
      
      if (directError) {
        console.log('⚠️  Impossible d\'exécuter via RPC, veuillez exécuter manuellement dans Supabase Dashboard:')
        console.log('📋 Fichier:', sqlFile)
        return false
      }
    }
    
    console.log(`✅ ${description} - Succès`)
    return true
  } catch (error) {
    console.error(`❌ Erreur lors de ${description}:`, error)
    return false
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)
  
  // Si pas d'erreur ou erreur PGRST116 (no rows), la table existe
  return !error || error.code === 'PGRST116'
}

async function main() {
  console.log('🚀 Début de l\'application des migrations de tracking Aurora50')
  console.log('================================================')
  
  // Vérifier la connexion
  const { data: testData, error: testError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
  
  if (testError && testError.code !== 'PGRST116') {
    console.error('❌ Impossible de se connecter à Supabase:', testError.message)
    process.exit(1)
  }
  
  console.log('✅ Connexion à Supabase établie')
  
  // 1. Vérifier si la table user_lesson_progress existe déjà
  console.log('\n🔍 Vérification des tables existantes...')
  const progressTableExists = await checkTableExists('user_lesson_progress')
  
  if (progressTableExists) {
    console.log('⚠️  La table user_lesson_progress existe déjà')
  } else {
    console.log('📝 La table user_lesson_progress sera créée')
  }
  
  // 2. Afficher les instructions pour exécuter les migrations
  console.log('\n📋 INSTRUCTIONS POUR APPLIQUER LES MIGRATIONS:')
  console.log('================================================')
  console.log('\n1. Allez dans Supabase Dashboard > SQL Editor')
  console.log('2. Créez une nouvelle requête')
  console.log('3. Copiez et exécutez les scripts suivants dans l\'ordre:\n')
  
  const migrations = [
    {
      file: 'create-user-lesson-progress.sql',
      description: 'Créer la table de tracking de progression'
    },
    {
      file: 'add-lesson-tracking-columns.sql',
      description: 'Ajouter les colonnes de tracking aux leçons'
    }
  ]
  
  migrations.forEach((migration, index) => {
    console.log(`\n${index + 1}. ${migration.description}`)
    console.log(`   📁 Fichier: scripts/${migration.file}`)
    console.log(`   ➡️  Copier le contenu et exécuter dans SQL Editor`)
  })
  
  // 3. Vérifier les tables après migration
  console.log('\n\n🔍 VÉRIFICATION POST-MIGRATION:')
  console.log('================================')
  
  // Vérifier les colonnes de la table lessons
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id, lesson_number, is_free, video_url')
    .limit(1)
  
  if (!lessonsError) {
    const hasNewColumns = lessons && lessons[0] && 
      'lesson_number' in lessons[0] && 
      'is_free' in lessons[0]
    
    if (hasNewColumns) {
      console.log('✅ Les colonnes de tracking ont été ajoutées à la table lessons')
    } else {
      console.log('⚠️  Les colonnes de tracking n\'ont pas encore été ajoutées')
    }
  }
  
  // 4. Afficher un résumé
  console.log('\n\n📊 RÉSUMÉ:')
  console.log('==========')
  console.log('• Table user_lesson_progress: ' + (progressTableExists ? '✅ Existe' : '⏳ À créer'))
  console.log('• Colonnes lessons: ' + (lessons ? '✅ Vérifiées' : '⏳ À vérifier'))
  console.log('\n💡 Conseil: Après avoir exécuté les migrations, relancez ce script pour vérifier')
  
  // 5. Tester l'insertion d'une progression
  if (progressTableExists) {
    console.log('\n\n🧪 TEST DE LA TABLE user_lesson_progress:')
    console.log('==========================================')
    
    // Récupérer un utilisateur et une leçon pour le test
    const { data: user } = await supabase.auth.admin.listUsers()
    const { data: lesson } = await supabase.from('lessons').select('id').limit(1).single()
    
    if (user?.users?.[0] && lesson) {
      const testProgress = {
        user_id: user.users[0].id,
        lesson_id: lesson.id,
        status: 'not_started',
        completion_percentage: 0,
        watch_time_seconds: 0
      }
      
      const { error: insertError } = await supabase
        .from('user_lesson_progress')
        .upsert(testProgress, { onConflict: 'user_id,lesson_id' })
      
      if (!insertError) {
        console.log('✅ Test d\'insertion réussi - La table fonctionne correctement')
        
        // Nettoyer le test
        await supabase
          .from('user_lesson_progress')
          .delete()
          .eq('user_id', testProgress.user_id)
          .eq('lesson_id', testProgress.lesson_id)
      } else {
        console.log('⚠️  Erreur lors du test:', insertError.message)
      }
    }
  }
  
  console.log('\n\n✨ Script terminé!')
  console.log('N\'oubliez pas d\'exécuter les migrations SQL dans Supabase Dashboard si nécessaire.')
}

main().catch(console.error)
