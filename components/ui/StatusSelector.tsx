'use client';

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useStatus } from '@/contexts/StatusContext';

// Configuration des statuts
export const statusConfig = {
  online: { 
    color: '#10b981', 
    label: 'En ligne', 
    emoji: '🟢',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  busy: { 
    color: '#f59e0b', 
    label: 'Occupée', 
    emoji: '🟡',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  },
  dnd: { 
    color: '#ef4444', 
    label: 'Ne pas déranger', 
    emoji: '🔴',
    bgColor: 'rgba(239, 68, 68, 0.1)'
  },
  offline: { 
    color: '#6b7280', 
    label: 'Hors ligne', 
    emoji: '⚫',
    bgColor: 'rgba(107, 114, 128, 0.1)'
  }
};

export type UserStatus = keyof typeof statusConfig;

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const StatusButton = styled.button<{ $color: string; $bgColor: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: ${props => props.$bgColor};
  border: 1px solid ${props => props.$color}33;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  
  &:hover {
    background: ${props => props.$color}22;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .emoji {
    font-size: 16px;
  }
  
  .label {
    @media (max-width: 640px) {
      display: none;
    }
  }
`;

const Dropdown = styled.div<{ $isOpen: boolean; $position: 'top' | 'bottom'; $align: 'left' | 'right' }>`
  position: absolute;
  ${props => props.$position === 'top' 
    ? 'bottom: calc(100% + 8px);' 
    : 'top: calc(100% + 8px);'
  }
  ${props => props.$align === 'right' 
    ? 'right: 0;' 
    : 'left: 0;'
  }
  min-width: 200px;
  max-width: 90vw;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen 
    ? 'translateY(0) scale(1)' 
    : props.$position === 'top' 
      ? 'translateY(10px) scale(0.95)' 
      : 'translateY(-10px) scale(0.95)'
  };
  transition: all 0.2s ease;
  z-index: 9999;
  overflow: hidden;
  
  @media (max-width: 768px) {
    position: fixed;
    ${props => props.$align === 'right' 
      ? 'right: 16px;' 
      : 'left: 16px;'
    }
    min-width: 250px;
  }
`;

// Mobile Bottom Sheet Styles
const MobileModal = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 640px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  }
`;

const MobileOverlay = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${props => props.$isOpen ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const MobileContent = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 24px;
  
  max-height: 60vh;
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(100%)'};
  transition: transform 0.3s ease;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  
  /* S'assurer que le contenu est scrollable si nécessaire */
  overflow-y: auto;
  
  /* Ajustement pour éviter la barre de saisie */
  @supports (padding: max(0px)) {

  }
`;

const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const MobileStatusOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MobileStatusOption = styled.button<{ $color: string; $bgColor: string; $isActive: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: ${props => props.$isActive ? props.$bgColor : 'transparent'};
  border: 1px solid ${props => props.$isActive ? props.$color + '33' : 'transparent'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 15px;
  color: #111827;
  text-align: left;
  
  &:active {
    transform: scale(0.98);
  }
  
  .emoji {
    font-size: 20px;
  }
  
  .label {
    flex: 1;
    font-weight: ${props => props.$isActive ? 600 : 400};
  }
  
  .check {
    color: ${props => props.$color};
    font-size: 18px;
    opacity: ${props => props.$isActive ? 1 : 0};
  }
`;

const StatusOption = styled.button<{ $color: string; $bgColor: string; $isActive: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: ${props => props.$isActive ? props.$bgColor : 'transparent'};
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: #111827;
  text-align: left;
  
  &:hover {
    background: ${props => props.$bgColor};
  }
  
  .emoji {
    font-size: 18px;
  }
  
  .label {
    flex: 1;
    font-weight: ${props => props.$isActive ? 600 : 400};
  }
  
  .check {
    color: ${props => props.$color};
    font-size: 16px;
    opacity: ${props => props.$isActive ? 1 : 0};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
`;

interface StatusSelectorProps {
  userId: string;
  initialStatus?: UserStatus;
  onStatusChange?: (status: UserStatus) => void;
}

export default function StatusSelector({ 
  userId, 
  initialStatus = 'offline',
  onStatusChange 
}: StatusSelectorProps) {
  // Utiliser le hook sans userId pour obtenir le context complet
  const statusContext = useStatus();
  const { updateMyStatus, getStatus } = typeof statusContext === 'string' ? 
    { updateMyStatus: async () => {}, getStatus: () => statusContext as UserStatus } : 
    statusContext;
    
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [dropdownAlign, setDropdownAlign] = useState<'left' | 'right'>('left');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  
  // Utiliser le statut depuis le context
  const status = getStatus(userId) || 'offline';
  
  console.log(`🎨 StatusSelector: Rendu pour ${userId}, statut: ${status}`);
  
  // Calculer la position optimale du dropdown
  useEffect(() => {
    if (isOpen && buttonRef.current && !isMobile) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;
      
      // Position verticale
      if (spaceBelow < 250 && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
      
      // Alignement horizontal
      if (spaceRight < 220 && spaceLeft > spaceRight) {
        setDropdownAlign('right');
      } else {
        setDropdownAlign('left');
      }
    }
  }, [isOpen, isMobile]);
  
  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen && !isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, isMobile]);
  
  const handleStatusChange = async (newStatus: UserStatus) => {
    if (newStatus === status || isUpdating) return;
    
    console.log(`🔄 StatusSelector: Changement de statut demandé: ${status} -> ${newStatus}`);
    
    setIsUpdating(true);
    setIsOpen(false);
    
    try {
      // Utiliser la méthode du context
      await updateMyStatus(newStatus);
      
      console.log(`✅ StatusSelector: Statut mis à jour avec succès`);
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('❌ StatusSelector: Erreur lors de la mise à jour du statut:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const currentConfig = statusConfig[status] || statusConfig.offline;
  
  return (
    <>
      <Container ref={containerRef}>
        <StatusButton
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          $color={currentConfig.color}
          $bgColor={currentConfig.bgColor}
          disabled={isUpdating}
          aria-label="Changer le statut"
        >
          <span className="emoji">{currentConfig.emoji}</span>
          <span className="label">{currentConfig.label}</span>
        </StatusButton>
        
        {/* Desktop/Tablet Dropdown */}
        {!isMobile && (
          <Dropdown 
            $isOpen={isOpen}
            $position={dropdownPosition}
            $align={dropdownAlign}
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <StatusOption
                key={key}
                onClick={() => handleStatusChange(key as UserStatus)}
                $color={config.color}
                $bgColor={config.bgColor}
                $isActive={status === key}
              >
                <span className="emoji">{config.emoji}</span>
                <span className="label">{config.label}</span>
                <span className="check">✓</span>
              </StatusOption>
            ))}
          </Dropdown>
        )}
      </Container>
      
      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <MobileModal $isOpen={isOpen}>
          <MobileOverlay 
            $isOpen={isOpen} 
            onClick={() => setIsOpen(false)} 
          />
          <MobileContent $isOpen={isOpen}>
            <MobileHeader>
              <h3>Choisir votre statut</h3>
              <CloseButton onClick={() => setIsOpen(false)}>
                ✕
              </CloseButton>
            </MobileHeader>
            <MobileStatusOptions>
              {Object.entries(statusConfig).map(([key, config]) => (
                <MobileStatusOption
                  key={key}
                  onClick={() => handleStatusChange(key as UserStatus)}
                  $color={config.color}
                  $bgColor={config.bgColor}
                  $isActive={status === key}
                >
                  <span className="emoji">{config.emoji}</span>
                  <span className="label">{config.label}</span>
                  <span className="check">✓</span>
                </MobileStatusOption>
              ))}
            </MobileStatusOptions>
          </MobileContent>
        </MobileModal>
      )}
    </>
  );
}
