'use client'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

const Button = styled.a`
  display: inline-block;
  background: white;
  color: #8B5CF6;
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  animation: ${pulse} 2s infinite;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }
  
  @media (min-width: 768px) {
    padding: 1.5rem 3rem;
    font-size: 1.25rem;
  }
`

const PriceStrike = styled.span`
  text-decoration: line-through;
  opacity: 0.6;
  margin-right: 0.5rem;
`

export const CTAButton = () => {
  return (
    <Button href="https://buy.stripe.com/dRm7sMerOcjO47JdhYcs800">
      <PriceStrike>97€</PriceStrike> 47€/mois - Rejoindre Aurora50
    </Button>
  )
}
