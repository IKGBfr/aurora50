'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styled from '@emotion/styled'
import { createClient } from '@/lib/supabase/client'
import { OnboardingAnswers } from '@/lib/database.types'

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
  max-width: 600px;
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

const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #e5e7eb;
`

const ProgressFill = styled.div<{ progress: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  transition: width 0.5s ease;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`

const StepNumber = styled.span`
  color: #8B5CF6;
  font-weight: bold;
  font-size: 0.875rem;
`

const StepTotal = styled.span`
  color: #9ca3af;
  font-size: 0.875rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;

  @media (max-width: 640px) {
    font-size: 1.75rem;
  }
`

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
`

const QuestionContainer = styled.div`
  animation: fadeIn 0.5s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const Question = styled.h2`
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 600;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`

const OptionsGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
`

const OptionCard = styled.button<{ selected: boolean }>`
  padding: 1.25rem;
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%)' 
    : 'white'};
  border: 2px solid ${props => props.selected ? '#8B5CF6' : '#e5e7eb'};
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1rem;

  &:hover {
    border-color: #8B5CF6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
  }

  @media (max-width: 640px) {
    padding: 1rem;
  }
`

const OptionEmoji = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`

const OptionText = styled.span`
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  flex: 1;

  @media (max-width: 640px) {
    font-size: 0.938rem;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
`

