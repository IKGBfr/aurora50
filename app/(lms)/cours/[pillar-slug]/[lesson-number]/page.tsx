'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import LessonPlayer from '@/components/cours/LessonPlayer'
import { useLessonProgress } from '@/lib/hooks/useLessonProgress'
import styled from '@emotion/styled'

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
`;

const Header = styled.div`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 0;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
  
  a {
    color: #667eea;
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
      color: #764ba2;
    }
  }
`;

const LessonHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LessonTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const NavButton = styled.button<{ disabled?: boolean }>`
  padding: 10px 20px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &.secondary {
    background: white;
    border: 2px solid #e5e7eb;
    color: #6b7280;
    
    &:hover:not(:disabled) {
      border-color: #667eea;
      color: #667eea;
    }
  }
  
  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
  }
`;

const ContentSection = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
`;

const LessonContent = styled.div`
  margin-top: 32px;
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ContentTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
`;

const ContentText = styled.p`
  color: #6b7280;
  line-height: 1.8;
  font-size: 16px;
`;

const CompletionSection = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
  border-radius: 16px;
  text-align: center;
`;

const CompletionButton = styled.button<{ completed?: boolean }>`
  padding: 14px 32px;
  background: ${props => props.completed 
    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background: #D1FAE5;
  color: #065F46;
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease;
  
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
`;

// Mapping des slugs
const SLUG_MAPPING: { [key: string]: string } = {
  'liberation-emotionnelle': '🦋 Libération Émotionnelle',
  'reconquete-corps': '🌸 Reconquête du Corps',
  'renaissance-professionnelle': '💼 Renaissance Professionnelle',
  'relations-authentiques': '💖 Relations Authentiques',
  'creativite-debridee': '🎨 Créativité Débridée',
  'liberte-financiere': '💎 Liberté Financière',
  'mission-vie': '⭐ Mission de Vie'
}

interface LessonPageProps {
  params: Promise<{ 
    'pillar-slug': string
    'lesson-number': string 
  }>
}

export default function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params)
  const { 'pillar-slug': pillarSlug, 'lesson-number': lessonNumber } = resolvedParams
  
  const [lesson, setLesson] = useState<{
    id: string
    title: string
    content: string
    created_at: string
  } | null>(null)
  const [course, setCourse] = useState<{
    id: string
    title: string
    lessons?: Array<{
      id: string
      title: string
      content: string
      created_at: string
    }>
  } | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  // Utiliser le hook de progression
  const { completeLesson, isCompleted, progress } = useLessonProgress(lesson?.id)

  useEffect(() => {
    fetchLessonData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillarSlug, lessonNumber])

  const fetchLessonData = async () => {
    const lessonIndex = parseInt(lessonNumber) - 1

    try {
      // Récupérer l'utilisateur
      const { data: { user } } = await supabase.auth.getUser()
      
      // Vérifier l'abonnement
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_type')
          .eq('id', user.id)
          .single()
        
        setIsSubscribed(profile?.subscription_type === 'premium' || profile?.subscription_type === 'trial')
      }

      // Récupérer le cours et ses leçons
      const pillarTitle = SLUG_MAPPING[pillarSlug]
      if (!pillarTitle) {
        router.push('/cours')
        return
      }

      const { data: courseData, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons (
            id,
            title,
            content,
            created_at
          )
        `)
        .ilike('title', `%${pillarTitle.split(' ').slice(1).join(' ')}%`)
        .single()

      if (error || !courseData) {
        router.push('/cours')
        return
      }

      // Trier les leçons
      const sortedLessons = courseData.lessons?.sort((a: { created_at: string }, b: { created_at: string }) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ) || []

      if (lessonIndex >= sortedLessons.length) {
        router.push(`/cours/${pillarSlug}`)
        return
      }

      setCourse(courseData)
      setLesson(sortedLessons[lessonIndex])
    } catch (error) {
      console.error('Error fetching lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousLesson = () => {
    const currentNumber = parseInt(lessonNumber)
    if (currentNumber > 1) {
      router.push(`/cours/${pillarSlug}/${currentNumber - 1}`)
    }
  }

  const handleNextLesson = () => {
    if (!course) return
    const currentNumber = parseInt(lessonNumber)
    const totalLessons = course.lessons?.length || 0
    
    if (currentNumber < totalLessons) {
      // Vérifier si la prochaine leçon est verrouillée
      if (!isSubscribed && currentNumber >= 1) {
        router.push('/inscription')
      } else {
        router.push(`/cours/${pillarSlug}/${currentNumber + 1}`)
      }
    }
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    
    try {
      // Sauvegarder la progression dans la base de données
      await completeLesson()
      
      setShowSuccess(true)
      
      // Redirection après 2 secondes vers la page du pilier
      setTimeout(() => {
        router.push(`/cours/${pillarSlug}`)
      }, 2000)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsCompleting(false)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <span style={{ fontSize: '24px', color: '#667eea' }}>Chargement...</span>
        </div>
      </PageContainer>
    )
  }

  if (!lesson || !course) {
    return null
  }

  const lessonNumberInt = parseInt(lessonNumber)
  const isLocked = !isSubscribed && lessonNumberInt > 1
  const pillarTitle = SLUG_MAPPING[pillarSlug] || ''
  const totalLessons = course.lessons?.length || 0

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <Breadcrumb>
            <Link href="/cours">Cours</Link>
            <span>→</span>
            <Link href={`/cours/${pillarSlug}`}>
              {pillarTitle}
            </Link>
            <span>→</span>
            <span>Leçon {lessonNumberInt}</span>
          </Breadcrumb>
          
          <LessonHeader>
            <LessonTitle>{lesson.title}</LessonTitle>
            
            <NavigationButtons>
              <NavButton 
                className="secondary"
                onClick={handlePreviousLesson}
                disabled={lessonNumberInt === 1}
              >
                ← Précédent
              </NavButton>
              <NavButton 
                className="primary"
                onClick={handleNextLesson}
                disabled={lessonNumberInt === totalLessons}
              >
                Suivant →
              </NavButton>
            </NavigationButtons>
          </LessonHeader>
        </HeaderContent>
      </Header>

      {/* Vidéo en pleine largeur */}
      <LessonPlayer
        videoId="VGqksvn6x0E" // ID par défaut, à remplacer par l'ID réel de la vidéo
        title={lesson.title}
        description={lesson.content}
        isLocked={isLocked}
        onComplete={handleComplete}
      />

      {/* Contenu de la leçon centré */}
      <ContentSection>
        {!isLocked && (
          <LessonContent>
            <ContentTitle>À propos de cette leçon</ContentTitle>
            <ContentText>{lesson.content}</ContentText>
            
            <CompletionSection>
              <ContentTitle>Prêt(e) pour la suite ?</ContentTitle>
              <ContentText style={{ marginBottom: '20px' }}>
                {isCompleted 
                  ? 'Cette leçon est déjà complétée. Vous pouvez passer à la suivante !'
                  : 'Marquez cette leçon comme complétée pour continuer votre parcours'}
              </ContentText>
              <CompletionButton 
                onClick={handleComplete}
                disabled={isCompleting || isCompleted}
                completed={isCompleted}
              >
                {isCompleting ? (
                  <>⏳ Enregistrement...</>
                ) : isCompleted ? (
                  <>✅ Leçon complétée!</>
                ) : (
                  <>✅ Marquer comme complétée</>
                )}
              </CompletionButton>
              
              {showSuccess && (
                <SuccessMessage>
                  <span style={{ fontSize: '24px' }}>🎉</span>
                  <div>
                    <strong>Bravo !</strong> Vous avez gagné 10 points Aurora.
                    <br />Retour à la liste des leçons...
                  </div>
                </SuccessMessage>
              )}
            </CompletionSection>
          </LessonContent>
        )}
      </ContentSection>
    </PageContainer>
  )
}
