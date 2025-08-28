'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import styled from '@emotion/styled'
import Link from 'next/link'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #fdf4ff 50%, #fef3f2 100%);
  padding: 2rem;
`

const Card = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const Section = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #1f2937;
`

const InfoRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  align-items: center;
`

const Label = styled.span`
  font-weight: 600;
  color: #4b5563;
  min-width: 120px;
`

const Value = styled.span`
  color: #6b7280;
  font-family: monospace;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
`

const Status = styled.span<{ $isConnected: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  ${props => props.$isConnected ? `
    background: #d1fae5;
    color: #065f46;
  ` : `
    background: #fee2e2;
    color: #991b1b;
  `}
`

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const LinkButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  color: #4b5563;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s;

  &:hover {
    background: #e5e7eb;
  }
`

const JsonDisplay = styled.pre`
  background: #1f2937;
  color: #10b981;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.875rem;
  margin-top: 1rem;
`

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  // Fonction pour vérifier l'email dans la DB
  const checkEmailInDB = async () => {
    setEmailLoading(true)
    setEmailStatus(null)
    
    try {
      // Note: Cette requête nécessite que l'email existe dans auth.users
      // Pour un test plus simple, on peut juste tenter l'envoi
      const { data: { users }, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        // Si pas d'accès admin, on indique juste qu'on va tenter l'envoi
        setEmailStatus({
          type: 'info',
          message: '💡 Vérification directe impossible. Tentez l\'envoi du Magic Link pour vérifier.'
        })
        return
      }
      
      const userExists = users?.some(u => u.email === testEmail)
      
      setEmailStatus({
        type: userExists ? 'success' : 'error',
        message: userExists 
          ? `✅ Email trouvé ! Cet utilisateur peut recevoir un Magic Link.`
          : `❌ Email non trouvé. Seuls les utilisateurs ayant payé peuvent se connecter.`
      })
    } catch (error: any) {
      setEmailStatus({
        type: 'error',
        message: `Erreur: ${error.message}`
      })
    } finally {
      setEmailLoading(false)
    }
  }

  // Fonction pour envoyer le Magic Link
  const sendTestMagicLink = async () => {
    setEmailLoading(true)
    setEmailStatus(null)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: testEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`
        }
      })
      
      if (error) throw error
      
      setEmailStatus({
        type: 'success',
        message: `✅ Magic Link envoyé avec succès à ${testEmail} via Brevo !
      
      📧 Vérifiez votre boîte de réception.
      ⏱️ Le lien est valable 24 heures.
      🔍 Pensez à vérifier les spams si vous ne voyez rien.`
      })
      
      // Reset le champ après succès
      setTimeout(() => {
        setTestEmail('')
      }, 2000)
      
    } catch (error: any) {
      setEmailStatus({
        type: 'error',
        message: `❌ Erreur d'envoi: ${error.message}
      
      Vérifiez que :
      - L'email est valide
      - L'utilisateur existe dans la base de données
      - La configuration SMTP Brevo est correcte dans Supabase`
      })
    } finally {
      setEmailLoading(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <Card>
          <Title>Chargement...</Title>
        </Card>
      </Container>
    )
  }

  return (
    <Container>
      <Card>
        <Title>🔐 Test du Système d'Authentification Aurora50</Title>
        
        <Section>
          <SectionTitle>État de la connexion</SectionTitle>
          <InfoRow>
            <Label>Status:</Label>
            <Status $isConnected={!!user}>
              {user ? '✅ Connecté' : '❌ Non connecté'}
            </Status>
          </InfoRow>
          {user && (
            <>
              <InfoRow>
                <Label>Email:</Label>
                <Value>{user.email}</Value>
              </InfoRow>
              <InfoRow>
                <Label>ID:</Label>
                <Value>{user.id}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Créé le:</Label>
                <Value>{new Date(user.created_at).toLocaleString('fr-FR')}</Value>
              </InfoRow>
            </>
          )}
        </Section>

        <Section>
          <SectionTitle>Actions disponibles</SectionTitle>
          <div>
            {user ? (
              <>
                <Button onClick={handleSignOut}>
                  🚪 Se déconnecter
                </Button>
                <LinkButton href="/dashboard">
                  📚 Accéder au Dashboard
                </LinkButton>
              </>
            ) : (
              <>
                <LinkButton href="/connexion">
                  🔑 Se connecter
                </LinkButton>
                <LinkButton href="/dashboard" style={{ marginLeft: '1rem' }}>
                  🔒 Tester l'accès protégé (Dashboard)
                </LinkButton>
              </>
            )}
          </div>
        </Section>

        {/* Section Test Email - À ajouter uniquement si l'utilisateur n'est PAS connecté */}
        {!user && (
          <Section>
            <SectionTitle>🧪 Test d'envoi Magic Link (Brevo)</SectionTitle>
            
            {/* Champ email pour test */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="Entrez votre email Aurora50"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            {/* Boutons de test */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <Button 
                onClick={checkEmailInDB} 
                disabled={!testEmail || emailLoading}
              >
                🔍 Vérifier dans la DB
              </Button>
              
              <Button 
                onClick={sendTestMagicLink}
                disabled={!testEmail || emailLoading}
              >
                ✉️ Envoyer Magic Link
              </Button>
            </div>
            
            {/* Affichage du statut */}
            {emailStatus && (
              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                marginTop: '1rem',
                background: emailStatus.type === 'success' ? '#d1fae5' : 
                           emailStatus.type === 'error' ? '#fee2e2' : '#dbeafe',
                color: emailStatus.type === 'success' ? '#065f46' : 
                       emailStatus.type === 'error' ? '#991b1b' : '#1e40af'
              }}>
                {emailStatus.message}
              </div>
            )}
            
            {/* Instructions */}
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <strong>📋 Instructions de test :</strong>
              <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Vérifiez d'abord que l'email existe dans la DB</li>
                <li>Envoyez le Magic Link</li>
                <li>Vérifiez votre boîte mail (et les spams)</li>
                <li>Cliquez sur le lien reçu</li>
                <li>Vous serez automatiquement connecté</li>
              </ol>
            </div>
          </Section>
        )}

        {session && (
          <Section>
            <SectionTitle>Détails de la session</SectionTitle>
            <InfoRow>
              <Label>Type d'auth:</Label>
              <Value>{session.user?.app_metadata?.provider || 'magic link'}</Value>
            </InfoRow>
            <InfoRow>
              <Label>Expire dans:</Label>
              <Value>
                {Math.round((new Date(session.expires_at * 1000).getTime() - Date.now()) / 1000 / 60)} minutes
              </Value>
            </InfoRow>
            <details>
              <summary style={{ cursor: 'pointer', marginTop: '1rem', color: '#6b7280' }}>
                Voir les données complètes (JSON)
              </summary>
              <JsonDisplay>
                {JSON.stringify({ user, session }, null, 2)}
              </JsonDisplay>
            </details>
          </Section>
        )}

        <Section>
          <SectionTitle>Routes testées</SectionTitle>
          <ul style={{ color: '#6b7280', lineHeight: '1.8' }}>
            <li>✅ <strong>/connexion</strong> - Page de connexion Magic Link</li>
            <li>✅ <strong>/dashboard</strong> - Route protégée (redirection si non connecté)</li>
            <li>✅ <strong>/api/auth/callback</strong> - Callback pour Magic Link</li>
            <li>✅ <strong>Middleware</strong> - Protection automatique des routes LMS</li>
            <li>✅ <strong>AuthProvider</strong> - Context global d'authentification</li>
            <li>✅ <strong>UserMenu</strong> - Menu utilisateur dans le header LMS</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>⚙️ Configuration actuelle</SectionTitle>
          <ul style={{ color: '#6b7280', lineHeight: '1.8' }}>
            <li>📧 <strong>SMTP:</strong> Brevo (smtp-relay.brevo.com:587)</li>
            <li>🔗 <strong>Callback URL:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/callback</li>
            <li>⏱️ <strong>Durée Magic Link:</strong> 24 heures</li>
            <li>✅ <strong>Confirmation email:</strong> Désactivée</li>
            <li>🌐 <strong>Environnement:</strong> {process.env.NODE_ENV}</li>
          </ul>
        </Section>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <LinkButton href="/">
            ← Retour à l'accueil
          </LinkButton>
        </div>
      </Card>
    </Container>
  )
}
