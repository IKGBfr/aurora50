'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/providers/AuthProvider'
import { Database } from '@/lib/database.types'
import Avatar from '@/components/ui/Avatar'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

// ========== TYPES ==========
type Profile = Database['public']['Tables']['profiles']['Row']

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  rarity: 'bronze' | 'silver' | 'gold' | 'diamond'
  isLocked: boolean
}

interface Activity {
  id: string
  type: 'lesson' | 'achievement' | 'chat' | 'course'
  title: string
  description: string
  timestamp: Date
  icon: string
}

interface Course {
  id: string
  title: string
  progress: number
  totalLessons: number
  completedLessons?: number
  currentLesson: string
  thumbnail: string
}

interface ProfileStats {
  points: number
  level: number
  nextLevelPoints: number
  streak: number
  totalStudyTime: string
  lessonsCompleted: number
  rank: number
}

// ========== ANIMATIONS ==========
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`

const flame = keyframes`
  0%, 100% {
    transform: scale(1) rotate(-2deg);
  }
  25% {
    transform: scale(1.05) rotate(2deg);
  }
  50% {
    transform: scale(1.1) rotate(-1deg);
  }
  75% {
    transform: scale(1.05) rotate(1deg);
  }
`

const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotateY(0);
  }
  50% {
    transform: translateY(-5px) rotateY(180deg);
  }
`

// ========== STYLED COMPONENTS ==========
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out;
`

const ProfileHeader = styled.div`
  background: #FFFFFF;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  position: relative;
`

const CoverImage = styled.div<{ coverUrl?: string | null }>`
  height: 200px;
  background: ${props => props.coverUrl 
    ? `url(${props.coverUrl}) center/cover` 
    : 'linear-gradient(135deg, #10B981, #8B5CF6, #EC4899)'};
  position: relative;
  
  @media (min-width: 768px) {
    height: 250px;
  }
  
  &::after {
    content: '🌿';
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    font-size: 2rem;
    opacity: 0.8;
    animation: ${float} 4s ease-in-out infinite;
  }
`

const ProfileContent = styled.div`
  padding: 1.5rem;
  position: relative;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`

const AvatarSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-top: -60px;
  margin-bottom: 1.5rem;
  padding-top: 80px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -50px;
    padding-top: 70px;
  }
`

const AvatarWrapper = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #FFFFFF;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
  position: relative;
  flex-shrink: 0;
  margin-top: -80px;
  overflow: hidden;  /* Important pour contenir l'avatar */
  display: flex;     /* Pour centrer l'avatar */
  align-items: center;
  justify-content: center;
  background: white; /* Fond blanc au cas où */
  
  @media (min-width: 768px) {
    width: 140px;
    height: 140px;
    border-width: 5px;
  }
  
  @media (max-width: 768px) {
    margin-top: -70px;
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    padding: 2px;
    background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    z-index: -1;  /* S'assurer que le gradient est derrière */
  }
`

const UserInfo = styled.div`
  flex: 1;
  padding-bottom: 1rem;
  padding-top: 0.5rem;
`

const UserName = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  
  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`

const UserBio = styled.p`
  color: #4B5563;
  line-height: 1.6;
  margin-bottom: 1rem;
  max-width: 600px;
`

const UserMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #6B7280;
  font-size: 0.9rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`

const EditButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10B981, #8B5CF6);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
`

const StatCard = styled.div`
  background: linear-gradient(135deg, #F9FAFB, #FFFFFF);
  padding: 1.25rem;
  border-radius: 16px;
  text-align: center;
  border: 1px solid rgba(139, 92, 246, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.15);
  }
`

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #10B981, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.25rem;
`

const StatLabel = styled.div`
  color: #6B7280;
  font-size: 0.875rem;
