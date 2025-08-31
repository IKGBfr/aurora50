'use client'

import styled from '@emotion/styled'
import Link from 'next/link'
import Lottie from 'lottie-react'
import logoAnimation from '../public/animations/Multiple_circles.json'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  text-align: center;
  position: relative;
  overflow: hidden;

  @media (max-width: 640px) {
    padding: 1rem;
  }
`

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: 
    radial-gradient(circle at 20% 80%, white 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, white 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, white 0%, transparent 50%);
  pointer-events: none;
`

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  width: 100%;
`

const Logo = styled.div`
  width: 200px;
  height: 200px;
  margin: 0 auto 2rem;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2));

  @media (max-width: 640px) {
    width: 150px;
    height: 150px;
    margin-bottom: 1.5rem;
  }
`

const Title = styled.h1`
  font-size: 4rem;
  color: white;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }

  @media (max-width: 640px) {
    font-size: 2.5rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.75rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 1.5rem;
  font-weight: 500;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 3rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  display: inline-flex;

  @media (max-width: 640px) {
    padding: 0.75rem 1.5rem;
    margin-bottom: 2rem;
  }
`

const StatsEmoji = styled.span`
  font-size: 1.5rem;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`

const StatsNumber = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`

const StatsText = styled.span`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }
`

const PrimaryButton = styled(Link)`
  background: white;
  color: #8B5CF6;
  padding: 1.25rem 3rem;
  font-size: 1.25rem;
  font-weight: 700;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 280px;
  justify-content: center;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, white 0%, #faf5ff 100%);
  }

  @media (max-width: 640px) {
    font-size: 1.125rem;
    padding: 1rem 2rem;
    min-width: 250px;
  }
`

const SecondaryButton = styled(Link)`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  padding: 1.25rem 3rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 280px;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 640px) {
    font-size: 1rem;
    padding: 1rem 2rem;
    min-width: 250px;
  }
`

const TrustSignals = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
    margin-top: 3rem;
  }
`

const TrustItem = styled.div`
  text-align: center;
`

const TrustIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;

  @media (max-width: 640px) {
    font-size: 2rem;
  }
`

const TrustNumber = styled.div`
  font-size: 1.75rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.25rem;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`

const TrustLabel = styled.div`
  font-size: 0.938rem;
  color: rgba(255, 255, 255, 0.9);

  @media (max-width: 640px) {
    font-size: 0.875rem;
  }
`

const FreeTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 185, 129, 0.2);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  margin-bottom: 2rem;
  border: 1px solid rgba(16, 185, 129, 0.3);
`

const FreeTagText = styled.span`
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

export default function Home() {
  return (
    <Container>
      <BackgroundPattern />
      
      <Content>
        <Logo>
          <Lottie
            animationData={logoAnimation}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </Logo>

        <FreeTag>
          <span>🎁</span>
          <FreeTagText>100% Gratuit - Sans carte bancaire</FreeTagText>
        </FreeTag>

        <Title>Aurora50</Title>
        
        <Subtitle>
          Votre Renaissance Après 50 Ans<br />
          Commence Ici 🌿
        </Subtitle>

        <StatsContainer>
          <StatsEmoji>👥</StatsEmoji>
          <StatsNumber>21 885</StatsNumber>
          <StatsText>membres actives</StatsText>
        </StatsContainer>

        <ButtonGroup>
          <PrimaryButton href="/inscription">
            Commencer Gratuitement
            <span>→</span>
          </PrimaryButton>
          <SecondaryButton href="/connexion">
            J'ai déjà un compte
            <span>→</span>
          </SecondaryButton>
        </ButtonGroup>

        <TrustSignals>
          <TrustItem>
            <TrustIcon>🌟</TrustIcon>
            <TrustNumber>4.9/5</TrustNumber>
            <TrustLabel>Note moyenne</TrustLabel>
          </TrustItem>
          <TrustItem>
            <TrustIcon>💬</TrustIcon>
            <TrustNumber>1000+</TrustNumber>
            <TrustLabel>Messages/jour</TrustLabel>
          </TrustItem>
          <TrustItem>
            <TrustIcon>🎯</TrustIcon>
            <TrustNumber>89%</TrustNumber>
            <TrustLabel>Taux de satisfaction</TrustLabel>
          </TrustItem>
        </TrustSignals>
      </Content>
    </Container>
  )
}
