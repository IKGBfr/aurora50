'use client';

import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';

const PlayerWrapper = styled.div`
  width: 100%;
  margin: 0 0 2rem 0; /* Seulement marge en bas */
  
  /* Override Plyr colors avec Aurora50 */
  --plyr-color-main: #8B5CF6;
  --plyr-video-background: #111827;
  --plyr-badge-background: #10B981;
  --plyr-video-controls-background: linear-gradient(180deg, transparent, rgba(0,0,0,0.7));
  
  .plyr {
    border-radius: 0 !important; /* Pas de coins arrondis */
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Ombre légère en bas */
  }
  
  .plyr__poster {
    background-size: cover;
  }
  
  /* Cache COMPLÈTEMENT les éléments YouTube */
  .plyr__video-embed iframe {
    pointer-events: none; /* Désactive les clics sur le titre YouTube */
  }
  
  .plyr--playing .plyr__video-embed iframe {
    pointer-events: auto; /* Réactive pour les contrôles pendant la lecture */
  }
  
  /* Style Udemy - Hauteur fixe pour le ratio 16:9 */
  .plyr__video-wrapper {
    padding-bottom: 56.25% !important; /* Force le ratio 16:9 */
  }
`;

interface PlyrVideoPlayerProps {
  videoId: string;
  title?: string;
  thumbnail?: string;
}

export function PlyrVideoPlayer({ videoId, title, thumbnail }: PlyrVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  
  useEffect(() => {
    const loadPlyr = async () => {
      if (!containerRef.current) return;
      
      // Import dynamique de Plyr et son CSS
      const Plyr = (await import('plyr')).default;
      
      // Charger le CSS de Plyr dynamiquement
      if (!document.querySelector('#plyr-css')) {
        const link = document.createElement('link');
        link.id = 'plyr-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
        document.head.appendChild(link);
      }
      
      // Extraire l'ID YouTube
      const extractVideoId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return match ? match[1] : url;
      };
      
      const cleanVideoId = extractVideoId(videoId);
      const posterImage = thumbnail || `https://img.youtube.com/vi/${cleanVideoId}/maxresdefault.jpg`;
      
      // Créer le container vidéo
      const videoContainer = document.createElement('div');
      videoContainer.setAttribute('data-plyr-provider', 'youtube');
      videoContainer.setAttribute('data-plyr-embed-id', cleanVideoId);
      
      // Vider et ajouter le container
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(videoContainer);
      
      // Initialiser Plyr avec config Aurora50
      playerRef.current = new Plyr(videoContainer, {
        controls: [
          'play-large', // Gros bouton play au centre
          'play',       // Play/pause dans les contrôles
          'progress',   // Barre de progression
          'current-time', // Temps actuel
          'duration',   // Durée totale
          'mute',       // Bouton mute
          'volume',     // Volume
          'fullscreen'  // Plein écran
        ],
        youtube: {
          noCookie: true, // youtube-nocookie.com
          rel: 0,         // Pas de vidéos suggérées
          showinfo: 0,    // Pas d'infos
          iv_load_policy: 3, // Pas d'annotations
          modestbranding: 1, // Moins de branding YouTube
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        ratio: '16:9',
        clickToPlay: true,
        hideControls: true,
        keyboard: { focused: true, global: false }
      });
      
      // Événements pour tracking
      if (playerRef.current) {
        playerRef.current.on('play', () => {
          console.log('🌿 Lecture démarrée:', title);
        });
        
        playerRef.current.on('ended', () => {
          console.log('✅ Vidéo terminée:', title);
        });
      }
    };
    
    loadPlyr();
    
    // Cleanup
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [videoId, title, thumbnail]);
  
  return (
    <PlayerWrapper>
      <div ref={containerRef} />
    </PlayerWrapper>
  );
}

export default PlyrVideoPlayer;
