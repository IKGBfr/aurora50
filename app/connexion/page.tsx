'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import styled from '@emotion/styled'
import { createClient } from '@/lib/supabase/client'

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

const ForgotPasswordLink = styled(Link)`
  display: block;
  text-align: right;
  margin-top: -0.5rem;
  font-size: 0.875rem;
  color: #8B5CF6;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
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

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Gérer le redirectTo depuis les paramètres URL
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  // Gérer les messages et erreurs provenant d'autres pages
  useEffect(() => {
    const message = searchParams.get('message')
    const redirect = searchParams.get('redirect')
    const error = searchParams.get('error')
    
    // Gérer les messages de confirmation
    if (message === 'email_confirmed') {
      setMessage({
        type: 'success',
        text: '✅ Email confirmé ! Connectez-vous pour accéder à votre espace.'
      })
      // Stocker la redirection souhaitée
      if (redirect) {
        sessionStorage.setItem('postLoginRedirect', redirect)
      }
    } else if (message === 'link_expired') {
      setMessage({
        type: 'error',
        text: 'Le lien de confirmation a expiré. Veuillez demander un nouveau lien.'
      })
    } else if (message === 'confirmation_error') {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la confirmation. Veuillez réessayer.'
      })
    } else if (message === 'email_confirmed_please_login') {
      setMessage({
        type: 'info',
        text: 'Votre email est déjà confirmé. Connectez-vous pour continuer.'
      })
    }
    
    // Gérer les erreurs existantes
    if (error) {
      if (error === 'expired') {
        setMessage({
          type: 'error',
          text: 'Le lien de connexion a expiré. Veuillez demander un nouveau lien.'
        })
      } else if (error === 'denied') {
        setMessage({
          type: 'error',
          text: 'Accès refusé. Veuillez réessayer.'
        })
      } else {
        setMessage({
          type: 'error',
          text: 'Lien invalide. Veuillez demander un nouveau lien de connexion.'
        })
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message?.toLowerCase().includes('invalid')) {
          setMessage({
            type: 'error',
            text: "Email ou mot de passe incorrect."
          })
        } else if (error.message?.toLowerCase().includes('rate') || 
                   error.message?.toLowerCase().includes('limit')) {
          setMessage({
            type: 'info',
            text: "Trop de tentatives. Veuillez patienter quelques instants."
          })
        } else {
          setMessage({
            type: 'error',
            text: "Une erreur s'est produite. Veuillez réessayer."
          })
        }
      } else if (data?.user) {
        // Vérifier le profil pour déterminer la redirection
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, onboarding_completed')
          .eq('id', data.user.id)
          .single()
        
        // Vérifier s'il y a une redirection post-login stockée
        const postLoginRedirect = sessionStorage.getItem('postLoginRedirect')
        if (postLoginRedirect) {
          sessionStorage.removeItem('postLoginRedirect')
          router.push(postLoginRedirect)
        } else if (!profile?.full_name || !profile?.onboarding_completed) {
          // Si le profil n'est pas complet ou nouveau
          router.push('/onboarding')
        } else {
          // Sinon rediriger vers la page demandée ou le dashboard
          router.push(redirectTo)
        }
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
    <Container>
      <div>
        <Card>
          <Title>Aurora50</Title>
          <Subtitle>Accédez à votre espace 🌿</Subtitle>

          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              required
              disabled={loading}
              autoFocus
            />

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              disabled={loading}
            />
            
            <ForgotPasswordLink href="/mot-de-passe-oublie">
              Mot de passe oublié ?
            </ForgotPasswordLink>

            <Button type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Form>

          {message && (
            <Message type={message.type}>
              {message.text}
            </Message>
          )}

          <FooterText>
            Pas encore membre ? <Link href="/inscription">Créer un compte</Link>
          </FooterText>
        </Card>
        
        <BackLink href="/">
          Retour à l'accueil
        </BackLink>
      </div>
    </Container>
  )
}
