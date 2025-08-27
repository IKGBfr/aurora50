'use client'
import styled from '@emotion/styled'
import Image from 'next/image'
import Link from 'next/link'
import { CTAButton } from '@/components/CTAButton'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #F9FAFB 0%, white 100%);
`

const Header = styled.header`
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  padding: 3rem 2rem;
  text-align: center;
  color: white;
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: white;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 2rem;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:before {
    content: '←';
    margin-right: 0.5rem;
  }
`

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 4rem;
  }
`

const Content = styled.main`
  max-width: 1000px;
  margin: 0 auto;
  padding: 4rem 2rem;
`

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    gap: 4rem;
    align-items: flex-start;
  }
`

const ProfileImage = styled.div`
  width: 280px; 
  height: 280px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #8B5CF6;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    width: 300px;
    height: 300px;
    margin-bottom: 0;
  }
`

const BioSection = styled.div`
  flex: 1;
`

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #111827;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const Paragraph = styled.p`
  font-size: 1.125rem;
  line-height: 1.8;
  color: #4B5563;
  margin-bottom: 1.5rem;
`

const Highlight = styled.div`
  background: #F3F4F6;
  border-left: 4px solid #8B5CF6;
  padding: 1.5rem;
  margin: 2rem 0;
  
  p {
    font-size: 1.125rem;
    line-height: 1.8;
    color: #374151;
    font-style: italic;
  }
`

const Timeline = styled.div`
  margin: 3rem 0;
`

const TimelineItem = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    gap: 2rem;
  }
`

const Year = styled.div`
  min-width: 80px;
  font-weight: 700;
  color: #8B5CF6;
  font-size: 1.125rem;
`

const Event = styled.div`
  flex: 1;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6B7280;
    line-height: 1.6;
  }
`

const ApproachSection = styled.section`
  margin: 4rem 0;
`

const ApproachGrid = styled.div`
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const ApproachCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  p {
    color: #6B7280;
    line-height: 1.6;
  }
`

const LanguageSection = styled.div`
  background: #F9FAFB;
  padding: 2rem;
  border-radius: 20px;
  margin: 3rem 0;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }
  
  p {
    color: #6B7280;
    line-height: 1.6;
  }
`

const CTASection = styled.section`
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  border-radius: 20px;
  color: white;
  margin-top: 4rem;
`

const CTATitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`

const CTAText = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.95;
`

