'use client'
import styled from '@emotion/styled'
import Link from 'next/link'
// L'import de Image n'est plus nécessaire pour le logo
// import Image from 'next/image'

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  text-align: center;
`

const Logo = styled.div`
  width: 250px;
  height: 250px;
  margin-bottom: 3rem;
`

const Title = styled.h1`
  font-size: 3rem;
  color: white;
  font-weight: 800;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 5rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  max-width: 600px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 2rem;
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`

const Button = styled(Link)`
  background: white;
  color: #8B5CF6;
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`

export default function Home() {
  return (
    <Container>
      <Logo>
        {/* Intégration de la balise vidéo */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          width="250" 
          height="250"
          style={{ background: 'transparent', border: 'none' }}
        >
          <source src="/logo.webm" type="video/webm" />
          {/* Optionnel : Ajoutez un fallback pour les navigateurs non compatibles */}
          Votre navigateur ne supporte pas la vidéo.
        </video>
      </Logo>
      <Title>Aurora50</Title>
      <Subtitle>Votre renaissance après 50 ans commence ici</Subtitle>
      <ButtonGroup>
        <Button href="/programme">Découvrir le programme</Button>
        <Button href="/sigrid-larsen">Qui est Sigrid ?</Button>
      </ButtonGroup>
    </Container>
  )
}
