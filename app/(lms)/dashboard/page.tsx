'use client'

import styled from '@emotion/styled'
import { devices } from '@/lib/utils/breakpoints'
import { useAuth, useRequireAuth } from '@/lib/hooks/useAuth'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'
// import LimitBanner from '@/components/freemium/LimitBanner' // Supprimé
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import { useSalons } from '@/lib/hooks/useSalons'
import { FiUsers, FiMessageCircle, FiTrendingUp, FiMapPin, FiClock, FiAward, FiPlus, FiArrowRight, FiLock } from 'react-icons/fi'

type UserProfile = Database['public']['Tables']['profiles']['Row']

// ========== FONCTIONS UTILITAIRES ==========
const isTestUser = (email: string | null): boolean => {
  return email?.endsWith('@test.aurora50.com') || false;
}

// ========== COMPOSANTS OVERLAY CONFIRMATION EMAIL ==========
const EmailConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`

const ConfirmationCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  @media ${devices.mobile} {
    padding: 2rem;
    border-radius: 16px;
  }
`

const ConfirmationTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  
  @media ${devices.mobile} {
    font-size: 1.5rem;
  }
`

const ConfirmationText = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  
  @media ${devices.mobile} {
    font-size: 0.938rem;
  }
`

const EmailHighlight = styled.span`
  color: #7c3aed;
  font-weight: 600;
`

const ResendButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media ${devices.mobile} {
    font-size: 0.938rem;
    padding: 0.625rem 1.5rem;
  }
`

const ResendInfo = styled.p`
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #9ca3af;
  
  @media ${devices.mobile} {
    font-size: 0.813rem;
  }
`

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

// Section Gamification
const GamificationSection = styled.div`
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

const GamificationTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media ${devices.mobile} {
    font-size: 1.125rem;
  }
`

const ProgressBar = styled.div`
  width: 100%;
  height: 24px;
  background: #f3f4f6;
  border-radius: 100px;
  overflow: hidden;
  position: relative;
  margin: 1rem 0;
`

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 100%);
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.5rem;
`

const ProgressText = styled.span`
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`

const GamificationInfo = styled.p`
  color: #6b7280;
  font-size: 0.938rem;
  margin-top: 0.5rem;
  
  @media ${devices.mobile} {
    font-size: 0.875rem;
  }
`

const EliteBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.125rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  
  @media ${devices.mobile} {
    font-size: 1rem;
  }
`

// Grille de salons
const SalonsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
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

// Carte de salon
const SalonCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    border-color: #8b5cf6;
  }
  
  @media ${devices.mobile} {
    padding: 1rem;
    border-radius: 12px;
  }
`

const SalonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`

const SalonName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media ${devices.mobile} {
    font-size: 1rem;
  }
`

const OwnerBadge = styled.span`
  font-size: 1.25rem;
`

const UnreadBadge = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
`

const SalonStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
  
  svg {
    color: #9ca3af;
  }
`

const LastActivity = styled.p`
  color: #9ca3af;
  font-size: 0.813rem;
  margin-top: 0.5rem;
`

const EnterButton = styled.button`
  width: 100%;
  padding: 0.625rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.938rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
`