export default function SigridLarsenPage() {
  return (
    <Container>
      <Header>
        <BackLink href="/">Retour à l'accueil</BackLink>
        <Title>Sigrid Larsen</Title>
      </Header>
      
      <Content>
        <ProfileSection>
          <ProfileImage>
            <Image 
              src="/images/Sigrid3.jpg" 
              alt="Sigrid Larsen"
              width={300}
              height={300}
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center 25%'
              }}
              priority
            />
          </ProfileImage>
          
          <BioSection>
            <SectionTitle>Psychologue Spécialiste & Guide de Renaissance</SectionTitle>
            <Paragraph>
              Avec près de 18 ans d'expérience en psychologie clinique, Sigrid Larsen 
              est une spécialiste reconnue en psychologie familiale et en thérapie émotionnelle. 
              Son parcours unique mêle expertise clinique approfondie et approches innovantes 
              intégrant art-thérapie, nature et traditions culturelles.
            </Paragraph>
            <Paragraph>
              Basée entre la France et la Norvège, Sigrid apporte une perspective internationale 
              enrichie par son travail dans des contextes multiculturels. Sa maîtrise de cinq 
              langues et son expérience transculturelle font d'elle une guide exceptionnelle 
              pour accompagner votre renaissance.
            </Paragraph>
          </BioSection>
        </ProfileSection>

        <Highlight>
          <p>
            "Mon approche combine 18 ans de pratique clinique avec une compréhension profonde 
            des transitions de vie. Je crois en la capacité de chacun à se réinventer, 
            particulièrement après 50 ans, quand l'expérience devient sagesse."
          </p>
        </Highlight>

        <Timeline>
          <SectionTitle>Son Parcours d'Excellence</SectionTitle>
          
          <TimelineItem>
            <Year>2006</Year>
            <Event>
              <h3>Cand.Psychol. - Université de Tromsø (UiT)</h3>
              <p>Diplômée avec mention excellente (A) - Recherche pionnière sur la thérapie familiale 
              en milieu naturel, soutenue par le Conseil de Recherche de Norvège</p>
            </Event>
          </TimelineItem>
          
          <TimelineItem>
            <Year>2013</Year>
            <Event>
              <h3>Spécialiste en Psychologie Familiale Clinique</h3>
              <p>Spécialisation approfondie dans les dynamiques familiales et les transitions 
              générationnelles</p>
            </Event>
          </TimelineItem>
          
          <TimelineItem>
            <Year>2016</Year>
            <Event>
              <h3>Formation en Art-thérapie expressive</h3>
              <p>75 crédits universitaires - Note A. Intégration des approches créatives 
              dans le processus thérapeutique</p>
            </Event>
          </TimelineItem>
          
          <TimelineItem>
            <Year>2023</Year>
            <Event>
              <h3>Spécialisation en Thérapie Émotionnelle</h3>
              <p>Formation avancée en thérapie centrée sur les émotions - Approche intégrative 
              pour la transformation personnelle</p>
            </Event>
          </TimelineItem>
          
          <TimelineItem>
            <Year>2024</Year>
            <Event>
              <h3>Création d'Aurora50</h3>
              <p>Lancement d'une approche révolutionnaire combinant psychologie clinique, 
              art-thérapie et sagesse culturelle pour la renaissance après 50 ans</p>
            </Event>
          </TimelineItem>
        </Timeline>

        <ApproachSection>
          <SectionTitle>Une Approche Unique et Innovante</SectionTitle>
          
          <ApproachGrid>
            <ApproachCard>
              <h3>🧠 Expertise Clinique</h3>
              <p>
                18 ans d'expérience en psychothérapie individuelle, familiale et de groupe. 
                Spécialiste certifiée avec une approche basée sur les preuves scientifiques 
                et l'innovation thérapeutique.
              </p>
            </ApproachCard>
            
            <ApproachCard>
              <h3>🎨 Art & Expression</h3>
              <p>
                Formation approfondie en art-thérapie permettant d'accéder aux ressources 
                créatives profondes. L'expression artistique comme voie de transformation 
                et de renaissance personnelle.
              </p>
            </ApproachCard>
            
            <ApproachCard>
              <h3>🌿 Nature & Traditions</h3>
              <p>
              Pionnière de la thérapie en milieu naturel. Intégration de la sagesse 
  traditionnelle et des approches modernes pour un accompagnement global 
  qui permet de se reconnecter à l'essentiel.
              </p>
            </ApproachCard>
            
            <ApproachCard>
              <h3>💎 Thérapie Émotionnelle</h3>
              <p>
              Spécialiste des thérapies émotionnelles avancées. Accompagnement 
  en profondeur des transitions de vie et transformation des blocages 
  émotionnels pour libérer votre plein potentiel.
              </p>
            </ApproachCard>
          </ApproachGrid>
        </ApproachSection>

        <LanguageSection>
          <h3>🌍 Une Perspective Internationale</h3>
          <p>
            <strong>Langues parlées :</strong> Norvégien (natif), Français (courant), 
            Anglais (courant), Espagnol (courant), Italien (notions), Samisk (en apprentissage)
          </p>
          <p style={{ marginTop: '1rem' }}>
            Cette richesse linguistique et culturelle permet à Sigrid d'accompagner 
            une communauté internationale et d'apporter des perspectives uniques issues 
            de différentes cultures sur le vieillissement et la renaissance personnelle.
          </p>
        </LanguageSection>

        <Highlight>
          <p>
            "Sigrid possède cette rare combinaison d'expertise clinique rigoureuse 
            et d'humanité profonde. Elle voit au-delà des symptômes pour révéler 
            le potentiel de transformation en chacun."
          </p>
        </Highlight>

        <CTASection>
          <CTATitle>Prête à transformer votre vie avec Sigrid ?</CTATitle>
          <CTAText>
            Bénéficiez de 18 ans d'expertise et d'une approche unique 
            pour votre renaissance après 50 ans
          </CTAText>
          <CTAButton />
        </CTASection>
      </Content>
    </Container>
  )
}