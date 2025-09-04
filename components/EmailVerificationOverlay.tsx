import { useState, useEffect } from 'react'
import styled from '@emotion/styled'
import { useEmailVerification } from 'lib/hooks/useEmailVerification'
import { createClient } from 'lib/supabase/client'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
`

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`

const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
`

const Description = styled.p`
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 2rem;
`

const Button = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SecondaryButton = styled(Button)`
  background: #F3F4F6;
  color: #4B5563;

  &:hover:not(:disabled) {
    background: #E5E7EB;
  }
`

const EmailDisplay = styled.div`
  background: #F9FAFB;
  padding: 0.75rem;
  border-radius: 12px;
  margin: 1rem 0;
  font-family: monospace;
  color: #4B5563;
  font-size: 0.9rem;
`

interface Props {
  onboardingCompleted: boolean
}

export function EmailVerificationOverlay({ onboardingCompleted }: Props) {
  const { isVerified, loading, user, resendVerificationEmail } = useEmailVerification()
  const [sending, setSending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Ne pas afficher si :
  // - En cours de chargement
  // - Email vérifié
  // - Onboarding non complété
  if (loading || isVerified || !onboardingCompleted) {
    return null
  }

  const handleResend = async () => {
    setSending(true)
    const { error } = await resendVerificationEmail()
    
    if (!error) {
      setCountdown(60) // Cooldown de 60 secondes
    }
    
    setSending(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/connexion'
  }

  return (
    <Overlay>
      <Modal>
        <Icon>📧</Icon>
        
        <Title>Vérifiez votre email</Title>
        
        <Description>
          Pour accéder à toutes les fonctionnalités d'Aurora50, 
          veuillez confirmer votre adresse email. 
          Nous avons envoyé un lien de vérification à :
        </Description>

        <EmailDisplay>{user?.email}</EmailDisplay>

        <Description style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
          🌿 Vérifiez également vos spams si vous ne trouvez pas l'email.
        </Description>

        <div>
          <Button 
            onClick={handleResend} 
            disabled={sending || countdown > 0}
          >
            {sending ? 'Envoi...' : 
             countdown > 0 ? `Renvoyer dans ${countdown}s` : 
             'Renvoyer l\'email'}
          </Button>

          <SecondaryButton onClick={handleLogout}>
            Se déconnecter
          </SecondaryButton>
        </div>
      </Modal>
    </Overlay>
  )
}
