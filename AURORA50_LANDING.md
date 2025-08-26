# AURORA50 LANDING PAGE - INSTRUCTIONS POUR CASCADE

## 🎯 OBJECTIF
Créer une landing page ultra-moderne pour Aurora50, communauté premium de transformation après 50 ans. Mobile-first, épurée, avec un seul CTA vers Stripe.

## 🛠 STACK TECHNIQUE
- Next.js 15 avec App Router
- TypeScript strict
- Emotion pour le styling
- Vercel pour l'hébergement
- Pas de navbar, pas de footer
- Mobile-first responsive design

## 📁 STRUCTURE DU PROJET

```
aurora50/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── fonts/
├── components/
│   ├── Hero.tsx
│   ├── Benefits.tsx
│   ├── Testimonials.tsx
│   ├── Pricing.tsx
│   ├── FAQ.tsx
│   └── CTAButton.tsx
├── styles/
│   └── theme.ts
├── public/
│   └── logo.svg
├── lib/
│   └── emotion.tsx
└── package.json
```

## 🎨 DESIGN SYSTEM

### Couleurs
```typescript
const colors = {
  primary: '#10B981',     // Vert aurore
  secondary: '#8B5CF6',   // Violet aurore  
  accent: '#EC4899',      // Rose aurore
  dark: '#111827',        // Texte principal
  light: '#F9FAFB',       // Background
  white: '#FFFFFF',
  gradient: 'linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%)'
}
```

### Typography
```typescript
const typography = {
  fontFamily: "'Inter', -apple-system, sans-serif",
  h1: {
    mobile: '2.5rem',
    desktop: '4rem',
    weight: 800
  },
  h2: {
    mobile: '2rem', 
    desktop: '3rem',
    weight: 700
  },
  body: {
    mobile: '1rem',
    desktop: '1.125rem',
    weight: 400
  }
}
```

### Spacing
```typescript
const spacing = {
  xs: '0.5rem',
  sm: '1rem',
  md: '2rem',
  lg: '3rem',
  xl: '4rem',
  xxl: '6rem'
}
```

## 💻 IMPLÉMENTATION DÉTAILLÉE

### 1. Setup initial
```bash
npx create-next-app@latest aurora50 --typescript --app --no-tailwind
cd aurora50
npm install @emotion/react @emotion/styled
npm install --save-dev @emotion/babel-plugin
```

### 2. Configuration Emotion avec Next.js 15

#### lib/emotion.tsx
```typescript
'use client'

import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { useServerInsertedHTML } from 'next/navigation'
import { useState } from 'react'

export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const cache = createCache({ key: 'css' })
    cache.compat = true
    return cache
  })

  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(cache.inserted).join(' '),
        }}
      />
    )
  })

  return <CacheProvider value={cache}>{children}</CacheProvider>
}
```

### 3. Layout principal

#### app/layout.tsx
```typescript
import { Inter } from 'next/font/google'
import { EmotionRegistry } from '@/lib/emotion'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Aurora50 - Votre Renaissance Après 50 Ans',
  description: 'Rejoignez la communauté premium de transformation personnelle après 50 ans. Sessions hebdomadaires avec Sigrid, psychologue spécialisée.',
  keywords: 'transformation 50 ans, développement personnel, psychologie, communauté',
  openGraph: {
    title: 'Aurora50 - Votre Renaissance Après 50 Ans',
    description: 'Communauté premium de transformation après 50 ans',
    images: ['/logo.svg'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <EmotionRegistry>{children}</EmotionRegistry>
      </body>
    </html>
  )
}
```

### 4. Composants principaux

#### components/Hero.tsx
```typescript
'use client'
import styled from '@emotion/styled'
import { CTAButton } from './CTAButton'

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  color: white;
  text-align: center;
  
  @media (min-width: 768px) {
    padding: 4rem;
  }
`

const Logo = styled.img`
  width: 100px;
  height: 100px;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    width: 150px;
    height: 150px;
  }
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 4rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  max-width: 600px;
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`

const Badge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  margin-bottom: 2rem;
  font-weight: 600;
