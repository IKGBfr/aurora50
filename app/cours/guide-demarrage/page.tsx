'use client';

import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

/**
 * Page Guide de Démarrage Aurora50
 * 
 * Ce composant sert de modèle de base pour toutes les pages de cours du programme.
 * Il utilise le design system Aurora50 avec les couleurs et styles définis.
 * 
 * Structure :
 * - En-tête avec titre principal et sous-titre
 * - Section Introduction
 * - Section Théorie Accessible
 * - Section Exercices Pratiques (avec placeholders interactifs)
 * - Section Plan d'Action Concret
 * - Section Conclusion Motivante
 * - Barre de navigation en bas
 */

// ========================================
// ANIMATIONS
// ========================================

/** Animation de dégradé pour les titres principaux */
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

/** Animation douce d'apparition */
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ========================================
// COMPOSANTS STYLISÉS
// ========================================

/** Conteneur principal de la page */
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%);
  padding: 2rem 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  animation: ${fadeIn} 0.6s ease-out;

  @media (min-width: 768px) {
    padding: 3rem 2rem;
  }
`;

/** Conteneur central pour limiter la largeur du contenu */
const ContentContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 100px; /* Espace pour la navigation fixe */
`;

/** En-tête du cours avec titre principal et sous-titre */
const CourseHeader = styled.header`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

/** Titre principal avec dégradé animé Aurora50 */
const MainTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  background-size: 200% 200%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${gradientAnimation} 3s ease infinite;
  margin-bottom: 1rem;
  line-height: 1.2;

  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

/** Sous-titre descriptif */
const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #4B5563;
  font-weight: 300;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

/** Props pour ContentSection */
interface ContentSectionProps {
  delay?: string;
}

/** Section de contenu générique */
const ContentSection = styled.section<ContentSectionProps>`
  margin-bottom: 3rem;
  animation: ${fadeIn} 1s ease-out;
  animation-fill-mode: both;
  animation-delay: ${props => props.delay || '0s'};
`;

/** Titre de section */
const SectionTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  /* Emoji décoratif */
  &::before {
    content: '🌿';
    font-size: 1.5rem;
  }
`;

/** Paragraphe de texte standard */
const Paragraph = styled.p`
  font-size: 1.125rem;
  color: #4B5563;
  line-height: 1.8;
  margin-bottom: 1.25rem;
`;

/** Boîte pour les exercices pratiques */
const ExerciseBox = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  /* Bordure dégradée subtile */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    padding: 2px;
    background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    opacity: 0.1;
  }
`;

/** Titre d'exercice */
const ExerciseTitle = styled.h3`
  font-size: 1.375rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
`;

/** Description d'exercice */
const ExerciseDescription = styled.p`
  font-size: 1rem;
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

/** Placeholder pour lecteur audio */
const AudioPlayerPlaceholder = styled.div`
  background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: not-allowed;
  opacity: 0.7;

  &::before {
    content: '🎵';
    font-size: 2rem;
  }
`;

/** Placeholder pour zone de texte */
const TextAreaPlaceholder = styled.div`
  background: #F9FAFB;
  border: 2px dashed #D1D5DB;
  border-radius: 8px;
  padding: 1.5rem;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  font-size: 1rem;
  text-align: center;
`;

/** Boîte pour les points clés */
const KeyPointBox = styled.div`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
  border-left: 4px solid;
  border-image: linear-gradient(135deg, #10B981 0%, #8B5CF6 100%) 1;
  padding: 1.5rem;
  border-radius: 0 8px 8px 0;
  margin: 2rem 0;
`;

/** Liste de points clés */
const KeyPointList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

/** Item de point clé */
const KeyPointItem = styled.li`
  color: #374151;
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  position: relative;
  line-height: 1.6;

  /* Puce personnalisée */
  &::before {
    content: '✨';
    position: absolute;
    left: 0;
  }
`;

/** Bouton d'appel à l'action principal */
const CtaButton = styled.a`
  display: inline-block;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  background-size: 200% 200%;
  color: white;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  text-align: center;
  margin: 1.5rem auto;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: ${gradientAnimation} 3s ease infinite;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/** Navigation du cours (fixée en bas) */
const CourseNavigation = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #E5E7EB;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
`;

/** Bouton de navigation */
const NavButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  /* Style pour bouton actif */
  &:not(:disabled) {
    background: linear-gradient(135deg, #10B981 0%, #8B5CF6 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
    }
  }

  /* Style pour bouton désactivé */
  &:disabled {
    background: #E5E7EB;
    color: #9CA3AF;
    cursor: not-allowed;
  }
`;

/** Indicateur de progression */
const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6B7280;
  font-size: 0.875rem;
`;

// ========================================
// COMPOSANT PRINCIPAL
// ========================================

/**
 * Page principale du Guide de Démarrage Aurora50
 * Cette page sert de modèle pour toutes les pages de cours
 */
