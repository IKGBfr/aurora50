'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createDevSupabaseClient } from '@/lib/supabase/client-dev';
import { useAuth } from '@/components/providers/AuthProvider';

interface UseActivityTrackerOptions {
  enabled?: boolean;
  heartbeatInterval?: number; // en millisecondes
  debounceDelay?: number; // en millisecondes
}

export function useActivityTracker(options: UseActivityTrackerOptions = {}) {
  const {
    enabled = true,
    heartbeatInterval = 30000, // 30 secondes par défaut
    debounceDelay = 5000, // 5 secondes de debounce
  } = options;

  const { user } = useAuth();
  const lastActivityRef = useRef<Date>(new Date());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  
  const isDevMode = process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';
  const supabase = isDevMode ? createDevSupabaseClient() : createClient();

  // Fonction pour envoyer le heartbeat à Supabase
  const sendHeartbeat = useCallback(async () => {
    if (!user || !enabled || isDevMode) return;

    try {
      // Utiliser la fonction RPC pour mettre à jour l'activité
      const { error } = await supabase.rpc('rpc_update_activity');
      
      if (error) {
        console.error('Erreur lors de l\'envoi du heartbeat:', error);
      } else {
        console.log('💓 Heartbeat envoyé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du heartbeat:', error);
    }
  }, [user, enabled, supabase, isDevMode]);

  // Fonction pour détecter l'activité utilisateur
  const handleActivity = useCallback(() => {
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime();
    
    // Si l'utilisateur était inactif et redevient actif
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      console.log('🎯 Utilisateur redevenu actif');
      sendHeartbeat(); // Envoyer immédiatement un heartbeat
    }
    
    lastActivityRef.current = now;
    
    // Debounce pour éviter trop d'appels
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (timeSinceLastActivity > debounceDelay) {
        sendHeartbeat();
      }
    }, debounceDelay);
  }, [sendHeartbeat, debounceDelay]);

  // Fonction pour vérifier l'inactivité
  const checkInactivity = useCallback(() => {
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - lastActivityRef.current.getTime();
    
    // Si inactif depuis plus de 5 minutes, marquer comme inactif localement
    if (timeSinceLastActivity > 5 * 60 * 1000 && isActiveRef.current) {
      isActiveRef.current = false;
      console.log('😴 Utilisateur marqué comme inactif localement');
    }
  }, []);

  // Configuration du heartbeat régulier
  useEffect(() => {
    if (!enabled || !user || isDevMode) return;

    console.log('🚀 Activity tracker activé pour l\'utilisateur:', user.id);
    
    // Envoyer un heartbeat initial
    sendHeartbeat();
    
    // Configurer l'intervalle de heartbeat
    heartbeatIntervalRef.current = setInterval(() => {
      checkInactivity();
      if (isActiveRef.current) {
        sendHeartbeat();
      }
    }, heartbeatInterval);
    
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [enabled, user, heartbeatInterval, sendHeartbeat, checkInactivity, isDevMode]);

  // Écouter les événements d'activité utilisateur
  useEffect(() => {
    if (!enabled || !user) return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown'
    ];

    // Fonction throttle pour mousemove
    let lastMouseMoveTime = 0;
    const handleMouseMove = (e: Event) => {
      const now = Date.now();
      if (now - lastMouseMoveTime > 1000) { // Throttle à 1 seconde
        lastMouseMoveTime = now;
        handleActivity();
      }
    };

    // Fonction pour les autres événements
    const handleEvent = (e: Event) => {
      if (e.type === 'mousemove') {
        handleMouseMove(e);
      } else {
        handleActivity();
      }
    };

    // Ajouter les listeners
    events.forEach(event => {
      window.addEventListener(event, handleEvent, { passive: true });
    });

    // Écouter aussi les changements de visibilité de la page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page redevenue visible');
        handleActivity();
        sendHeartbeat();
      } else {
        console.log('🙈 Page cachée');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Écouter le focus de la fenêtre
    const handleFocus = () => {
      console.log('🎯 Fenêtre a regagné le focus');
      handleActivity();
      sendHeartbeat();
    };
    
    const handleBlur = () => {
      console.log('😶‍🌫️ Fenêtre a perdu le focus');
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      // Nettoyer les listeners
      events.forEach(event => {
        window.removeEventListener(event, handleEvent);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      
      // Nettoyer les timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, user, handleActivity, sendHeartbeat]);

  // Gérer la fermeture de la page (beforeunload)
  useEffect(() => {
    if (!enabled || !user || isDevMode) return;

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // Essayer d'envoyer un dernier signal avant de fermer
      // Note: Les requêtes async ne sont pas garanties dans beforeunload
      // mais on peut essayer avec sendBeacon si disponible
      if (navigator.sendBeacon) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/rpc_update_activity`;
        const headers = {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        };
        
        navigator.sendBeacon(url, JSON.stringify({
          headers,
          body: {}
        }));
        
        console.log('📤 Beacon de déconnexion envoyé');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, user, isDevMode]);

  return {
    isActive: isActiveRef.current,
    lastActivity: lastActivityRef.current,
    sendHeartbeat
  };
}

// Hook pour utiliser dans les composants qui ont besoin de tracker l'activité
export function useAutoPresence() {
  const { user } = useAuth();
  
  // Activer le tracking seulement si l'utilisateur est connecté
  useActivityTracker({
    enabled: !!user,
    heartbeatInterval: 30000, // 30 secondes
    debounceDelay: 5000 // 5 secondes
  });
}