`

export const Hero = () => {
  return (
    <HeroSection>
      <Logo src="/logo.svg" alt="Aurora50" />
      <Badge>🎉 Offre Fondateurs - 30 places seulement</Badge>
      <Title>Votre Renaissance Commence Ici</Title>
      <Subtitle>
        Rejoignez 19 600 personnes qui transforment leur vie après 50 ans 
        avec l'aide de Sigrid, psychologue spécialisée
      </Subtitle>
      <CTAButton />
    </HeroSection>
  )
}
```

#### components/CTAButton.tsx
```typescript
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
```

#### components/Benefits.tsx
```typescript
'use client'
import styled from '@emotion/styled'

const Section = styled.section`
  padding: 4rem 2rem;
  background: white;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`

const Grid = styled.div`
  display: grid;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const Card = styled.div`
  padding: 2rem;
  border-radius: 20px;
  background: #F9FAFB;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`

const Icon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
`

const CardText = styled.p`
  color: #6B7280;
  line-height: 1.6;
`

const benefits = [
  {
    icon: '🔴',
    title: 'Lives hebdomadaires avec Sigrid',
    text: 'Chaque dimanche à 10h, session de transformation en direct avec notre psychologue'
  },
  {
    icon: '💬',
    title: 'Communauté bienveillante',
    text: 'Échangez quotidiennement avec des personnes qui vivent les mêmes défis'
  },
  {
    icon: '📚',
    title: 'Ressources exclusives',
    text: 'Exercices, guides PDF, méditations. Nouveaux contenus chaque semaine'
  },
  {
    icon: '❤️',
    title: 'Soutien personnalisé',
    text: 'Sigrid répond personnellement à vos questions chaque mercredi'
  }
]

export const Benefits = () => {
  return (
    <Section>
      <Container>
        <Title>Ce que vous obtenez avec Aurora50</Title>
        <Grid>
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <Icon>{benefit.icon}</Icon>
              <CardTitle>{benefit.title}</CardTitle>
              <CardText>{benefit.text}</CardText>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
```

#### components/Testimonials.tsx
```typescript
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
    quote: "À 52 ans, j'ai enfin osé divorcer et reconstruire ma vie. Le soutien du groupe a été crucial.",
    author: "Marie"
  },
  {
    quote: "La retraite me faisait peur. Maintenant, c'est mon nouveau départ !",
    author: "Jean-Pierre"
  },
  {
    quote: "Les sessions avec Sigrid m'ont redonné confiance. J'ai lancé mon entreprise à 58 ans.",
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
            <Quote>"{testimonial.quote}"</Quote>
            <Author>- {testimonial.author}</Author>
          </TestimonialCard>
        ))}
      </Container>
    </Section>
  )
}
```

#### components/Pricing.tsx
```typescript
'use client'
import styled from '@emotion/styled'
import { CTAButton } from './CTAButton'

const Section = styled.section`
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  color: white;
  text-align: center;
  
  @media (min-width: 768px) {
    padding: 6rem 2rem;
  }
`

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`

const PriceBox = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem 2rem;
  margin-bottom: 2rem;
`

const OldPrice = styled.p`
  font-size: 1.5rem;
  text-decoration: line-through;
  opacity: 0.7;
  margin-bottom: 0.5rem;
`

const NewPrice = styled.p`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    font-size: 4rem;
  }
`

const Badge = styled.div`
  display: inline-block;
  background: #10B981;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 600;
  margin-bottom: 2rem;
`

const Features = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0;
  text-align: left;
`

const Feature = styled.li`
  padding: 0.5rem 0;
  display: flex;
  align-items: center;
  
  &:before {
    content: '✅';
    margin-right: 1rem;
  }
`

const Urgency = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 2rem;
  color: #FEF3C7;
`

export const Pricing = () => {
  return (
    <Section>
      <Container>
        <Badge>OFFRE LIMITÉE</Badge>
        <Title>Devenez Membre Fondateur</Title>
        <PriceBox>
          <OldPrice>97€/mois</OldPrice>
          <NewPrice>47€/mois</NewPrice>
          <p>À VIE pour les 30 premiers</p>
          <Features>
            <Feature>Lives hebdomadaires avec Sigrid</Feature>
            <Feature>Communauté privée Telegram</Feature>
            <Feature>Ressources exclusives</Feature>
            <Feature>Réponses personnalisées</Feature>
            <Feature>Sans engagement - Annulez quand vous voulez</Feature>
          </Features>
        </PriceBox>
        <CTAButton />
        <Urgency>⏰ Plus que 30 places disponibles</Urgency>
      </Container>
    </Section>
  )
}
```

