'use client'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react' // On importe keyframes

// 1. Définir l'animation pour le dégradé du texte
const moveTextGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const Section = styled.section`
  padding: 4rem 2rem;
  background: white;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  
  // 2. Appliquer l'animation au texte
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899, #10B981);
  background-size: 400% 400%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${moveTextGradient} 20s ease infinite; // Animation plus rapide pour le texte

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`

const Grid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(1, 1fr);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const Card = styled.div`
  padding: 2rem;
  border-radius: 20px;
  background: #F9FAFB;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`

const Icon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
  
  @media (min-width: 1024px) {
    font-size: 1.375rem;
  }
`

const CardText = styled.p`
  color: #6B7280;
  line-height: 1.6;
  font-size: 0.875rem;
  
  @media (min-width: 1024px) {
    font-size: 1rem;
  }
`

const benefits = [
  {
    icon: '🔴',
    title: 'Votre clarté hebdomadaire',
    text: 'Chaque dimanche, une session de transformation en direct avec Sigrid pour garder le cap et la motivation.'
  },
  {
    icon: '💬',
    title: 'Ne soyez plus jamais seul(e)',
    text: 'Échangez quotidiennement avec des personnes qui vous comprennent vraiment, dans un cocon 100% bienveillant.'
  },
  {
    icon: '📚',
    title: 'Votre boîte à outils personnelle',
    text: 'Exercices, guides PDF, masterclass... Une bibliothèque de ressources exclusives qui grandit chaque semaine.'
  },
  {
    icon: '❤️',
    title: 'Des réponses, pas des doutes',
    text: 'Chaque mercredi, Sigrid répond à vos questions pour vous aider à surmonter vos blocages personnels.'
  },
  {
    icon: '🆘',
    title: 'Une main tendue en cas de crise',
    text: 'Un canal d\'urgence où Sigrid vous répond sous 48h pour traverser les moments les plus difficiles.'
  },
  {
    icon: '👥',
    title: 'Un soutien sur-mesure',
    text: 'Chaque mois, un binôme de renaissance vous est proposé pour un soutien mutuel et personnalisé.'
  },
  {
    icon: '🏆',
    title: 'Restez toujours motivé(e)',
    text: 'Des défis collectifs pour maintenir la flamme et célébrer chaque petite victoire ensemble.'
  },
  {
    icon: '🎯',
    title: 'Un chemin clair et sécurisant',
    text: 'Suivez un programme structuré sur 3 mois (Acceptation, Renaissance, Expansion) pour une transformation durable.'
  }
]

export const Benefits = () => {
  return (
    <Section>
      <Container>
        <Title>Ce que vous obtenez avec Aurora50</Title>
        <Grid>
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <Icon>{benefit.icon}</Icon>
              <CardTitle>{benefit.title}</CardTitle>
              <CardText>{benefit.text}</CardText>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
