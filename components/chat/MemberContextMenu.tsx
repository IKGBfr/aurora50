'use client';

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const MenuOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  position: fixed;
  inset: 0;
  z-index: 1002;
`;

const MenuContainer = styled.div<{ $x: number; $y: number; $isMobile?: boolean }>`
  position: fixed;
  ${props => props.$isMobile ? `
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    border-radius: 20px 20px 0 0;
    padding: 20px;
    animation: slideUp 0.3s ease;
  ` : `
    top: ${props.$y}px;
    left: ${props.$x}px;
    border-radius: 12px;
    padding: 8px;
    min-width: 200px;
    animation: fadeIn 0.2s ease;
  `}
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1003;
  
  @keyframes fadeIn {
    from { 
      opacity: 0;
      transform: scale(0.95);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const MenuHeader = styled.div`
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 8px;
  
  .name {
    font-weight: 600;
    color: #111827;
    font-size: 16px;
  }
  
  .status {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
  }
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  text-align: left;
  font-size: 14px;
  color: #111827;
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(16, 185, 129, 0.1), 
      rgba(139, 92, 246, 0.1), 
      rgba(236, 72, 153, 0.1)
    );
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .icon {
    font-size: 18px;
  }
`;

const MobileHandle = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    width: 40px;
    height: 4px;
    background: #d1d5db;
    border-radius: 2px;
    margin: 0 auto 16px;
  }
`;

interface MemberContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    user_id: string;
    full_name: string;
    isOnline?: boolean;
  } | null;
  position: { x: number; y: number };
  onMention?: (name: string) => void;
}

export default function MemberContextMenu({ 
  isOpen, 
  onClose, 
  member, 
  position,
  onMention 
}: MemberContextMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1023;
  
  useEffect(() => {
    if (isOpen && menuRef.current && !isMobile) {
      // Ajuster position si menu dépasse l'écran (seulement sur desktop)
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuRef.current.style.left = `${window.innerWidth - rect.width - 20}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menuRef.current.style.top = `${window.innerHeight - rect.height - 20}px`;
      }
    }
  }, [isOpen, position, isMobile]);
  
  useEffect(() => {
    console.log('🎨 MemberContextMenu state:', {
      isOpen,
      member: member?.full_name,
      position,
      isMobile
    });
  }, [isOpen, member, position, isMobile]);
  
  if (!member) return null;
  
  const handleMention = () => {
    if (onMention) {
      onMention(member.full_name);
    }
    onClose();
  };
  
  const handleViewProfile = () => {
    router.push(`/profil/${member.user_id}`);
    onClose();
  };
  
  const handlePrivateMessage = () => {
    // Pour le futur
    alert('Messages privés - Bientôt disponible ! 🌿');
    onClose();
  };
  
  return (
    <>
      <MenuOverlay $isOpen={isOpen} onClick={onClose} />
      {isOpen && (
        <MenuContainer 
          ref={menuRef} 
          $x={position.x} 
          $y={position.y}
          $isMobile={isMobile}
        >
          <MobileHandle />
          
          <MenuHeader>
            <div className="name">{member.full_name}</div>
            <div className="status">
              {member.isOnline ? '🟢 En ligne' : '⚫ Hors ligne'}
            </div>
          </MenuHeader>
          
          <MenuItem onClick={handleMention}>
            <span className="icon">💬</span>
            <span>Mentionner dans le chat</span>
          </MenuItem>
          
          <MenuItem onClick={handlePrivateMessage} disabled>
            <span className="icon">✉️</span>
            <span>Message privé (bientôt)</span>
          </MenuItem>
          
          <MenuItem onClick={handleViewProfile}>
            <span className="icon">👤</span>
            <span>Voir le profil</span>
          </MenuItem>
        </MenuContainer>
      )}
    </>
  );
}