`

const Section = styled.section`
  background: #FFFFFF;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  animation: ${fadeIn} 0.6s ease-out;
  animation-fill-mode: both;
  
  &:nth-of-type(2) {
    animation-delay: 0.1s;
  }
  
  &:nth-of-type(3) {
    animation-delay: 0.2s;
  }
  
  &:nth-of-type(4) {
    animation-delay: 0.3s;
  }
  
  &:nth-of-type(5) {
    animation-delay: 0.4s;
  }
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '🌿';
    font-size: 1.25rem;
  }
`

const ProgressBar = styled.div`
  background: #F3F4F6;
  height: 12px;
  border-radius: 100px;
  overflow: hidden;
  margin: 1rem 0;
`

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #10B981, #8B5CF6);
  border-radius: 100px;
  transition: width 1s ease-out;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    background-size: 200% 100%;
    animation: ${shimmer} 2s linear infinite;
  }
`

const LevelInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`

const StreakContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #FEF3C7, #FED7AA);
  border-radius: 16px;
  margin-top: 1.5rem;
`

const StreakFlame = styled.div`
  font-size: 2.5rem;
  animation: ${flame} 2s ease-in-out infinite;
`

const StreakInfo = styled.div`
  flex: 1;
`

const StreakValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #92400E;
`

const StreakLabel = styled.div`
  color: #B45309;
  font-size: 0.875rem;
`

const ChartContainer = styled.div`
  height: 300px;
  margin-top: 1.5rem;
`

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
`

const BadgeItem = styled.div<{ isLocked: boolean; rarity: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem 1rem;
  border-radius: 16px;
  background: ${props => props.isLocked ? '#F9FAFB' : '#FFFFFF'};
  border: 2px solid ${props => {
    if (props.isLocked) return '#E5E7EB';
    switch (props.rarity) {
      case 'diamond': return '#60A5FA';
      case 'gold': return '#FCD34D';
      case 'silver': return '#D1D5DB';
      default: return '#F59E0B';
    }
  }};
  transition: all 0.3s ease;
  cursor: ${props => props.isLocked ? 'default' : 'pointer'};
  position: relative;
  opacity: ${props => props.isLocked ? 0.6 : 1};
  
  &:hover {
    transform: ${props => props.isLocked ? 'none' : 'translateY(-4px) scale(1.05)'};
    box-shadow: ${props => props.isLocked ? 'none' : '0 10px 30px rgba(139, 92, 246, 0.2)'};
  }
  
  ${props => !props.isLocked && `
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 16px;
      padding: 2px;
      background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    &:hover::before {
      opacity: 1;
    }
  `}
`

const BadgeIcon = styled.div<{ isLocked: boolean }>`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  filter: ${props => props.isLocked ? 'grayscale(1)' : 'none'};
`

const BadgeTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`

const BadgeDescription = styled.div`
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.25rem;
`

const Timeline = styled.div`
  position: relative;
  padding-left: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0.75rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #10B981, #8B5CF6);
  }
`

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 2rem;
  
  &:last-child {
    padding-bottom: 0;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 0.5rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 3px solid #8B5CF6;
  }
`

const TimelineContent = styled.div`
  background: #F9FAFB;
  padding: 1rem;
  border-radius: 12px;
  margin-left: 0.5rem;
`

const TimelineTitle = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
`

const TimelineDescription = styled.div`
  color: #6B7280;
  font-size: 0.875rem;
`

const TimelineTime = styled.div`
  color: #9CA3AF;
  font-size: 0.75rem;
  margin-top: 0.5rem;
`

const CourseGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const CourseCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15);
    border-color: #8B5CF6;
  }
`

const CourseThumbnail = styled.div<{ thumbnail: string }>`
  height: 120px;
  background: ${props => props.thumbnail 
    ? `url(${props.thumbnail}) center/cover` 
    : 'linear-gradient(135deg, #10B981, #8B5CF6)'};
  position: relative;
`

const CourseContent = styled.div`
  padding: 1rem;
`

const CourseTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
`

const CourseLesson = styled.div`
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`

const CourseProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6B7280;
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  font-size: 1.25rem;
  color: #6B7280;
