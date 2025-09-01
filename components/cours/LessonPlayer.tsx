'use client';

import styled from '@emotion/styled';
import { useState, useEffect } from 'react';
import { useLessonProgress } from '@/lib/hooks/useLessonProgress';
import { PlyrVideoPlayer } from './PlyrVideoPlayer';

interface LessonPlayerProps {
  videoId: string;
  lessonId?: string;
  title?: string;
  description?: string;
  isLocked?: boolean;
  onComplete?: () => void;
}

// Wrapper pour le lecteur pleine largeur
const VideoContainer = styled.div`
  width: 100%;
  background: #000; /* Fond noir comme Udemy */
  position: relative;
`;

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
`;

// Container pour le contenu sous la vidéo
const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const VideoInfo = styled.div`
  padding: 32px 0;
`;

const VideoTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const VideoDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin-bottom: 24px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 24px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
`;

const LockedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  min-height: 400px;
`;

const LockIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

const LockedTitle = styled.h3`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
`;

const LockedMessage = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  max-width: 400px;
  margin-bottom: 32px;
`;

const UnlockButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
`;

const CompletionBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
`;

const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  font-size: 14px;
  color: #666;
`;

export default function LessonPlayer({
  videoId = 'VGqksvn6x0E',
  lessonId,
  title,
  description,
  isLocked = false,
  onComplete
}: LessonPlayerProps) {
  const [localProgress, setLocalProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Hook de tracking de progression (toujours appelé, mais avec undefined si pas de lessonId)
  const { 
    progress, 
    startLesson, 
    saveVideoPosition, 
    completeLesson,
    isCompleted,
    completionPercentage,
    lastVideoPosition 
  } = useLessonProgress(lessonId);

  // Utiliser la progression du hook ou la progression locale
  const displayProgress = lessonId ? completionPercentage : localProgress;

  // Gestionnaires d'événements vidéo
  const handleVideoPlay = () => {
    // Marquer la leçon comme commencée
    if (lessonId && !hasStarted && progress?.status !== 'in_progress' && progress?.status !== 'completed') {
      startLesson();
      setHasStarted(true);
    }
  };

  const handleVideoProgress = (currentTime: number, duration: number) => {
    if (duration > 0) {
      const percentage = Math.round((currentTime / duration) * 100);
      setLocalProgress(percentage);
      
      // Sauvegarder la position si on a un lessonId (toutes les 10 secondes)
      if (lessonId && Math.floor(currentTime) % 10 === 0) {
        saveVideoPosition(currentTime, duration);
      }
      
      // Marquer comme complété à 90%
      if (percentage >= 90 && !isCompleted) {
        if (onComplete) onComplete();
        if (lessonId) {
          completeLesson();
        }
      }
    }
  };

  const handleVideoPause = () => {
    // Sauvegarder la position actuelle
    if (lessonId && (window as any).currentYouTubePlayer) {
      const player = (window as any).currentYouTubePlayer;
      if (player.getCurrentTime && player.getDuration) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        if (duration > 0) {
          saveVideoPosition(currentTime, duration);
        }
      }
    }
  };

  const handleVideoEnd = () => {
    setLocalProgress(100);
    if (onComplete) onComplete();
    if (lessonId) {
      completeLesson();
    }
  };

  return (
    <>
      <VideoContainer>
        <PlayerContainer>
          <VideoWrapper>
            {!isLocked ? (
              <PlyrVideoPlayer
                videoId={videoId}
                title={title}
              />
            ) : (
              <LockedOverlay>
                <LockIcon>🔒</LockIcon>
                <LockedTitle>Contenu Premium</LockedTitle>
                <LockedMessage>
                  Cette leçon fait partie du programme complet Aurora50. 
                  Débloquez l'accès illimité pour continuer votre transformation.
                </LockedMessage>
                <UnlockButton onClick={() => window.location.href = '/inscription'}>
                  Débloquer avec Premium 🌟
                </UnlockButton>
              </LockedOverlay>
            )}
          </VideoWrapper>
        </PlayerContainer>
      </VideoContainer>

      {(title || description) && !isLocked && (
        <ContentContainer>
          <VideoInfo>
            {title && <VideoTitle>{title}</VideoTitle>}
            {description && <VideoDescription>{description}</VideoDescription>}
            
            {(isCompleted || displayProgress === 100) && (
              <CompletionBadge>
                ✅ Leçon complétée
              </CompletionBadge>
            )}
            
            <ProgressBar>
              <ProgressFill progress={displayProgress} />
            </ProgressBar>
            
            {lessonId && (
              <ProgressInfo>
                <span>Progression: {displayProgress}%</span>
                {progress?.watch_time_seconds && (
                  <span>• Temps visionné: {Math.floor(progress.watch_time_seconds / 60)} min</span>
                )}
              </ProgressInfo>
            )}
          </VideoInfo>
        </ContentContainer>
      )}
    </>
  );
}