export default function GuideDemarragePage() {
  return (
    <PageWrapper>
      <ContentContainer>
        {/* En-tête du cours */}
        <CourseHeader>
          <MainTitle>Bienvenue dans votre Cocon</MainTitle>
          <Subtitle>
            Le pas que vous venez de franchir est le plus important. Je suis Sigrid, et je suis honorée de vous accueillir dans l'espace Aurora50, un lieu pensé pour votre renaissance.
          </Subtitle>
        </CourseHeader>

        {/* Section Introduction */}
        <ContentSection delay="0.2s">
          <SectionTitle>Un nouveau chapitre commence</SectionTitle>
          <Paragraph>
            Bonjour et bienvenue. Prenez un instant pour respirer profondément. Je vous imagine, peut-être avec une tasse de thé, un mélange d'excitation et sans doute un peu d'appréhension. C'est tout à fait normal. La décision de commencer un voyage intérieur demande du courage, et je vous félicite sincèrement d'avoir écouté cette voix en vous qui appelle au changement. Vous n'êtes plus seule.
          </Paragraph>
          <Paragraph>
            Aurora50 a été pensé comme un "cocon" : un espace sûr, chaleureux et à l'abri du bruit du monde. Ici, nous laissons les masques à l'extérieur. C'est un lieu d'échanges authentiques où chaque expérience est valide, chaque doute est légitime et chaque victoire, même la plus petite, est célébrée. Considérez cet endroit comme votre sanctuaire pour les mois à venir.
          </Paragraph>
        </ContentSection>

        {/* Section Guide Pratique Telegram */}
        <ContentSection delay="0.4s">
          <SectionTitle>Rejoindre notre Cocon (Le Guide Telegram)</SectionTitle>
          <Paragraph>
            Pour nos échanges quotidiens, nous avons délibérément choisi Telegram. Pourquoi ? Parce que c'est un espace intime et confidentiel, sans publicité ni distractions. C'est notre cercle privé, un lieu où la conversation peut être profonde et sincère. C'est ici que la communauté prend vie, où les liens se tissent et où la transformation s'opère jour après jour.
          </Paragraph>
          
          {/* Appel à l'action principal */}
          <KeyPointBox>
            <h4 style={{ color: '#111827', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
              Vos premiers pas pour nous rejoindre :
            </h4>
            <Paragraph style={{ marginBottom: '1.5rem' }}>
              Cliquez sur le bouton ci-dessous pour accéder à notre canal principal. C'est la porte d'entrée de notre univers. Vous y trouverez le canal <strong>"📢 Aurora50 - Annonces Officielles"</strong>, qui est connecté à tous nos groupes de discussion.
            </Paragraph>
            <CtaButton href="https://t.me/lien_invitation_prive" target="_blank" rel="noopener noreferrer">
              Rejoindre la Communauté Privée
            </CtaButton>
            <KeyPointList>
              <KeyPointItem>
                <strong>Activez les notifications</strong> pour le canal "Annonces Officielles" afin de ne rien manquer.
              </KeyPointItem>
              <KeyPointItem>
                <strong>Présentez-vous d'abord</strong> dans le groupe <strong>"💬 Aurora50 - Communauté Premium"</strong>. C'est notre espace d'échange principal. Dites-nous simplement qui vous êtes et ce qui vous amène ici. Nous avons hâte de vous lire !
              </KeyPointItem>
              <KeyPointItem>
                <strong>Explorez les autres espaces</strong> à votre rythme :
                <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', listStyle: 'none' }}>
                  <li style={{ marginBottom: '0.25rem' }}><strong>❤️ Aurora50 - Entraide :</strong> Pour les jours où vous avez besoin de soutien.</li>
                  <li style={{ marginBottom: '0.25rem' }}><strong>🔴 Aurora50 - Lives du Dimanche :</strong> Pour nos sessions hebdomadaires.</li>
                  <li><strong>📚 Aurora50 - Ressources :</strong> Votre bibliothèque d'outils et de guides.</li>
                </ul>
              </KeyPointItem>
              <KeyPointItem>
                <strong>Consultez la Charte de Bienveillance</strong> qui est épinglée en haut de chaque groupe. C'est la gardienne de la sérénité de notre cocon.
              </KeyPointItem>
            </KeyPointList>
          </KeyPointBox>

          <Paragraph>
            N'ayez crainte, tout cela deviendra très vite une seconde nature. L'important est de faire le premier pas. Nous sommes là pour vous guider et vous accueillir de l'autre côté.
          </Paragraph>
        </ContentSection>

        {/* Section Exercices Pratiques */}
        <ContentSection delay="0.6s">
          <SectionTitle>Exercices Pratiques</SectionTitle>
          
          {/* Exercice 1 : Méditation guidée */}
          <ExerciseBox>
            <ExerciseTitle>Exercice 1 : Méditation de Centrage</ExerciseTitle>
            <ExerciseDescription>
            Avant de commencer notre grand voyage, il est essentiel de marquer une pause. De s'ancrer. Cet exercice est une invitation à trouver votre centre, ce point de calme intérieur qui existe en vous, même lorsque tout semble agité à l'extérieur. L'objectif n'est pas de "faire le vide", mais de vous accueillir pleinement, ici et maintenant. En vous offrant ces quelques minutes, vous cultivez un sentiment de sécurité intérieure, vous apaisez votre système nerveux et vous vous donnez la clarté nécessaire pour aborder la suite avec sérénité.
            </ExerciseDescription>
            <AudioPlayerPlaceholder>
              [Lecteur audio - Méditation guidée de 10 minutes]
            </AudioPlayerPlaceholder>
          </ExerciseBox>

          {/* Exercice 2 : Écriture réflexive */}
          <ExerciseBox>
            <ExerciseTitle>Exercice 2 : Journal de Transformation</ExerciseTitle>
            <ExerciseDescription>
              [Description de l'exercice d'écriture. Instructions pour guider la réflexion
              personnelle et l'introspection...]
            </ExerciseDescription>
            <TextAreaPlaceholder>
              [Zone de texte interactive pour l'exercice d'écriture réflexive.
              Les participantes pourront écrire leurs pensées ici...]
            </TextAreaPlaceholder>
          </ExerciseBox>

          {/* Exercice 3 : Action concrète */}
          <ExerciseBox>
            <ExerciseTitle>Exercice 3 : Premier Pas Concret</ExerciseTitle>
            <ExerciseDescription>
              [Description d'une action simple mais significative à mettre en place
              immédiatement dans le quotidien...]
            </ExerciseDescription>
            <KeyPointList>
              <KeyPointItem>
                [Étape 1 de l'exercice pratique...]
              </KeyPointItem>
              <KeyPointItem>
                [Étape 2 pour approfondir l'exercice...]
              </KeyPointItem>
              <KeyPointItem>
                [Étape 3 pour intégrer la pratique au quotidien...]
              </KeyPointItem>
            </KeyPointList>
          </ExerciseBox>
        </ContentSection>

        {/* Section Plan d'Action Concret */}
        <ContentSection delay="0.8s">
          <SectionTitle>Plan d'Action Concret</SectionTitle>
          <Paragraph>
            [Introduction au plan d'action hebdomadaire pour intégrer les apprentissages...]
          </Paragraph>
          
          <KeyPointBox>
            <h4 style={{ color: '#111827', marginBottom: '1rem', fontSize: '1.125rem' }}>
              🎯 Vos objectifs cette semaine :
            </h4>
            <KeyPointList>
              <KeyPointItem>
                [Objectif 1 : Action quotidienne simple à mettre en place...]
              </KeyPointItem>
              <KeyPointItem>
                [Objectif 2 : Pratique hebdomadaire à instaurer...]
              </KeyPointItem>
              <KeyPointItem>
                [Objectif 3 : Réflexion ou observation à maintenir...]
              </KeyPointItem>
              <KeyPointItem>
                [Objectif 4 : Connexion avec la communauté Aurora50...]
              </KeyPointItem>
            </KeyPointList>
          </KeyPointBox>

          <Paragraph>
            [Encouragements pour la mise en pratique et rappel de l'importance de la
            régularité dans le processus de transformation...]
          </Paragraph>
        </ContentSection>

        {/* Section Conclusion Motivante */}
        <ContentSection delay="1s">
          <SectionTitle>Conclusion Motivante</SectionTitle>
          <Paragraph>
            [Message inspirant et motivant pour conclure cette première leçon.
            Félicitations pour avoir franchi ce premier pas important...]
          </Paragraph>
          <Paragraph>
            [Rappel de la vision globale du programme Aurora50 et de la transformation
            qui les attend. Message d'encouragement personnalisé de Sigrid...]
          </Paragraph>
          
          {/* Citation inspirante */}
          <KeyPointBox>
            <p style={{ 
              fontStyle: 'italic', 
              fontSize: '1.125rem', 
              color: '#374151',
              textAlign: 'center',
              margin: 0
            }}>
              "🌿 [Citation inspirante sur la transformation personnelle et le pouvoir
              de faire le premier pas vers le changement...] "
            </p>
            <p style={{
              textAlign: 'right',
              color: '#6B7280',
              marginTop: '0.5rem',
              fontSize: '0.875rem'
            }}>
              — Sigrid Larsen
            </p>
          </KeyPointBox>
        </ContentSection>
      </ContentContainer>

      {/* Navigation fixe en bas de page */}
      <CourseNavigation>
        <NavButton disabled>
          ← Leçon Précédente
        </NavButton>
        
        <ProgressIndicator>
          <span>Leçon 1 sur 50</span>
          <span>•</span>
          <span>2% complété</span>
        </ProgressIndicator>

        <NavButton onClick={() => console.log('Navigation vers la leçon suivante')}>
          Leçon Suivante →
        </NavButton>
      </CourseNavigation>
    </PageWrapper>
  );
}
