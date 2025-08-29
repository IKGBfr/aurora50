'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import styled from '@emotion/styled'

export const dynamic = 'force-dynamic'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #fdf4ff 50%, #fef3f2 100%);
`

const LoadingCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
`

const Title = styled.h1`
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
  margin-bottom: 1rem;
`

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  margin: 2rem auto;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #8B5CF6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const Message = styled.p`
  color: #6b7280;
  font-size: 1.1rem;
  margin: 1rem 0;
`

function AuthConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Connexion en cours...')
  
  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        const supabase = createClient()
        
        // Supabase gère automatiquement le token dans l'URL (hash ou query params)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          setMessage('Connexion réussie ! Redirection...')
          
          // Récupérer la destination depuis les params ou utiliser /dashboard par défaut
          const next = searchParams.get('next') || '/dashboard?welcome=true'
          
          // Petit délai pour afficher le message de succès
          setTimeout(() => {
            router.push(next)
          }, 1000)
        } else {
          // Si pas de session, essayer de récupérer depuis l'URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const access_token = hashParams.get('access_token')
          
          if (access_token) {
            // Établir la session avec le token
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token: hashParams.get('refresh_token') || ''
            })
            
            if (!sessionError) {
              setMessage('Connexion réussie ! Redirection...')
              const next = searchParams.get('next') || '/dashboard?welcome=true'
              setTimeout(() => router.push(next), 1000)
              return
            }
          }
          
          // Si toujours pas de session, rediriger vers connexion
          setMessage('Lien expiré ou invalide. Redirection...')
          setTimeout(() => router.push('/connexion'), 2000)
        }
      } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        setMessage('Une erreur est survenue. Redirection...')
        setTimeout(() => router.push('/connexion'), 2000)
      }
    }
    
    handleMagicLink()
  }, [router, searchParams])
  
  return (
    <Container>
      <LoadingCard>
        <Title>Aurora50 🌿</Title>
        <Spinner />
        <Message>{message}</Message>
      </LoadingCard>
    </Container>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <Container>
        <LoadingCard>
          <Title>Aurora50 🌿</Title>
          <Spinner />
          <Message>Chargement...</Message>
        </LoadingCard>
      </Container>
    }>
      <AuthConfirmContent />
    </Suspense>
  )
}
