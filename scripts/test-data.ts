/**
 * Données de test pour Aurora50
 * Utilisateur test : altoweb.fr@gmail.com
 */

import { addDays, subDays, format } from 'date-fns';

// Types pour les données
export interface UserStats {
  points: number;
  level: number;
  streak_days: number;
  total_lessons_completed: number;
  total_study_time_minutes: number;
  rank: number;
}

export interface Achievement {
  badge_id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond';
  earned_at?: Date;
}

export interface Activity {
  type: 'module_completed' | 'badge_unlocked' | 'community_participation' | 'course_started' | 'lesson_completed';
  title: string;
  description: string;
  icon: string;
  created_at: Date;
}

export interface Course {
  course_id: string;
  course_title: string;
  course_thumbnail?: string;
  current_lesson: number;
  total_lessons: number;
  progress_percentage: number;
  started_at: Date;
  last_accessed_at: Date;
}

export interface ProgressHistory {
  date: Date;
  points_earned: number;
  lessons_completed: number;
  study_time_minutes: number;
  streak_maintained: boolean;
}

// Statistiques globales de Marie Dupont
export const testUserStats: UserStats = {
  points: 1250,
  level: 8,
  streak_days: 12,
  total_lessons_completed: 42,
  total_study_time_minutes: 750, // 12h30
  rank: 23
};

// Achievements débloqués et verrouillés
export const testAchievements: Achievement[] = [
  {
    badge_id: 'first_login',
    title: 'Première connexion',
    description: 'Bienvenue dans la communauté Aurora50 !',
    icon: '🎯',
    rarity: 'bronze',
    earned_at: subDays(new Date(), 30)
  },
  {
    badge_id: 'perfect_week',
    title: 'Semaine parfaite',
    description: '7 jours consécutifs de pratique',
    icon: '🔥',
    rarity: 'silver',
    earned_at: subDays(new Date(), 15)
  },
  {
    badge_id: 'explorer',
    title: 'Exploratrice',
    description: '10 modules différents explorés',
    icon: '🗺️',
    rarity: 'gold',
    earned_at: subDays(new Date(), 7)
  }
];

// Activités récentes (derniers 10 jours)
export const testActivities: Activity[] = [
  {
    type: 'lesson_completed',
    title: 'Leçon terminée',
    description: 'Méditation guidée : Respiration profonde',
    icon: '📚',
    created_at: subDays(new Date(), 0)
  },
  {
    type: 'module_completed',
    title: 'Module complété',
    description: 'Introduction à la méditation guidée',
    icon: '✅',
    created_at: subDays(new Date(), 1)
  },
  {
    type: 'badge_unlocked',
    title: 'Badge débloqué',
    description: 'Exploratrice - 10 modules explorés',
    icon: '🏆',
    created_at: subDays(new Date(), 2)
  },
  {
    type: 'community_participation',
    title: 'Participation communautaire',
    description: 'Discussion dans le salon "Bien-être et épanouissement"',
    icon: '💬',
    created_at: subDays(new Date(), 3)
  },
  {
    type: 'course_started',
    title: 'Nouveau cours commencé',
    description: 'Yoga doux pour débutantes',
    icon: '🎯',
    created_at: subDays(new Date(), 4)
  },
  {
    type: 'lesson_completed',
    title: 'Leçon terminée',
    description: 'Nutrition équilibrée : Les super-aliments après 50 ans',
    icon: '📚',
    created_at: subDays(new Date(), 5)
  },
  {
    type: 'community_participation',
    title: 'Partage d\'expérience',
    description: 'Témoignage dans "Mon parcours Aurora50"',
    icon: '🌟',
    created_at: subDays(new Date(), 6)
  },
  {
    type: 'module_completed',
    title: 'Module complété',
    description: 'Gestion du stress au quotidien',
    icon: '✅',
    created_at: subDays(new Date(), 8)
  }
];

