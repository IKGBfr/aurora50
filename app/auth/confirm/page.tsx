'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styled from '@emotion/styled'
import { createClient } from '@/lib/supabase/client'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  padding: 2rem;
`

const Card = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
`

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const Message = styled.p`
  color: #6B7280;
  margin-bottom: 2rem;
  line-height: 1.6;
`

const Spinner = styled.div`
  width: 30px;
  height: 30px;
  border: 3px solid #E5E7EB;
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const ErrorMessage = styled.div`
  background: #FEE2E2;
  color: #991B1B;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
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
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
  }
`

// Composant de chargement avec le style Aurora50
const LoadingFallback = () => (
  <Container>
    <Card>
      <Icon>✨</Icon>
      <Title>Vérification en cours</Title>
      <Message>
        Nous vérifions votre lien de confirmation...
        <br />
        Un instant, la magie opère !
      </Message>
      <Spinner />
    </Card>
  </Container>
)

// Composant qui utilise useSearchParams
function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('Vérification en cours...')
  const [countdown, setCountdown] = useState(3)
  const supabase = createClient()

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        setStatus('error')
        setMessage('Lien de vérification invalide. Le token est manquant.')
        return
      }

      try {
        // Vérifier le token et mettre à jour le profil
        const { data, error } = await supabase
          .from('profiles')
          .update({ 
            email_verified: true,
            email_verified_at: new Date().toISOString(),
            email_verification_token: null // Supprimer le token après utilisation
          } as any)
          .eq('email_verification_token', token)
          .select()
          .single()

        if (error || !data) {
          console.error('Erreur de vérification:', error)
          setStatus('error')
          setMessage('Lien de vérification invalide ou expiré. Veuillez demander un nouveau lien.')
        } else {
          console.log('Email vérifié avec succès pour:', data.id)
          setStatus('success')
          setMessage('Votre email a été confirmé avec succès !')
          
          // Démarrer le compte à rebours pour la redirection
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer)
                router.push('/dashboard')
                return 0
              }
              return prev - 1
            })
          }, 1000)
        }
      } catch (err) {
        console.error('Erreur inattendue:', err)
        setStatus('error')
        setMessage('Une erreur inattendue s\'est produite. Veuillez réessayer.')
      }
    }
    
    verifyToken()
  }, [searchParams, router, supabase])

  return (
    <Container>
      <Card>
        {status === 'verifying' && (
          <>
            <Icon>🔍</Icon>
            <Title>Vérification en cours</Title>
            <Message>{message}</Message>
            <Spinner />
          </>
        )}
        
        {status === 'success' && (
          <>
            <Icon>✨</Icon>
            <Title>Email Vérifié !</Title>
            <Message>
              {message}
              <br />
              <br />
              Vous allez être redirigé vers votre espace dans {countdown} seconde{countdown > 1 ? 's' : ''}...
            </Message>
            <Spinner />
          </>
        )}
        
        {status === 'error' && (
          <>
            <Icon>❌</Icon>
            <Title>Erreur de vérification</Title>
            <ErrorMessage>{message}</ErrorMessage>
            <Button onClick={() => router.push('/connexion')}>
              Retour à la connexion
            </Button>
          </>
        )}
      </Card>
    </Container>
  )
}

// Page principale avec Suspense
export default function ConfirmPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmContent />
    </Suspense>
  )
}
