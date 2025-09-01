'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styled from '@emotion/styled'
import { createClient } from '@/lib/supabase/client'
import Lottie from 'lottie-react'
import logoAnimation from '@/public/animations/Multiple_circles.json'

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

  @media (max-width: 640px) {
    padding: 2rem;
  }
`

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`

const LogoAnimation = styled.div`
  width: 100px;
  height: 100px;
  margin-bottom: 1rem;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  text-align: center;
`

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
`

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`

const WelcomeTitle = styled.h2`
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-weight: 600;
`

const WelcomeSubtitle = styled.p`
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
`

const Stats = styled.div`
  background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  border: 1px solid #e9d5ff;
`

const StatsNumber = styled.span`
  font-size: 1.25rem;
  font-weight: bold;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const StatsText = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
  margin-left: 0.5rem;
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
  display: flex;
  align-items: center;
  justify-content: center;

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

const FooterLinks = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
`

const FooterLink = styled(Link)`
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
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

const CheckList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const CheckItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.875rem;

  &::before {
    content: '✨';
    font-size: 1rem;
  }
`

export default function InscriptionPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info'
    text: string
  } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Vérifier si l'email existe déjà
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        setMessage({
          type: 'info',
          text: "Cet email est déjà inscrit ! Utilisez la page de connexion pour recevoir votre lien magique 🌿"
        })
        setTimeout(() => {
          router.push('/connexion')
        }, 3000)
        return
      }

      // Créer le compte avec Supabase Auth
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            is_new_user: true
          }
        }
      })

      if (error) {
        if (error.message?.toLowerCase().includes('rate') || 
            error.message?.toLowerCase().includes('limit')) {
          setMessage({
            type: 'info',
            text: "⏱️ Pour votre sécurité, merci de patienter quelques secondes avant de réessayer."
          })
        } else {
          setMessage({
            type: 'error',
            text: "Oh, un petit souci technique ! Réessayons dans quelques instants 🌿"
          })
        }
      } else {
        setMessage({
          type: 'success',
          text: "✨ Félicitations ! Votre compte est créé. Vérifiez votre boîte mail pour continuer !"
        })
        
        // Rediriger vers une page de confirmation
        setTimeout(() => {
          router.push('/inscription/confirmation')
        }, 2000)
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
        <LogoContainer>
          <LogoAnimation>
            <Lottie
              animationData={logoAnimation}
              loop={true}
              autoplay={true}
            />
          </LogoAnimation>
          <Title>Aurora50</Title>
          <Subtitle>Votre Renaissance Après 50 Ans Commence Ici 🌿</Subtitle>
        </LogoContainer>

        <Card>
          <WelcomeSection>
            <WelcomeTitle>Rejoignez notre communauté bienveillante</WelcomeTitle>
            <WelcomeSubtitle>
              Inscription gratuite en 30 secondes, sans carte bancaire
            </WelcomeSubtitle>
          </WelcomeSection>

          <Stats>
            <StatsNumber>21 885</StatsNumber>
            <StatsText>femmes déjà inscrites</StatsText>
          </Stats>

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="email">Votre email</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marie@example.com"
                required
                disabled={loading}
                aria-label="Adresse email"
              />
            </InputGroup>

            <CheckList>
              <CheckItem>Accès gratuit immédiat</CheckItem>
              <CheckItem>Pas de carte bancaire requise</CheckItem>
              <CheckItem>Communauté bienveillante de 21 885 membres</CheckItem>
            </CheckList>

            <Button type="submit" disabled={loading}>
              {loading && <Spinner />}
              {loading ? 'Création en cours...' : 'Commencer Gratuitement →'}
            </Button>
          </Form>

          {message && (
            <Message type={message.type}>
              {message.text}
            </Message>
          )}

          <FooterLinks>
            <FooterLink href="/connexion">
              J'ai déjà un compte → Me connecter
            </FooterLink>
          </FooterLinks>
        </Card>
      </div>
    </Container>
  )
}
