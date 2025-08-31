'use client'

import styled from '@emotion/styled'
import Link from 'next/link'
import Lottie from 'lottie-react'
import logoAnimation from '@/public/animations/Multiple_circles.json'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #fdf4ff 50%, #fef3f2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

const Card = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  }

  @media (max-width: 640px) {
    padding: 2rem;
  }
`

const LogoAnimation = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
`

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  animation: bounce 1s ease-in-out;

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
`

const Message = styled.p`
  color: #4b5563;
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`

const EmailBox = styled.div`
  background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
  border: 2px dashed #e9d5ff;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
`

const EmailIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`

const EmailTitle = styled.h3`
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const EmailText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
`

const StepsList = styled.div`
  text-align: left;
  margin: 2rem 0;
  padding: 1.5rem;
  background: #fafafa;
  border-radius: 12px;
`

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`

const StepNumber = styled.div`
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
`

const StepContent = styled.div`
  flex: 1;
`

const StepTitle = styled.h4`
  color: #1f2937;
  font-size: 0.938rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`

const StepDescription = styled.p`
  color: #6b7280;
  font-size: 0.813rem;
  line-height: 1.4;
`

const TipBox = styled.div`
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 1rem;
  margin: 2rem 0;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`

const TipIcon = styled.span`
  font-size: 1.25rem;
`

const TipText = styled.p`
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.5;
  flex: 1;
`

const FooterLinks = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  gap: 2rem;
`

const FooterLink = styled(Link)`
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;

  &:hover {
    color: #8B5CF6;
  }
`

export default function ConfirmationPage() {
  return (
    <Container>
      <Card>
        <LogoAnimation>
          <Lottie
            animationData={logoAnimation}
            loop={true}
            autoplay={true}
          />
        </LogoAnimation>

   

        <Title>Félicitations ! 🎉</Title>
        
        <Message>
          Votre inscription est presque terminée !<br />
          Un email vient de vous être envoyé pour finaliser votre compte.
        </Message>

        <EmailBox>
          <EmailIcon>📧</EmailIcon>
          <EmailTitle>Vérifiez votre boîte mail</EmailTitle>
          <EmailText>
            Nous venons de vous envoyer un lien magique pour accéder à votre espace Aurora50.
            Cliquez simplement sur le lien dans l'email pour continuer.
          </EmailText>
        </EmailBox>

        <StepsList>
          <StepItem>
            <StepNumber>1</StepNumber>
            <StepContent>
              <StepTitle>Ouvrez votre boîte mail</StepTitle>
              <StepDescription>
                Cherchez un email de Aurora50 (peut prendre 1-2 minutes)
              </StepDescription>
            </StepContent>
          </StepItem>

          <StepItem>
            <StepNumber>2</StepNumber>
            <StepContent>
              <StepTitle>Cliquez sur le lien magique</StepTitle>
              <StepDescription>
                Un simple clic et vous serez connectée automatiquement
              </StepDescription>
            </StepContent>
          </StepItem>

          <StepItem>
            <StepNumber>3</StepNumber>
            <StepContent>
              <StepTitle>Personnalisez votre expérience</StepTitle>
              <StepDescription>
                3 questions rapides pour adapter Aurora50 à vos besoins
              </StepDescription>
            </StepContent>
          </StepItem>
        </StepsList>

        <TipBox>
          <TipIcon>💡</TipIcon>
          <TipText>
            <strong>Astuce :</strong> Si vous ne voyez pas l'email, vérifiez votre dossier spam ou promotions. 
            L'email provient de <strong>hello@aurora50.com</strong>
          </TipText>
        </TipBox>

        <FooterLinks>
          <FooterLink href="/">
            ← Retour à l'accueil
          </FooterLink>
          <FooterLink href="/connexion">
            Renvoyer l'email →
          </FooterLink>
        </FooterLinks>
      </Card>
    </Container>
  )
}
