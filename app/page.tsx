'use client'
import styled from '@emotion/styled'
import Link from 'next/link'
import Image from 'next/image'

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

const LogoWrapper = styled.div`
  width: 180px; // Légèrement plus grand pour l'ombre
  height: 180px;
  margin-bottom: 3rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
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
  gap: 1rem; // Espacement réduit pour mobile
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
    gap: 2rem;
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
      <LogoWrapper>
        <Image src="/logo.png" alt="Aurora50 Logo" width={150} height={150} />
      </LogoWrapper>
      <Title>Aurora50</Title>
      <Subtitle>Votre renaissance après 50 ans commence ici</Subtitle>
      <ButtonGroup>
        <Button href="/programme">Découvrir le programme</Button>
        <Button href="/sigrid-larsen">Qui est Sigrid ?</Button>
      </ButtonGroup>
    </Container>
  )
}
