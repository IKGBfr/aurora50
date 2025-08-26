'use client'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import Link from 'next/link'

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
  padding: 1rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  color: white;
  text-align: center;
`

const Card = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  max-width: 650px;
  width: 100%;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.8s ease-out;

  @media (min-width: 768px) {
    padding: 3rem;
  }
`

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`

const Text = styled.p`
  font-size: 1.125rem;
  line-height: 1.8;
  opacity: 0.9;
  margin-bottom: 2.5rem;
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 2.5rem auto;
`

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: left;
`

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`

const StepIcon = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`

const StepContent = styled.div`
  h3 {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 0.25rem 0;
  }
  p {
    font-size: 0.9rem;
    opacity: 0.8;
    margin: 0;
    line-height: 1.6;
  }
`

// --- NOUVEAUX COMPOSANTS ---
const DownloadButton = styled.a`
  display: inline-block;
  background: white;
  color: #8B5CF6;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`

const SupportText = styled.p`
  font-size: 0.875rem;
  opacity: 0.7;
  margin-top: 1.5rem;
  
  a {
    color: white;
    font-weight: 600;
    text-decoration: underline;
    
    &:hover {
      opacity: 0.8;
    }
  }
`

// Icônes SVG pour le tutoriel
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><polyline points="22,6 12,13 2,6"></polyline></svg>
);

const TelegramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><path d="M22 2L15 22L11 13L2 9L22 2Z"></path></svg>
);

const GroupIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);


export default function ThankYouPage() {
  return (
    <Container>
      <Card>
        <Title>Bienvenue dans l'aventure !</Title>
        <Text>
          Félicitations et merci pour votre confiance. Voici les quelques étapes simples pour nous rejoindre dans le cocon.
        </Text>

        <Divider />

        <StepsContainer>
          <Step>
            <StepIcon><MailIcon /></StepIcon>
            <StepContent>
              <h3>1. Surveillez votre boîte mail</h3>
              <p>Vous allez recevoir d'ici quelques minutes votre e-mail d'accueil avec le lien d'invitation.</p>
            </StepContent>
          </Step>

          <Step>
            <StepIcon><TelegramIcon /></StepIcon>
            <StepContent>
              <h3>2. Cliquez pour rejoindre</h3>
              <p>Ouvrez l'e-mail et cliquez sur le bouton pour rejoindre le groupe. Si vous n'avez pas Telegram, il vous sera proposé de l'installer (c'est gratuit).</p>
            </StepContent>
          </Step>

          <Step>
            <StepIcon><GroupIcon /></StepIcon>
            <StepContent>
              <h3>3. Présentez-vous !</h3>
              <p>Une fois dans le groupe, n'hésitez pas à envoyer un petit message pour vous présenter. Nous avons hâte de vous rencontrer !</p>
            </StepContent>
          </Step>
        </StepsContainer>

        <Divider />

        <div>
          <DownloadButton href="https://telegram.org/apps" target="_blank" rel="noopener noreferrer">
            Télécharger Telegram
          </DownloadButton>
          <SupportText>
            Un problème pour l'installation ? <a href="https://wa.me/33766743192" target="_blank" rel="noopener noreferrer">Contactez Anthony, notre gardien technique.</a>
          </SupportText>
        </div>
      </Card>
    </Container>
  )
}
