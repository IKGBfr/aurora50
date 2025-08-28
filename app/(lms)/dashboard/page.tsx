'use client'

import styled from '@emotion/styled'
import { devices } from '@/lib/utils/breakpoints'

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

export default function DashboardPage() {
  const stats = [
    {
      title: 'Progression',
      value: '45%',
      description: 'Du parcours complété',
      color: 'purple' as const
    },
    {
      title: 'Temps d\'étude',
      value: '12h 30min',
      description: 'Cette semaine',
      color: 'pink' as const
    },
    {
      title: 'Points',
      value: '850',
      description: 'Points d\'expérience',
      color: 'purple' as const
    }
  ]

  const upcomingLessons = [
    { title: 'Introduction à la méditation', duration: '15 min' },
    { title: 'Gérer son stress au quotidien', duration: '20 min' },
    { title: 'Développer sa confiance', duration: '25 min' }
  ]

  return (
    <DashboardContainer>
      <DashboardTitle>Tableau de Bord</DashboardTitle>
      
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index} $color={stat.color}>
            <StatTitle>{stat.title}</StatTitle>
            <StatValue $color={stat.color}>{stat.value}</StatValue>
            <StatDescription>{stat.description}</StatDescription>
          </StatCard>
        ))}
      </StatsGrid>
      
      <ContentSection>
        <SectionTitle>Prochaines leçons</SectionTitle>
        <ContentText>
          Continuez votre parcours de transformation avec ces leçons recommandées pour vous.
        </ContentText>
        
        <LessonsGrid>
          {upcomingLessons.map((lesson, index) => (
            <LessonCard key={index}>
              <LessonTitle>{lesson.title}</LessonTitle>
              <LessonDuration>⏱ {lesson.duration}</LessonDuration>
            </LessonCard>
          ))}
        </LessonsGrid>
        
        <ProgressBadge>
          🎯 3 leçons à compléter cette semaine
        </ProgressBadge>
      </ContentSection>
      
      <ContentSection>
        <SectionTitle>Activité récente</SectionTitle>
        <ContentText>
          Vous avez été très actif cette semaine ! Continuez sur cette lancée pour atteindre vos objectifs de transformation personnelle.
        </ContentText>
      </ContentSection>
    </DashboardContainer>
  )
}
