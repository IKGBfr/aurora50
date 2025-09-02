'use client'

import styled from '@emotion/styled'
import { devices } from '@/lib/utils/breakpoints'
import { useAuth } from '@/lib/hooks/useAuth'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/database.types'
import LimitBanner from '@/components/freemium/LimitBanner'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'

// ========== FONCTIONS UTILITAIRES ==========
const isTestUser = (email: string | null): boolean => {
  return email?.endsWith('@test.aurora50.com') || false;
}

// Container principal
const DashboardContainer = styled.div`
  space-y: 1.5rem;
  
  @media ${devices.mobile} {
    padding: 0;
  }
`

// Titre principal
const DashboardTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(to right, #9333ea, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  
  @media ${devices.mobile} {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  @media ${devices.tablet} {
    font-size: 1.75rem;
  }
`

// Grille de statistiques
const StatsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media ${devices.mobile} {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media ${devices.tablet} {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  
  @media ${devices.laptop} {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
`

// Carte de statistique
const StatCard = styled.div<{ $color: 'purple' | 'pink' }>`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.$color === 'purple' ? '#e9d5ff' : '#fce7f3'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media ${devices.mobile} {
    padding: 1rem;
    border-radius: 12px;
  }
  
  @media ${devices.tablet} {
    padding: 1.25rem;
  }
`

// Titre de la carte
const StatTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  
  @media ${devices.mobile} {
    font-size: 1rem;
    margin-bottom: 0.375rem;
  }
`

// Valeur de la statistique
const StatValue = styled.p<{ $color: 'purple' | 'pink' }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.$color === 'purple' ? '#7c3aed' : '#ec4899'};
  margin-bottom: 0.25rem;
  
  @media ${devices.mobile} {
    font-size: 1.5rem;
  }
  
  @media ${devices.tablet} {
    font-size: 1.75rem;
  }
`

// Description de la statistique
const StatDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  
  @media ${devices.mobile} {
    font-size: 0.813rem;
  }
`

// Section de contenu
const ContentSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media ${devices.mobile} {
    padding: 1rem;
    border-radius: 12px;
  }
  
  @media ${devices.tablet} {
    padding: 1.25rem;
  }
`

// Titre de section
const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  
  @media ${devices.mobile} {
    font-size: 1.125rem;
    margin-bottom: 0.75rem;
  }
`

// Texte de contenu
const ContentText = styled.p`
  color: #6b7280;
  line-height: 1.6;
  
  @media ${devices.mobile} {
    font-size: 0.938rem;
  }
`

// Grille de leçons
const LessonsGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
  
  @media ${devices.mobile} {
    grid-template-columns: 1fr;
  }
  
  @media ${devices.tablet} {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media ${devices.laptop} {
    grid-template-columns: repeat(3, 1fr);
  }
`

// Carte de leçon
const LessonCard = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
  border-radius: 12px;
  border: 1px solid #e9d5ff;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(147, 51, 234, 0.1);
  }
  
  @media ${devices.mobile} {
    padding: 0.875rem;
    border-radius: 10px;
  }
`

// Titre de leçon
const LessonTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #7c3aed;
  margin-bottom: 0.25rem;
  
  @media ${devices.mobile} {
    font-size: 0.938rem;
  }
`

// Durée de leçon
const LessonDuration = styled.span`
  font-size: 0.813rem;
  color: #9ca3af;
`

// Badge de progression
const ProgressBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #ddd6fe 0%, #fce7f3 100%);
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #7c3aed;
  margin-top: 1rem;
  
  @media ${devices.mobile} {
    font-size: 0.813rem;
    padding: 0.25rem 0.625rem;
  }
`

// Nouveau composant pour les fonctionnalités premium
const PremiumFeature = styled.div`
  position: relative;
  opacity: 0.7;
  cursor: not-allowed;
  
  &::after {
    content: '🔒 Premium';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(139, 92, 246, 0.95);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
  }
`

// Composant Avatar pour le dashboard
const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`

const UserInfoSection = styled.div`
  flex: 1;
`

const UserName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
`

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e9d5ff;
  
  @media ${devices.mobile} {
    padding: 1rem;
    border-radius: 12px;
  }
`

const WelcomeTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  
  @media ${devices.mobile} {
    font-size: 1.25rem;
  }
`

const WelcomeMessage = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
  
  @media ${devices.mobile} {
    font-size: 0.938rem;
  }
`

// Nouveaux composants pour la progression
const ProgressCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9d5ff;
  
  @media ${devices.mobile} {
    padding: 1rem;
    border-radius: 12px;
  }
`

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #f3f4f6;
  border-radius: 100px;
  overflow: hidden;
  margin: 1rem 0;
`

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 100%);
  transition: width 0.5s ease;
