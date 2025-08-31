'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import ChatRoom from '@/components/chat/ChatRoom';
import MembersSidebar from '@/components/chat/MembersSidebar';

const FullScreenContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  background: #f0f0f0;
  overflow: hidden;
  margin: 0;
  padding: 0;
`;

const ChatSection = styled.div`
  flex: 1;
  display: flex;
  background: #e5ddd5; /* Fond style WhatsApp */
  position: relative;
`;

const SidebarSection = styled.div`
  width: 320px;
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  
  @media (max-width: 1023px) {
    display: none;
  }
`;

const MobileSidebarWrapper = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 1023px) {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 300px;
    background: white;
    transform: translateX(${props => props.$isOpen ? '0' : '100%'});
    transition: transform 0.3s ease;
    z-index: 1001;
    box-shadow: -4px 0 20px rgba(0,0,0,0.1);
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 1023px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
`;

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mentionName, setMentionName] = useState<string>('');
  
  const handleMentionMember = (name: string) => {
    setMentionName(name);
    // Fermer la sidebar mobile après mention
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <FullScreenContainer>
      {/* CHAT - Prend tout l'espace restant */}
      <ChatSection>
        <ChatRoom 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          mentionName={mentionName}
          onMentionHandled={() => setMentionName('')}
        />
      </ChatSection>
      
      {/* SIDEBAR DESKTOP - Fixe à droite */}
      <SidebarSection>
        <MembersSidebar onMentionMember={handleMentionMember} />
      </SidebarSection>
      
      {/* SIDEBAR MOBILE - Drawer */}
      <MobileSidebarWrapper $isOpen={sidebarOpen}>
        <MembersSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(false)}
          onMentionMember={handleMentionMember}
        />
      </MobileSidebarWrapper>
      
      {/* OVERLAY MOBILE */}
      <Overlay $isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
    </FullScreenContainer>
  );
}
