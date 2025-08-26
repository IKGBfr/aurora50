'use client'
import styled from '@emotion/styled'
import { useState } from 'react'
import { keyframes } from '@emotion/react'

// --- Animations ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

// --- Composants Stylisés ---
const Section = styled.section`
  padding: 4rem 2rem;
  background: white;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 4rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`

const FAQItem = styled.div`
  background: #F9FAFB;
  border-radius: 16px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.07);
  }
`

const Question = styled.div<{ isOpen: boolean }>`
  padding: 1.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
    padding-right: 1rem;
  }
  
  span {
    font-size: 1.5rem;
    color: #8B5CF6;
    transition: transform 0.3s ease;
    transform: ${props => props.isOpen ? 'rotate(45deg)' : 'rotate(0)'};
  }
`

const Answer = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.4s ease-in-out, padding 0.4s ease-in-out;
  padding: ${props => props.isOpen ? '0 1.5rem 1.5rem' : '0 1.5rem'};
  
  p {
    margin: 0;
    color: #6B7280;
    line-height: 1.7;
    animation: ${props => props.isOpen ? `${fadeIn} 0.5s ease forwards` : 'none'};
  }
`

const StillQuestionsCard = styled.div`
  margin-top: 4rem;
  padding: 2rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 100%);
  border-radius: 16px;
  text-align: center;
  color: white;

  h4 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
  }

  p {
    margin: 0 0 1.5rem 0;
    opacity: 0.9;
  }

  a {
    color: #8B5CF6;
    background: white;
    padding: 0.75rem 1rem; // Padding mobile réduit
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: transform 0.2s ease;
    display: inline-block;
    max-width: 100%;

    @media (min-width: 768px) {
      padding: 0.75rem 1.5rem; // Padding desktop
    }

    &:hover {
      transform: scale(1.05);
    }
  }
`

const faqs = [
  {
    question: "Est-ce que c'est de la psychothérapie ?",
    answer: "Non. Aurora50 est un programme d'accompagnement de groupe et de soutien. Il ne remplace pas une psychothérapie individuelle, mais constitue un formidable accélérateur de transformation pour les périodes de transition de vie, dans un cadre éthique et sécurisé."
  },
  {
    question: "Je peux annuler à tout moment ?",
    answer: "Oui, absolument ! L'abonnement est sans engagement. Vous pouvez l'annuler en un clic depuis votre espace personnel, à tout moment, sans aucune justification. La liberté est une de nos valeurs clés."
  },
  {
    question: "Et si je me sens trop 'cassé(e)' pour commencer ?",
    answer: "Ce programme est justement conçu pour vous. Vous n'avez pas besoin d'être 'parfait(e)'. Le but du cocon est de vous accueillir là où vous en êtes, avec vos doutes et vos fragilités, pour avancer ensemble, à votre rythme et sans aucun jugement."
  },
  {
    question: "Je n'ai pas beaucoup de temps, est-ce que c'est pour moi ?",
    answer: "Oui. Le programme est conçu pour s'intégrer dans une vie active. Le live du dimanche est enregistré, et les exercices hebdomadaires sont pensés pour prendre quelques minutes de réflexion. L'important n'est pas le temps que vous y passez, mais la qualité de votre présence."
  },
  {
    question: "Comment garantissez-vous la bienveillance dans le groupe ?",
    answer: "C'est notre priorité absolue. Chaque membre adhère à une charte de bienveillance à l'inscription. En tant qu'administrateurs, nous sommes très présents et toute personne ne respectant pas le cadre sécurisant de l'échange est immédiatement exclue. La sécurité du cocon n'est pas négociable."
  },
]

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0) // Ouvre la première question par défaut
  
  return (
    <Section>
      <Container>
        <Title>Vos dernières questions, nos réponses claires</Title>
        {faqs.map((faq, index) => (
          <FAQItem key={index}>
            <Question 
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <h3>{faq.question}</h3>
              <span>+</span>
            </Question>
            <Answer isOpen={openIndex === index}>
              <p>{faq.answer}</p>
            </Answer>
          </FAQItem>
        ))}
        <StillQuestionsCard>
          <h4>Vous avez encore un doute ?</h4>
          <p>C'est tout à fait normal. L'important est de prendre une décision éclairée.</p>
          <a href="mailto:contact@aurora50.com">Posez-nous votre question par email</a>
        </StillQuestionsCard>
      </Container>
    </Section>
  )
}
