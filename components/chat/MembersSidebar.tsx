'use client';

import styled from '@emotion/styled';
import { usePresence } from '@/lib/hooks/usePresence';
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import MemberContextMenu from './MemberContextMenu';
import StatusSelector, { statusConfig, UserStatus } from '@/components/ui/StatusSelector';

const SidebarContainer = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

const StatusDot = styled.div<{ $status?: UserStatus }>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    if (!props.$status || props.$status === 'offline') return '#9ca3af';
    return statusConfig[props.$status].color;
  }};
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

const ErrorState = styled.div`
  padding: 20px;
  text-align: center;
  
  .emoji {
    font-size: 32px;
    margin-bottom: 12px;
  }
  
  .error-title {
    color: #ef4444;
    font-weight: 600;
    margin-bottom: 8px;
  }
  
  .error-message {
    color: #6b7280;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;
  }
  
  .retry-button {
    background: linear-gradient(135deg, #10B981, #8B5CF6);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.05);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
`;

const MyStatusSection = styled.div`
  padding: 16px 12px;
  background: linear-gradient(135deg, #f0fdf4 0%, #faf5ff 50%, #fdf2f8 100%);
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 12px;
`;

const MyStatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MyStatusInfo = styled.div`
  flex: 1;
  
  .label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  
  .name {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;
  }
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  
  .emoji {
    font-size: 14px;
  }
`;

interface MembersSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onMentionMember?: (name: string) => void;
  salonId?: string; // AJOUT pour support des salons
}

export default function MembersSidebar({ isOpen, onToggle, onMentionMember, salonId }: MembersSidebarProps) {
  const { 
    onlineMembers, 
    offlineMembers, 
    isLoading, 
    error,
    totalOnline, 
    totalOffline,
    currentUser,
    isCurrentUserOnline 
  } = usePresence();
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
      <SidebarContainer>
        <Header>
          <h3>
            <span>Membres</span>
          </h3>
        </Header>
        
        <MembersList>
          {isLoading ? (
            <LoadingContainer>
              Chargement des membres...
            </LoadingContainer>
          ) : error ? (
            <ErrorState>
              <div className="emoji">⚠️</div>
              <div className="error-title">Erreur de connexion</div>
              <div className="error-message">
                {error === 'Chargement trop long' 
                  ? 'Le chargement a pris trop de temps. Vérifiez votre connexion.'
                  : 'Impossible de charger la liste des membres.'}
              </div>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Rafraîchir la page
              </button>
            </ErrorState>
          ) : (
            <>
              {/* Section Mon Statut */}
              {currentUser && (
                <MyStatusSection>
                  <MyStatusItem>
                    <AvatarWrapper>
                      <Avatar 
                        src={currentUser.avatar_url} 
                        alt={currentUser.full_name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.user_id}`;
                        }}
                      />
                      <StatusDot $status={currentUser.status || 'offline'} />
                    </AvatarWrapper>
                    <MyStatusInfo>
                      <div className="label">Mon statut</div>
                      <div className="name">{currentUser.full_name}</div>
                    </MyStatusInfo>
                    <StatusSelector 
                      userId={currentUser.user_id}
                      initialStatus={currentUser.status || 'online'}
                    />
                  </MyStatusItem>
                </MyStatusSection>
              )}
              
              {/* Liste des autres membres */}
              {onlineMembers.length === 0 && offlineMembers.length === 0 ? (
                <EmptyState>
                  <div className="emoji">👥</div>
                  <div>Aucun autre membre pour le moment</div>
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
                            <StatusDot $status={member.status || 'online'} />
                          </AvatarWrapper>
                          <MemberInfo>
                            <div className="name">{member.full_name}</div>
                            <div className="status">
                              {member.status && statusConfig[member.status] 
                                ? `${statusConfig[member.status].emoji} ${statusConfig[member.status].label}`
                                : '🟢 En ligne'}
                            </div>
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
                            <StatusDot $status={member.status || 'offline'} />
                          </AvatarWrapper>
                          <MemberInfo>
                            <div className="name">{member.full_name}</div>
                            <div className="status">
                              {member.status && statusConfig[member.status] 
                                ? `${statusConfig[member.status].emoji} ${statusConfig[member.status].label}`
                                : '⚫ Hors ligne'}
                            </div>
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
