'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from '@/components/providers/AuthProvider'
import { Database } from '@/lib/database.types'
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

const Avatar = styled.div<{ avatarUrl?: string | null }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.avatarUrl 
    ? `url(${props.avatarUrl}) center/cover` 
    : 'linear-gradient(135deg, #10B981, #8B5CF6)'};
  border: 4px solid #FFFFFF;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
  position: relative;
  flex-shrink: 0;
  margin-top: -80px;
  
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
  
  // Utiliser des refs pour éviter les redirections et rechargements multiples
  const hasRedirected = useRef(false)
  const lastFetchedUserId = useRef<string | null>(null)
  const lastFetchedUsername = useRef<string | null>(null)
  
  // Effet séparé pour vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const username = params.username as string
      
      // Si c'est /profil/moi et qu'on n'a pas encore vérifié l'auth
      if (username === 'moi' && !authChecked) {
        // Attendre un peu pour laisser le temps à l'auth de se charger
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Si toujours pas d'utilisateur et qu'on n'a pas déjà redirigé
        if (!user && !hasRedirected.current) {
          hasRedirected.current = true
          router.push('/connexion')
          return
        }
      }
      
      setAuthChecked(true)
    }
    
    checkAuth()
  }, [params.username, user, authChecked, router])
  
  // Effet principal pour charger le profil
  useEffect(() => {
    // Ne pas charger si on n'a pas encore vérifié l'auth ou si on a redirigé
    if (!authChecked || hasRedirected.current) return
    
    const fetchProfile = async () => {
      // Déterminer l'ID du profil à charger
      const username = params.username as string
      let profileId: string
      
      if (username === 'moi') {
        if (!user) return
        profileId = user.id
      } else {
        profileId = username
      }
      
      // Vérifier si on a déjà chargé ce profil pour éviter les rechargements inutiles
      if (lastFetchedUserId.current === profileId && 
          lastFetchedUsername.current === username &&
          profile) {
        // Les données sont déjà chargées, pas besoin de recharger
        return
      }
      
      // Mémoriser ce qu'on est en train de charger
      lastFetchedUserId.current = profileId
      lastFetchedUsername.current = username
      
      try {
        setLoading(true)
        setError(null)
        
        // Déterminer si c'est son propre profil
        setIsOwnProfile(username === 'moi' || user?.id === profileId)
        
        // Récupérer les données du profil
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single()
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            setError('Profil non trouvé')
          } else {
            setError('Erreur lors du chargement du profil')
          }
          return
        }
        
        setProfile(data)
      } catch (err) {
        console.error('Erreur:', err)
        setError('Une erreur inattendue est survenue')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [params.username, user, authChecked, supabase])
  
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
              <Avatar avatarUrl={profile.avatar_url} />
              <UserInfo>
                <UserName>{profile.full_name || 'Membre Aurora50'}</UserName>
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
                <StatValue>{mockStats.points}</StatValue>
                <StatLabel>Points</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{mockStats.level}</StatValue>
                <StatLabel>Niveau</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>#{mockStats.rank}</StatValue>
                <StatLabel>Classement</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{mockStats.lessonsCompleted}</StatValue>
                <StatLabel>Leçons</StatLabel>
              </StatCard>
            </StatsGrid>
          </ProfileContent>
        </ProfileHeader>
        
        {/* Section Progression */}
        <Section>
          <SectionTitle>Progression</SectionTitle>
          
          <LevelInfo>
            <span>Niveau {mockStats.level}</span>
            <span>{mockStats.points} / {mockStats.nextLevelPoints} points</span>
          </LevelInfo>
          <ProgressBar>
            <ProgressFill progress={(mockStats.points / mockStats.nextLevelPoints) * 100} />
          </ProgressBar>
          
          <StreakContainer>
            <StreakFlame>🔥</StreakFlame>
            <StreakInfo>
              <StreakValue>{mockStats.streak} jours</StreakValue>
              <StreakLabel>Série en cours - Continue comme ça !</StreakLabel>
            </StreakInfo>
          </StreakContainer>
          
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
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
          <BadgeGrid>
            {mockAchievements.map(achievement => (
              <BadgeItem
                key={achievement.id}
                isLocked={achievement.isLocked}
                rarity={achievement.rarity}
              >
                <BadgeIcon isLocked={achievement.isLocked}>
                  {achievement.icon}
                </BadgeIcon>
                <BadgeTitle>{achievement.title}</BadgeTitle>
                <BadgeDescription>
                  {achievement.isLocked ? 'Verrouillé' : achievement.description}
                </BadgeDescription>
              </BadgeItem>
            ))}
          </BadgeGrid>
        </Section>
        
        {/* Section Activité Récente */}
        <Section>
          <SectionTitle>Activité Récente</SectionTitle>
          <Timeline>
            {mockActivities.map(activity => (
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
        </Section>
        
        {/* Section Cours en Cours */}
        <Section>
          <SectionTitle>Cours en Cours</SectionTitle>
          <CourseGrid>
            {mockCourses.map(course => (
              <CourseCard key={course.id}>
                <CourseThumbnail thumbnail={course.thumbnail} />
                <CourseContent>
                  <CourseTitle>{course.title}</CourseTitle>
                  <CourseLesson>{course.currentLesson}</CourseLesson>
                  <ProgressBar>
                    <ProgressFill progress={course.progress} />
                  </ProgressBar>
                  <CourseProgress>
                    <span>{course.progress}% complété</span>
                    <span>•</span>
                    <span>{Math.floor(course.totalLessons * course.progress / 100)}/{course.totalLessons} leçons</span>
                  </CourseProgress>
                </CourseContent>
              </CourseCard>
            ))}
          </CourseGrid>
        </Section>
      </ProfileContainer>
    </PageContainer>
  )
}
