'use client';

import { Toaster } from 'react-hot-toast';
import styled from '@emotion/styled';

const StyledToaster = styled.div`
  /* Override les styles par défaut avec un design moderne */
  .toaster-container {
    > div {
      /* Styles de base pour tous les toasts */
      background: white !important;
      color: #1f2937 !important;
      padding: 1rem 1.25rem !important;
      border-radius: 1rem !important;
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(0, 0, 0, 0.05) !important;
      border: none !important;
      font-size: 1rem !important;
      font-weight: 500 !important;
      max-width: 450px !important;
      min-width: 350px !important;
      
      /* Animations smooth */
      animation: slideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      
      /* Flex pour aligner l'icône et le texte */
      display: flex !important;
      align-items: center !important;
      gap: 0.75rem !important;
    }
    
    /* Toast de succès */
    [data-type="success"], 
    div[role="status"][aria-live="polite"]:has(svg[stroke="currentColor"]) {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      color: white !important;
      border: none !important;
      
      svg {
        width: 24px !important;
        height: 24px !important;
        flex-shrink: 0;
      }
    }
    
    /* Toast d'erreur */
    [data-type="error"],
    div[role="status"][aria-live="polite"]:has(svg:not([stroke="currentColor"])) {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
      color: white !important;
      border: none !important;
      
      svg {
        width: 24px !important;
        height: 24px !important;
        flex-shrink: 0;
      }
    }
    
    /* Toast de loading */
    [data-type="loading"] {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) !important;
      color: white !important;
      border: none !important;
    }
    
    /* Toast custom/info */
    [data-type="custom"],
    div[role="status"][aria-live="polite"]:not(:has(svg)) {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
      color: white !important;
      border: none !important;
    }
  }
  
  @keyframes slideInBounce {
    0% {
      transform: translateY(-100px) scale(0.8);
      opacity: 0;
    }
    50% {
      transform: translateY(10px) scale(1.02);
    }
    100% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
  
  /* Animation de sortie */
  @keyframes slideOut {
    to {
      transform: translateY(-100px) scale(0.8);
      opacity: 0;
    }
  }
  
  /* Effet de hover */
  .toaster-container > div:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 25px 30px -5px rgba(0, 0, 0, 0.15),
      0 15px 15px -5px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(0, 0, 0, 0.08) !important;
  }
`;

export function ToastProvider() {
  return (
    <StyledToaster className="toaster-container">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: 20,
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 5000,
          style: {
            background: 'white',
            color: '#1f2937',
            fontSize: '1rem',
            fontWeight: '500',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#ffffff',
              secondary: '#10b981',
            },
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
            },
          },
          error: {
            duration: 6000,
            iconTheme: {
              primary: '#ffffff',
              secondary: '#ef4444',
            },
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
            },
          },
        }}
      />
    </StyledToaster>
  );
}
