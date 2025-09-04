'use client';

import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  hasNotch: boolean;
  viewportHeight: number;
  keyboardHeight: number;
  isLandscape: boolean;
}

export function useMobileDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    hasNotch: false,
    viewportHeight: 0,
    keyboardHeight: 0,
    isLandscape: false
  });

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent;
      const isIOS = /iPhone|iPad|iPod/.test(ua);
      const isAndroid = /Android/.test(ua);
      const isMobile = isIOS || isAndroid || window.innerWidth < 768;
      
      // Détection iPhone avec encoche (incluant les derniers modèles)
      const hasNotch = isIOS && (
        // iPhone X, XS, 11 Pro
        (window.screen.height === 812 && window.screen.width === 375) ||
        // iPhone XR, XS Max, 11, 11 Pro Max
        (window.screen.height === 896 && window.screen.width === 414) ||
        // iPhone 12, 13, 14
        (window.screen.height === 844 && window.screen.width === 390) ||
        // iPhone 12, 13, 14 Pro Max
        (window.screen.height === 926 && window.screen.width === 428) ||
        // iPhone 15, 15 Pro
        (window.screen.height === 852 && window.screen.width === 393) ||
        // iPhone 15 Pro Max
        (window.screen.height === 932 && window.screen.width === 430) ||
        // iPhone 16 Pro Max (nouveau)
        (window.screen.height === 956 && window.screen.width === 440) ||
        // Mode paysage (largeur > hauteur)
        (window.screen.width === 812 && window.screen.height === 375) ||
        (window.screen.width === 896 && window.screen.height === 414) ||
        (window.screen.width === 844 && window.screen.height === 390) ||
        (window.screen.width === 926 && window.screen.height === 428) ||
        (window.screen.width === 852 && window.screen.height === 393) ||
        (window.screen.width === 932 && window.screen.height === 430) ||
        (window.screen.width === 956 && window.screen.height === 440)
      );
      
      // Hauteur réelle du viewport (utilise visualViewport si disponible)
      const viewportHeight = window.visualViewport 
        ? window.visualViewport.height 
        : window.innerHeight;
      
      // Calcul de la hauteur du clavier (différence entre window height et viewport height)
      const keyboardHeight = window.innerHeight - viewportHeight;
      
      // Détection de l'orientation
      const isLandscape = window.innerWidth > window.innerHeight;
      
      setDeviceInfo({
        isIOS,
        isAndroid,
        isMobile,
        hasNotch,
        viewportHeight,
        keyboardHeight: Math.max(0, keyboardHeight),
        isLandscape
      });
    };
    
    // Check initial
    checkDevice();
    
    // Écouter les changements de viewport (clavier qui s'ouvre/ferme)
    const handleViewportChange = () => checkDevice();
    
    // Support visualViewport pour les navigateurs modernes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }
    
    // Fallback pour les anciens navigateurs
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    
    // Détection du focus sur input (indicateur d'ouverture du clavier)
    const handleFocus = () => {
      setTimeout(checkDevice, 300); // Délai pour laisser le clavier s'ouvrir
    };
    
    const handleBlur = () => {
      setTimeout(checkDevice, 300); // Délai pour laisser le clavier se fermer
    };
    
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);
  
  return deviceInfo;
}

// Hook pour obtenir la hauteur safe du viewport
export function useSafeViewportHeight(): number {
  const { viewportHeight, isMobile } = useMobileDetection();
  const [safeHeight, setSafeHeight] = useState(0);
  
  useEffect(() => {
    const calculateSafeHeight = () => {
      if (!isMobile) {
        setSafeHeight(window.innerHeight);
        return;
      }
      
      // Utilise visualViewport si disponible, sinon innerHeight
      const height = viewportHeight || window.innerHeight;
      setSafeHeight(height);
    };
    
    calculateSafeHeight();
  }, [viewportHeight, isMobile]);
  
  return safeHeight;
}

// Hook pour détecter si le clavier est ouvert
export function useKeyboardOpen(): boolean {
  const { keyboardHeight } = useMobileDetection();
  return keyboardHeight > 50; // Seuil pour éviter les faux positifs
}