`

const ErrorContainer = styled.div`
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  background: #FFFFFF;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
`

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  color: #DC2626;
  margin-bottom: 1rem;
`

const ErrorMessage = styled.p`
  color: #6B7280;
  line-height: 1.6;
`

// ========== DONNÉES MOCKÉES ==========
const mockStats: ProfileStats = {
  points: 1250,
  level: 8,
  nextLevelPoints: 1500,
  streak: 12,
  totalStudyTime: '48h 30min',
  lessonsCompleted: 42,
  rank: 23
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Première connexion',
    description: 'Bienvenue dans Aurora50',
    icon: '🎯',
    unlockedAt: new Date('2024-01-15'),
    rarity: 'bronze',
    isLocked: false
  },
  {
    id: '2',
    title: 'Semaine parfaite',
    description: '7 jours consécutifs',
    icon: '🔥',
    unlockedAt: new Date('2024-01-22'),
    rarity: 'silver',
    isLocked: false
  },
  {
    id: '3',
    title: 'Exploratrice',
    description: '10 modules explorés',
    icon: '🗺️',
    unlockedAt: new Date('2024-02-01'),
    rarity: 'gold',
    isLocked: false
  },
  {
    id: '4',
    title: 'Mentor',
    description: 'Aider 5 membres',
    icon: '🤝',
    rarity: 'gold',
    isLocked: true
  },
  {
    id: '5',
    title: 'Étoile montante',
    description: 'Top 10 du classement',
    icon: '⭐',
    rarity: 'diamond',
    isLocked: true
  },
  {
    id: '6',
    title: 'Sage',
    description: '100 leçons complétées',
    icon: '🦉',
    rarity: 'diamond',
    isLocked: true
  }
]

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'lesson',
    title: 'Module complété',
    description: 'Introduction à la méditation guidée',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: '📚'
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Badge débloqué',
    description: 'Exploratrice - 10 modules explorés',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    icon: '🏆'
  },
  {
    id: '3',
    type: 'chat',
    title: 'Participation communautaire',
    description: 'Discussion dans le salon "Bien-être"',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    icon: '💬'
  },
  {
    id: '4',
    type: 'course',
    title: 'Nouveau cours commencé',
    description: 'Yoga pour débutantes',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    icon: '🎯'
  }
]

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Méditation guidée',
    progress: 75,
    totalLessons: 12,
    currentLesson: 'Leçon 9: Respiration profonde',
    thumbnail: ''
  },
  {
    id: '2',
    title: 'Yoga pour débutantes',
    progress: 30,
    totalLessons: 20,
    currentLesson: 'Leçon 6: Salutation au soleil',
    thumbnail: ''
  },
  {
    id: '3',
    title: 'Nutrition équilibrée',
    progress: 50,
    totalLessons: 15,
    currentLesson: 'Leçon 8: Les super-aliments',
    thumbnail: ''
  }
]

const mockChartData = [
  { month: 'Jan', points: 320 },
  { month: 'Fév', points: 450 },
  { month: 'Mar', points: 580 },
  { month: 'Avr', points: 720 },
  { month: 'Mai', points: 890 },
  { month: 'Juin', points: 1250 }
]

// ========== FONCTIONS UTILITAIRES ==========
const isTestUser = (email: string | null): boolean => {
  return email?.endsWith('@test.aurora50.com') || false;
}

// Générer les labels de mois entre deux dates
const generateMonthLabels = (startDate: Date, endDate: Date): string[] => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  const labels: string[] = []
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Si moins d'un mois, retourner les jours
  const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff < 30) {
    // Retourner les 7 derniers jours
    for (let i = 6; i >= 0; i--) {
      const date = new Date(end)
      date.setDate(date.getDate() - i)
      labels.push(`${date.getDate()}/${date.getMonth() + 1}`)
    }
    return labels
  }
  
  // Sinon, retourner les mois
  const current = new Date(start)
  while (current <= end) {
    labels.push(months[current.getMonth()])
    current.setMonth(current.getMonth() + 1)
    
    // Limiter à 6 mois pour l'affichage
    if (labels.length >= 6) break
  }
  
  return labels
}

