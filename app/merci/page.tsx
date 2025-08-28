'use client'
import { useEffect } from 'react'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

// --- Canvas pour les confettis ---
const ConfettiCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
`

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
  padding: 1.5rem;
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
  line-height: 1.2;

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
    font-size: 1rem;
    opacity: 0.8;
    margin: 0;
    line-height: 1.6;
  }
`

const SupportText = styled.p`
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 2.5rem;
  
  a {
    color: white;
    font-weight: 600;
    text-decoration: underline;
    
    &:hover {
      opacity: 0.8;
    }
  }
`

// --- Icônes SVG ---
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
);

const RocketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.11.64-1.26 2-2.37 2-2.37.2-1.02.2-2.13.05-3.11.64-1.26 2-2.37 2-2.37.2-1.02.2-2.13.05-3.11.64-1.26 2-2.37 2-2.37.2-1.02.2-2.13.05-3.11.64-1.26 2-2.37 2-2.37s-.5 3.74-2 5c-.84.71-2.3.7-3.11.05-1.26.64-2.37 2-2.37 2-1.02.2-2.13.2-3.11.05-1.26.64-2.37 2-2.37 2-1.02.2-2.13.2-3.11.05-1.26.64-2.37 2-2.37 2-1.02.2-2.13.2-3.11.05-.84.71-2.3.7-3.11.05-1.26.64-2.37 2-2.37 2s3.74-.5 5-2c.71-.84.7-2.3.05-3.11.64-1.26 2-2.37 2-2.37.2-1.02.2-2.13.05-3.11.64-1.26 2-2.37 2-2.37.2-1.02.2-2.13.05-3.11.64-1.26 2-2.37 2-2.37s-.5 3.74-2 5c-.84.71-2.3.7-3.11.05-1.26.64-2.37 2-2.37 2-1.02.2-2.13.2-3.11.05-1.26.64-2.37 2-2.37 2-1.02.2-2.13.2-3.11.05-.84.71-2.3.7-3.11.05-1.26.64-2.37 2-2.37 2z"></path></svg>
);


export default function ThankYouPage() {
  useEffect(() => {
    // --- Logique des confettis (inchangée) ---
    const createConfetti = () => {
      const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ['#10B981', '#8B5CF6', '#EC4899', '#FCD34D', '#60A5FA'];
      const confettiCount = 150;
      const confetti: Array<{
        x: number; y: number; w: number; h: number; dx: number; dy: number;
        color: string; angle: number; dAngle: number;
      }> = [];

      for (let i = 0; i < confettiCount; i++) {
        confetti.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          w: Math.random() * 10 + 5,
          h: Math.random() * 5 + 3,
          dx: Math.random() * 2 - 1,
          dy: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          angle: Math.random() * 360,
          dAngle: Math.random() * 10 - 5
        });
      }

      let animationId: number;
      const startTime = Date.now();
      const duration = 5000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
          cancelAnimationFrame(animationId);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confetti.forEach((piece) => {
          piece.y += piece.dy;
          piece.x += piece.dx;
          piece.angle += piece.dAngle;
          if (piece.x > canvas.width) piece.x = 0;
          if (piece.x < 0) piece.x = canvas.width;
          ctx.save();
          ctx.translate(piece.x + piece.w / 2, piece.y + piece.h / 2);
          ctx.rotate((piece.angle * Math.PI) / 180);
          ctx.fillStyle = piece.color;
          ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
          ctx.restore();
        });
        animationId = requestAnimationFrame(animate);
      };
      animate();
    };

    const timer = setTimeout(() => createConfetti(), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <ConfettiCanvas id="confetti-canvas" />
      <Container>
        <Card>
          <Title>Félicitations et bienvenue !</Title>
          <Text>
            Votre voyage commence maintenant. Vous allez recevoir deux emails importants pour accéder à votre cocon.
          </Text>

          <Divider />

          <StepsContainer>
            <Step>
              <StepIcon><MailIcon /></StepIcon>
              <StepContent>
                <h3>1. L'email de bienvenue</h3>
                <p>Vous avez déjà dû recevoir un premier email confirmant votre inscription et votre paiement.</p>
              </StepContent>
            </Step>

            <Step>
              <StepIcon><KeyIcon /></StepIcon>
              <StepContent>
                <h3>2. Votre lien d'accès personnelle</h3>
                <p>Un second email arrive dans un instant. Il contient votre lien de connexion sécurisé pour entrer dans votre espace.</p>
              </StepContent>
            </Step>

            <Step>
              <StepIcon><RocketIcon /></StepIcon>
              <StepContent>
                <h3>3. Commencez votre transformation !</h3>
                <p>Cliquez sur le lien dans le second email pour accéder à votre tableau de bord et commencer votre premier module.</p>
              </StepContent>
            </Step>
          </StepsContainer>

          <SupportText>
            Un problème ? <a href="mailto:sigrid@aurora50.fr">Contactez-nous</a>, nous sommes là pour vous aider.
          </SupportText>
        </Card>
      </Container>
    </>
  )
}
