'use client'

import styled from '@emotion/styled'
import Link from 'next/link'
import { useState } from 'react'

const CardContainer = styled.div<{ gradient?: string }>`
  position: relative;
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85)),
              ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.5);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    opacity: 0.05;
    z-index: 0;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 30px 60px rgba(0,0,0,0.12);
    
    &::before {
      opacity: 0.08;
    }
  }
`

const CardInner = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const EmojiContainer = styled.div`
  font-size: 64px;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.8);
  border-radius: 20px;
  margin: 0 auto 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  backdrop-filter: blur(10px);
`

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`

const Description = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.6;
  flex: 1;
  margin-bottom: 1.5rem;
`

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const Duration = styled.span`
  color: #9ca3af;
  font-size: 0.875rem;
`

const LessonCount = styled.span`
  color: #9ca3af;
  font-size: 0.875rem;
`

const ProgressContainer = styled.div`
  margin-bottom: 1rem;
`

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  transition: width 0.5s ease;
  border-radius: 4px;
`

const FreeBadge = styled.div`
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  letter-spacing: 0.5px;
  text-transform: uppercase;
`

const CTAButton = styled.div`
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  border-radius: 16px;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  letter-spacing: 0.3px;
  
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.35);
  }
`

interface PillarCardProps {
  pillar: {
    id: string
    title: string
    description?: string
    emoji?: string
    gradient?: string
    duration_weeks?: number
    slug?: string
    pillar_number?: number
  }
  progress?: {
    completed_lessons: number
    total_lessons: number
    percentage: number
  }
  lessonCount?: number
  isLocked?: boolean
  isSubscribed?: boolean
}

export default function PillarCard({ 
  pillar, 
  progress, 
  lessonCount = 0,
  isLocked = false,
  isSubscribed = false
}: PillarCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Générer un slug basé sur le titre si pas de slug
  const slug = pillar.slug || pillar.title.toLowerCase().replace(/\s+/g, '-')
  
  // Emojis par défaut selon le numéro du pilier
  const defaultEmojis: { [key: number]: string } = {
    1: '🦋',
    2: '💪',
    3: '💼',
    4: '❤️',
    5: '🎨',
    6: '💰',
    7: '🌟'
  }
  
  const emoji = pillar.emoji || defaultEmojis[pillar.pillar_number || 1] || '🌿'
  
  // Gradients par défaut
  const defaultGradients: { [key: number]: string } = {
    1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    3: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    4: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    5: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    6: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    7: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  }
  
  const gradient = pillar.gradient || defaultGradients[pillar.pillar_number || 1]

  return (
    <Link href={`/cours/${slug}`} style={{ textDecoration: 'none' }}>
      <CardContainer 
        gradient={gradient}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardInner>
          <EmojiContainer>{emoji}</EmojiContainer>
          
          {!isSubscribed && (
            <FreeBadge>✨ 1ère leçon gratuite</FreeBadge>
          )}
          
          <Title>{pillar.title}</Title>
          
          <Description>
            {pillar.description || 'Découvrez ce pilier transformateur pour votre renaissance après 50 ans.'}
          </Description>
          
          <MetaInfo>
            <Duration>
              {pillar.duration_weeks ? `${pillar.duration_weeks} semaines` : '4 semaines'}
            </Duration>
            <LessonCount>
              {lessonCount} leçons
            </LessonCount>
          </MetaInfo>
          
          {progress && (
            <ProgressContainer>
              <ProgressLabel>
                <span>Progression</span>
                <span>{progress.percentage}%</span>
              </ProgressLabel>
              <ProgressBar>
                <ProgressFill percentage={progress.percentage} />
              </ProgressBar>
            </ProgressContainer>
          )}
          
          <CTAButton>
            {isLocked 
              ? '🔒 Débloquer ce pilier'
              : progress && progress.percentage > 0
                ? 'Continuer →'
                : 'Commencer →'
            }
          </CTAButton>
        </CardInner>
      </CardContainer>
    </Link>
  )
}
