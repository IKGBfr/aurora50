'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase/client'
import styled from '@emotion/styled'

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
  max-width: 450px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 640px) {
    padding: 2rem;
    max-width: 90%;
  }
`

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(139, 92, 246, 0.2);
  border-top-color: #8B5CF6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 2rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.5s ease-in;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
`

const Title = styled.h1`
  font-size: 1.75rem;
  color: #111827;
  margin-bottom: 1rem;
  font-weight: 600;
  
  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`

const Message = styled.p`
  color: #6B7280;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`

const RedirectInfo = styled.p`
  color: #9CA3AF;
  font-size: 0.875rem;
  margin-top: 1rem;
`

type Status = 'processing' | 'success' | 'error'

export default function ConfirmerPage() {
  const [status, setStatus] = useState<Status>('processing')
  const [countdown, setCountdown] = useState(3)
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    // Éviter les appels multiples
    if (hasProcessed) return
    
    const verifyEmail = async () => {
      try {
        setHasProcessed(true)
        
        // Récupérer TOUS les params possibles du hash
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        
        // Log pour debug
        console.log('URL complète:', window.location.href)
        console.log('Hash brut:', hash)
        console.log('Params extraits:', {
          token_hash: params.get('token_hash'),
          access_token: params.get('access_token'),
          type: params.get('type'),
          error: params.get('error')
        })
        
        // Vérifier d'abord les erreurs
        const error = params.get('error')
        const errorDescription = params.get('error_description')
        
        if (error) {
          console.error('Erreur dans l\'URL:', error, errorDescription)
          setStatus('error')
          setTimeout(() => {
            window.location.href = '/connexion?error=invalid'
          }, 2000)
          return
        }
        
        // Cas 1: Token hash (format OTP - le plus courant pour la confirmation email)
        const tokenHash = params.get('token_hash')
        const type = params.get('type') || 'signup'
        
        if (tokenHash) {
          console.log('Token hash trouvé, vérification OTP...')
          
          try {
            const { data, error: otpError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: type as 'signup' | 'recovery' | 'invite' | 'email'
            })
            
            if (otpError) {
              console.error('Erreur OTP:', otpError)
              setStatus('error')
              
              // Message d'erreur spécifique selon le type
              if (otpError.message?.includes('expired')) {
                setTimeout(() => {
                  window.location.href = '/connexion?error=expired'
                }, 2000)
              } else if (otpError.message?.includes('not found')) {
                setTimeout(() => {
                  window.location.href = '/connexion?error=invalid'
                }, 2000)
              } else {
                setTimeout(() => {
                  window.location.href = '/connexion?error=invalid'
                }, 2000)
              }
            } else {
              console.log('Email confirmé avec succès!', data)
              setStatus('success')
              
              // Rediriger vers connexion avec message de succès
              setTimeout(() => {
                window.location.href = '/connexion?message=email_confirmed'
              }, 2000)
            }
          } catch (err) {
            console.error('Erreur lors de la vérification OTP:', err)
            setStatus('error')
            setTimeout(() => {
              window.location.href = '/connexion?error=invalid'
            }, 2000)
          }
          return
        }
        
        // Cas 2: Access token (ancien format ou magic link)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        
        if (accessToken && refreshToken) {
          console.log('Tokens trouvés, établissement session...')
          
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (!sessionError) {
              console.log('Session établie avec succès')
              setStatus('success')
              
              // Si c'est une confirmation d'inscription, aller vers onboarding
              const redirectTo = type === 'signup' ? '/onboarding' : '/dashboard'
              setTimeout(() => {
                window.location.href = redirectTo
              }, 1500)
            } else {
              console.error('Erreur session:', sessionError)
              setStatus('error')
              setTimeout(() => {
                window.location.href = '/connexion?error=invalid'
              }, 2000)
            }
          } catch (err) {
            console.error('Erreur lors de l\'établissement de la session:', err)
            setStatus('error')
            setTimeout(() => {
              window.location.href = '/connexion?error=invalid'
            }, 2000)
          }
          return
        }
        
        // Aucun token trouvé
        console.log('Aucun token trouvé dans l\'URL')
        setStatus('error')
        setTimeout(() => {
          window.location.href = '/connexion?error=invalid'
        }, 2000)
        
      } catch (err) {
        console.error('Erreur inattendue:', err)
        setStatus('error')
        setTimeout(() => {
          window.location.href = '/connexion?error=invalid'
        }, 2000)
      }
    }
    
    // N'appeler qu'UNE SEULE FOIS
    verifyEmail()
  }, [hasProcessed])

  useEffect(() => {
    // Countdown pour la redirection
    if (status !== 'processing' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [status, countdown])

  return (
    <Container>
      <Card>
        {status === 'processing' && (
          <>
            <Spinner />
            <Title>Confirmation en cours...</Title>
            <Message>
              Nous vérifions votre lien de confirmation.
            </Message>
          </>
        )}

        {status === 'success' && (
          <>
            <Icon>✅</Icon>
            <Title>Email confirmé !</Title>
            <Message>
              Votre email a été confirmé avec succès.
              <br />
              Vous allez être redirigé...
            </Message>
            <RedirectInfo>
              Redirection dans {countdown} seconde{countdown > 1 ? 's' : ''}...
            </RedirectInfo>
          </>
        )}

        {status === 'error' && (
          <>
            <Icon>❌</Icon>
            <Title>Lien invalide ou expiré</Title>
            <Message>
              Ce lien de confirmation n'est plus valide.
              <br />
              Veuillez demander un nouveau lien de confirmation.
            </Message>
            <RedirectInfo>
              Redirection dans {countdown} seconde{countdown > 1 ? 's' : ''}...
            </RedirectInfo>
          </>
        )}
      </Card>
    </Container>
  )
}
