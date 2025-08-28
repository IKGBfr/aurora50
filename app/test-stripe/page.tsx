'use client'

import styled from '@emotion/styled'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const Title = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
`

const StatusSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f0fdf4;
  border-radius: 12px;
  border: 1px solid #86efac;
  
  h3 {
    color: #065f46;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  ul {
    color: #047857;
    font-size: 0.95rem;
    list-style: none;
    padding: 0;
    
    li {
      padding: 0.5rem 0;
      border-bottom: 1px solid #d1fae5;
      
      &:last-child {
        border-bottom: none;
      }
      
      strong {
        color: #065f46;
      }
    }
  }
`

const PaymentLink = styled.a`
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  margin: 2rem 0;
  text-align: center;
  width: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }
`

const InfoBox = styled.div`
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 2rem;
  
  h4 {
    color: #92400e;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
  
  p {
    color: #78350f;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  
  code {
    background: #fef3c7;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.85rem;
  }
`

const ChecklistSection = styled.div`
  margin-top: 2rem;
  
  h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  .checklist {
    background: #f9fafb;
    border-radius: 12px;
    padding: 1rem;
    
    .item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .icon {
        margin-right: 0.75rem;
        margin-top: 0.1rem;
      }
      
      .content {
        flex: 1;
        
        .title {
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        
        .description {
          font-size: 0.875rem;
          color: #6b7280;
        }
      }
    }
  }
`

export default function TestStripePage() {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkUserCount()
  }, [])

  const checkUserCount = async () => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      setUserCount(count)
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre d\'utilisateurs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // URL du Payment Link TEST - À remplacer par votre vrai lien
  const paymentLinkUrl = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_TEST_URL || 
    `https://buy.stripe.com/test/${process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_ID || 'YOUR_TEST_LINK'}`

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/stripe`
    : 'https://votre-domaine.vercel.app/api/webhooks/stripe'

  return (
    <Container>
      <Card>
        <Title>🌿 Test Inscription Aurora50 via Stripe</Title>
        
        <StatusSection>
          <h3>📊 Statut Actuel</h3>
          <ul>
            <li>
              <strong>Utilisateurs dans la DB :</strong> {
                isLoading ? 'Chargement...' : (userCount !== null ? userCount : 'Erreur')
              }
            </li>
            <li>
              <strong>Environnement :</strong> {process.env.NODE_ENV}
            </li>
            <li>
              <strong>URL Webhook :</strong> <code>{webhookUrl}</code>
            </li>
            <li>
              <strong>Supabase URL :</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configuré' : '❌ Manquant'}
            </li>
            <li>
              <strong>Service Role Key :</strong> {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configuré' : '❌ Manquant'}
            </li>
          </ul>
        </StatusSection>

        <PaymentLink 
          href={paymentLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          💳 Tester le paiement Stripe (Mode TEST)
        </PaymentLink>

        <ChecklistSection>
          <h3>✅ Checklist de Test</h3>
          <div className="checklist">
            <div className="item">
              <span className="icon">1️⃣</span>
              <div className="content">
                <div className="title">Configurer le webhook dans Stripe</div>
                <div className="description">
                  Dashboard Stripe → Developers → Webhooks → Add endpoint
                </div>
              </div>
            </div>
            <div className="item">
              <span className="icon">2️⃣</span>
              <div className="content">
                <div className="title">Tester avec la carte de test</div>
                <div className="description">
                  Utilisez : 4242 4242 4242 4242 (date future, CVC quelconque)
                </div>
              </div>
            </div>
            <div className="item">
              <span className="icon">3️⃣</span>
              <div className="content">
                <div className="title">Vérifier dans Supabase</div>
                <div className="description">
                  Authentication → Users (nouvel utilisateur créé)
                </div>
              </div>
            </div>
            <div className="item">
              <span className="icon">4️⃣</span>
              <div className="content">
                <div className="title">Vérifier les emails</div>
                <div className="description">
                  Vous devriez recevoir l'email de bienvenue + Magic Link
                </div>
              </div>
            </div>
          </div>
        </ChecklistSection>

        <InfoBox>
          <h4>⚠️ Important pour Vercel</h4>
          <p>
            Assurez-vous que <code>SUPABASE_SERVICE_ROLE_KEY</code> est bien configuré dans les variables d'environnement Vercel.
          </p>
          <p>
            Après déploiement, mettez à jour le webhook secret dans Stripe avec celui généré pour votre endpoint Vercel.
          </p>
        </InfoBox>
      </Card>
    </Container>
  )
}
