'use client';

import styled from '@emotion/styled';
import LessonPlayer from '@/components/cours/LessonPlayer';
import { useState } from 'react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 40px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #666;
  margin-bottom: 32px;
`;

const TestSection = styled.div`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
`;

const ToggleContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
`;

const ToggleButton = styled.button<{ active?: boolean }>`
  padding: 12px 24px;
  border-radius: 12px;
  border: 2px solid ${props => props.active ? '#667eea' : '#e0e0e0'};
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

export default function TestPlayerPage() {
  const [isLocked, setIsLocked] = useState(false);

  return (
    <PageContainer>
      <Header>
        <Title>🎬 Test du LessonPlayer Aurora50</Title>
        <Subtitle>
          Composant de lecture vidéo sécurisé avec YouTube-nocookie
        </Subtitle>
      </Header>

      <TestSection>
        <SectionTitle>Mode de visualisation</SectionTitle>
        <ToggleContainer>
          <ToggleButton 
            active={!isLocked}
            onClick={() => setIsLocked(false)}
          >
            🔓 Débloqué (Premium)
          </ToggleButton>
          <ToggleButton 
            active={isLocked}
            onClick={() => setIsLocked(true)}
          >
            🔒 Verrouillé (Freemium)
          </ToggleButton>
        </ToggleContainer>

        <LessonPlayer
          videoId="VGqksvn6x0E"
          title="Introduction à Aurora50 - Votre Renaissance Commence Ici"
          description="Découvrez comment Aurora50 va transformer votre vie après 50 ans. Dans cette première leçon, nous explorons les 7 piliers de transformation qui vous guideront vers une nouvelle version de vous-même, plus épanouie et alignée avec vos vraies valeurs."
          isLocked={isLocked}
          onComplete={() => console.log('Leçon complétée!')}
        />
      </TestSection>

      <TestSection>
        <SectionTitle>Exemple avec une autre vidéo</SectionTitle>
        <LessonPlayer
          videoId="dQw4w9WgXcQ"
          title="Leçon 2 : Libération Émotionnelle"
          description="Apprenez à identifier et libérer les blocages émotionnels qui vous empêchent d'avancer."
          isLocked={false}
        />
      </TestSection>

      <TestSection>
        <SectionTitle>Caractéristiques du composant</SectionTitle>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px', background: 'white', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>✨ Fonctionnalités implémentées :</h3>
          <ul style={{ lineHeight: '2', color: '#666' }}>
            <li>✅ YouTube-nocookie.com pour la confidentialité</li>
            <li>✅ Blocage de la zone titre YouTube</li>
            <li>✅ Ratio 16:9 responsive</li>
            <li>✅ Design glassmorphism premium</li>
            <li>✅ État verrouillé/déverrouillé</li>
            <li>✅ Barre de progression simulée</li>
            <li>✅ Badge de complétion</li>
            <li>✅ Paramètres de sécurité (pas de vidéos suggérées)</li>
            <li>✅ Bouton de conversion vers Premium</li>
            <li>✅ Animation et transitions fluides</li>
          </ul>
        </div>
      </TestSection>
    </PageContainer>
  );
}
