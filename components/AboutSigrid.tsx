'use client'
import styled from '@emotion/styled'
import Image from 'next/image'
import Link from 'next/link'

const Section = styled.section`
  padding: 4rem 2rem;
  background: #F9FAFB;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`

const Container = styled.div`
  max-width: 1100px; // Légèrement augmenté pour plus d'aisance
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (min-width: 768px) {
    flex-direction: row;
    gap: 5rem; // Espacement augmenté
    align-items: flex-start; // Aligne les éléments en haut
  }
`

const ImageWrapper = styled.div`
  width: 280px;
  height: 350px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
  flex-shrink: 0; // Empêche l'image de se réduire

  @media (min-width: 768px) {
    flex: 0 0 40%; // L'image prend 40% de la largeur du conteneur
    height: auto; // Hauteur automatique pour garder le ratio
    aspect-ratio: 4 / 5; // Maintient le ratio 4:5
    margin-bottom: 0;
  }
`

const Content = styled.div`
  text-align: center;
  
  @media (min-width: 768px) {
    text-align: left;
    flex: 1; // Le contenu prend le reste de l'espace
  }
`

const Title = styled.h2`
  font-size: 2.5rem; // Augmenté pour plus d'impact
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const Subtitle = styled.h3`
  font-size: 1.25rem;
  color: #6B7280;
  margin-bottom: 2rem;
  font-weight: 500;
`

const Bio = styled.p`
  font-size: 1.125rem;
  line-height: 1.8;
  color: #4B5563;
  margin-bottom: 2.5rem;
`

const Stats = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin: 2rem 0;
  
  @media (min-width: 768px) {
    justify-content: flex-start;
    gap: 3rem;
  }
`

const Stat = styled.div`
  text-align: center;
  
  h4 {
    font-size: 2.5rem;
    font-weight: 800;
    color: #8B5CF6;
  }
  
  p {
    font-size: 0.875rem;
    color: #6B7280;
    text-transform: uppercase; // Ajoute une touche pro
    letter-spacing: 0.5px;
  }
`

const MoreLink = styled(Link)`
  display: inline-block;
  color: #8B5CF6;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  
  &:hover {
    border-bottom-color: #8B5CF6;
  }
`

export const AboutSigrid = () => {
  return (
    <Section>
      <Container>
        <ImageWrapper>
          <Image 
            src="/images/Sigrid.jpg" // Assure-toi que le chemin est correct
            alt="Portrait de Sigrid Larsen, psychologue"
            width={400} // Augmenté pour une meilleure qualité
            height={500}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            priority
          />
        </ImageWrapper>
        <Content>
          <Title>Votre guide : Sigrid Larsen</Title>
          <Subtitle>Psychologue clinicienne à l’hôpital public du Finnmark</Subtitle>
          <Bio>
            &quot;Après 50 ans, on ne cherche plus à être parfait. On cherche à être vrai.&quot;<br/><br/>
            C’est cette conviction, forgée au cœur du cercle arctique et dans les couloirs de l’hôpital public, 
            qui anime Sigrid. Elle n’est pas là pour vous donner des leçons, mais pour vous offrir un cadre 
            sécurisant et des outils concrets pour que vous trouviez vos propres réponses. Son approche unique 
            mêle la rigueur de la psychologie moderne à la sagesse de la nature norvégienne.
          </Bio>
          <Stats>
            <Stat>
              <h4>25+</h4>
              <p>Ans d’expérience</p>
            </Stat>
            <Stat>
              <h4>1000+</h4>
              <p>Vies accompagnées</p>
            </Stat>
            <Stat>
              <h4>52</h4>
              <p>Ans, comme vous</p>
            </Stat>
          </Stats>
          <MoreLink href="/sigrid-larsen">
            Découvrir l’histoire de Sigrid →
          </MoreLink>
        </Content>
      </Container>
    </Section>
  )
}