// Cours en cours
export const testCourses: Course[] = [
  {
    course_id: 'meditation_guidee',
    course_title: 'Méditation guidée pour débutantes',
    course_thumbnail: '/images/courses/meditation.jpg',
    current_lesson: 9,
    total_lessons: 12,
    progress_percentage: 75,
    started_at: subDays(new Date(), 25),
    last_accessed_at: subDays(new Date(), 0)
  },
  {
    course_id: 'yoga_doux',
    course_title: 'Yoga doux pour le bien-être',
    course_thumbnail: '/images/courses/yoga.jpg',
    current_lesson: 6,
    total_lessons: 20,
    progress_percentage: 30,
    started_at: subDays(new Date(), 15),
    last_accessed_at: subDays(new Date(), 2)
  },
  {
    course_id: 'nutrition_50plus',
    course_title: 'Nutrition équilibrée après 50 ans',
    course_thumbnail: '/images/courses/nutrition.jpg',
    current_lesson: 8,
    total_lessons: 15,
    progress_percentage: 53,
    started_at: subDays(new Date(), 20),
    last_accessed_at: subDays(new Date(), 5)
  }
];

// Génération de l'historique de progression sur 30 jours
export function generateProgressHistory(): ProgressHistory[] {
  const history: ProgressHistory[] = [];
  const today = new Date();
  let currentStreak = true;
  let totalPoints = 0;
  let totalLessons = 0;
  let totalMinutes = 0;

  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();
    
    // Simulation réaliste : moins d'activité le weekend
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Quelques jours sans activité pour être réaliste
    const skipDay = Math.random() > 0.85 && i > 12; // 15% de chance de skip, mais pas récemment
    
    if (skipDay) {
      history.push({
        date,
        points_earned: 0,
        lessons_completed: 0,
        study_time_minutes: 0,
        streak_maintained: false
      });
      currentStreak = false;
    } else {
      // Génération de données cohérentes
      const basePoints = isWeekend ? 20 : 40;
      const baseLessons = isWeekend ? 0 : 1;
      const baseMinutes = isWeekend ? 10 : 25;
      
      const points = basePoints + Math.floor(Math.random() * 30);
      const lessons = baseLessons + (Math.random() > 0.7 ? 1 : 0);
      const minutes = baseMinutes + Math.floor(Math.random() * 20);
      
      totalPoints += points;
      totalLessons += lessons;
      totalMinutes += minutes;
      
      history.push({
        date,
        points_earned: points,
        lessons_completed: lessons,
        study_time_minutes: minutes,
        streak_maintained: i <= 11 ? true : currentStreak // Les 12 derniers jours en streak
      });
      
      if (i <= 11) currentStreak = true; // Assurer le streak des 12 derniers jours
    }
  }
  
  // Ajuster pour correspondre aux totaux
  const pointsDiff = testUserStats.points - totalPoints;
  const lessonsDiff = testUserStats.total_lessons_completed - totalLessons;
  const minutesDiff = testUserStats.total_study_time_minutes - totalMinutes;
  
  // Répartir les différences sur les derniers jours actifs
  let adjustIndex = 0;
  while (pointsDiff > 0 && adjustIndex < history.length) {
    if (history[adjustIndex].points_earned > 0) {
      history[adjustIndex].points_earned += Math.min(pointsDiff, 20);
      break;
    }
    adjustIndex++;
  }
  
  return history;
}

// Messages bienveillants style Sigrid
export const encouragingMessages = [
  "Chère Marie, votre progression est remarquable ! Continuez à prendre soin de vous. 🌿",
  "Quelle belle énergie aujourd'hui ! Votre engagement inspire toute la communauté Aurora50. ✨",
  "Bravo pour votre constance ! Chaque petit pas compte dans votre renaissance. 🌸",
  "Votre série de 12 jours montre votre détermination. Vous êtes sur la bonne voie ! 💪",
  "Marie, votre parcours est une source d'inspiration. Continuez à briller ! ⭐"
];

// Fonction pour obtenir un message aléatoire
export function getRandomEncouragingMessage(): string {
  return encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
}

// Export de toutes les données
export const testData = {
  stats: testUserStats,
  achievements: testAchievements,
  activities: testActivities,
  courses: testCourses,
  generateProgressHistory,
  getRandomEncouragingMessage
};
