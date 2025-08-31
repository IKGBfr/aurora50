import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes!')
  console.error('Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyMigration() {
  console.log('🔍 Vérification de la migration freemium Aurora50...\n')
  console.log('=' .repeat(60))
  
  let allChecksPass = true
  
  // 1. Vérifier les colonnes
  console.log('\n📊 VÉRIFICATION DES COLONNES')
  console.log('-'.repeat(40))
  
  const requiredColumns = [
    'onboarding_completed',
    'onboarding_answers',
    'subscription_type',
    'subscription_started_at',
    'trial_ends_at',
    'conversion_triggers',
    'daily_chat_count',
    'daily_profile_views',
    'last_activity_reset'
  ]
  
  try {
    // Récupérer un profil pour vérifier les colonnes
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }
    
    const existingColumns: string[] = []
    const missingColumns: string[] = []
    
    // Si on a un profil, on peut vérifier les colonnes
    if (profile) {
      const profileKeys = Object.keys(profile)
      
      requiredColumns.forEach(col => {
        if (profileKeys.includes(col)) {
          existingColumns.push(col)
        } else {
          missingColumns.push(col)
        }
      })
    } else {
      // Si pas de profil, on essaie de créer un profil test pour voir les colonnes
      console.log('⚠️  Aucun profil trouvé, tentative de vérification alternative...')
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'test@test.com',
          full_name: 'Test User',
          onboarding_completed: false,
          subscription_type: 'free',
          daily_chat_count: 0,
          daily_profile_views: 0
        })
      
      if (insertError) {
        // Analyser l'erreur pour voir quelles colonnes manquent
        const errorMessage = insertError.message.toLowerCase()
        
        requiredColumns.forEach(col => {
          if (errorMessage.includes(col)) {
            missingColumns.push(col)
          } else {
            existingColumns.push(col)
          }
        })
      }
      
      // Nettoyer le profil test
      await supabase
        .from('profiles')
        .delete()
        .eq('id', '00000000-0000-0000-0000-000000000000')
    }
    
    // Afficher les résultats
    if (existingColumns.length > 0) {
      console.log(`✅ Colonnes présentes (${existingColumns.length}/${requiredColumns.length}):`)
      existingColumns.forEach(col => console.log(`   ✓ ${col}`))
    }
    
    if (missingColumns.length > 0) {
      console.log(`\n❌ Colonnes manquantes (${missingColumns.length}):`)
      missingColumns.forEach(col => console.log(`   ✗ ${col}`))
      allChecksPass = false
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des colonnes:', error)
    allChecksPass = false
  }
  
  // 2. Vérifier les fonctions (via RPC si possible)
  console.log('\n🔧 VÉRIFICATION DES FONCTIONS')
  console.log('-'.repeat(40))
  
  const requiredFunctions = [
    'reset_daily_limits',
    'check_freemium_limit',
    'increment_usage_counter',
    'log_conversion_trigger'
  ]
  
  const functionResults: { [key: string]: boolean } = {}
  
  for (const funcName of requiredFunctions) {
    try {
      // Essayer d'appeler la fonction pour voir si elle existe
      if (funcName === 'check_freemium_limit') {
        // Cette fonction nécessite des paramètres
        await supabase.rpc(funcName, {
          user_id: '00000000-0000-0000-0000-000000000000',
          limit_type: 'chat',
          limit_value: 10
        })
        functionResults[funcName] = true
      } else if (funcName === 'increment_usage_counter') {
        // Cette fonction nécessite des paramètres
        await supabase.rpc(funcName, {
          user_id: '00000000-0000-0000-0000-000000000000',
          counter_type: 'chat'
        })
        functionResults[funcName] = true
      } else {
        // Fonctions sans paramètres
        await supabase.rpc(funcName)
        functionResults[funcName] = true
      }
      console.log(`✅ Fonction trouvée: ${funcName}`)
    } catch (error: any) {
      if (error.message?.includes('not exist') || error.code === '42883') {
        functionResults[funcName] = false
        console.log(`❌ Fonction manquante: ${funcName}`)
        allChecksPass = false
      } else {
        // La fonction existe mais a peut-être retourné une erreur d'exécution
        console.log(`✅ Fonction trouvée: ${funcName} (avec erreur d'exécution normale)`)
        functionResults[funcName] = true
      }
    }
  }
  
  // 3. Vérifier la vue premium_users
  console.log('\n👁️  VÉRIFICATION DE LA VUE')
  console.log('-'.repeat(40))
  
  try {
    const { data, error } = await supabase
      .from('premium_users')
      .select('id')
      .limit(1)
    
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      console.log('✅ Vue premium_users présente')
    } else if (error) {
      console.log('❌ Vue premium_users manquante')
      allChecksPass = false
    } else {
      console.log('✅ Vue premium_users présente')
    }
  } catch (error) {
    console.log('❌ Vue premium_users manquante ou erreur')
    allChecksPass = false
  }
  
  // Résumé final
  console.log('\n' + '='.repeat(60))
  console.log('📋 RÉSUMÉ DE LA MIGRATION FREEMIUM')
  console.log('='.repeat(60))
  
  if (allChecksPass) {
    console.log('\n✅ MIGRATION COMPLÈTE!')
    console.log('Tous les éléments de la migration freemium sont en place.')
  } else {
    console.log('\n❌ MIGRATION INCOMPLÈTE!')
    console.log('\n➡️  Actions requises:')
    console.log('1. Copiez le contenu de /scripts/freemium-migration.sql')
    console.log('2. Exécutez-le dans Supabase SQL Editor')
    console.log('3. Relancez ce script de vérification')
  }
  
  console.log('\n' + '='.repeat(60))
}

// Exécuter la vérification
verifyMigration()
  .then(() => {
    console.log('\n✨ Vérification terminée')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors de la vérification:', error)
    process.exit(1)
  })
