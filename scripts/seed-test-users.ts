import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✓' : '✗');
  process.exit(1);
}

// Client Supabase avec service role key pour les opérations admin
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Données des utilisateurs de test
const TEST_USERS = [
  {
    email: 'marie.dubois@test.aurora50.com',
    password: 'Aurora50Test2024!',
    profile: {
      full_name: 'Marie Dubois',
      bio: 'Passionnée de développement personnel et de bien-être. J\'adore partager mes découvertes avec la communauté Aurora50 ! 🌿',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
      email: 'marie.dubois@test.aurora50.com'
    },
    stats: {
      points: 2450,
      level: 12,
      courses_completed: 8,
      badges_earned: 15,
      streak_days: 45,
      total_watch_time: 3600,
      community_rank: 3
    },
    achievements: [
      { type: 'course_completed', name: 'Première Formation', description: 'A terminé sa première formation', earned_at: '2024-01-15' },
      { type: 'streak_30', name: 'Régularité', description: '30 jours de connexion consécutifs', earned_at: '2024-02-20' },
      { type: 'helper', name: 'Entraide', description: 'A aidé 10 membres', earned_at: '2024-03-10' }
    ],
    courses: [
      { course_id: 1, progress: 100, completed: true, last_accessed: '2024-03-15' },
      { course_id: 2, progress: 100, completed: true, last_accessed: '2024-03-20' },
      { course_id: 3, progress: 75, completed: false, last_accessed: '2024-03-25' }
    ]
  },
  {
    email: 'sylvie.martin@test.aurora50.com',
    password: 'Aurora50Test2024!',
    profile: {
      full_name: 'Sylvie Martin',
      bio: 'Coach en reconversion, je découvre Aurora50 et j\'adore ! Toujours prête pour de nouveaux défis 💪',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sylvie',
      email: 'sylvie.martin@test.aurora50.com'
    },
    stats: {
      points: 1850,
      level: 9,
      courses_completed: 5,
      badges_earned: 11,
      streak_days: 23,
      total_watch_time: 2400,
      community_rank: 8
    },
    achievements: [
      { type: 'course_completed', name: 'Première Formation', description: 'A terminé sa première formation', earned_at: '2024-02-01' },
      { type: 'early_bird', name: 'Lève-tôt', description: 'Connexion avant 6h du matin', earned_at: '2024-02-15' }
    ],
    courses: [
      { course_id: 1, progress: 100, completed: true, last_accessed: '2024-03-10' },
      { course_id: 2, progress: 60, completed: false, last_accessed: '2024-03-24' }
    ]
  },
  {
    email: 'catherine.leroy@test.aurora50.com',
    password: 'Aurora50Test2024!',
    profile: {
      full_name: 'Catherine Leroy',
      bio: 'Entrepreneure et maman de 3 enfants. Aurora50 m\'aide à trouver mon équilibre 🌸',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=catherine',
      email: 'catherine.leroy@test.aurora50.com'
    },
    stats: {
      points: 3200,
      level: 15,
      courses_completed: 12,
      badges_earned: 22,
      streak_days: 67,
      total_watch_time: 5400,
      community_rank: 1
    },
    achievements: [
      { type: 'course_completed', name: 'Première Formation', description: 'A terminé sa première formation', earned_at: '2024-01-05' },
      { type: 'streak_60', name: 'Persévérance', description: '60 jours de connexion consécutifs', earned_at: '2024-03-01' },
      { type: 'top_contributor', name: 'Top Contributrice', description: 'Fait partie du top 3', earned_at: '2024-03-15' }
    ],
    courses: [
      { course_id: 1, progress: 100, completed: true, last_accessed: '2024-03-01' },
      { course_id: 2, progress: 100, completed: true, last_accessed: '2024-03-10' },
      { course_id: 3, progress: 100, completed: true, last_accessed: '2024-03-20' },
      { course_id: 4, progress: 45, completed: false, last_accessed: '2024-03-25' }
    ]
  },
  {
    email: 'isabelle.moreau@test.aurora50.com',
    password: 'Aurora50Test2024!',
    profile: {
      full_name: 'Isabelle Moreau',
      bio: 'Professeure de yoga et adepte du développement personnel. Ravie de faire partie de cette belle communauté 🧘‍♀️',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=isabelle',
      email: 'isabelle.moreau@test.aurora50.com'
    },
    stats: {
      points: 2100,
      level: 10,
      courses_completed: 6,
      badges_earned: 13,
      streak_days: 34,
      total_watch_time: 2800,
      community_rank: 5
    },
    achievements: [
      { type: 'course_completed', name: 'Première Formation', description: 'A terminé sa première formation', earned_at: '2024-01-20' },
      { type: 'social_butterfly', name: 'Papillon Social', description: 'A interagi avec 50 membres', earned_at: '2024-02-28' }
    ],
    courses: [
      { course_id: 1, progress: 100, completed: true, last_accessed: '2024-03-05' },
      { course_id: 2, progress: 100, completed: true, last_accessed: '2024-03-15' },
      { course_id: 3, progress: 30, completed: false, last_accessed: '2024-03-25' }
    ]
  },
  {
    email: 'nathalie.bernard@test.aurora50.com',
    password: 'Aurora50Test2024!',
    profile: {
      full_name: 'Nathalie Bernard',
      bio: 'En pleine transformation personnelle à 50 ans ! Aurora50 est ma boussole 🌟',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nathalie',
      email: 'nathalie.bernard@test.aurora50.com'
    },
    stats: {
      points: 1650,
      level: 8,
      courses_completed: 4,
      badges_earned: 9,
      streak_days: 18,
      total_watch_time: 2000,
      community_rank: 12
    },
    achievements: [
      { type: 'course_completed', name: 'Première Formation', description: 'A terminé sa première formation', earned_at: '2024-02-10' },
      { type: 'night_owl', name: 'Oiseau de Nuit', description: 'Active après minuit', earned_at: '2024-03-05' }
    ],
    courses: [
      { course_id: 1, progress: 100, completed: true, last_accessed: '2024-03-18' },
      { course_id: 2, progress: 85, completed: false, last_accessed: '2024-03-24' }
    ]
  },
  {
    email: 'christine.petit@test.aurora50.com',
    password: 'Aurora50Test2024!',
    profile: {
      full_name: 'Christine Petit',
      bio: 'Artiste et créatrice. J\'explore ma créativité grâce à Aurora50 🎨',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=christine',
      email: 'christine.petit@test.aurora50.com'
    },
    stats: {
      points: 2750,
      level: 13,
      courses_completed: 9,
      badges_earned: 18,
      streak_days: 52,
      total_watch_time: 4200,
      community_rank: 2
    },
    achievements: [
      { type: 'course_completed', name: 'Première Formation', description: 'A terminé sa première formation', earned_at: '2024-01-10' },
      { type: 'streak_50', name: 'Constance', description: '50 jours de connexion consécutifs', earned_at: '2024-03-10' },
      { type: 'creative_soul', name: 'Âme Créative', description: 'A partagé 20 créations', earned_at: '2024-03-20' }
    ],
    courses: [
      { course_id: 1, progress: 100, completed: true, last_accessed: '2024-03-08' },
      { course_id: 2, progress: 100, completed: true, last_accessed: '2024-03-12' },
      { course_id: 3, progress: 100, completed: true, last_accessed: '2024-03-22' }
    ]
  },
  {
    email: 'brigitte.rousseau@test.aurora50.com',
    password: 'Aurora50Test2024!',
    profile: {
      full_name: 'Brigitte Rousseau',
      bio: 'Retraitée active, je profite de cette nouvelle étape pour apprendre et grandir 🌺',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=brigitte',
      email: 'brigitte.rousseau@test.aurora50.com'
    },
    stats: {
      points: 1950,
      level: 9,
      courses_completed: 5,
      badges_earned: 12,
      streak_days: 28,
      total_watch_time: 2600,
      community_rank: 7
    },
    achievements: [
      { type: 'course_completed', name: 'Première Formation', description: 'A terminé sa première formation', earned_at: '2024-01-25' },
      { type: 'wisdom_sharer', name: 'Sagesse Partagée', description: 'A partagé son expérience', earned_at: '2024-02-20' }
    ],
    courses: [
      { course_id: 1, progress: 100, completed: true, last_accessed: '2024-03-12' },
      { course_id: 2, progress: 100, completed: true, last_accessed: '2024-03-20' },
      { course_id: 3, progress: 20, completed: false, last_accessed: '2024-03-25' }
    ]
  },
  {
    email: 'veronique.durand@test.aurora50.com',
    password: 'Aurora50Test2024!',
    profile: {
      full_name: 'Véronique Durand',
      bio: 'Consultante en transition professionnelle. Aurora50 m\'accompagne dans mon évolution 🚀',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=veronique',
      email: 'veronique.durand@test.aurora50.com'
    },
    stats: {
      points: 2300,
      level: 11,
      courses_completed: 7,
      badges_earned: 16,
      streak_days: 39,
      total_watch_time: 3200,
      community_rank: 4
    },
    achievements: [
      { type: 'course_completed', name: 'Première Formation', description: 'A terminé sa première formation', earned_at: '2024-01-18' },
      { type: 'mentor', name: 'Mentor', description: 'A mentoré 5 membres', earned_at: '2024-03-01' },
      { type: 'streak_30', name: 'Régularité', description: '30 jours de connexion consécutifs', earned_at: '2024-02-25' }
    ],
    courses: [
      { course_id: 1, progress: 100, completed: true, last_accessed: '2024-03-06' },
      { course_id: 2, progress: 100, completed: true, last_accessed: '2024-03-14' },
      { course_id: 3, progress: 90, completed: false, last_accessed: '2024-03-25' }
    ]
  },
  {
    email: 'philippe.lefebvre@test.aurora50.com',
    password: 'Aurora50Test2024!',
    profile: {
      full_name: 'Philippe Lefebvre',
      bio: 'Entrepreneur et père de famille. Je cherche l\'équilibre entre vie pro et perso 💼',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=philippe',
      email: 'philippe.lefebvre@test.aurora50.com'
    },
    stats: {
      points: 1750,
      level: 8,
      courses_completed: 4,
      badges_earned: 10,
      streak_days: 21,
      total_watch_time: 2200,
      community_rank: 10
    },
    achievements: [
      { type: 'course_completed', name: 'Première Formation', description: 'A terminé sa première formation', earned_at: '2024-02-05' },
      { type: 'weekend_warrior', name: 'Guerrier du Weekend', description: 'Actif tous les weekends', earned_at: '2024-03-15' }
    ],
    courses: [
      { course_id: 1, progress: 100, completed: true, last_accessed: '2024-03-16' },
      { course_id: 2, progress: 50, completed: false, last_accessed: '2024-03-24' }
    ]
  },
  {
    email: 'jeanmarc.thomas@test.aurora50.com',
    password: 'Aurora50Test2024!',
    profile: {
      full_name: 'Jean-Marc Thomas',
      bio: 'Coach sportif en reconversion. Aurora50 m\'ouvre de nouvelles perspectives 🏃‍♂️',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jeanmarc',
      email: 'jeanmarc.thomas@test.aurora50.com'
    },
    stats: {
      points: 2000,
      level: 10,
      courses_completed: 6,
      badges_earned: 14,
      streak_days: 31,
      total_watch_time: 3000,
      community_rank: 6
    },
    achievements: [
      { type: 'course_completed', name: 'Première Formation', description: 'A terminé sa première formation', earned_at: '2024-01-30' },
      { type: 'fitness_guru', name: 'Guru Fitness', description: 'A partagé des conseils sportifs', earned_at: '2024-02-15' },
      { type: 'streak_30', name: 'Régularité', description: '30 jours de connexion consécutifs', earned_at: '2024-03-05' }
    ],
    courses: [
      { course_id: 1, progress: 100, completed: true, last_accessed: '2024-03-10' },
      { course_id: 2, progress: 100, completed: true, last_accessed: '2024-03-18' },
      { course_id: 3, progress: 65, completed: false, last_accessed: '2024-03-25' }
    ]
  }
];