const Button = styled.button<{ variant?: 'secondary' }>`
  padding: 0.875rem 2rem;
  background: ${props => props.variant === 'secondary' 
    ? 'transparent' 
    : 'linear-gradient(135deg, #10B981, #8B5CF6, #EC4899)'};
  color: ${props => props.variant === 'secondary' ? '#6b7280' : 'white'};
  border: ${props => props.variant === 'secondary' ? '2px solid #e5e7eb' : 'none'};
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'secondary' 
      ? 'none' 
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
    ${props => props.variant === 'secondary' && 'border-color: #9ca3af;'}
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SkipButton = styled.button`
  color: #9ca3af;
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 1rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
  transition: color 0.2s;

  &:hover {
    color: #6b7280;
  }
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const TextInput = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: 1.125rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
  background: white;
  color: #1f2937;
  
  &:focus {
    outline: none;
    border-color: #8B5CF6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`

const InputHint = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
`

const questions = [
  {
    id: 'fullName',
    question: 'Comment souhaitez-vous être appelée ?',
    emoji: '✨',
    type: 'text',
    placeholder: 'Entrez votre prénom et nom',
    hint: 'Ce nom sera affiché sur votre profil'
  },
  {
    id: 'situation',
    question: 'Où en êtes-vous aujourd\'hui ?',
    emoji: '🌱',
    type: 'options',
    options: [
      { value: 'active', label: 'En activité professionnelle', emoji: '💼' },
      { value: 'transition', label: 'En transition de carrière', emoji: '🔄' },
      { value: 'retired', label: 'Nouvellement retraitée', emoji: '🌸' },
      { value: 'searching', label: 'En quête de sens', emoji: '🔍' }
    ]
  },
  {
    id: 'motivation',
    question: 'Qu\'est-ce qui vous amène ?',
    emoji: '💫',
    type: 'options',
    options: [
      { value: 'change', label: 'Besoin de changement', emoji: '🦋' },
      { value: 'loneliness', label: 'Sentiment de solitude', emoji: '🤝' },
      { value: 'learning', label: 'Envie d\'apprendre', emoji: '📚' },
      { value: 'curiosity', label: 'Curiosité et découverte', emoji: '✨' }
    ]
  },
  {
    id: 'priority',
    question: 'Votre priorité actuelle ?',
    emoji: '🎯',
    type: 'options',
    options: [
      { value: 'emotional', label: 'Libération émotionnelle', emoji: '💝' },
      { value: 'physical', label: 'Reconquête du corps', emoji: '💪' },
      { value: 'career', label: 'Nouvelle carrière', emoji: '🚀' },
      { value: 'relationships', label: 'Relations authentiques', emoji: '❤️' }
    ]
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<OnboardingAnswers>({})
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/connexion')
        return
      }
      setUserId(user.id)

      // Vérifier si le profil existe et si l'onboarding est déjà complété
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Le profil n'existe pas, le créer
          console.log('Création du profil pour l\'onboarding...')
          
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.email?.split('@')[0] || 'Nouveau membre',
              bio: 'Nouveau membre de la communauté Aurora50 🌿',
              avatar_url: null,
              cover_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              subscription_status: 'free',
              subscription_plan: 'free',
              subscription_period_end: null,
              stripe_customer_id: null,
              stripe_subscription_id: null,
              onboarding_completed: false,
              daily_messages_count: 0,
              last_message_reset: new Date().toISOString()
            })

          if (createError && createError.code !== '23505') {
            console.error('Erreur lors de la création du profil:', createError)
          }
        } else {
          console.error('Erreur lors de la vérification du profil:', profileError)
        }
      } else if (profile?.onboarding_completed) {
        // Si l'onboarding est déjà complété, rediriger vers le dashboard
        router.push('/dashboard')
      }
    }

    checkUser()
  }, [router, supabase])

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value as any
    }))
  }

  const handleNext = async () => {
    // Si on est sur la question du nom, sauvegarder la réponse
    if (currentQuestion.id === 'fullName' && fullName.trim()) {
      handleAnswer(fullName.trim())
    }
    
    if (currentStep < questions.length - 1) {
      // Sauvegarder la progression
      if (userId) {
        const updatedAnswers = currentQuestion.id === 'fullName' 
          ? { ...answers, fullName: fullName.trim() }
          : answers
          
        await supabase
          .from('profiles')
          .update({ 
            onboarding_answers: updatedAnswers 
          })
          .eq('id', userId)
      }
      
      setCurrentStep(prev => prev + 1)
    } else {
      // Dernière étape - finaliser l'onboarding
      await completeOnboarding()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = async () => {
    await completeOnboarding()
  }

  const completeOnboarding = async () => {
    if (!userId) return

    setLoading(true)
    
    try {
      // Récupérer l'email de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser()
      const userEmail = user?.email || ''
      
      // Récupérer le nom depuis les réponses ou l'état local
      const savedFullName = (answers.fullName as string) || fullName.trim()
      
      // NE PAS utiliser de fallback - forcer l'utilisateur à entrer son nom
      if (!savedFullName) {
        console.error('[Onboarding] Aucun nom fourni')
        alert('Veuillez entrer votre nom pour continuer')
        setLoading(false)
        setCurrentStep(0) // Retourner à la première question
        return
      }
      
      console.log('[Onboarding] Finalisation pour utilisateur:', userId)
      console.log('[Onboarding] Sauvegarde du nom:', savedFullName)
      
      // Utiliser upsert pour éviter les erreurs de duplication
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: userEmail,
          full_name: savedFullName, // Utiliser le nom entré, sans fallback
          onboarding_answers: answers,
          onboarding_completed: true,
          subscription_status: 'free',
          subscription_plan: 'free',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('[Onboarding] Erreur lors de l\'upsert:', error)
        
        // Si l'upsert échoue complètement, essayer de créer via l'API
        try {
          const response = await fetch('/api/profile/ensure', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            // Réessayer l'update après création via API
            await supabase
              .from('profiles')
              .update({
                onboarding_answers: answers,
                onboarding_completed: true,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId)
          }
        } catch (apiError) {
          console.error('[Onboarding] Erreur API fallback:', apiError)
        }
      } else {
        console.log('[Onboarding] Profil mis à jour avec succès')
      }

      // Toujours rediriger vers le dashboard, même en cas d'erreur
      console.log('[Onboarding] Redirection vers le dashboard')
      router.push('/dashboard')
    } catch (error) {
      console.error('[Onboarding] Erreur inattendue:', error)
      // Rediriger quand même pour ne pas bloquer l'utilisateur
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (!currentQuestion) return null

  return (
    <Container>
      <Card>
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>

        <Header>
          <StepIndicator>
            <StepNumber>Étape {currentStep + 1}</StepNumber>
            <StepTotal>sur {questions.length}</StepTotal>
          </StepIndicator>
          <Title>Personnalisons votre expérience</Title>
          <Subtitle>
            Quelques questions pour mieux vous accompagner 🌿
          </Subtitle>
        </Header>

        <QuestionContainer key={currentStep}>
          <Question>
            <span style={{ marginRight: '0.5rem' }}>{currentQuestion.emoji}</span>
            {currentQuestion.question}
          </Question>

          {currentQuestion.type === 'text' ? (
            <>
              <TextInput
                type="text"
                placeholder={currentQuestion.placeholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              {currentQuestion.hint && (
                <InputHint>{currentQuestion.hint}</InputHint>
              )}
            </>
          ) : (
            <OptionsGrid>
              {currentQuestion.options?.map(option => (
                <OptionCard
                  key={option.value}
                  selected={answers[currentQuestion.id as keyof OnboardingAnswers] === option.value}
                  onClick={() => handleAnswer(option.value)}
                >
                  <OptionEmoji>{option.emoji}</OptionEmoji>
                  <OptionText>{option.label}</OptionText>
                </OptionCard>
              ))}
            </OptionsGrid>
          )}

          <ButtonContainer>
            {currentStep > 0 && (
              <Button variant="secondary" onClick={handlePrevious}>
                ← Précédent
              </Button>
            )}
            
            <Button 
              onClick={handleNext}
              disabled={
                currentQuestion.type === 'text' 
                  ? !fullName.trim() || loading
                  : !answers[currentQuestion.id as keyof OnboardingAnswers] || loading
              }
              style={{ marginLeft: currentStep === 0 ? 'auto' : '0' }}
            >
              {loading && <LoadingSpinner />}
              {currentStep === questions.length - 1 
                ? (loading ? 'Finalisation...' : 'Terminer →')
                : 'Suivant →'
              }
            </Button>
          </ButtonContainer>

          {/* Bouton "Passer" désactivé pour forcer l'entrée du nom */}
          {currentStep > 0 && (
            <SkipButton onClick={handleSkip}>
              Passer cette étape et accéder au tableau de bord
            </SkipButton>
          )}
        </QuestionContainer>
      </Card>
    </Container>
  )
}
