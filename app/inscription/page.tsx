'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styled from '@emotion/styled'
import supabase from '@/lib/supabase/client'

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
  width: 100%;
  max-width: 440px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    padding: 2rem;
  }
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
  text-align: center;
`

const Subtitle = styled.p`
  color: #6B7280;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 2.5rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 1rem;
  transition: border-color 0.2s;
  height: 48px;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
  }

  &::placeholder {
    color: #9CA3AF;
  }
`

const PasswordHint = styled.p`
  font-size: 0.75rem;
  color: #9CA3AF;
  margin-top: -1rem;
  margin-bottom: 0.5rem;
`

const Button = styled.button`
  padding: 1rem;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  height: 48px;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Message = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;

  ${props => props.type === 'success' && `
    background: #f0fdf4;
    color: #166534;
  `}

  ${props => props.type === 'error' && `
    background: #fef2f2;
    color: #991b1b;
  `}

  ${props => props.type === 'info' && `
    background: #f0f9ff;
    color: #1e40af;
  `}
`

const FooterText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6B7280;

  a {
    color: #8B5CF6;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

const BackLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #ffffff;
  opacity: 0.9;
  text-decoration: none;
  font-size: 0.875rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`

const LoadingContent = styled.div`
  text-align: center;
  color: white;
`

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const LoadingTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const LoadingText = styled.p`
  font-size: 1rem;
  opacity: 0.9;
`

export default function InscriptionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Vérifier la longueur du mot de passe
    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: "Le mot de passe doit faire au moins 6 caractères"
      })
      setLoading(false)
      return
    }

    try {
      // 1. Créer le compte avec Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // IMPORTANT : Ajouter l'URL de redirection pour le lien de vérification
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (error) {
        console.error('Signup error:', error)
        if (error.message?.includes('already registered')) {
          setMessage({
            type: 'info',
            text: "Cet email est déjà inscrit. Connectez-vous."
          })
          setTimeout(() => {
            router.push('/connexion')
          }, 2000)
        } else {
          setMessage({
            type: 'error',
            text: error.message || "Une erreur s'est produite. Veuillez réessayer."
          })
        }
      } else if (data?.user) {
        console.log('Signup successful, sending verification email...')
  
        // Envoyer l'email de vérification manuellement
        try {
          const emailRes = await fetch('/api/send-verification-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email,
              userId: data.user.id
            })
          })
          
          const emailResult = await emailRes.json()
          console.log('Verification email result:', emailResult)
          
          if (!emailResult.success) {
            console.error('Failed to send verification email')
          }
        } catch (err) {
          console.error('Error sending verification email:', err)
        }
        
        // Message et redirection
        setMessage({
          type: 'success',
          text: '🎉 Compte créé ! Un email de vérification a été envoyé.'
        })
        
        setTimeout(() => {
          router.push('/onboarding')
        }, 2000)
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: "Une erreur s'est produite. Veuillez réessayer."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {isRedirecting && (
        <LoadingOverlay>
          <LoadingContent>
            <Spinner />
            <LoadingTitle>Création de votre espace...</LoadingTitle>
            <LoadingText>Un instant, nous préparons tout pour vous 🌿</LoadingText>
          </LoadingContent>
        </LoadingOverlay>
      )}
      
      <Container>
        <div>
          <Card>
          <Title>Aurora50</Title>
          <Subtitle>Créez votre espace personnel 🌿</Subtitle>

          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              required
              disabled={loading}
            />

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              disabled={loading}
            />
            <PasswordHint>Minimum 6 caractères</PasswordHint>

            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </Button>
          </Form>

          {message && (
            <Message type={message.type}>
              {message.text}
            </Message>
          )}

          <FooterText>
            Déjà membre ? <Link href="/connexion">Se connecter</Link>
          </FooterText>
        </Card>
        
          <BackLink href="/">
            Retour à l'accueil
          </BackLink>
        </div>
      </Container>
    </>
  )
}
