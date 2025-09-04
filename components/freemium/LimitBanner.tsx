'use client'

import styled from '@emotion/styled'
import { useState, useEffect } from 'react'
import { Database } from '@/lib/database.types'

type UserProfile = Database['public']['Tables']['profiles']['Row']

const BannerContainer = styled.div<{ variant: 'info' | 'warning' | 'urgent' }>`
  background: ${props => {
    switch(props.variant) {
      case 'urgent': return 'linear-gradient(135deg, #fef2f2 0%, #fdf2f8 100%)'
      case 'warning': return 'linear-gradient(135deg, #fef3c7 0%, #fdf2f8 100%)'
      default: return 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)'
    }
  }};
  border: 2px solid ${props => {
    switch(props.variant) {
      case 'urgent': return '#fecaca'
      case 'warning': return '#fde68a'
      default: return '#e9d5ff'
    }
  }};
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  animation: slideDown 0.5s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    padding: 1rem;
    border-radius: 12px;
  }
`

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`

const BannerLeft = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const BannerIcon = styled.div`
  font-size: 2rem;
  flex-shrink: 0;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`

const BannerText = styled.div`
  flex: 1;
`

const BannerTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`

const BannerMessage = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;

  @media (max-width: 640px) {
    font-size: 0.813rem;
  }
`

const BannerStats = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: 1rem;
  }
`

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const StatLabel = styled.span`
  font-size: 0.813rem;
  color: #9ca3af;
`

const StatValue = styled.span<{ isLimit?: boolean }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.isLimit ? '#ef4444' : '#10b981'};
`

const UpgradeButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 640px) {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  transition: color 0.2s;

  &:hover {
    color: #6b7280;
  }
`

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
`

const ProgressFill = styled.div<{ percentage: number; color: string }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: ${props => props.color};
  transition: width 0.3s ease;
`

interface LimitBannerProps {
  user: UserProfile
  onUpgradeClick?: () => void
  onClose?: () => void
}

export default function LimitBanner({ user, onUpgradeClick, onClose }: LimitBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [variant, setVariant] = useState<'info' | 'warning' | 'urgent'>('info')

  // Limites freemium
  const LIMITS = {
    chat_messages: 10,
    profile_views: 5
  }

  // Calculer les pourcentages d'utilisation
  const chatUsagePercent = Math.min(((user.daily_chat_count || 0) / LIMITS.chat_messages) * 100, 100)
  const profileViewsPercent = Math.min(((user.daily_profile_views || 0) / LIMITS.profile_views) * 100, 100)

  useEffect(() => {
    // Déterminer la variante selon l'usage
    if (chatUsagePercent >= 100 || profileViewsPercent >= 100) {
      setVariant('urgent')
    } else if (chatUsagePercent >= 80 || profileViewsPercent >= 80) {
      setVariant('warning')
    } else {
      setVariant('info')
    }
  }, [chatUsagePercent, profileViewsPercent])

  if (!isVisible || user.subscription_type !== 'free') return null

  const getIcon = () => {
    switch(variant) {
      case 'urgent': return '🚨'
      case 'warning': return '⚠️'
      default: return '✨'
    }
  }

  const getTitle = () => {
    if (variant === 'urgent') {
      return 'Limite atteinte !'
    } else if (variant === 'warning') {
      return 'Vous approchez de vos limites'
    }
    return 'Compte Gratuit'
  }

  const getMessage = () => {
    if (variant === 'urgent') {
      return 'Passez à Premium pour continuer à profiter pleinement d\'Aurora50'
    } else if (variant === 'warning') {
      return 'Bientôt à court ? Découvrez tous les avantages Premium'
    }
    return 'Profitez de votre accès gratuit. Passez à Premium pour débloquer toutes les fonctionnalités'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#ef4444'
    if (percentage >= 80) return '#f59e0b'
    if (percentage >= 60) return '#8b5cf6'
    return '#10b981'
  }

  return (
    <BannerContainer variant={variant}>
      {onClose && (
        <CloseButton onClick={() => setIsVisible(false)}>
          ×
        </CloseButton>
      )}
      
      <BannerContent>
        <BannerLeft>
          <BannerIcon>{getIcon()}</BannerIcon>
          
          <BannerText>
            <BannerTitle>{getTitle()}</BannerTitle>
            <BannerMessage>{getMessage()}</BannerMessage>
            
            <BannerStats>
              <StatItem>
                <StatLabel>Messages chat :</StatLabel>
                <StatValue isLimit={chatUsagePercent >= 100}>
                  {user.daily_chat_count || 0}/{LIMITS.chat_messages}
                </StatValue>
              </StatItem>
              
              <StatItem>
                <StatLabel>Profils vus :</StatLabel>
                <StatValue isLimit={profileViewsPercent >= 100}>
                  {user.daily_profile_views || 0}/{LIMITS.profile_views}
                </StatValue>
              </StatItem>
            </BannerStats>

            <ProgressBar>
              <ProgressFill 
                percentage={Math.max(chatUsagePercent, profileViewsPercent)} 
                color={getProgressColor(Math.max(chatUsagePercent, profileViewsPercent))}
              />
            </ProgressBar>
          </BannerText>
        </BannerLeft>

        <UpgradeButton onClick={onUpgradeClick}>
          Passer à Premium →
        </UpgradeButton>
      </BannerContent>
    </BannerContainer>
  )
}
