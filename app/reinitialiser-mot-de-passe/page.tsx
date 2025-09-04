'use client'

import { useState, useEffect, Suspense } from 'react'
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
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.75rem;
  text-align: center;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
`

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 1rem;
  height: 48px;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
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
    background: #eff6ff;
    color: #1e40af;
  `}
`

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid #E5E7EB;
    border-top-color: #8B5CF6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [sessionValid, setSessionValid] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const verifyAndExchangeCode = async () => {
      try {
        const code = searchParams.get('code')
        
        if (!code) {
          setMessage({ type: 'error', text: 'Code de réinitialisation manquant dans l\'URL' })
          setVerifying(false)
          return
        }

        // IMPORTANT: Utiliser exchangeCodeForSession au lieu de verifyOtp
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Erreur exchangeCodeForSession:', error)
          setMessage({ 
            type: 'error', 
            text: 'Le lien est invalide ou a expiré. Veuillez demander un nouveau lien de réinitialisation.' 
          })
        } else if (data?.session) {
          setSessionValid(true)
          setMessage({ 
            type: 'info', 
            text: '✅ Vérification réussie ! Créez votre nouveau mot de passe.' 
          })
        } else {
          setMessage({ 
            type: 'error', 
            text: 'Session invalide. Veuillez réessayer.' 
          })
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error)
        setMessage({ 
          type: 'error', 
          text: 'Une erreur inattendue est survenue.' 
        })
      } finally {
        setVerifying(false)
      }
    }

    verifyAndExchangeCode()
  }, [searchParams, supabase.auth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Maintenant on peut simplement mettre à jour le mot de passe
      // car la session a déjà été établie avec exchangeCodeForSession
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: '🎉 Mot de passe réinitialisé avec succès ! Redirection...' 
      })

      // Se déconnecter pour forcer une nouvelle connexion avec le nouveau mot de passe
      await supabase.auth.signOut()

      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push('/connexion?reset=success')
      }, 2000)

    } catch (error: any) {
      console.error('Erreur mise à jour mot de passe:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erreur lors de la réinitialisation du mot de passe' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Affichage pendant la vérification
  if (verifying) {
    return (
      <Container>
        <Card>
          <Title>Vérification en cours... 🌿</Title>
          <LoadingSpinner />
        </Card>
      </Container>
    )
  }

  // Si la session n'est pas valide
  if (!sessionValid) {
    return (
      <Container>
        <Card>
          <Title>Lien Invalide 😔</Title>
          {message && <Message type={message.type}>{message.text}</Message>}
          <Button onClick={() => router.push('/connexion')}>
            Retour à la connexion
          </Button>
        </Card>
      </Container>
    )
  }

  // Formulaire de nouveau mot de passe
  return (
    <Container>
      <Card>
        <Title>Nouveau mot de passe 🔐</Title>
        
        {message && (
          <Message type={message.type}>
            {message.text}
          </Message>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe (min. 6 caractères)"
            required
            disabled={loading}
            autoFocus
            minLength={6}
          />
          
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmer le mot de passe"
            required
            disabled={loading}
            minLength={6}
          />

          <Button type="submit" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
          </Button>
        </Form>
      </Card>
    </Container>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Container><Card>Chargement...</Card></Container>}>
      <ResetPasswordContent />
    </Suspense>
  )
}