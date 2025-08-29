'use client';

import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { createDevSupabaseClient } from '@/lib/supabase/client-dev';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDevAuth } from '@/components/providers/DevAuthProvider';
import Link from 'next/link';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Card = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 2rem;
  text-align: center;
`;

const Section = styled.section`
  margin-bottom: 3rem;
  padding: 2rem;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const InfoCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #cbd5e0;
`;

const Label = styled.div`
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Value = styled.div`
  font-size: 1.125rem;
  color: #2d3748;
  font-weight: 500;
  word-break: break-all;
`;

const StatusBadge = styled.span<{ status: 'success' | 'warning' | 'error' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'success': return '#c6f6d5';
      case 'warning': return '#fed7aa';
      case 'error': return '#fed7d7';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'success': return '#22543d';
      case 'warning': return '#7c2d12';
      case 'error': return '#742a2a';
    }
  }};
`;

const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const CodeBlock = styled.pre`
  background: #1a202c;
  color: #68d391;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  margin-top: 1rem;
`;

const Alert = styled.div<{ type: 'info' | 'success' | 'warning' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  background: ${props => {
    switch (props.type) {
      case 'info': return '#bee3f8';
      case 'success': return '#c6f6d5';
      case 'warning': return '#fed7aa';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'info': return '#2c5282';
      case 'success': return '#22543d';
      case 'warning': return '#7c2d12';
    }
  }};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export default function TestDevAuthPage() {
  const supabase = createDevSupabaseClient();
  const { user, loading, isAuthenticated } = useAuth();
  const { isDevMode, devUser } = useDevAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    testSupabaseOperations();
  }, []);

  const testSupabaseOperations = async () => {
    try {
      // Test de récupération du profil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', 'dev-user-123')
        .single();

      if (profile) {
        setProfileData(profile);
        setTestResult('✅ Toutes les opérations Supabase mockées fonctionnent correctement !');
      }
    } catch (err) {
      setTestResult('❌ Erreur lors du test des opérations');
    }
  };

  const isDevModeActive = process.env.NODE_ENV === 'development' && 
                          process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';

  return (
    <Container>
      <Card>
        <Title>🧪 Test du Système de Bypass d'Authentification</Title>

        {/* Status du mode dev */}
        <Alert type={isDevModeActive ? 'success' : 'warning'}>
          {isDevModeActive ? '✅' : '⚠️'} Mode Dev Auth : {isDevModeActive ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
        </Alert>

        {/* Informations d'environnement */}
        <Section>
          <SectionTitle>🔧 Configuration de l'Environnement</SectionTitle>
          <InfoGrid>
            <InfoCard>
              <Label>NODE_ENV</Label>
              <Value>{process.env.NODE_ENV}</Value>
            </InfoCard>
            <InfoCard>
              <Label>NEXT_PUBLIC_USE_DEV_AUTH</Label>
              <Value>{process.env.NEXT_PUBLIC_USE_DEV_AUTH || 'non défini'}</Value>
            </InfoCard>
            <InfoCard>
              <Label>État du Mode Dev</Label>
              <StatusBadge status={isDevModeActive ? 'success' : 'error'}>
                {isDevModeActive ? 'Actif' : 'Inactif'}
              </StatusBadge>
            </InfoCard>
          </InfoGrid>
        </Section>

        {/* Informations utilisateur */}
        <Section>
          <SectionTitle>👤 Utilisateur Mocké</SectionTitle>
          {loading ? (
            <p>Chargement...</p>
          ) : user ? (
            <InfoGrid>
              <InfoCard>
                <Label>ID</Label>
                <Value>{user.id}</Value>
              </InfoCard>
              <InfoCard>
                <Label>Email</Label>
                <Value>{user.email}</Value>
              </InfoCard>
              <InfoCard>
                <Label>Nom Complet</Label>
                <Value>{user.user_metadata?.full_name || 'Non défini'}</Value>
              </InfoCard>
              <InfoCard>
                <Label>Statut Auth</Label>
                <StatusBadge status="success">
                  {isAuthenticated ? 'Authentifié' : 'Non authentifié'}
                </StatusBadge>
              </InfoCard>
            </InfoGrid>
          ) : (
            <Alert type="warning">
              ⚠️ Aucun utilisateur détecté - Vérifiez la configuration
            </Alert>
          )}
        </Section>

        {/* Données du profil mocké */}
        {profileData && (
          <Section>
            <SectionTitle>📊 Données du Profil Mocké</SectionTitle>
            <CodeBlock>{JSON.stringify(profileData, null, 2)}</CodeBlock>
          </Section>
        )}

        {/* Résultat des tests */}
        {testResult && (
          <Section>
            <SectionTitle>🧪 Résultat des Tests</SectionTitle>
            <Alert type="success">
              {testResult}
            </Alert>
          </Section>
        )}

        {/* Navigation de test */}
        <Section>
          <SectionTitle>🚀 Pages de Test</SectionTitle>
          <ButtonGrid>
            <Button href="/dashboard">
              🏠 Dashboard
            </Button>
            <Button href="/profil/moi">
              👤 Mon Profil
            </Button>
            <Button href="/profil/modifier">
              ✏️ Modifier Profil
            </Button>
            <Button href="/cours">
              📚 Mes Cours
            </Button>
            <Button href="/chat">
              💬 Chat
            </Button>
            <Button href="/membres">
              👥 Membres
            </Button>
          </ButtonGrid>
        </Section>

        {/* Instructions */}
        <Section>
          <SectionTitle>📖 Instructions d'Utilisation</SectionTitle>
          <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>Pour <strong>activer</strong> le mode dev : Mettre <code>NEXT_PUBLIC_USE_DEV_AUTH=true</code> dans <code>.env.local</code></li>
            <li>Pour <strong>désactiver</strong> le mode dev : Mettre <code>NEXT_PUBLIC_USE_DEV_AUTH=false</code> ou supprimer la variable</li>
            <li>Redémarrer le serveur de développement après modification</li>
            <li>L'indicateur "Mode Dev - Auth simulée" apparaît en bas à droite quand le mode est actif</li>
            <li>Toutes les pages protégées sont accessibles sans authentification réelle</li>
            <li>Les données utilisateur sont mockées avec Marie Dupont (test@aurora50.dev)</li>
          </ol>
        </Section>
      </Card>
    </Container>
  );
}