#### components/FAQ.tsx
```typescript
'use client'
import styled from '@emotion/styled'
import { useState } from 'react'

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
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #111827;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
`

const Question = styled.div<{ isOpen: boolean }>`
  border-bottom: 1px solid #E5E7EB;
  padding: 1.5rem 0;
  cursor: pointer;
  
  h3 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    
    &:after {
      content: '${props => props.isOpen ? '−' : '+'}';
      font-size: 1.5rem;
      color: #8B5CF6;
    }
  }
`

const Answer = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  
  p {
    padding: 1rem 0;
    color: #6B7280;
    line-height: 1.6;
  }
`

const faqs = [
  {
    question: "C'est quoi Telegram ?",
    answer: "Telegram est une application de messagerie gratuite, similaire à WhatsApp. Nous vous guidons pas à pas pour l'installation et l'utilisation. C'est très simple !"
  },
  {
    question: "Je peux annuler à tout moment ?",
    answer: "Oui, absolument ! Vous pouvez annuler votre abonnement à tout moment, sans frais cachés ni engagement. Il vous suffit de nous envoyer un message."
  },
  {
    question: "Les lives sont enregistrés ?",
    answer: "Oui ! Tous les lives du dimanche sont enregistrés. Si vous ne pouvez pas être présent en direct, vous aurez accès aux replays dans les 24h."
  },
  {
    question: "Qui est Sigrid ?",
    answer: "Sigrid Larsen est psychologue norvégienne spécialisée dans les transitions de vie après 50 ans. Elle anime les sessions hebdomadaires avec bienveillance et expertise."
  }
]

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  
  return (
    <Section>
      <Container>
        <Title>Questions fréquentes</Title>
        {faqs.map((faq, index) => (
          <Question 
            key={index} 
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <h3>{faq.question}</h3>
            <Answer isOpen={openIndex === index}>
              <p>{faq.answer}</p>
            </Answer>
          </Question>
        ))}
      </Container>
    </Section>
  )
}
```

### 5. Page principale

#### app/page.tsx
```typescript
import { Hero } from '@/components/Hero'
import { Benefits } from '@/components/Benefits'
import { Testimonials } from '@/components/Testimonials'
import { Pricing } from '@/components/Pricing'
import { FAQ } from '@/components/FAQ'

export default function Home() {
  return (
    <>
      <Hero />
      <Benefits />
      <Testimonials />
      <Pricing />
      <FAQ />
    </>
  )
}
```

### 6. Styles globaux

#### app/globals.css
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}
```

## 📱 RESPONSIVE BREAKPOINTS
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

## 🚀 DÉPLOIEMENT VERCEL

1. Push sur GitHub
2. Connecter le repo à Vercel
3. Deploy automatique
4. Domaine custom si disponible

## ⚡ OPTIMISATIONS CRITIQUES

- Images optimisées avec next/image
- Lazy loading des sections
- Font-display: swap pour les fonts
- Préconnect aux domaines externes
- Meta tags SEO complets
- Schema.org pour le SEO local
- Compression gzip
- Cache headers optimaux

## 🎯 OBJECTIFS DE PERFORMANCE

- Lighthouse Score > 95
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Cumulative Layout Shift < 0.1

## LIEN STRIPE UNIQUE
https://buy.stripe.com/dRm7sMerOcjO47JdhYcs800

Ne pas oublier de placer logo.svg dans le dossier public/

## Instructions pour Cascade:
1. Lire ce fichier en entier
2. Créer le projet Next.js 15 avec les spécifications
3. Implémenter tous les composants avec Emotion
4. Tester le responsive sur mobile/tablet/desktop
5. Déployer sur Vercel
6. Un seul CTA vers le lien Stripe fourni