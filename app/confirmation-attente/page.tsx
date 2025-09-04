'use client'

import styled from '@emotion/styled'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import supabase from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 640px) {
    padding: 2rem;
    max-width: 90%;
  }
`

const Emoji = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`

const Title = styled.h1`
  font-size: 2rem;
  color: #111827;
  margin-bottom: 1rem;
  font-weight: 600;
  
  @media (max-width: 640px) {
    font-size: 1.75rem;
  }
`

const Message = styled.p`
  color: #6B7280;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  
  @media (max-width: 640px) {
    font-size: 1rem;
  }
`

const EmailHighlight = styled.span`
  color: #8B5CF6;
  font-weight: 600;
`

const InfoBox = styled.div`
  background: #F9FAFB;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 2rem 0;
  border: 1px solid #E5E7EB;
`

const InfoText = styled.p`
  color: #6B7280;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  
  strong {
    color: #4B5563;
  }
`

const ResendButton = styled.button`
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const CooldownText = styled.p`
  color: #9CA3AF;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`

const BackLink = styled(Link)`
  display: inline-block;
  margin-top: 2rem;
  color: #9CA3AF;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: #6B7280;
    text-decoration: underline;
  }
`

const SuccessMessage = styled.div`
  background: #F0FDF4;
  color: #166534;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
`

export default function ConfirmationAttentePage() {
  const [email, setEmail] = useState<string>('')
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Récupérer l'email depuis sessionStorage
    const pendingEmail = sessionStorage.getItem('pendingEmail')
    if (pendingEmail) {
      setEmail(pendingEmail)
      sessionStorage.removeItem('pendingEmail')
    } else {
      // Si pas d'email en attente, rediriger vers inscription
      router.push('/inscription')
    }
  }, [router])

  useEffect(() => {
    // Gérer le cooldown
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResendEmail = async () => {
    if (resending || cooldown > 0 || !email) return

    setResending(true)
    setShowSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (!error) {
        setShowSuccess(true)
        setCooldown(60) // Cooldown de 60 secondes
        
        // Masquer le message de succès après 5 secondes
        setTimeout(() => {
          setShowSuccess(false)
        }, 5000)
      }
    } catch (err) {
      console.error('Erreur lors du renvoi:', err)
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return null // Ou un loader
  }

  return (
    <Container>
      <Card>
        <Emoji>📧</Emoji>
        
        <Title>Parfait ! Votre compte est créé</Title>
        
        <Message>
          Vérifiez votre boîte mail pour activer votre espace Aurora50.
          <br />
          Nous avons envoyé un email à{' '}
          <EmailHighlight>{email}</EmailHighlight>
        </Message>

        <InfoBox>
          <InfoText>
            <strong>💡 Astuce :</strong> L'email arrive généralement en moins d'une minute. 
            Pensez à vérifier vos <strong>spams</strong> ou <strong>courriers indésirables</strong> si vous ne le voyez pas dans votre boîte de réception.
          </InfoText>
        </InfoBox>

        {showSuccess && (
          <SuccessMessage>
            ✅ Email renvoyé avec succès ! Vérifiez votre boîte mail.
          </SuccessMessage>
        )}

        <ResendButton 
          onClick={handleResendEmail}
          disabled={resending || cooldown > 0}
        >
          {resending 
            ? 'Envoi en cours...' 
            : cooldown > 0 
              ? `Renvoyer dans ${cooldown}s`
              : 'Renvoyer l\'email'
          }
        </ResendButton>

        {cooldown > 0 && (
          <CooldownText>
            Vous pourrez renvoyer l'email dans {cooldown} secondes
          </CooldownText>
        )}

        <BackLink href="/">
          Retour à l'accueil
        </BackLink>
      </Card>
    </Container>
  )
}
