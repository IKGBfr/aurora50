'use client'

import { useEffect } from 'react'
import styled from '@emotion/styled'
import Link from 'next/link'

/**
 * Page d'accueil simplifiée Aurora50
 * Contient uniquement : titre, slogan et boutons CTA
 */

// Container principal avec le dégradé signature
const HeroSection = styled.div`
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 640px) {
    padding: 1rem;
  }
`

// Pattern de fond subtil pour ajouter de la profondeur
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

// Wrapper pour centrer le contenu
const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 600px;
  width: 100%;
`

// Titre principal
const MainTitle = styled.h1`
  font-size: 5rem;
  color: white;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: 3.5rem;
  }

  @media (max-width: 640px) {
    font-size: 3rem;
  }
`

// Slogan
const Tagline = styled.p`
  font-size: 1.75rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 3rem;
  font-weight: 500;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 2.5rem;
  }

  @media (max-width: 640px) {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }
`

// Container pour les boutons
const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
  }
`

// Bouton primaire (Inscription)
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
  display: inline-block;
  min-width: 200px;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, white 0%, #faf5ff 100%);
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    font-size: 1.125rem;
    padding: 1rem 2.5rem;
    width: 100%;
    max-width: 280px;
  }
`

// Bouton secondaire (Connexion)
const SecondaryButton = styled(Link)`
  background: transparent;
  color: white;
  padding: 1.25rem 3rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
  display: inline-block;
  min-width: 200px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    border-color: white;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    font-size: 1rem;
    padding: 1rem 2.5rem;
    width: 100%;
    max-width: 280px;
  }
`

export default function Home() {
  useEffect(() => {
    // JUSTE rediriger, NE PAS traiter le token ici pour éviter de le consommer
    const hash = window.location.hash
    const search = window.location.search
    
    // Vérifier le hash pour token_hash (format OTP)
    if (hash && hash.includes('token_hash=')) {
      console.log('Token hash OTP détecté, redirection simple...')
      // Redirection SIMPLE sans traiter le token
      window.location.href = `/auth/confirmer${hash}`
      return
    }
    
    // Vérifier le hash pour access_token (ancien format)
    if (hash && hash.includes('access_token=')) {
      console.log('Access token détecté, redirection simple...')
      // Redirection SIMPLE sans traiter le token
      window.location.href = `/auth/confirmer${hash}`
      return
    }
    
    // Vérifier aussi les query params (autres cas)
    const urlParams = new URLSearchParams(search)
    const code = urlParams.get('code')
    
    if (code) {
      console.log('Code détecté dans les query params, redirection...')
      window.location.href = `/api/auth/callback?code=${code}`
      return
    }
  }, [])

  return (
    <HeroSection>
      <BackgroundPattern />
      
      <ContentWrapper>
        {/* Titre principal */}
        <MainTitle>Aurora50</MainTitle>
        
        {/* Slogan */}
        <Tagline>
          Créez votre salon privé.<br />
          Invitez vos amies. 🌿
        </Tagline>

        {/* Boutons CTA */}
        <ButtonContainer>
          <PrimaryButton href="/inscription">
            S'inscrire
          </PrimaryButton>
          <SecondaryButton href="/connexion">
            Se connecter
          </SecondaryButton>
        </ButtonContainer>
      </ContentWrapper>
    </HeroSection>
  )
}