// Grille de statistiques
const StatsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media ${devices.mobile} {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  @media ${devices.tablet} {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  
  @media ${devices.laptop} {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
`

// Carte de statistique
const StatCard = styled.div<{ $color: 'purple' | 'pink' | 'green' | 'blue' }>`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => {
    switch(props.$color) {
      case 'purple': return '#e9d5ff';
      case 'pink': return '#fce7f3';
      case 'green': return '#d1fae5';
      case 'blue': return '#dbeafe';
      default: return '#e5e7eb';
    }
  }};
  
  @media ${devices.mobile} {
    padding: 1rem;
    border-radius: 12px;
  }
`

const StatIcon = styled.div<{ $color: 'purple' | 'pink' | 'green' | 'blue' }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  background: ${props => {
    switch(props.$color) {
      case 'purple': return '#f3e8ff';
      case 'pink': return '#fce7f3';
      case 'green': return '#d1fae5';
      case 'blue': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.$color) {
      case 'purple': return '#7c3aed';
      case 'pink': return '#ec4899';
      case 'green': return '#10b981';
      case 'blue': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
`

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.25rem;
`

const StatValue = styled.p<{ $color: 'purple' | 'pink' | 'green' | 'blue' }>`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => {
    switch(props.$color) {
      case 'purple': return '#7c3aed';
      case 'pink': return '#ec4899';
      case 'green': return '#10b981';
      case 'blue': return '#3b82f6';
      default: return '#1f2937';
    }
  }};
  
  @media ${devices.mobile} {
    font-size: 1.5rem;
  }
`

// Section découverte
const DiscoverSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  
  @media ${devices.mobile} {
    padding: 1rem;
    border-radius: 12px;
  }
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media ${devices.mobile} {
    font-size: 1.125rem;
    margin-bottom: 0.75rem;
  }
`

const DiscoverGrid = styled.div`
  display: grid;
  gap: 1rem;
  
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

const DiscoverCard = styled.div`
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
`

const DiscoverCardTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #7c3aed;
  margin-bottom: 0.25rem;
  
  @media ${devices.mobile} {
    font-size: 0.938rem;
  }
`

const DiscoverCardInfo = styled.p`
  font-size: 0.813rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

// Call to action
const CTASection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  
  @media ${devices.mobile} {
    padding: 1.5rem;
    border-radius: 12px;
  }
`

const CTATitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  
  @media ${devices.mobile} {
    font-size: 1.25rem;
  }
`

const CTAText = styled.p`
  font-size: 1rem;
  margin-bottom: 1.5rem;
  opacity: 0.95;
  
  @media ${devices.mobile} {
    font-size: 0.938rem;
  }
`

const CTAButton = styled.button`
  padding: 0.875rem 2rem;
  background: white;
  color: #7c3aed;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
  
  @media ${devices.mobile} {
    font-size: 0.938rem;
    padding: 0.75rem 1.5rem;
  }
`

// Message de chargement
const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: #6b7280;
  font-size: 1.125rem;
`

// Empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
`

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth('/connexion')
  const { mySalons, salons, loading: salonsLoading } = useSalons()
  const router = useRouter()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailConfirmed, setEmailConfirmed] = useState(true)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  
  // Stats pour gamification
  const [totalMembers, setTotalMembers] = useState(0)
  const [todayMessages, setTodayMessages] = useState(0)
  const [newConnections, setNewConnections] = useState(0)
  const [popularSalons, setPopularSalons] = useState<any[]>([])
  
  const supabase = createClient()

  // Fonction pour renvoyer l'email de confirmation
  const resendConfirmationEmail = async () => {
    if (resendingEmail || resendCooldown > 0 || !user) return
    
    setResendingEmail(true)
    
    try {
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          userId: user.id
        })
      })
      
      if (!response.ok) throw new Error('Erreur lors de l\'envoi')
      
      // Démarrer le cooldown de 60 secondes
      setResendCooldown(60)
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email:', error)
    } finally {
      setResendingEmail(false)
    }
  }

  useEffect(() => {
    if (authLoading) {
      console.log('[Dashboard] Auth loading...')
      return
    }

    if (!user) {
      console.log('[Dashboard] Pas d\'utilisateur')
      return
    }

    const loadProfile = async () => {
      try {
        console.log('[Dashboard] Chargement du profil pour:', user.id)

        // Récupérer le profil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('[Dashboard] Erreur récupération profil:', profileError)
          
          if (profileError.code === 'PGRST116') {
            console.log('[Dashboard] Profil inexistant, création...')
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                onboarding_completed: false,
                subscription_type: 'free'
              })
            
            if (insertError) {
              console.error('[Dashboard] Erreur création profil:', insertError)
            } else {
              console.log('[Dashboard] Profil créé, redirection vers onboarding')
              router.push('/onboarding')
              return
            }
          }
          
          router.push('/onboarding')
          return
        }
        
        console.log('[Dashboard] Profil trouvé:', {
          id: profileData.id,
          onboardingCompleted: profileData.onboarding_completed,
          fullName: profileData.full_name,
          emailVerified: (profileData as any).email_verified
        })
        
        // Vérifier le statut de confirmation de l'email
        const isEmailConfirmed = (profileData as any).email_verified === true
        setEmailConfirmed(isEmailConfirmed)
        console.log('[Dashboard] Email confirmé (custom):', isEmailConfirmed)
        
        // Si l'onboarding n'est pas complété, rediriger
        if (!profileData.onboarding_completed) {
          console.log('[Dashboard] Onboarding non complété, redirection')
          router.push('/onboarding')
          return
        }

        setProfile(profileData as UserProfile)
        
        // Charger les stats de gamification
        await loadGamificationStats()
        
      } catch (error) {
        console.error('[Dashboard] Erreur générale:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, authLoading, router, supabase])

  const loadGamificationStats = async () => {
    if (!user) return

    try {
      // Récupérer les salons où l'utilisateur est owner
      const { data: ownedSalons } = await supabase
        .from('salons')
        .select('member_count')
        .eq('owner_id', user.id)
      
      const total = ownedSalons?.reduce((sum, s) => sum + (s.member_count || 0), 0) || 0
      setTotalMembers(total)

      // Messages aujourd'hui
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
      
      setTodayMessages(count || 0)

      // Salons populaires pour découverte
      const { data: popular } = await supabase
        .from('salons')
        .select('*')
        .eq('is_active', true)
        .order('member_count', { ascending: false })
        .limit(3)
      
      setPopularSalons(popular || [])

      // Nouvelles connexions cette semaine
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { count: connections } = await supabase
        .from('salon_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('joined_at', weekAgo.toISOString())
      
      setNewConnections(connections || 0)
      
    } catch (error) {
      console.error('[Dashboard] Erreur chargement stats:', error)
    }
  }

  const handleUpgradeClick = () => {
    console.log('Redirection vers upgrade...')
    router.push('/upgrade')
  }

  const handleEnterSalon = (salonId: string) => {
    router.push(`/salons/${salonId}`)
  }

  // Afficher le chargement si nécessaire
  if (loading || authLoading || salonsLoading) {
    return (
      <DashboardContainer>
        <LoadingMessage>Chargement de votre espace...</LoadingMessage>
      </DashboardContainer>
    )
  }

  // Si pas de profil après chargement, ne rien afficher
  if (!profile) {
    return null
  }

  const isFreemium = profile.subscription_type === 'free'
  const isPremium = profile.subscription_type === 'premium' || 
                    profile.subscription_type === 'founder' || 
                    profile.subscription_type === 'trial'
  const firstName = profile.full_name?.split(' ')[0] || 'là'
  const isTest = isTestUser(profile.email)

  // Filtrer mes salons où je suis owner
  const ownedSalons = mySalons.filter(s => s.owner_id === user?.id)
  const hasOwnedSalons = ownedSalons.length > 0
  const progressPercentage = (totalMembers / 200) * 100

  return (
    <>
      {/* Overlay de confirmation email */}
      {!emailConfirmed && (
        <EmailConfirmationOverlay>
          <ConfirmationCard>
            <ConfirmationTitle>Confirmez votre email 📧</ConfirmationTitle>
            <ConfirmationText>
              Pour accéder à toutes les fonctionnalités d'Aurora50, veuillez confirmer votre adresse email.
            </ConfirmationText>
            <ConfirmationText>
              Un email de confirmation a été envoyé à{' '}
              <EmailHighlight>{user?.email}</EmailHighlight>
            </ConfirmationText>
            <ConfirmationText>
              Vérifiez votre boîte de réception et vos spams.
            </ConfirmationText>
            
            <ResendButton 
              onClick={resendConfirmationEmail}
              disabled={resendingEmail || resendCooldown > 0}
            >
              {resendingEmail 
                ? 'Envoi en cours...' 
                : resendCooldown > 0 
                  ? `Renvoyer dans ${resendCooldown}s`
                  : 'Renvoyer l\'email'
              }
            </ResendButton>
            
            {resendCooldown > 0 && (
              <ResendInfo>
                Email envoyé ! Vérifiez votre boîte de réception.
              </ResendInfo>
            )}
          </ConfirmationCard>
        </EmailConfirmationOverlay>
      )}

      <DashboardContainer>
        <DashboardTitle>Hub des Salons</DashboardTitle>

        {/* Section Gamification - Seulement si l'utilisateur a créé des salons */}
        {hasOwnedSalons && (
          <GamificationSection>
            {totalMembers >= 200 ? (
              <EliteBadge>
                <FiAward size={24} />
                🏆 Créatrice Elite - Abonnement à vie débloqué !
              </EliteBadge>
            ) : (
              <>
                <GamificationTitle>
                  <FiTrendingUp />
                  Votre progression vers l'abonnement gratuit
                </GamificationTitle>
                <ProgressBar>
                  <ProgressFill $percentage={progressPercentage}>
                    <ProgressText>{totalMembers}/200</ProgressText>
                  </ProgressFill>
                </ProgressBar>
                <GamificationInfo>
                  Atteignez 200 membres dans vos salons pour obtenir Aurora50 Premium à vie ! 
                  Plus que {200 - totalMembers} membres à recruter.
                </GamificationInfo>
              </>
            )}
          </GamificationSection>
        )}

        {/* Section Mes Salons Actifs */}
        {mySalons.length > 0 && (
          <>
            <SectionTitle>
              <FiMessageCircle />
              Mes Salons Actifs
            </SectionTitle>
            <SalonsGrid>
              {mySalons.slice(0, 6).map(salon => (
                <SalonCard key={salon.id} onClick={() => handleEnterSalon(salon.id)}>
                  {/* Badge messages non lus (simulé) */}
                  {Math.random() > 0.7 && <UnreadBadge>3</UnreadBadge>}
                  
                  <SalonHeader>
                    <SalonName>
                      {salon.name}
                      {salon.owner_id === user?.id && <OwnerBadge>👑</OwnerBadge>}
                    </SalonName>
                  </SalonHeader>
                  
                  <SalonStats>
                    <StatItem>
                      <FiUsers size={14} />
                      {salon.member_count} membres
                    </StatItem>
                    <StatItem>
                      <FiMessageCircle size={14} />
                      {salon.message_count} messages
                    </StatItem>
                  </SalonStats>
                  
                  <LastActivity>
                    <FiClock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Actif il y a 2 heures
                  </LastActivity>
                  
                  <EnterButton>
                    Entrer <FiArrowRight />
                  </EnterButton>
                </SalonCard>
              ))}
            </SalonsGrid>
          </>
        )}

        {/* Statistiques Sociales */}
        <SectionTitle>📊 Vos Statistiques</SectionTitle>
        <StatsGrid>
          <StatCard $color="purple">
            <StatIcon $color="purple">
              <FiUsers />
            </StatIcon>
            <StatTitle>Salons rejoints</StatTitle>
            <StatValue $color="purple">{mySalons.length}</StatValue>
          </StatCard>
          
          <StatCard $color="pink">
            <StatIcon $color="pink">
              <FiMessageCircle />
            </StatIcon>
            <StatTitle>Messages aujourd'hui</StatTitle>
            <StatValue $color="pink">{todayMessages}</StatValue>
          </StatCard>
          
          <StatCard $color="green">
            <StatIcon $color="green">
              <FiUsers />
            </StatIcon>
            <StatTitle>Membres dans vos salons</StatTitle>
            <StatValue $color="green">{totalMembers}</StatValue>
          </StatCard>
          
          <StatCard $color="blue">
            <StatIcon $color="blue">
              <FiTrendingUp />
            </StatIcon>
            <StatTitle>Nouvelles connexions</StatTitle>
            <StatValue $color="blue">{newConnections}</StatValue>
          </StatCard>
        </StatsGrid>

        {/* Section Découvrir */}
        <DiscoverSection>
          <SectionTitle>
            🔍 Découvrir de nouveaux salons
          </SectionTitle>
          <DiscoverGrid>
            {popularSalons.map(salon => (
              <DiscoverCard key={salon.id} onClick={() => router.push(`/salons`)}>
                <DiscoverCardTitle>{salon.name}</DiscoverCardTitle>
                <DiscoverCardInfo>
                  <FiUsers size={12} />
                  {salon.member_count} membres
                  {salon.city && (
                    <>
                      {' • '}
                      <FiMapPin size={12} />
                      {salon.city}
                    </>
                  )}
                </DiscoverCardInfo>
              </DiscoverCard>
            ))}
          </DiscoverGrid>
          
          <EnterButton 
            style={{ marginTop: '1rem', width: 'auto', display: 'inline-flex' }}
            onClick={() => router.push('/salons')}
          >
            Explorer tous les salons <FiArrowRight />
          </EnterButton>
        </DiscoverSection>

        {/* Call to Action Premium */}
        {isFreemium && (
          <CTASection>
            <CTATitle>
              {hasOwnedSalons 
                ? 'Créez plus de salons privés'
                : 'Créez votre premier salon privé'
              }
            </CTATitle>
            <CTAText>
              Devenez Premium pour créer des salons illimités, accéder à toutes les fonctionnalités 
              et rejoindre une communauté exclusive de femmes 50+
            </CTAText>
            <CTAButton onClick={handleUpgradeClick}>
              {isPremium ? <FiPlus /> : <FiLock />}
              {isPremium ? 'Créer un salon' : 'Devenir Premium'}
            </CTAButton>
          </CTASection>
        )}

        {/* Empty state si pas de salons */}
        {mySalons.length === 0 && (
          <EmptyState>
            <h3>Bienvenue dans votre hub de salons ! 🌿</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Vous n'avez pas encore rejoint de salon. 
              Explorez les salons disponibles ou créez le vôtre pour commencer à échanger.
            </p>
            <EnterButton 
              style={{ marginTop: '1rem', width: 'auto', display: 'inline-flex', margin: '1rem auto 0' }}
              onClick={() => router.push('/salons')}
            >
              Découvrir les salons <FiArrowRight />
            </EnterButton>
          </EmptyState>
        )}
      </DashboardContainer>
    </>
  )
}
