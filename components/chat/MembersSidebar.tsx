'use client';

import styled from '@emotion/styled';
import { usePresence } from '@/lib/hooks/usePresence';
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import MemberContextMenu from './MemberContextMenu';

const SidebarContainer = styled.div<{ $isOpen?: boolean }>`
  width: 100%;
  height: 100vh; /* Pleine hauteur */
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  @media (min-width: 1024px) {
    width: 100%;
    border-radius: 0; /* Pas de border-radius pour l'effet plein écran */
  }
  
  @media (max-width: 1023px) {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    transform: translateX(${props => props.$isOpen ? '0' : '100%'});
    transition: transform 0.3s ease;
    z-index: 1000;
    box-shadow: -4px 0 20px rgba(0,0,0,0.1);
    border-radius: 0;
  }
`;

const Overlay = styled.div<{ $isOpen?: boolean }>`
  display: none;
  
  @media (max-width: 1023px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 999;
  }
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.95);
  }
  
  h3 {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    span {
      display: flex;
      align-items: center;
      gap: 8px;
      
      &::after {
        content: '🌿';
        font-size: 20px;
      }
    }
  }
`;

const CloseButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
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
  
  @media (max-width: 1023px) {
    display: flex;
  }
`;

const MembersList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 3px;
    
    &:hover {
      background: #d1d5db;
    }
  }
`;

const MemberSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h4 {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    margin: 0 0 12px 8px;
    letter-spacing: 0.5px;
  }
`;

const MemberItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    transform: translateX(4px);
  }
  
  &:active {
    transform: translateX(2px);
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  object-fit: cover;
  background: #f3f4f6;
`;

const StatusDot = styled.div<{ $online: boolean }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$online ? '#10b981' : '#9ca3af'};
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
`;

const MemberInfo = styled.div`
  flex: 1;
  text-align: left;
  min-width: 0;
  
  .name {
    font-size: 14px;
    font-weight: 500;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .status {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }
`;

const ToggleButton = styled.button`
  display: none;
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: linear-gradient(135deg, #10B981, #8B5CF6);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  z-index: 998;
  transition: all 0.3s;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
  font-size: 14px;
`;

const EmptyState = styled.div`
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  
  .emoji {
    font-size: 32px;
    margin-bottom: 12px;
  }
`;

interface MembersSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onMentionMember?: (name: string) => void;
}

export default function MembersSidebar({ isOpen, onToggle, onMentionMember }: MembersSidebarProps) {
  const { onlineMembers, offlineMembers, isLoading, totalOnline, totalOffline } = usePresence();
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    member: any | null;
    position: { x: number; y: number };
  }>({
    isOpen: false,
    member: null,
    position: { x: 0, y: 0 }
  });
  
  // DEBUG - Logs pour identifier le problème
  console.log('🔍 MembersSidebar Debug:');
  console.log('- onlineMembers:', onlineMembers);
  console.log('- offlineMembers:', offlineMembers);
  console.log('- isLoading:', isLoading);
  console.log('- totalOnline:', totalOnline);
  console.log('- totalOffline:', totalOffline);
  console.log('- isOpen:', isOpen);
  console.log('- isDesktop:', isDesktop);
  console.log('- mounted:', mounted);
  
  useEffect(() => {
    setMounted(true);
    console.log('✅ MembersSidebar mounted');
  }, []);
  
  // Temporairement, on retire la vérification de mounted pour voir si c'est le problème
  // if (!mounted) {
  //   return null;
  // }
  
  const handleMemberClick = (e: React.MouseEvent, member: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🎯 Member clicked:', member.full_name);
    
    // Position du menu
    const rect = e.currentTarget.getBoundingClientRect();
    const x = window.innerWidth > 768 ? rect.right + 10 : 0;
    const y = window.innerWidth > 768 ? rect.top : 0;
    
    console.log('📍 Menu position:', { x, y });
    console.log('📐 Window width:', window.innerWidth);
    
    // Déterminer si le membre est en ligne
    const isOnline = onlineMembers.some(m => m.user_id === member.user_id);
    
    const newContextMenu = {
      isOpen: true,
      member: { ...member, isOnline },
      position: { x, y }
    };
    
    console.log('📋 Setting context menu:', newContextMenu);
    setContextMenu(newContextMenu);
  };
  
  const handleClose = () => {
    if (onToggle) {
      onToggle();
    }
  };
  
  return (
    <>
      {!isDesktop && (
        <>
          <Overlay $isOpen={isOpen} onClick={handleClose} />
          <ToggleButton onClick={onToggle} aria-label="Afficher les membres">
            👥
          </ToggleButton>
        </>
      )}
      
      <SidebarContainer $isOpen={isOpen || isDesktop}>
        <Header>
          <h3>
            <span>Membres</span>
            {!isDesktop && (
              <CloseButton onClick={handleClose} aria-label="Fermer">
                ✕
              </CloseButton>
            )}
          </h3>
        </Header>
        
        <MembersList>
          {isLoading ? (
            <LoadingContainer>
              Chargement des membres...
            </LoadingContainer>
          ) : (
            <>
              {onlineMembers.length === 0 && offlineMembers.length === 0 ? (
                <EmptyState>
                  <div className="emoji">👥</div>
                  <div>Aucun membre pour le moment</div>
                </EmptyState>
              ) : (
                <>
                  {onlineMembers.length > 0 && (
                    <MemberSection>
                      <h4>En ligne ({totalOnline})</h4>
                      {onlineMembers.map(member => (
                        <MemberItem 
                          key={member.user_id}
                          onClick={(e) => handleMemberClick(e, member)}
                          title={`Cliquer pour ouvrir le menu`}
                        >
                          <AvatarWrapper>
                            <Avatar 
                              src={member.avatar_url} 
                              alt={member.full_name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`;
                              }}
                            />
                            <StatusDot $online={true} />
                          </AvatarWrapper>
                          <MemberInfo>
                            <div className="name">{member.full_name}</div>
                            <div className="status">En ligne</div>
                          </MemberInfo>
                        </MemberItem>
                      ))}
                    </MemberSection>
                  )}
                  
                  {offlineMembers.length > 0 && (
                    <MemberSection>
                      <h4>Hors ligne ({totalOffline})</h4>
                      {offlineMembers.map(member => (
                        <MemberItem 
                          key={member.user_id}
                          onClick={(e) => handleMemberClick(e, member)}
                          title={`Cliquer pour ouvrir le menu`}
                        >
                          <AvatarWrapper>
                            <Avatar 
                              src={member.avatar_url} 
                              alt={member.full_name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`;
                              }}
                            />
                            <StatusDot $online={false} />
                          </AvatarWrapper>
                          <MemberInfo>
                            <div className="name">{member.full_name}</div>
                            <div className="status">Hors ligne</div>
                          </MemberInfo>
                        </MemberItem>
                      ))}
                    </MemberSection>
                  )}
                </>
              )}
            </>
          )}
        </MembersList>
      </SidebarContainer>
      
      <MemberContextMenu
        isOpen={contextMenu.isOpen}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        member={contextMenu.member}
        position={contextMenu.position}
        onMention={onMentionMember}
      />
    </>
  );
}
