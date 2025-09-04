import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: false
  }
})

async function applyMigration() {
  console.log('🚀 Application de la migration pour la vérification email custom...')
  
  try {
    // Test si les colonnes existent déjà
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single()
    
    if (testError && testError.code !== 'PGRST116') {
      console.log('⚠️  Table profiles existe, vérification des colonnes...')
    }
    
    // Pour l'instant, nous allons simplement documenter ce qui doit être fait
    console.log('\n📋 Migration SQL à exécuter dans Supabase Dashboard:')
    console.log('================================================')
    console.log(`
-- Ajouter les colonnes de vérification email custom
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_email_verification_token 
ON profiles(email_verification_token) 
WHERE email_verification_token IS NOT NULL;
    `)
    console.log('================================================')
    console.log('\n✅ Copiez et exécutez ce SQL dans:')
    console.log('   1. Supabase Dashboard > SQL Editor')
    console.log('   2. Ou utilisez: npx supabase db push')
    
    // Essayons de vérifier si nous pouvons au moins lire la table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)
    
    if (!profilesError) {
      console.log('\n✅ Connexion à Supabase réussie')
      console.log('📊 Table profiles accessible')
    } else {
      console.log('\n⚠️  Erreur de connexion:', profilesError.message)
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

// Exécuter la migration
applyMigration()
