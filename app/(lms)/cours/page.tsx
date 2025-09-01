'use client'

import styled from '@emotion/styled'
import { useEffect, useState } from 'react'
import PillarCardPremium from '@/components/cours/PillarCardPremium'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100px 20px 80px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '🌿';
    position: absolute;
    font-size: 300px;
    opacity: 0.05;
    top: -50px;
    right: -50px;
    transform: rotate(-15deg);
  }
`;

const PageTitle = styled.h1`
  font-size: 56px;
  font-weight: 800;
  margin-bottom: 24px;
  text-shadow: 0 4px 20px rgba(0,0,0,0.15);
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const Subtitle = styled.p`
  font-size: 22px;
  opacity: 0.95;
  max-width: 700px;
  margin: 0 auto 40px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-top: 40px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    gap: 24px;
  }
`;

const Stat = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ContentSection = styled.section`
  max-width: 1400px;
  margin: -40px auto 0;
  padding: 50px 20px 80px;
  position: relative;
  z-index: 10;
`;

const PillarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FreemiumBanner = styled.div`
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  padding: 24px 32px;
  border-radius: 20px;
  margin-bottom: 48px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
`;

const BannerTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 12px;
`;

const BannerText = styled.p`
  font-size: 16px;
  opacity: 0.95;
  margin-bottom: 20px;
`;

const UpgradeButton = styled.button`
  background: white;
  color: #10B981;
  border: none;
  padding: 14px 32px;
  border-radius: 100px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 24px;
  color: #667eea;
`;

interface Course {
  id: string
  title: string
  description?: string
  short_description?: string
  pillar_number?: number
  slug?: string
  duration_weeks?: number
  emoji?: string
  color_gradient?: string
  order_index?: number
  is_published?: boolean
  lessons?: any[]
}

export default function CoursPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [userType, setUserType] = useState<'free' | 'premium'>('free')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser()
      
      // Récupérer les cours avec le nombre de leçons
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          lessons (
            id,
            title
          )
        `)
        .order('order_index', { ascending: true })

      if (coursesError) {
        console.error('Erreur lors de la récupération des cours:', coursesError)
      } else {
        setCourses(coursesData || [])
      }

      // Récupérer le profil de l'utilisateur pour vérifier le type d'abonnement
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_type')
          .eq('id', user.id)
          .single()
        
        if (profile?.subscription_type === 'premium' || profile?.subscription_type === 'trial') {
          setUserType('premium')
        }
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/inscription')
  }

  // Calculer les statistiques totales
  const totalLessons = courses.reduce((acc, course) => acc + (course.lessons?.length || 0), 0)
  const totalWeeks = courses.reduce((acc, course) => acc + (course.duration_weeks || 4), 0)

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <span>🌿 Chargement de votre parcours...</span>
        </LoadingContainer>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      
      <ContentSection>

        
        <PillarsGrid>
          {courses.map((course) => (
            <PillarCardPremium
              key={course.id}
              pillar={course}
              lessonCount={course.lessons?.length || 0}
              isSubscribed={userType === 'premium'}
            />
          ))}
        </PillarsGrid>

        {courses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <h2 style={{ marginBottom: '16px' }}>Aucun cours disponible pour le moment</h2>
            <p>Les 7 piliers de transformation arrivent bientôt !</p>
          </div>
        )}
      </ContentSection>
    </PageContainer>
  )
}
