'use client'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import Link from 'next/link'
import Lottie from 'lottie-react'
// Vous pouvez utiliser la même animation de logo ou une autre, par exemple une coche de validation
import logoAnimation from '../../public/animations/Multiple_circles.json' 

// --- Animations ---
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

// --- Composants Stylisés ---
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  color: white;
  text-align: center;
`

const Card = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.8s ease-out;

  @media (min-width: 768px) {
    padding: 4rem;
  }
`

const LogoWrapper = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem auto;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`

const Text = styled.p`
  font-size: 1.125rem;
  line-height: 1.8;
  opacity: 0.9;
  margin-bottom: 2rem;
`

const Highlight = styled.span`
  font-weight: 700;
  color: #fff;
`

const HomeButton = styled(Link)`
  display: inline-block;
  background: white;
  color: #8B5CF6;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 2rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`

export default function ThankYouPage() {
  return (
    <Container>
      <Card>
        <LogoWrapper>
          <Lottie
            animationData={logoAnimation}
            loop={true}
            autoplay={true}
          />
        </LogoWrapper>
        <Title>Bienvenue dans l'aventure !</Title>
        <Text>
          Félicitations et un immense merci pour votre confiance. Vous faites maintenant partie 
          du cercle des membres fondateurs d'Aurora50.
        </Text>
        <Text>
          Surveillez attentivement votre boîte mail. Vous allez recevoir d'ici quelques minutes 
          un e-mail contenant <Highlight>le lien pour rejoindre notre cocon privé sur Telegram</Highlight> 
          et toutes les informations pour bien démarrer.
        </Text>
        <HomeButton href="/">Retour à l'accueil</HomeButton>
      </Card>
    </Container>
  )
}
