'use client'
import styled from '@emotion/styled'

const Section = styled.section`
  padding: 4rem 2rem;
  background: #F9FAFB;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #111827;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`

const TestimonialCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`

const Quote = styled.p`
  font-size: 1.125rem;
  line-height: 1.8;
  color: #4B5563;
  font-style: italic;
  margin-bottom: 1rem;
`

const Author = styled.p`
  font-weight: 600;
  color: #8B5CF6;
`

const testimonials = [
  {
    quote: "À 52 ans, j&apos;ai enfin osé divorcer et reconstruire ma vie. Le soutien du groupe a été crucial.",
    author: "Marie"
  },
  {
    quote: "La retraite me faisait peur. Maintenant, c&apos;est mon nouveau départ !",
    author: "Jean-Pierre"
  },
  {
    quote: "Les sessions avec Sigrid m&apos;ont redonné confiance. J&apos;ai lancé mon entreprise à 58 ans.",
    author: "Françoise"
  }
]

export const Testimonials = () => {
  return (
    <Section>
      <Container>
        <Title>Ils ont transformé leur vie</Title>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index}>
            <Quote>&quot;{testimonial.quote}&quot;</Quote>
            <Author>- {testimonial.author}</Author>
          </TestimonialCard>
        ))}
      </Container>
    </Section>
  )
}