`

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
`

const ProgressLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  
  @media ${devices.mobile} {
    font-size: 0.813rem;
  }
`

const ProgressValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #7c3aed;
  
  @media ${devices.mobile} {
    font-size: 0.813rem;
  }
`

export default function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [globalProgress, setGlobalProgress] = useState(0)
  const [completedLessons, setCompletedLessons] = useState(0)
  const [totalLessons, setTotalLessons] = useState(0)
  const [activeCoursesCount, setActiveCoursesCount] = useState(0)
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.push('/connexion')
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        
        // Si l'onboarding n'est pas complété, rediriger
        if (!data?.onboarding_completed) {
          router.push('/onboarding')
          return
        }

        setProfile(data as UserProfile)
        
        // Récupérer la progression globale
        // Récupérer toutes les leçons disponibles
        const { data: allLessons } = await supabase
          .from('lessons')
          .select('id')

        const totalLessonsCount = allLessons?.length || 0
        setTotalLessons(totalLessonsCount)

        // Récupérer les leçons complétées par l'utilisateur
        const { data: completedData } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', user.id)
          .eq('status', 'completed')

        const completedCount = completedData?.length || 0
        setCompletedLessons(completedCount)

        // Calculer le pourcentage global
        const progressPercentage = totalLessonsCount > 0 
          ? Math.round((completedCount / totalLessonsCount) * 100)
          : 0
        setGlobalProgress(progressPercentage)
        
        // Récupérer les cours actifs
        const { data: activeCourses } = await supabase
          .from('user_courses')
          .select('course_id')
          .eq('user_id', user.id)
          .gt('progress_percentage', 0)

        setActiveCoursesCount(activeCourses?.length || 0)

        // Récupérer la dernière activité
        const { data: lastActivity } = await supabase
          .from('user_activities')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (lastActivity) {
          const date = new Date(lastActivity.created_at)
          const options: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'long' 
          }
          setLastActivityDate(date.toLocaleDateString('fr-FR', options))
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, router, supabase])

  const handleUpgradeClick = () => {
    // TODO: Implémenter la redirection vers Stripe Checkout
    console.log('Redirection vers upgrade...')
  }

  if (loading) {
    return (
      <DashboardContainer>
        <DashboardTitle>Chargement...</DashboardTitle>
      </DashboardContainer>
    )
  }

  if (!profile) return null

  const isFreemium = profile.subscription_type === 'free'
  const firstName = profile.full_name?.split(' ')[0] || 'là'
  const isTest = isTestUser(profile.email)

  // Données conditionnelles selon le type d'utilisateur
  const stats = isTest ? [
    {
      title: 'Progression globale',
      value: '45%',
      description: 'Du parcours complété',
      color: 'purple' as const
    },
    {
      title: 'Messages envoyés',
      value: '127',
      description: 'Cette semaine',
      color: 'pink' as const
    },
    {
      title: 'Profils consultés',
      value: '23',
      description: 'Nouveaux contacts',
      color: 'purple' as const
    }
  ] : [
    {
      title: 'Progression globale',
      value: `${globalProgress}%`,
      description: completedLessons === 0 
        ? 'Commencez votre parcours'
        : `${completedLessons} leçon${completedLessons > 1 ? 's' : ''} sur ${totalLessons} complétée${completedLessons > 1 ? 's' : ''}`,
      color: 'purple' as const
    },
    {
      title: 'Messages envoyés',
      value: `${profile.daily_chat_count || 0}`,
      description: isFreemium ? `/ ${10} aujourd'hui` : 'Illimité',
      color: 'pink' as const
    },
    {
      title: 'Profils consultés',
      value: `${profile.daily_profile_views || 0}`,
      description: isFreemium ? `/ ${5} aujourd'hui` : 'Illimité',
      color: 'purple' as const
    }
  ]

  const upcomingLessons = [
    { title: 'Introduction à la méditation', duration: '15 min', locked: false },
    { title: 'Gérer son stress au quotidien', duration: '20 min', locked: isFreemium },
    { title: 'Développer sa confiance', duration: '25 min', locked: isFreemium }
  ]

  return (
    <DashboardContainer>
      <DashboardTitle>Tableau de Bord</DashboardTitle>
      
      {/* Bannière freemium pour les utilisateurs gratuits */}
      {isFreemium && profile && (
        <LimitBanner 
          user={profile}
          onUpgradeClick={handleUpgradeClick}
          onClose={() => {}}
        />
      )}

      {/* Section Avatar et info utilisateur */}
      <AvatarContainer>
        <Avatar 
          userId={profile.id}
          fullName={profile.full_name}
          avatarUrl={profile.avatar_url}
          size="large"
        />
        <UserInfoSection>
          <UserName>{profile.full_name || 'Membre Aurora50'}</UserName>
          <UserEmail>{profile.email}</UserEmail>
        </UserInfoSection>
      </AvatarContainer>

      {/* Message de bienvenue personnalisé */}
      <WelcomeSection>
        <WelcomeTitle>
          Bonjour {firstName} ! 🌿
        </WelcomeTitle>
        <WelcomeMessage>
          {isFreemium 
            ? "Bienvenue dans votre espace Aurora50. Explorez librement et découvrez tout ce que nous avons à vous offrir !"
            : "Ravie de vous retrouver ! Continuez votre belle transformation avec Aurora50."
          }
        </WelcomeMessage>
      </WelcomeSection>
      
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index} $color={stat.color}>
            <StatTitle>{stat.title}</StatTitle>
            <StatValue $color={stat.color}>{stat.value}</StatValue>
            <StatDescription>{stat.description}</StatDescription>
          </StatCard>
        ))}
      </StatsGrid>
      
      {/* Barre de progression détaillée */}
      {globalProgress > 0 && (
        <ProgressCard>
          <SectionTitle>Votre progression détaillée</SectionTitle>
          <ProgressBar>
            <ProgressFill percentage={globalProgress} />
          </ProgressBar>
          <ProgressInfo>
            <ProgressLabel>
              {activeCoursesCount > 0 
                ? `${activeCoursesCount} pilier${activeCoursesCount > 1 ? 's' : ''} en cours`
                : completedLessons > 0
                  ? `${completedLessons} leçon${completedLessons > 1 ? 's' : ''} complétée${completedLessons > 1 ? 's' : ''}`
                  : 'Aucune progression'
              }
            </ProgressLabel>
            <ProgressValue>{globalProgress}% complété</ProgressValue>
          </ProgressInfo>
          {lastActivityDate && (
            <ContentText style={{ marginTop: '0.5rem', fontSize: '0.813rem' }}>
              Dernière activité le {lastActivityDate}
            </ContentText>
          )}
        </ProgressCard>
      )}
      
      <ContentSection>
        <SectionTitle>Prochaines leçons</SectionTitle>
        <ContentText>
          {isFreemium 
            ? "Découvrez nos leçons gratuites et passez à Premium pour accéder à tout le contenu."
            : "Continuez votre parcours de transformation avec ces leçons recommandées pour vous."
          }
        </ContentText>
        
        <LessonsGrid>
          {upcomingLessons.map((lesson, index) => {
            const LessonWrapper = lesson.locked ? PremiumFeature : 'div'
            return (
              <LessonWrapper key={index}>
                <LessonCard>
                  <LessonTitle>{lesson.title}</LessonTitle>
                  <LessonDuration>⏱ {lesson.duration}</LessonDuration>
                </LessonCard>
              </LessonWrapper>
            )
          })}
        </LessonsGrid>
        
        {isTest && (
          <ProgressBadge>
            🎯 3 leçons à compléter cette semaine
          </ProgressBadge>
        )}
      </ContentSection>
      
      <ContentSection>
        <SectionTitle>
          {isFreemium ? 'Débloquez votre potentiel' : 'Activité récente'}
        </SectionTitle>
        <ContentText>
          {isTest 
            ? "Vous avez été très actif cette semaine ! Continuez sur cette lancée pour atteindre vos objectifs de transformation personnelle."
            : isFreemium 
              ? "Avec Aurora50 Premium, accédez à tous les cours, participez aux lives de Sigrid, échangez sans limite avec la communauté et bien plus encore !"
              : "Commencez votre parcours de transformation avec Aurora50. Explorez les cours et connectez-vous avec la communauté."
          }
        </ContentText>
        {isFreemium && (
          <ProgressBadge style={{ cursor: 'pointer' }} onClick={handleUpgradeClick}>
            🚀 Passer à Premium maintenant
          </ProgressBadge>
        )}
      </ContentSection>
    </DashboardContainer>
  )
}
