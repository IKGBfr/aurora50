'use client';

import styled from '@emotion/styled';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLessonProgress } from '@/lib/hooks/useLessonProgress';

interface LessonPlayerProps {
  videoId: string;
  lessonId?: string;
  title?: string;
  description?: string;
  isLocked?: boolean;
  onComplete?: () => void;
}

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85));
  backdrop-filter: blur(10px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const VideoIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

const VideoDiv = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const TitleBlocker = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
  pointer-events: none;
  z-index: 10;
`;

const VideoInfo = styled.div`
  padding: 32px;
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
  const playerDivRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const playerRef = useRef<any>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  
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

  // Charger l'API YouTube IFrame
  useEffect(() => {
    if (isLocked || typeof window === 'undefined') return;

    // Vérifier si l'API est déjà chargée
    if ((window as any).YT && (window as any).YT.Player) {
      setIsApiLoaded(true);
      return;
    }

    // Charger le script YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Callback quand l'API est prête
    (window as any).onYouTubeIframeAPIReady = () => {
      setIsApiLoaded(true);
    };

    return () => {
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLocked]);

  // Créer le player YouTube quand l'API est prête
  useEffect(() => {
    if (!isApiLoaded || !playerDivRef.current || isLocked) return;

    // Créer le player
    playerRef.current = new (window as any).YT.Player(playerDivRef.current, {
      videoId: videoId,
      playerVars: {
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 1,
        playsinline: 1,
        controls: 1,
        disablekb: 0,
        start: lastVideoPosition || 0,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
  }, [isApiLoaded, videoId, lastVideoPosition, isLocked]);

  const onPlayerReady = (event: any) => {
    // Reprendre à la dernière position si disponible
    if (lastVideoPosition && lastVideoPosition > 0) {
      event.target.seekTo(lastVideoPosition);
    }
  };

  const onPlayerStateChange = (event: any) => {
    // État 1 = Playing
    if (event.data === 1) {
      // Marquer la leçon comme commencée
      if (lessonId && progress?.status !== 'in_progress' && progress?.status !== 'completed') {
        startLesson();
      }
      
      // Démarrer le tracking de position
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          
          if (duration > 0) {
            const percentage = Math.round((currentTime / duration) * 100);
            setLocalProgress(percentage);
            
            // Sauvegarder la position si on a un lessonId
            if (lessonId) {
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
        }
      }, 10000); // Sauvegarder toutes les 10 secondes
    }
    
    // État 0 = Ended, État 2 = Paused
    if (event.data === 0 || event.data === 2) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        
        // Sauvegarder immédiatement la position
        if (playerRef.current && playerRef.current.getCurrentTime && lessonId) {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          if (duration > 0) {
            saveVideoPosition(currentTime, duration);
          }
        }
      }
      
      // Si la vidéo est terminée
      if (event.data === 0) {
        setLocalProgress(100);
        if (onComplete) onComplete();
        if (lessonId) {
          completeLesson();
        }
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // Utiliser la progression du hook ou la progression locale
  const displayProgress = lessonId ? completionPercentage : localProgress;

  return (
    <PlayerContainer>
      <VideoWrapper>
        {!isLocked && (
          <>
            <VideoDiv ref={playerDivRef} />
            <TitleBlocker />
          </>
        )}
        
        {isLocked && (
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

      {(title || description) && (
        <VideoInfo>
          {title && <VideoTitle>{title}</VideoTitle>}
          {description && <VideoDescription>{description}</VideoDescription>}
          
          {!isLocked && (
            <>
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
            </>
          )}
        </VideoInfo>
      )}
    </PlayerContainer>
  );
}
