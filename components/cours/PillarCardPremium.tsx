'use client'

import styled from '@emotion/styled'
import Link from 'next/link'
import { useState } from 'react'

const CardWrapper = styled(Link)`
  text-decoration: none;
  display: block;
  height: 100%;
`;

const Card = styled.div<{ gradient: string; isHovered: boolean }>`
  position: relative;
  background: ${props => props.gradient};
  border-radius: 32px;
  padding: 40px 32px;
  height: 400px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.isHovered ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)'};
  box-shadow: ${props => props.isHovered 
    ? '0 30px 60px rgba(0,0,0,0.25)' 
    : '0 10px 30px rgba(0,0,0,0.15)'};
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255,255,255,0.2) 0%, 
      rgba(255,255,255,0) 60%);
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    opacity: ${props => props.isHovered ? 1 : 0};
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
  
  &:hover .start-button {
    background: white;
    transform: scale(1.05);
  }
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const FreeBadge = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  color: #10B981;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const EmojiWrapper = styled.div`
  font-size: 72px;
  margin-bottom: 24px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const Title = styled.h3`
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.95);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: auto;
  text-shadow: 0 1px 4px rgba(0,0,0,0.1);
`;

const Footer = styled.div`
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
`;

const Duration = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '📅';
  }
`;

const LessonCount = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '📚';
  }
`;

const ProgressBar = styled.div`
  margin-top: 16px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 100px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(255, 255, 255, 0.6) 100%);
  border-radius: 100px;
  transition: width 0.6s ease;
`;

const StartButton = styled.div`
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.95);
  color: #111827;
  padding: 12px 24px;
  border-radius: 100px;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
`;

interface PillarCardProps {
  pillar: {
    id: string
    title: string
    description?: string
    short_description?: string
    emoji?: string
    color_gradient?: string
    duration_weeks?: number
    slug?: string
    pillar_number?: number
  }
  lessonCount?: number
  progress?: {
    percentage: number
  }
  isSubscribed?: boolean
}

export default function PillarCardPremium({ 
  pillar, 
  lessonCount = 0,
  progress,
  isSubscribed = false
}: PillarCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Utiliser directement le slug de la base de données
  const slug = pillar.slug
  const gradient = pillar.color_gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

  return (
    <CardWrapper href={`/cours/${slug}`}>
      <Card 
        gradient={gradient}
        isHovered={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isSubscribed && (
          <FreeBadge>✨ 1ère leçon gratuite</FreeBadge>
        )}
        
        <CardContent>
          <EmojiWrapper>{pillar.emoji}</EmojiWrapper>
          
          <Title>{pillar.title}</Title>
          
          <Description>
            {pillar.short_description || pillar.description?.substring(0, 100) + '...'}
          </Description>
          
          <Footer>
            <Stats>
              <Duration>{pillar.duration_weeks} semaines</Duration>
              <LessonCount>{lessonCount} leçons</LessonCount>
            </Stats>
            
            {progress && (
              <ProgressBar>
                <ProgressFill percentage={progress.percentage} />
              </ProgressBar>
            )}
            
            <StartButton className="start-button">
              {progress && progress.percentage > 0 ? 'Continuer →' : 'Commencer →'}
            </StartButton>
          </Footer>
        </CardContent>
      </Card>
    </CardWrapper>
  )
}