// Calculer la période d'affichage
const calculateChartPeriod = (registrationDate: Date): { labels: string[], periodText: string, isNewUser: boolean } => {
  const now = new Date()
  const daysSinceRegistration = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysSinceRegistration < 7) {
    // Nouvel utilisateur - afficher "Cette semaine"
    return {
      labels: generateMonthLabels(registrationDate, now),
      periodText: 'Cette semaine',
      isNewUser: true
    }
  } else if (daysSinceRegistration < 30) {
    // Utilisateur récent - afficher "Ce mois"
    return {
      labels: generateMonthLabels(registrationDate, now),
      periodText: 'Ce mois',
      isNewUser: true
    }
  } else if (daysSinceRegistration < 180) {
    // Moins de 6 mois - afficher depuis l'inscription
    const monthCount = Math.ceil(daysSinceRegistration / 30)
    return {
      labels: generateMonthLabels(registrationDate, now),
      periodText: `${monthCount} derniers mois`,
      isNewUser: false
    }
  } else {
    // Plus de 6 mois - afficher les 6 derniers mois
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return {
      labels: generateMonthLabels(sixMonthsAgo, now),
      periodText: '6 derniers mois',
      isNewUser: false
    }
  }
}

// Générer les données du graphique à partir des activités
const generateChartDataFromActivities = (
  activities: any[], 
  registrationDate: Date, 
  labels: string[],
  isNewUser: boolean
): any[] => {
  if (!activities || activities.length === 0) {
    // Si pas d'activités, retourner des données vides
    return labels.map(label => ({ month: label, points: 0 }))
  }
  
  // Grouper les activités par période
  const pointsByPeriod = new Map<string, number>()
  
  activities.forEach(activity => {
    const activityDate = new Date(activity.created_at)
    let periodKey: string
    
    if (isNewUser) {
      // Pour les nouveaux utilisateurs, grouper par jour
      periodKey = `${activityDate.getDate()}/${activityDate.getMonth() + 1}`
    } else {
      // Pour les autres, grouper par mois
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      periodKey = months[activityDate.getMonth()]
    }
    
    // 10 points par leçon complétée
    const currentPoints = pointsByPeriod.get(periodKey) || 0
    pointsByPeriod.set(periodKey, currentPoints + 10)
  })
  
  // Créer les données cumulatives
  let cumulativePoints = 0
  return labels.map(label => {
    const periodPoints = pointsByPeriod.get(label) || 0
    cumulativePoints += periodPoints
    return { month: label, points: cumulativePoints }
  })
}

