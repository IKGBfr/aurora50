import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('🚀 Application de la migration pour la vérification email custom...')
  
  try {
    // Lire le fichier SQL
    const sqlPath = join(__dirname, 'add-email-verification-columns.sql')
    const sql = readFileSync(sqlPath, 'utf8')
    
    // Exécuter la migration
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single()
    
    if (error) {
      // Si la fonction RPC n'existe pas, essayer directement
      console.log('⚠️  Tentative d\'exécution directe de la migration...')
      
      // Exécuter chaque commande séparément
      const commands = sql
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
      
      for (const command of commands) {
        if (command.startsWith('ALTER TABLE')) {
          // Pour les ALTER TABLE, on vérifie d'abord si les colonnes existent
          console.log('📝 Ajout des colonnes de vérification email...')
          
          // Vérifier et ajouter email_verified
          const { error: error1 } = await supabase
            .from('profiles')
            .select('email_verified')
            .limit(1)
          
          if (error1?.code === '42703') { // Column does not exist
            const { error: addError1 } = await supabase.rpc('exec_sql', { 
              sql_query: 'ALTER TABLE profiles ADD COLUMN email_verified BOOLEAN DEFAULT false' 
            }).single()
            if (addError1) console.log('Note: email_verified peut déjà exister')
          }
          
          // Vérifier et ajouter email_verification_token
          const { error: error2 } = await supabase
            .from('profiles')
            .select('email_verification_token')
            .limit(1)
          
          if (error2?.code === '42703') {
            const { error: addError2 } = await supabase.rpc('exec_sql', { 
              sql_query: 'ALTER TABLE profiles ADD COLUMN email_verification_token TEXT' 
            }).single()
            if (addError2) console.log('Note: email_verification_token peut déjà exister')
          }
          
          // Vérifier et ajouter email_verified_at
          const { error: error3 } = await supabase
            .from('profiles')
            .select('email_verified_at')
            .limit(1)
          
          if (error3?.code === '42703') {
            const { error: addError3 } = await supabase.rpc('exec_sql', { 
              sql_query: 'ALTER TABLE profiles ADD COLUMN email_verified_at TIMESTAMPTZ' 
            }).single()
            if (addError3) console.log('Note: email_verified_at peut déjà exister')
          }
        }
      }
    }
    
    // Vérifier que les colonnes ont été ajoutées
    console.log('✅ Vérification de la migration...')
    const { data, error: checkError } = await supabase
      .from('profiles')
      .select('id, email_verified, email_verification_token, email_verified_at')
      .limit(1)
    
    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError)
      process.exit(1)
    }
    
    console.log('✅ Migration appliquée avec succès !')
    console.log('📊 Structure de la table profiles mise à jour avec:')
    console.log('   - email_verified (BOOLEAN)')
    console.log('   - email_verification_token (TEXT)')
    console.log('   - email_verified_at (TIMESTAMPTZ)')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error)
    process.exit(1)
  }
}

// Exécuter la migration
applyMigration()