async function seedTestUsers() {
  console.log('🌱 Début du seeding des utilisateurs de test...\n');
  
  const results = {
    success: [] as string[],
    errors: [] as string[]
  };

  for (const userData of TEST_USERS) {
    try {
      console.log(`📝 Création de ${userData.profile.full_name}...`);
      
      // 1. Créer l'utilisateur avec auth.admin
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.profile.full_name
        }
      });

      if (authError) {
        throw new Error(`Erreur auth: ${authError.message}`);
      }

      const userId = authData.user.id;
      console.log(`  ✓ Utilisateur créé (ID: ${userId})`);

      // 2. Créer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...userData.profile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        throw new Error(`Erreur profil: ${profileError.message}`);
      }
      console.log(`  ✓ Profil créé`);

      // 3. Créer les stats utilisateur
      const { error: statsError } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          points: userData.stats.points,
          level: userData.stats.level,
          streak_days: userData.stats.streak_days,
          total_lessons_completed: userData.stats.courses_completed * 10, // Estimation
          total_study_time_minutes: userData.stats.total_watch_time,
          rank: userData.stats.community_rank
        });

      if (statsError) {
        throw new Error(`Erreur stats: ${statsError.message}`);
      }
      console.log(`  ✓ Stats utilisateur créées`);

      // 4. Créer les achievements
      for (const achievement of userData.achievements) {
        const rarityMap: { [key: string]: string } = {
          'course_completed': 'bronze',
          'early_bird': 'bronze',
          'night_owl': 'bronze',
          'weekend_warrior': 'bronze',
          'streak_30': 'silver',
          'social_butterfly': 'silver',
          'wisdom_sharer': 'silver',
          'fitness_guru': 'silver',
          'streak_50': 'gold',
          'helper': 'gold',
          'mentor': 'gold',
          'streak_60': 'gold',
          'creative_soul': 'diamond',
          'top_contributor': 'diamond'
        };

        const { error: achievementError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            badge_id: achievement.type,
            title: achievement.name,
            description: achievement.description,
            icon: '🏆',
            rarity: rarityMap[achievement.type] || 'bronze',
            earned_at: achievement.earned_at
          });

        if (achievementError) {
          console.warn(`  ⚠ Achievement non créé: ${achievementError.message}`);
        }
      }
      console.log(`  ✓ ${userData.achievements.length} achievements créés`);

      // 5. Créer les progressions de cours
      for (const course of userData.courses) {
        const courseNames = [
          'Introduction à Aurora50',
          'Développement Personnel',
          'Bien-être et Équilibre',
          'Créativité et Expression'
        ];
        
        const { error: courseError } = await supabase
          .from('user_courses')
          .insert({
            user_id: userId,
            course_id: `course_${course.course_id}`,
            course_title: courseNames[course.course_id - 1] || `Cours ${course.course_id}`,
            course_thumbnail: `https://picsum.photos/seed/course${course.course_id}/400/300`,
            current_lesson: Math.floor((course.progress / 100) * 10) || 1,
            total_lessons: 10,
            progress_percentage: course.progress,
            started_at: '2024-01-01',
            last_accessed_at: course.last_accessed,
            completed_at: course.completed ? course.last_accessed : null
          });

        if (courseError) {
          console.warn(`  ⚠ Progression cours non créée: ${courseError.message}`);
        }
      }
      console.log(`  ✓ ${userData.courses.length} progressions de cours créées`);

      // 6. Créer quelques activités récentes
      const activities = [
        {
          user_id: userId,
          type: 'lesson_completed',
          title: 'Leçon terminée',
          description: 'A terminé une leçon du cours',
          icon: '✅',
          metadata: { course_id: userData.courses[0]?.course_id },
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: userId,
          type: 'community_participation',
          title: 'Participation communautaire',
          description: 'A participé au chat communautaire',
          icon: '💬',
          metadata: { chat_messages: Math.floor(Math.random() * 10) + 1 },
          created_at: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      for (const activity of activities) {
        const { error: activityError } = await supabase
          .from('user_activities')
          .insert(activity);

        if (activityError) {
          console.warn(`  ⚠ Activité non créée: ${activityError.message}`);
        }
      }
      console.log(`  ✓ Activités récentes créées`);

      results.success.push(userData.profile.full_name);
      console.log(`✅ ${userData.profile.full_name} créé avec succès!\n`);
      
    } catch (error) {
      const errorMessage = `❌ Erreur pour ${userData.profile.full_name}: ${error}`;
      console.error(errorMessage);
      results.errors.push(errorMessage);
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DU SEEDING');
  console.log('='.repeat(50));
  console.log(`✅ Succès: ${results.success.length}/${TEST_USERS.length} utilisateurs`);
  if (results.success.length > 0) {
    results.success.forEach(name => console.log(`  • ${name}`));
  }
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Erreurs: ${results.errors.length}`);
    results.errors.forEach(error => console.log(`  • ${error}`));
  }

  console.log('\n🎉 Seeding terminé!');
  console.log('📧 Emails de test:');
  TEST_USERS.forEach(user => {
    console.log(`  • ${user.email} (mot de passe: ${user.password})`);
  });
}

async function cleanTestUsers() {
  console.log('🧹 Nettoyage des utilisateurs de test...\n');
  
  let deletedCount = 0;
  
  for (const userData of TEST_USERS) {
    try {
      // Récupérer l'ID de l'utilisateur par email
      const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
      
      if (fetchError) {
        console.error(`Erreur lors de la récupération des utilisateurs: ${fetchError.message}`);
        continue;
      }

      const user = users.users.find(u => u.email === userData.email);
      
      if (user) {
        // Supprimer l'utilisateur (cascade delete supprimera automatiquement les données liées)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error(`❌ Erreur suppression ${userData.email}: ${deleteError.message}`);
        } else {
          console.log(`✅ ${userData.email} supprimé`);
          deletedCount++;
        }
      } else {
        console.log(`⚠️  ${userData.email} non trouvé`);
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${userData.email}: ${error}`);
    }
  }
  
  console.log(`\n🧹 Nettoyage terminé: ${deletedCount}/${TEST_USERS.length} utilisateurs supprimés`);
}

// Fonction principale
async function main() {
  const command = process.argv[2];
  
  if (command === 'seed') {
    await seedTestUsers();
  } else if (command === 'clean') {
    await cleanTestUsers();
  } else {
    console.log('Usage:');
    console.log('  npm run seed:test-users    # Créer les utilisateurs de test');
    console.log('  npm run clean:test-users   # Supprimer les utilisateurs de test');
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

export { seedTestUsers, cleanTestUsers };
