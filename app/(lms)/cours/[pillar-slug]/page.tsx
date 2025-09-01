'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import styled from '@emotion/styled'

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
`;

const HeroSection = styled.div<{ gradient: string }>`
  background: ${props => props.gradient};
  padding: 80px 24px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  margin-bottom: 24px;
  transition: color 0.2s;
  
  &:hover {
    color: white;
  }
`;

const HeroHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const Emoji = styled.div`
  font-size: 72px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Stats = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
`;

const Description = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 4px rgba(0,0,0,0.1);
`;

const ContentContainer = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: 48px 24px;
`;

const FreemiumBanner = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 24px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #86efac;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

const BannerContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #15803d;
  margin-bottom: 8px;
`;

const BannerText = styled.p`
  color: #166534;
  font-size: 16px;
`;

const UnlockButton = styled(Link)`
  background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 100px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(147, 51, 234, 0.4);
  }
`;

const LessonsSection = styled.div`
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
`;

const LessonsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LessonCard = styled(Link)<{ $isLocked: boolean }>`
  display: block;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: ${props => props.$isLocked ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$isLocked ? 0.7 : 1};
  
  &:hover {
    ${props => !props.$isLocked && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-color: #9333ea;
    `}
  }
`;

const LessonContent = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const LessonMain = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
`;

const LessonNumber = styled.div<{ $isLocked: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
  background: ${props => props.$isLocked 
    ? '#f3f4f6' 
    : 'linear-gradient(135deg, #ede9fe 0%, #fce7f3 100%)'};
  color: ${props => props.$isLocked ? '#9ca3af' : '#9333ea'};
`;

const LessonInfo = styled.div`
  flex: 1;
`;

const LessonTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
`;

const LessonDescription = styled.p`
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
`;

const LessonBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const FreeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
`;

const LessonIcon = styled.span`
  font-size: 24px;
`;

const ProgressSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
`;

const ProgressTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #f3f4f6;
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProgressFill = styled.div<{ percentage: number; gradient: string }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background: ${props => props.gradient};
  transition: width 0.5s ease;
`;

const ProgressText = styled.p`
  color: #6b7280;
  font-size: 14px;
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  text-align: center;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #9333ea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  margin-top: 16px;
  color: #6b7280;
`;

// Mapping des slugs simplifiés
const SLUG_MAPPING: { [key: string]: string } = {
  'liberation-emotionnelle': '🦋 Libération Émotionnelle',
  'reconquete-corps': '🌸 Reconquête du Corps',
  'renaissance-professionnelle': '💼 Renaissance Professionnelle',
  'relations-authentiques': '💖 Relations Authentiques',
  'creativite-debridee': '🎨 Créativité Débridée',
  'liberte-financiere': '💎 Liberté Financière',
  'mission-vie': '⭐ Mission de Vie'
}

// Gradients pour chaque pilier
const PILLAR_GRADIENTS: { [key: string]: string } = {
  'liberation-emotionnelle': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'reconquete-corps': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'renaissance-professionnelle': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'relations-authentiques': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'creativite-debridee': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'liberte-financiere': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'mission-vie': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
}

export default function PillarDetailPage({ 
  params 
}: { 
  params: Promise<{ 'pillar-slug': string }>
}) {
  const router = useRouter()
  const { 'pillar-slug': slug } = use(params)
  const [course, setCourse] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sortedLessons, setSortedLessons] = useState<any[]>([])
  
  useEffect(() => {
    // Vérifier si le slug existe
    if (!SLUG_MAPPING[slug]) {
      notFound()
    }
    
    const loadData = async () => {
      const supabase = createClient()
      
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      
      // Récupérer le cours avec ses leçons
      const { data: courseData, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons (
            id,
            title,
            content,
            release_day_offset,
            created_at
          )
        `)
        .ilike('title', `%${SLUG_MAPPING[slug].split(' ').slice(1).join(' ')}%`)
        .single()

      if (error || !courseData) {
        notFound()
      }
      
      setCourse(courseData)

      // Récupérer le profil de l'utilisateur pour vérifier le type d'abonnement
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_type')
          .eq('id', user.id)
          .single()
        
        setIsSubscribed(profile?.subscription_type === 'premium' || profile?.subscription_type === 'trial')
      }

      // Trier les leçons par ordre de création
      const sorted = courseData.lessons?.sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ) || []
      setSortedLessons(sorted)
      
      setLoading(false)
    }
    
    loadData()
  }, [slug])

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <Spinner />
          <LoadingText>Chargement...</LoadingText>
        </LoadingContent>
      </LoadingContainer>
    )
  }

  if (!course) {
    return null
  }

  const gradient = PILLAR_GRADIENTS[slug]
  const emoji = SLUG_MAPPING[slug].split(' ')[0]
  const title = SLUG_MAPPING[slug].substring(2)

  return (
    <PageContainer>
      <HeroSection gradient={gradient}>
        <HeroContent>
          <BackLink href="/cours">
            ← Retour aux piliers
          </BackLink>
          
          <HeroHeader>
            <Emoji>{emoji}</Emoji>
            <TitleSection>
              <Title>{title}</Title>
              <Stats>
                {course.duration_weeks || 4} semaines • {sortedLessons.length} leçons
              </Stats>
            </TitleSection>
          </HeroHeader>
          
          <Description>
            {course.description}
          </Description>
        </HeroContent>
      </HeroSection>

      <ContentContainer>

        <LessonsSection>
          <SectionTitle>Programme des leçons</SectionTitle>
          
          <LessonsList>
            {sortedLessons.map((lesson: any, index: number) => {
              const isLocked = !isSubscribed && index > 0
              const lessonNumber = index + 1
              
              return (
                <LessonCard
                  key={lesson.id}
                  href={isLocked ? '#' : `/cours/${slug}/${lessonNumber}`}
                  $isLocked={isLocked}
                  onClick={isLocked ? (e) => e.preventDefault() : undefined}
                >
                  <LessonContent>
                    <LessonMain>
                      <LessonNumber $isLocked={isLocked}>
                        {lessonNumber}
                      </LessonNumber>
                      
                      <LessonInfo>
                        <LessonTitle>{lesson.title}</LessonTitle>
                        <LessonDescription>
                          {lesson.content}
                        </LessonDescription>
                        
                        {index === 0 && !isSubscribed && (
                          <LessonBadges>
                            <FreeBadge>✨ Gratuit</FreeBadge>
                          </LessonBadges>
                        )}
                      </LessonInfo>
                    </LessonMain>
                    
                    <LessonIcon>
                      {isLocked ? '🔒' : '→'}
                    </LessonIcon>
                  </LessonContent>
                </LessonCard>
              )
            })}
          </LessonsList>
        </LessonsSection>

        <ProgressSection>
          <ProgressTitle>Votre progression</ProgressTitle>
          <ProgressBar>
            <ProgressFill percentage={0} gradient={gradient} />
          </ProgressBar>
          <ProgressText>
            Commencez votre première leçon pour débuter votre transformation
          </ProgressText>
        </ProgressSection>
      </ContentContainer>
    </PageContainer>
  )
}
