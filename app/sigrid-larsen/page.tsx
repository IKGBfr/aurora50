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
  /* MODIFICATION : Agrandissement du cercle sur mobile */
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
        <BackLink href="/">Retour à l’accueil</BackLink>
        <Title>Sigrid Larsen</Title>
      </Header>
      
      <Content>
        <ProfileSection>
          <ProfileImage>
            {/* MODIFICATION : Ajout de objectPosition et priority */}
            <Image 
              src="/images/Sigrid3.jpg" 
              alt="Sigrid Larsen"
              width={300}
              height={300}
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center 25%' // N'hésitez pas à ajuster cette valeur
              }}
              priority // <-- Ajout pour la performance
            />
          </ProfileImage>
          
          <BioSection>
            <SectionTitle>Psychologue & Guide de Renaissance</SectionTitle>
            <Paragraph>
              Sigrid Larsen est bien plus qu’une psychologue. C’est une femme qui comprend 
              intimement les défis de la cinquantaine parce qu’elle les vit elle-même. 
              À 52 ans, elle incarne la renaissance qu’elle enseigne.
            </Paragraph>
            <Paragraph>
              Née en Norvège, formée en France et en Scandinavie, Sigrid apporte une perspective 
              unique mêlant la chaleur méditerranéenne à la sagesse nordique. Son approche 
              combine rigueur scientifique et bienveillance humaine.
            </Paragraph>
          </BioSection>
        </ProfileSection>

        <Highlight>
          <p>
            &quot;La cinquantaine n’est pas la fin d’un chapitre, c’est le début du plus beau 
            livre de votre vie. Un livre où vous êtes enfin l’auteur principal.&quot;
          </p>
        </Highlight>

        <Timeline>
          <SectionTitle>Son Parcours</SectionTitle>
          
          <TimelineItem>
            <Year>1998</Year>
            <Event>
              <h3>Master en Psychologie Clinique</h3>
              <p>Université d’Oslo - Spécialisation en psychologie du développement adulte</p>
            </Event>
          </TimelineItem>
          
          <TimelineItem>
            <Year>2003</Year>
            <Event>
              <h3>Doctorat en Psychologie</h3>
              <p>Université Paris Descartes - Thèse sur les transitions de vie après 50 ans</p>
            </Event>
          </TimelineItem>
          
          <TimelineItem>
            <Year>2010</Year>
            <Event>
              <h3>Formation en Thérapie ACT</h3>
              <p>Thérapie d&#39;Acceptation et d&#39;Engagement - Institut de Psychologie Contextuelle</p>
            </Event>
          </TimelineItem>
          
          <TimelineItem>
            <Year>2015</Year>
            <Event>
              <h3>Création de la méthode Aurora</h3>
              <p>Développement d’une approche unique combinant psychologie positive et sagesse nordique</p>
            </Event>
          </TimelineItem>
          
          <TimelineItem>
            <Year>2024</Year>
            <Event>
              <h3>Lancement d’Aurora50</h3>
              <p>Création de la communauté premium pour accompagner la renaissance après 50 ans</p>
            </Event>
          </TimelineItem>
        </Timeline>

        <ApproachSection>
          <SectionTitle>Son Approche Unique</SectionTitle>
          
          <ApproachGrid>
            <ApproachCard>
              <h3>🧠 Science & Empathie</h3>
              <p>
                25 ans d’expérience clinique combinée à une compréhension profonde 
                des défis personnels de la cinquantaine.
              </p>
            </ApproachCard>
            
            <ApproachCard>
              <h3>❄️ Sagesse Nordique</h3>
              <p>
                Les principes de résilience scandinave : hygge, lagom et sisu pour 
                traverser les tempêtes de la vie avec sérénité.
              </p>
            </ApproachCard>
            
            <ApproachCard>
              <h3>🌟 Méthode Aurora</h3>
              <p>
                Un programme en 3 phases : Acceptation de ce qui est, Renaissance 
                de qui vous êtes, Expansion vers qui vous devenez.
              </p>
            </ApproachCard>
            
            <ApproachCard>
              <h3>👥 Communauté</h3>
              <p>
                La force du collectif pour briser l’isolement et créer des liens 
                authentiques entre personnes qui se comprennent vraiment.
              </p>
            </ApproachCard>
          </ApproachGrid>
        </ApproachSection>

        <Highlight>
          <p>
            &quot;Avec Sigrid, j’ai compris que vieillir n’était pas subir le temps qui passe, 
            mais sculpter activement la personne que je deviens.&quot; - Marie, 54 ans
          </p>
        </Highlight>

        <CTASection>
          <CTATitle>Prête à rencontrer Sigrid ?</CTATitle>
          <CTAText>
            Rejoignez Aurora50 et participez aux sessions hebdomadaires en direct
          </CTAText>
          <CTAButton />
        </CTASection>
      </Content>
    </Container>
  )
}