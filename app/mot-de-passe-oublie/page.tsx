'use client'

import { useState } from 'react'
import Link from 'next/link'
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

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      })

      if (error) {
        if (error.message?.toLowerCase().includes('rate') || 
            error.message?.toLowerCase().includes('limit')) {
          setMessage({
            type: 'info',
            text: "Veuillez patienter quelques instants avant de réessayer."
          })
        } else {
          setMessage({
            type: 'error',
            text: "Une erreur s'est produite. Veuillez réessayer."
          })
        }
      } else {
        setMessage({
          type: 'success',
          text: "Un email de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception."
        })
        setEmail('')
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
          <Title>Mot de passe oublié ?</Title>
          <Subtitle>Entrez votre email pour recevoir un lien de réinitialisation</Subtitle>

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

            <Button type="submit" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </Button>
          </Form>

          {message && (
            <Message type={message.type}>
              {message.text}
            </Message>
          )}

          <FooterText>
            Vous vous souvenez de votre mot de passe ? <Link href="/connexion">Se connecter</Link>
          </FooterText>
        </Card>
        
        <BackLink href="/connexion">
          Retour à la connexion
        </BackLink>
      </div>
    </Container>
  )
}