// ========== COMPOSANT PRINCIPAL ==========
export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  // Créer le client Supabase une seule fois avec useMemo
  const supabase = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
    []
  )
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  
  // États pour les données réelles
  const [realStats, setRealStats] = useState<ProfileStats>({
    points: 0,
    level: 1,
    nextLevelPoints: 100,
    streak: 0,
    totalStudyTime: '0h',
    lessonsCompleted: 0,
    rank: 0
  })
  const [realAchievements, setRealAchievements] = useState<Achievement[]>([])
  const [realActivities, setRealActivities] = useState<Activity[]>([])
  const [realCourses, setRealCourses] = useState<Course[]>([])
  const [progressData, setProgressData] = useState<any[]>([])
  const [chartPeriodLabel, setChartPeriodLabel] = useState<string>('')
  
  // Utiliser des refs pour éviter les redirections et rechargements multiples
  const hasRedirected = useRef(false)
  const lastFetchedUserId = useRef<string | null>(null)
  const lastFetchedUsername = useRef<string | null>(null)
  
  // Effet unique pour gérer l'authentification et le chargement du profil
  useEffect(() => {
    const loadProfile = async () => {
      const username = params.username as string
      
      // Si on a déjà redirigé, ne rien faire
      if (hasRedirected.current) return
      
      // Si c'est /profil/moi, vérifier l'authentification
      if (username === 'moi') {
        // Attendre un peu pour laisser le temps à l'auth de se charger
        if (!authChecked) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setAuthChecked(true)
        }
        
        // Si pas d'utilisateur connecté, rediriger vers connexion
        if (!user) {
          hasRedirected.current = true
          router.push('/connexion')
          return
        }
        
        // Appeler l'API pour garantir l'existence du profil et vérifier l'onboarding
        console.log('[Profile Page] Appel API pour garantir l\'existence du profil...')
        
        try {
          const response = await fetch('/api/profile/ensure', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          const result = await response.json()
          console.log('[Profile Page] Réponse API:', result)
          
          if (!response.ok) {
            console.error('[Profile Page] Erreur API:', result)
            setError(result.error || 'Impossible de créer le profil')
            setLoading(false)
            return
          }
          
          // Si l'onboarding est nécessaire, rediriger UNE SEULE FOIS
          if (result.needsOnboarding && !hasRedirected.current) {
            console.log('[Profile Page] Onboarding nécessaire, redirection...')
            hasRedirected.current = true
            router.push('/onboarding')
            return
          }
          
          // Si on arrive ici, le profil existe et l'onboarding est complété
          // Charger les données complètes du profil
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
          
          if (profileError) {
            console.error('[Profile Page] Erreur lors du chargement du profil:', profileError)
            setError('Erreur lors du chargement du profil')
            setLoading(false)
            return
          }
          
          if (!data) {
            console.log('[Profile Page] Profil non trouvé')
            setError('Profil non trouvé')
            setLoading(false)
            return
          }
          
          console.log('[Profile Page] Profil chargé avec succès')
          setProfile(data)
          setIsOwnProfile(true)
          
          // Récupérer les données réelles de progression
          const profileId = data.id
          
          // Récupérer les statistiques réelles
          const { data: userStats } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', profileId)
            .single()

          if (userStats) {
            const level = Math.floor((userStats.points || 0) / 200) + 1 // 200 points par niveau
            setRealStats({
              points: userStats.points || 0,
              level: level,
              nextLevelPoints: level * 200,
              streak: userStats.streak_days || 0,
              totalStudyTime: userStats.total_study_time_minutes 
                ? `${Math.floor(userStats.total_study_time_minutes / 60)}h ${userStats.total_study_time_minutes % 60}min`
                : '0h',
              lessonsCompleted: userStats.total_lessons_completed || 0,
              rank: userStats.rank || 0
            })
          } else {
            // Si pas de stats, calculer depuis user_lesson_progress
            const { data: completedLessons } = await supabase
              .from('user_lesson_progress')
              .select('lesson_id')
              .eq('user_id', profileId)
              .eq('status', 'completed')
            
            const lessonsCount = completedLessons?.length || 0
            const points = lessonsCount * 10 // 10 points par leçon
            const level = Math.floor(points / 200) + 1
            
            setRealStats({
              points: points,
              level: level,
              nextLevelPoints: level * 200,
              streak: 0,
              totalStudyTime: '0h',
              lessonsCompleted: lessonsCount,
              rank: 0
            })
          }

          // Récupérer les achievements réels
          const { data: userAchievements } = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', profileId)
            .order('earned_at', { ascending: false })

          if (userAchievements && userAchievements.length > 0) {
            const achievements = userAchievements.map((a: any) => ({
              id: a.id,
              title: a.title || 'Achievement',
              description: a.description || '',
              icon: a.icon || '🏆',
              unlockedAt: new Date(a.earned_at),
              rarity: (a.rarity || 'bronze') as 'bronze' | 'silver' | 'gold' | 'diamond',
              isLocked: false
            }))
            setRealAchievements(achievements)
          }

          // Récupérer l'activité récente
          const { data: activities } = await supabase
            .from('user_activities')
            .select('*')
            .eq('user_id', profileId)
            .order('created_at', { ascending: false })
            .limit(10) // Récupérer plus pour pouvoir filtrer

          if (activities && activities.length > 0) {
            // Filtrer les doublons basés sur type + description
            const uniqueActivities = activities.reduce((acc, activity) => {
              const key = `${activity.type}-${activity.description}`
              const existingIndex = acc.findIndex((a: any) => 
                `${a.type}-${a.description}` === key &&
                // Considérer comme doublon si dans la même heure
                Math.abs(new Date(a.created_at).getTime() - new Date(activity.created_at).getTime()) < 3600000
              )
              
              if (existingIndex === -1) {
                acc.push(activity)
              }
              return acc
            }, [] as typeof activities)
            
            // Prendre seulement les 5 premières activités uniques
            const activityList = uniqueActivities.slice(0, 5).map((a: any) => ({
              id: a.id,
              type: (a.type || 'lesson') as 'lesson' | 'achievement' | 'chat' | 'course',
              title: a.title || 'Activité',
              description: a.description || '',
              timestamp: new Date(a.created_at),
              icon: a.icon || '📚'
            }))
            setRealActivities(activityList)
          }

          // Charger les cours avec leur progression RÉELLE
          await loadUserCoursesWithProgress(profileId)

          // Générer les données de progression dynamiques basées sur la date d'inscription
          if (data.created_at) {
            const registrationDate = new Date(data.created_at)
            const chartPeriod = calculateChartPeriod(registrationDate)
            
            // Définir la période affichée
            setChartPeriodLabel(chartPeriod.periodText)
            
            // Récupérer les activités de type lesson_completed pour générer le graphique
            const { data: lessonActivities } = await supabase
              .from('user_activities')
              .select('*')
              .eq('user_id', profileId)
              .eq('type', 'lesson_completed')
              .gte('created_at', registrationDate.toISOString())
              .order('created_at', { ascending: true })
            
            // Générer les données du graphique
            const chartData = generateChartDataFromActivities(
              lessonActivities || [],
              registrationDate,
              chartPeriod.labels,
              chartPeriod.isNewUser
            )
            
            // Si pas d'activités mais des points, créer une progression simulée
            if ((!lessonActivities || lessonActivities.length === 0) && realStats.points > 0) {
              const simulatedData = chartPeriod.labels.map((label, index) => {
                const progress = Math.floor((realStats.points / chartPeriod.labels.length) * (index + 1))
                return { month: label, points: progress }
              })
              setProgressData(simulatedData)
            } else {
              setProgressData(chartData)
            }
          } else {
            // Fallback si pas de date de création
            setProgressData([])
            setChartPeriodLabel('Période inconnue')
          }
          
          setLoading(false)
          
        } catch (error) {
          console.error('[Profile Page] Erreur lors de l\'appel API:', error)
          setError('Erreur de connexion au serveur')
          setLoading(false)
        }
      } else {
        // Profil d'un autre utilisateur
        try {
          setLoading(true)
          
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', username)
            .maybeSingle()
          
          if (profileError) {
            console.error('[Profile Page] Erreur lors du chargement du profil:', profileError)
            setError('Erreur lors du chargement du profil')
            setLoading(false)
            return
          }
          
          if (!data) {
            console.log('[Profile Page] Profil non trouvé pour ID:', username)
            setError('Profil non trouvé')
            setLoading(false)
            return
          }
          
          setProfile(data)
          setIsOwnProfile(user?.id === username)
          setLoading(false)
          
        } catch (err) {
          console.error('[Profile Page] Erreur inattendue:', err)
          setError('Une erreur inattendue est survenue')
          setLoading(false)
        }
      }
    }
    
    loadProfile()
  }, [params.username, user, supabase, router, authChecked])

  // Fonction séparée pour charger les cours avec la progression réelle
  const loadUserCoursesWithProgress = async (userId: string) => {
    const { data: userCourses } = await supabase
      .from('user_courses')
      .select('*')
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false })

    if (userCourses && userCourses.length > 0) {
      // Pour chaque cours, récupérer la progression réelle
      const coursesWithProgress = await Promise.all(
        userCourses.map(async (course) => {
          // Récupérer les leçons du cours
          const { data: courseLessons } = await supabase
            .from('lessons')
            .select('id')
            .eq('course_id', course.course_id)
          
          const totalLessons = courseLessons?.length || course.total_lessons || 0
          
          // Récupérer les leçons complétées pour ce cours
          const { data: completedLessons } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .in('lesson_id', courseLessons?.map(l => l.id) || [])
          
          const completedCount = completedLessons?.length || 0
          const progressPercentage = totalLessons > 0 
            ? Math.round((completedCount / totalLessons) * 100)
            : 0
          
          return {
            id: course.id,
            title: course.course_title || 'Cours',
            progress: progressPercentage,
            totalLessons: totalLessons,
            completedLessons: completedCount,
            currentLesson: `Leçon ${course.current_lesson || 1}`,
            thumbnail: course.course_thumbnail || ''
          }
        })
      )
      
      setRealCourses(coursesWithProgress)
    }
  }

  // Effet pour recharger les cours quand la page reprend le focus
  useEffect(() => {
    if (!profile?.id) return

    const handleFocus = () => {
      console.log('[Profile Page] Rechargement des cours actifs...')
      loadUserCoursesWithProgress(profile.id)
    }
    
    // Écouter l'événement focus
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [profile?.id, supabase])
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date inconnue'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    })
  }
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
    } else {
      return 'À l\'instant'
    }
  }
  
  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Chargement du profil... 🌿</div>
        </LoadingContainer>
      </PageContainer>
    )
  }
  
  if (error || !profile) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorTitle>Oops ! 😔</ErrorTitle>
          <ErrorMessage>
            {error || 'Impossible de charger le profil'}
          </ErrorMessage>
          <EditButton 
            onClick={() => router.push('/dashboard')}
            style={{ marginTop: '2rem' }}
          >
            Retour au tableau de bord
          </EditButton>
        </ErrorContainer>
      </PageContainer>
    )
  }
  
  return (
    <PageContainer>
      <ProfileContainer>
        {/* Header du profil */}
        <ProfileHeader>
          <CoverImage coverUrl={profile.cover_url} />
          <ProfileContent>
            <AvatarSection>
              <AvatarWrapper>
                <Avatar 
                  userId={profile.id}
                  fullName={profile.full_name}
                  avatarUrl={profile.avatar_url}
                  size="large"
                />
              </AvatarWrapper>
              <UserInfo>
                <UserName>
                  {profile.full_name || 'Membre Aurora50'}
                </UserName>
                <UserBio>
                  {profile.bio || 'Passionnée par l\'apprentissage et le développement personnel. En route vers une nouvelle renaissance avec Aurora50 🌿'}
                </UserBio>
                <UserMeta>
                  <span>📅 Membre depuis {formatDate(profile.created_at)}</span>
                  <span>✉️ {profile.email?.split('@')[0]}@...</span>
                </UserMeta>
              </UserInfo>
              {isOwnProfile && (
                <EditButton onClick={() => router.push('/profil/modifier')}>
                  Modifier le profil
                </EditButton>
              )}
            </AvatarSection>
            
            <StatsGrid>
              <StatCard>
                <StatValue>{realStats.points}</StatValue>
                <StatLabel>Points</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{realStats.level}</StatValue>
                <StatLabel>Niveau</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>#{realStats.rank || '-'}</StatValue>
                <StatLabel>Classement</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{realStats.lessonsCompleted}</StatValue>
                <StatLabel>Leçons</StatLabel>
              </StatCard>
            </StatsGrid>
          </ProfileContent>
        </ProfileHeader>
        
        {/* Section Progression */}
        <Section>
          <SectionTitle>
            Progression {chartPeriodLabel && `(${chartPeriodLabel})`}
          </SectionTitle>
          
          <LevelInfo>
            <span>Niveau {realStats.level}</span>
            <span>{realStats.points} / {realStats.nextLevelPoints} points</span>
          </LevelInfo>
          <ProgressBar>
            <ProgressFill progress={(realStats.points / realStats.nextLevelPoints) * 100} />
          </ProgressBar>
          
          <StreakContainer>
            <StreakFlame>🔥</StreakFlame>
            <StreakInfo>
              <StreakValue>{realStats.streak} jours</StreakValue>
              <StreakLabel>
                {realStats.streak > 0 
                  ? 'Série en cours - Continue comme ça !' 
                  : 'Commence ta série dès aujourd\'hui !'}
              </StreakLabel>
            </StreakInfo>
          </StreakContainer>
          
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData.length > 0 ? progressData : [
                { month: 'Jan', points: 0 },
                { month: 'Fév', points: 0 },
                { month: 'Mar', points: 0 },
                { month: 'Avr', points: 0 },
                { month: 'Mai', points: 0 },
                { month: 'Juin', points: 0 }
              ]}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  style={{ fontSize: '0.875rem' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '0.875rem' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="points"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPoints)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Section>
        
        {/* Section Achievements */}
        <Section>
          <SectionTitle>Achievements</SectionTitle>
          {realAchievements.length > 0 ? (
            <BadgeGrid>
              {realAchievements.map(achievement => (
                <BadgeItem
                  key={achievement.id}
                  isLocked={false}
                  rarity={achievement.rarity}
                >
                  <BadgeIcon isLocked={false}>
                    {achievement.icon}
                  </BadgeIcon>
                  <BadgeTitle>{achievement.title}</BadgeTitle>
                  <BadgeDescription>{achievement.description}</BadgeDescription>
                </BadgeItem>
              ))}
            </BadgeGrid>
          ) : (
            <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>
              Aucun achievement débloqué pour le moment. Continue ton parcours pour débloquer des badges ! 🌟
            </p>
          )}
        </Section>
        
        {/* Section Activité Récente */}
        <Section>
          <SectionTitle>Activité Récente</SectionTitle>
          {realActivities.length > 0 ? (
            <Timeline>
              {realActivities.map(activity => (
                <TimelineItem key={activity.id}>
                  <TimelineContent>
                    <TimelineTitle>
                      {activity.icon} {activity.title}
                    </TimelineTitle>
                    <TimelineDescription>
                      {activity.description}
                    </TimelineDescription>
                    <TimelineTime>
                      {formatTimeAgo(activity.timestamp)}
                    </TimelineTime>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>
              Aucune activité récente. Commence à explorer Aurora50 ! 🚀
            </p>
          )}
        </Section>
        
        {/* Section Mes Piliers Actifs */}
        <Section>
          <SectionTitle>Mes Piliers Actifs</SectionTitle>
          {realCourses.length > 0 ? (
            <CourseGrid>
              {realCourses.map(course => (
                <CourseCard key={course.id}>
                  <CourseThumbnail thumbnail={course.thumbnail}>
                    {course.thumbnail && (
                      <div style={{ 
                        fontSize: '3rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%'
                      }}>
                        {course.thumbnail}
                      </div>
                    )}
                  </CourseThumbnail>
                  <CourseContent>
                    <CourseTitle>{course.title}</CourseTitle>
                    <CourseLesson>{course.currentLesson}</CourseLesson>
                    <ProgressBar>
                      <ProgressFill progress={course.progress} />
                    </ProgressBar>
                    <CourseProgress>
                      <span>{course.progress}% complété</span>
                      <span>•</span>
                      <span>
                        {course.completedLessons ?? Math.floor(course.totalLessons * course.progress / 100)}/{course.totalLessons} leçons
                      </span>
                    </CourseProgress>
                  </CourseContent>
                </CourseCard>
              ))}
            </CourseGrid>
          ) : (
            <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>
              Aucun pilier en cours. Explore nos 7 piliers de transformation pour commencer ta renaissance ! 🌿
            </p>
          )}
        </Section>
      </ProfileContainer>
    </PageContainer>
  )
}
