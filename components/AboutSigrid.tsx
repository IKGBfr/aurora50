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
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (min-width: 768px) {
    flex-direction: row;
    gap: 5rem;
    align-items: flex-start;
  }
`

const ImageWrapper = styled.div`
  width: 280px;
  height: 350px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
  flex-shrink: 0;

  @media (min-width: 768px) {
    flex: 0 0 40%;
    height: auto;
    aspect-ratio: 4 / 5;
    margin-bottom: 0;
  }
`

const Content = styled.div`
  text-align: center;
  
  @media (min-width: 768px) {
    text-align: left;
    flex: 1;
  }
`

const Title = styled.h2`
  font-size: 2.5rem;
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
    text-transform: uppercase;
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
            src="/images/Sigrid.jpg"
            alt="Portrait de Sigrid Larsen, psychologue spécialiste"
            width={400}
            height={500}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            priority
          />
        </ImageWrapper>
        <Content>
          <Title>Votre guide : Sigrid Larsen</Title>
          <Subtitle>Psychologue spécialiste - Hôpital de Hammerfest, Finnmark</Subtitle>
          <Bio>
            &quot;Après 50 ans, on ne cherche plus à être parfait. On cherche à être vrai.&quot;<br/><br/>
            Forte de près de 18 ans d'expérience en psychologie clinique et familiale, Sigrid combine 
            l'expertise d'une spécialiste certifiée avec une approche profondément humaine. 
            Son parcours unique - de la thérapie en milieu naturel arctique à l'art-thérapie, 
            en passant par la thérapie centrée sur les émotions - fait d'elle une guide exceptionnelle 
            pour votre renaissance. Elle parle votre langue, au propre comme au figuré, avec une 
            maîtrise de 5 langues et une compréhension transculturelle rare.
          </Bio>
          <Stats>
            <Stat>
              <h4>18</h4>
              <p>Ans d'expertise</p>
            </Stat>
            <Stat>
              <h4>3</h4>
              <p>Spécialisations</p>
            </Stat>
            <Stat>
              <h4>5</h4>
              <p>Langues parlées</p>
            </Stat>
          </Stats>
          <MoreLink href="/sigrid-larsen">
            Découvrir le parcours de Sigrid →
          </MoreLink>
        </Content>
      </Container>
    </Section>
  )
}