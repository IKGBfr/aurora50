'use client'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react' // On importe keyframes pour l'animation
import { CTAButton } from './CTAButton'

// 1. Définir l'animation pour le mouvement du dégradé
const moveGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const Section = styled.section`
  padding: 4rem 2rem;
  color: white;
  text-align: center;
  
  // 2. Appliquer l'animation au fond
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899, #8B5CF6);
  background-size: 400% 400%; // Agrandir le fond pour le mouvement
  animation: ${moveGradient} 15s ease infinite; // Appliquer l'animation en boucle

  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`

const PriceBox = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2rem;
  margin-bottom: 2rem;
`

const OldPrice = styled.p`
  font-size: 1.5rem;
  text-decoration: line-through;
  opacity: 0.7;
  margin-bottom: 0.5rem;
`

const NewPrice = styled.p`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 4rem;
  }
`

const Badge = styled.div`
  display: inline-block;
  background: #10B981;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  margin-bottom: 2rem;
`

const Features = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  text-align: left;
`

const Feature = styled.li`
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  
  &:before {
    content: '✅';
    margin-right: 1rem;
  }
`

const Urgency = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 2rem;
  color: #FEF3C7;
`

export const Pricing = () => {
  return (
    <Section>
      <Container>
        <Badge>OFFRE LIMITÉE</Badge>
        <Title>Devenez Membre Fondateur</Title>
        <PriceBox>
          <OldPrice>97€/mois</OldPrice>
          <NewPrice>47€/mois</NewPrice>
          <p>À VIE pour les 30 premiers</p>
          <Features>
            <Feature>Lives hebdomadaires avec Sigrid</Feature>
            <Feature>Communauté privée Telegram</Feature>
            <Feature>Ressources exclusives</Feature>
            <Feature>Réponses personnalisées</Feature>
            <Feature>Sans engagement - Annulez quand vous voulez</Feature>
          </Features>
        </PriceBox>
        <CTAButton />
        <Urgency>⏰ Plus que 30 places disponibles</Urgency>
        <p style={{ marginTop: '1rem', opacity: '0.8', fontSize: '0.875rem' }}>
          Ce nombre est volontairement limité pour garantir une qualité d’échange exceptionnelle 
          et une attention personnelle de Sigrid pour chaque membre fondateur.
        </p>
      </Container>
    </Section>
  )
}
