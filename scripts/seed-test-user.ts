#!/usr/bin/env tsx
/**
 * Script de seed pour créer les données de test
 * Utilisateur : altoweb.fr@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import { testData } from './test-data';
import { format } from 'date-fns';

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

async function seedTestUser() {
  console.log('🚀 Début du seed pour l\'utilisateur test:', TEST_USER_EMAIL);
  console.log('================================================\n');

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
      console.log('ℹ️  Assurez-vous que l\'utilisateur', TEST_USER_EMAIL, 'existe dans Supabase Auth');
      process.exit(1);
    }

    const userId = users.id;
    console.log('✅ Utilisateur trouvé:', users.full_name || users.email);
    console.log('   ID:', userId);
    console.log('');

    // 2. Mettre à jour le profil
    console.log('📋 Étape 2: Mise à jour du profil...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: 'Marie Dupont',
        bio: 'Passionnée par l\'apprentissage continu et le développement personnel. Je découvre Aurora50 avec enthousiasme et je suis ravie de faire partie de cette belle communauté bienveillante ! 🌿',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('⚠️  Erreur lors de la mise à jour du profil:', profileError);
    } else {
      console.log('✅ Profil mis à jour');
    }
    console.log('');

    // 3. Créer ou mettre à jour les statistiques
    console.log('📋 Étape 3: Création des statistiques...');
    const { error: statsError } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        points: testData.stats.points,
        level: testData.stats.level,
        streak_days: testData.stats.streak_days,
        total_lessons_completed: testData.stats.total_lessons_completed,
        total_study_time_minutes: testData.stats.total_study_time_minutes,
        rank: testData.stats.rank,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (statsError) {
      console.error('❌ Erreur lors de la création des stats:', statsError);
    } else {
      console.log('✅ Statistiques créées:');
      console.log('   - Points:', testData.stats.points);
      console.log('   - Niveau:', testData.stats.level);
      console.log('   - Série:', testData.stats.streak_days, 'jours');
      console.log('   - Leçons complétées:', testData.stats.total_lessons_completed);
      console.log('   - Temps d\'étude:', Math.floor(testData.stats.total_study_time_minutes / 60), 'h', testData.stats.total_study_time_minutes % 60, 'min');
    }
    console.log('');

    // 4. Supprimer et recréer les achievements
    console.log('📋 Étape 4: Création des achievements...');
    await supabase
      .from('user_achievements')
      .delete()
      .eq('user_id', userId);

    for (const achievement of testData.achievements) {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          badge_id: achievement.badge_id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          earned_at: achievement.earned_at?.toISOString()
        });

      if (error) {
        console.error(`⚠️  Erreur pour ${achievement.title}:`, error.message);
      } else {
        console.log(`✅ Achievement créé: ${achievement.icon} ${achievement.title}`);
      }
    }
    console.log('');

    // 5. Supprimer et recréer les activités
    console.log('📋 Étape 5: Création des activités récentes...');
    await supabase
      .from('user_activities')
      .delete()
      .eq('user_id', userId);

    for (const activity of testData.activities) {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          icon: activity.icon,
          created_at: activity.created_at.toISOString()
        });

      if (error) {
        console.error(`⚠️  Erreur pour ${activity.title}:`, error.message);
      } else {
        console.log(`✅ Activité créée: ${activity.icon} ${activity.title}`);
      }
    }
    console.log('');

    // 6. Supprimer et recréer les cours
    console.log('📋 Étape 6: Création des cours en cours...');
    await supabase
      .from('user_courses')
      .delete()
      .eq('user_id', userId);

    for (const course of testData.courses) {
      const { error } = await supabase
        .from('user_courses')
        .insert({
          user_id: userId,
          course_id: course.course_id,
          course_title: course.course_title,
          course_thumbnail: course.course_thumbnail,
          current_lesson: course.current_lesson,
          total_lessons: course.total_lessons,
          progress_percentage: course.progress_percentage,
          started_at: course.started_at.toISOString(),
          last_accessed_at: course.last_accessed_at.toISOString()
        });

      if (error) {
        console.error(`⚠️  Erreur pour ${course.course_title}:`, error.message);
      } else {
        console.log(`✅ Cours créé: ${course.course_title} (${course.progress_percentage}%)`);
      }
    }
    console.log('');

    // 7. Générer et insérer l'historique de progression
    console.log('📋 Étape 7: Génération de l\'historique de progression (30 jours)...');
    await supabase
      .from('user_progress_history')
      .delete()
      .eq('user_id', userId);

    const progressHistory = testData.generateProgressHistory();
    let insertedCount = 0;

    for (const progress of progressHistory) {
      const { error } = await supabase
        .from('user_progress_history')
        .insert({
          user_id: userId,
          date: format(progress.date, 'yyyy-MM-dd'),
          points_earned: progress.points_earned,
          lessons_completed: progress.lessons_completed,
          study_time_minutes: progress.study_time_minutes,
          streak_maintained: progress.streak_maintained
        });

      if (error) {
        console.error(`⚠️  Erreur pour ${format(progress.date, 'dd/MM')}:`, error.message);
      } else {
        insertedCount++;
      }
    }
    console.log(`✅ ${insertedCount} jours d'historique créés`);
    console.log('');

    // 8. Message de confirmation
    console.log('================================================');
    console.log('🎉 Seed terminé avec succès !');
    console.log('');
    console.log('📊 Résumé des données créées:');
    console.log(`   - Utilisateur: ${users.full_name || users.email}`);
    console.log(`   - Statistiques: Niveau ${testData.stats.level}, ${testData.stats.points} points`);
    console.log(`   - Achievements: ${testData.achievements.length} badges`);
    console.log(`   - Activités: ${testData.activities.length} activités récentes`);
    console.log(`   - Cours: ${testData.courses.length} cours en cours`);
    console.log(`   - Historique: ${insertedCount} jours de progression`);
    console.log('');
    console.log('💬 Message du jour:');
    console.log(`   "${testData.getRandomEncouragingMessage()}"`);
    console.log('');
    console.log('✨ Vous pouvez maintenant tester avec l\'utilisateur', TEST_USER_EMAIL);
    console.log('================================================');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    process.exit(1);
  }
}

// Exécution
seedTestUser().catch(console.error);
