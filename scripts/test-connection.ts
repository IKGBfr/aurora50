#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Test de connexion à Supabase...\n');

// Vérifier les variables d'environnement
if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌');
  process.exit(1);
}

console.log('✅ Variables d\'environnement trouvées');
console.log('   URL:', supabaseUrl);
console.log('   Service Role Key:', serviceRoleKey.substring(0, 20) + '...\n');

// Créer le client Supabase avec la service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    // Test 1: Vérifier la connexion
    console.log('📊 Test 1: Connexion à la base de données...');
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      console.error('❌ Erreur de connexion:', tablesError.message);
    } else {
      console.log('✅ Connexion réussie!\n');
    }

    // Test 2: Vérifier l'utilisateur test
    console.log('👤 Test 2: Recherche de l\'utilisateur altoweb.fr@gmail.com...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Erreur lors de la recherche:', usersError.message);
    } else {
      const testUser = users.find(u => u.email === 'altoweb.fr@gmail.com');
      if (testUser) {
        console.log('✅ Utilisateur trouvé!');
        console.log('   ID:', testUser.id);
        console.log('   Email:', testUser.email);
        console.log('   Créé le:', new Date(testUser.created_at).toLocaleDateString('fr-FR'));
      } else {
        console.log('⚠️  Utilisateur non trouvé');
        console.log('   → Créez d\'abord l\'utilisateur via /connexion');
      }
    }

    // Test 3: Vérifier les tables personnalisées
    console.log('\n📋 Test 3: Vérification des tables personnalisées...');
    const tablesToCheck = [
      'user_stats',
      'user_achievements', 
      'user_activities',
      'user_courses',
      'user_progress_history'
    ];

    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ Table '${table}' non trouvée`);
        } else {
          console.log(`   ✅ Table '${table}' existe`);
        }
      } catch (err) {
        console.log(`   ❌ Table '${table}' non trouvée`);
      }
    }

    console.log('\n✨ Test de connexion terminé!');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Si des tables sont manquantes, exécutez scripts/create-tables.sql dans Supabase');
    console.log('   2. Si l\'utilisateur n\'existe pas, créez-le via /connexion');
    console.log('   3. Ensuite, lancez: npm run seed:test');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testConnection();
