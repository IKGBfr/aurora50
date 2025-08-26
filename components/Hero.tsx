'use client'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
// 1. Importer Lottie et le fichier d'animation
import Lottie from 'lottie-react'
import logoAnimation from '../public/animations/Multiple_circles.json' // Assurez-vous que le chemin est correct

// --- Animations ---
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }
  50% { transform: scale(1.03); box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3); }
  100% { transform: scale(1); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

// --- Composants Stylisés ---
const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  color: white;
  text-align: center;
  overflow: hidden;
`

const LogoWrapper = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.5s ease-out;
  // On ajuste la taille du conteneur pour l'animation
  width: 150px;
  height: 150px;

  @media (min-width: 768px) {
    width: 150px;
    height: 150px;
  }
`

// Le composant Logo (img) n'est plus nécessaire
// const Logo = styled.img`...`

const LogoText = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1rem;
  letter-spacing: 1px;
  opacity: 0.9;
`

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 1rem;
  line-height: 1.2;
  animation: ${fadeIn} 0.7s ease-out backwards;
  animation-delay: 0.2s;

  span {
    display: block;
    font-size: 1.5rem;
    font-weight: 400;
    opacity: 0.9;
    margin-top: 0.5rem;
  }

  @media (min-width: 768px) {
    font-size: 4.5rem;
    span {
      font-size: 2rem;
    }
  }
`

const Subtitle = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2.5rem;
  opacity: 0.95;
  max-width: 650px;
  animation: ${fadeIn} 0.7s ease-out backwards;
  animation-delay: 0.4s;

  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`

const Badge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  margin-bottom: 2rem;
  font-weight: 600;
  animation: ${fadeIn} 0.7s ease-out backwards;
  animation-delay: 0.3s;
`

const CTAButton = styled.a`
  display: inline-block;
  background: white;
  color: #8B5CF6;
  padding: 1.25rem 1.5rem; // Padding mobile ajusté
  width: 90%;
  max-width: 400px;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  animation: ${pulse} 2.5s infinite;
  animation-delay: 1s;
  
  @media (min-width: 768px) {
    width: auto;
    padding: 1.25rem 2.5rem; // Padding desktop
  }

  &:hover {
    transform: translateY(-3px) !important; // Priorité sur l'animation
    animation-play-state: paused;
  }

  span {
    display: block;
  }
`

const MainActionText = styled.span`
  font-size: 1.125rem; // Taille de police mobile ajustée
  font-weight: 700;
  
  @media (min-width: 768px) {
    font-size: 1.5rem; // Taille de police desktop
  }
`

const PriceText = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.25rem;
  opacity: 0.8;

  span {
    text-decoration: line-through;
    opacity: 0.7;
    margin-right: 0.5rem;
  }
`

const Guarantees = styled.div`
  display: flex;
  flex-wrap: wrap; // Permet aux éléments de passer à la ligne
  justify-content: center; // Centre les éléments
  gap: 1rem 1.5rem; // Espacement vertical et horizontal
  margin-top: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
  animation: ${fadeIn} 0.7s ease-out backwards;
  animation-delay: 0.6s;

  @media (min-width: 768px) {
    gap: 2.5rem;
    flex-wrap: nowrap; // Empêche le retour à la ligne sur desktop
  }
`

const Guarantee = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const Hero = () => {
  return (
    <HeroSection>
      <LogoWrapper>
        {/* 2. Remplacer la balise <img> par le composant Lottie */}
        <Lottie
          animationData={logoAnimation}
          loop={true}
          autoplay={true}
          // Le style est appliqué directement, pas besoin du composant Logo
          style={{ width: '100%', height: '100%' }}
        />
        <LogoText>Aurora50</LogoText>
      </LogoWrapper>

      <Title>
        Votre Renaissance<br />Commence Ici
        <span>Il n’est jamais trop tard pour être qui vous auriez pu être.</span>
      </Title>
      <Subtitle>
        Rejoignez un cercle intime de pionniers et commencez votre transformation avec Sigrid, 
        psychologue spécialiste des transitions de vie.
      </Subtitle>
      
      <CTAButton href="https://buy.stripe.com/dRm7sMerOcjO47JdhYcs800">
        <MainActionText>Je deviens Membre Fondateur</MainActionText>
        <PriceText>
          <span>97€</span> 47€/mois - À vie
        </PriceText>
      </CTAButton>

      <Guarantees>
        <Guarantee>🛡️ Paiement sécurisé</Guarantee>
        <Guarantee>🔄 Sans engagement</Guarantee>
        <Guarantee>❤️ Communauté privée</Guarantee>
      </Guarantees>
    </HeroSection>
  )
}
