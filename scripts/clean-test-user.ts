#!/usr/bin/env tsx
/**
 * Script de nettoyage pour supprimer les données de test
 * Utilisateur : altoweb.fr@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

// Configuration Supabase avec service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local');
  process.exit(1);
}

// Client Supabase avec service role (bypass RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Email de l'utilisateur test
const TEST_USER_EMAIL = 'altoweb.fr@gmail.com';

// Interface pour readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askConfirmation(): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question('⚠️  Êtes-vous sûr de vouloir supprimer toutes les données de test ? (oui/non): ', (answer) => {
      resolve(answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'o' || answer.toLowerCase() === 'y');
    });
  });
}

async function cleanTestUser() {
  console.log('🧹 Script de nettoyage des données de test');
  console.log('================================================');
  console.log('Utilisateur concerné:', TEST_USER_EMAIL);
  console.log('');
  console.log('⚠️  ATTENTION: Cette action va supprimer:');
  console.log('   - Les statistiques de l\'utilisateur');
  console.log('   - Les achievements');
  console.log('   - Les activités récentes');
  console.log('   - Les cours en cours');
  console.log('   - L\'historique de progression');
  console.log('');

  const confirmed = await askConfirmation();
  
  if (!confirmed) {
    console.log('❌ Nettoyage annulé');
    rl.close();
    process.exit(0);
  }

  console.log('');
  console.log('🚀 Début du nettoyage...');
  console.log('');

  try {
    // 1. Récupérer l'ID de l'utilisateur
    console.log('📋 Étape 1: Récupération de l\'utilisateur...');
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', TEST_USER_EMAIL)
      .single();

    if (userError || !users) {
      console.error('❌ Utilisateur non trouvé:', userError);
      rl.close();
      process.exit(1);
    }

    const userId = users.id;
    console.log('✅ Utilisateur trouvé:', users.full_name || users.email);
    console.log('   ID:', userId);
    console.log('');

    // 2. Supprimer les statistiques
    console.log('📋 Étape 2: Suppression des statistiques...');
    const { error: statsError, count: statsCount } = await supabase
      .from('user_stats')
      .delete()
      .eq('user_id', userId);

    if (statsError) {
      console.error('⚠️  Erreur lors de la suppression des stats:', statsError);
    } else {
      console.log(`✅ ${statsCount || 0} ligne(s) de statistiques supprimée(s)`);
    }

    // 3. Supprimer les achievements
    console.log('📋 Étape 3: Suppression des achievements...');
    const { error: achievementsError, count: achievementsCount } = await supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', userId);

    if (achievementsError) {
      console.error('⚠️  Erreur lors de la suppression des achievements:', achievementsError);
    } else {
      console.log(`✅ ${achievementsCount || 0} achievement(s) supprimé(s)`);
    }

    // 4. Supprimer les activités
    console.log('📋 Étape 4: Suppression des activités...');
    const { error: activitiesError, count: activitiesCount } = await supabase
      .from('user_activities')
      .delete()
      .eq('user_id', userId);

    if (activitiesError) {
      console.error('⚠️  Erreur lors de la suppression des activités:', activitiesError);
    } else {
      console.log(`✅ ${activitiesCount || 0} activité(s) supprimée(s)`);
    }

    // 5. Supprimer les cours
    console.log('📋 Étape 5: Suppression des cours...');
    const { error: coursesError, count: coursesCount } = await supabase
      .from('user_courses')
      .delete()
      .eq('user_id', userId);

    if (coursesError) {
      console.error('⚠️  Erreur lors de la suppression des cours:', coursesError);
    } else {
      console.log(`✅ ${coursesCount || 0} cours supprimé(s)`);
    }

    // 6. Supprimer l'historique de progression
    console.log('📋 Étape 6: Suppression de l\'historique de progression...');
    const { error: historyError, count: historyCount } = await supabase
      .from('user_progress_history')
      .delete()
      .eq('user_id', userId);

    if (historyError) {
      console.error('⚠️  Erreur lors de la suppression de l\'historique:', historyError);
    } else {
      console.log(`✅ ${historyCount || 0} jour(s) d\'historique supprimé(s)`);
    }

    // 7. Réinitialiser le profil (optionnel)
    console.log('📋 Étape 7: Réinitialisation du profil...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        bio: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('⚠️  Erreur lors de la réinitialisation du profil:', profileError);
    } else {
      console.log('✅ Profil réinitialisé');
    }

    console.log('');
    console.log('================================================');
    console.log('🎉 Nettoyage terminé avec succès !');
    console.log('');
    console.log('📊 Résumé:');
    console.log('   - Toutes les données de test ont été supprimées');
    console.log('   - Le profil a été réinitialisé');
    console.log('   - L\'utilisateur', TEST_USER_EMAIL, 'est prêt pour un nouveau seed');
    console.log('');
    console.log('💡 Pour recréer les données, exécutez: npm run seed:test');
    console.log('================================================');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

// Exécution
cleanTestUser().catch(console.error);
