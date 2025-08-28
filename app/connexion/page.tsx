'use client'

import { useState } from 'react'
import Link from 'next/link'
import styled from '@emotion/styled'
import { createClient } from '@/lib/supabase/client'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #fdf4ff 50%, #fef3f2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

const Card = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  }
`

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
`

const WelcomeTitle = styled.h2`
  font-size: 1.5rem;
  color: #1f2937;
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 600;
`

const WelcomeSubtitle = styled.p`
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  color: #4b5563;
  font-size: 0.875rem;
  font-weight: 500;
`

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: #8B5CF6;
    background: white;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
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
  transition: all 0.3s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

const Message = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 12px;
  margin-top: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
  animation: slideIn 0.3s ease-out;

  ${props => props.type === 'success' && `
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  `}

  ${props => props.type === 'error' && `
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
  `}

  ${props => props.type === 'info' && `
    background: #f0f9ff;
    color: #1e40af;
    border: 1px solid #bfdbfe;
  `}

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  margin-top: 2rem;
  transition: color 0.2s;

  &:hover {
    color: #8B5CF6;
  }
`

const Spinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

export default function ConnexionPage() {
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) {
        // Gestion douce des erreurs
        if (error.message.includes('not authorized') || error.message.includes('User not found')) {
          setMessage({
            type: 'info',
            text: "Hmm, cet email ne fait pas encore partie de notre communauté Aurora50. Avez-vous bien finalisé votre inscription ? 🌿"
          })
        } else {
          setMessage({
            type: 'error',
            text: "Oh, un petit souci technique ! Réessayons ensemble 🌿"
          })
        }
      } else {
        setMessage({
          type: 'success',
          text: "✨ C'est parti ! Votre lien magique vient d'être envoyé. Vérifiez votre boîte mail !"
        })
        setEmail('')
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: "Oh, un petit souci technique ! Réessayons ensemble 🌿"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <Logo>
          <Title>Aurora50</Title>
          <Subtitle>Votre cocon digital de transformation 🌸</Subtitle>
        </Logo>

        <Card>
          <WelcomeTitle>Bienvenue dans votre espace Aurora50 🌿</WelcomeTitle>
          <WelcomeSubtitle>
            Connectez-vous simplement avec votre email
          </WelcomeSubtitle>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="email">Votre email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email Aurora50"
                required
                disabled={loading}
                aria-label="Adresse email"
              />
            </InputGroup>

            <Button type="submit" disabled={loading}>
              {loading && <Spinner />}
              {loading ? 'Envoi en cours...' : 'Recevoir mon lien de connexion'}
            </Button>
          </Form>

          {message && (
            <Message type={message.type}>
              {message.text}
            </Message>
          )}
        </Card>

        <div style={{ textAlign: 'center' }}>
          <BackLink href="/">
            ← Retour à l'accueil
          </BackLink>
        </div>
      </div>
    </Container>
  )
}
