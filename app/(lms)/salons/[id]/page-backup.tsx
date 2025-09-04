'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import ChatRoom from '@/components/chat/ChatRoom';
import MembersSidebar from '@/components/chat/MembersSidebar';
import { useSalon } from '@/lib/hooks/useSalons';
import { FiArrowLeft, FiShare2, FiCopy, FiCheck } from 'react-icons/fi';

const FullScreenContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f0f0;
  overflow: hidden;
  margin: 0;
  padding: 0;
`;

const SalonHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 0.95rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const SalonInfo = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  
  p {
    font-size: 0.95rem;
    opacity: 0.9;
  }
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 0.95rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const ChatSection = styled.div`
  flex: 1;
  display: flex;
  background: #e5ddd5;
  position: relative;
  min-width: 0;
  overflow: hidden;
`;

const SidebarSection = styled.div`
  width: 320px;
  min-width: 320px;
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-shrink: 0;
  position: relative;
  
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

const Modal = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ShareCode = styled.div`
  background: #f3f4f6;
  border: 2px dashed #9ca3af;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
  
  .label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }
  
  .code {
    font-family: monospace;
    font-size: 1.5rem;
    font-weight: 600;
    color: #8b5cf6;
    margin: 0.5rem 0;
  }
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const ShareInstructions = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 0.5rem;
  
  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #92400e;
    margin-bottom: 0.5rem;
  }
  
  ol {
    margin: 0;
    padding-left: 1.25rem;
    color: #78350f;
    font-size: 0.875rem;
    line-height: 1.5;
  }
`;

const CloseButton = styled.button`
  margin-top: 1rem;
  width: 100%;
  padding: 0.75rem;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  font-size: 1.1rem;
`;

export default function SalonChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { salon, loading } = useSalon(params.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mentionName, setMentionName] = useState<string>('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleMentionMember = (name: string) => {
    setMentionName(name);
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleCopyCode = () => {
    if (salon?.share_code) {
      navigator.clipboard.writeText(salon.share_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <FullScreenContainer>
        <LoadingContainer>Chargement du salon...</LoadingContainer>
      </FullScreenContainer>
    );
  }

  if (!salon) {
    return (
      <FullScreenContainer>
        <LoadingContainer>Salon introuvable</LoadingContainer>
      </FullScreenContainer>
    );
  }
  
  return (
    <FullScreenContainer>
      {/* HEADER DU SALON */}
      <SalonHeader>
        <HeaderLeft>
          <BackButton onClick={() => router.push('/salons')}>
            <FiArrowLeft /> Retour
          </BackButton>
          <SalonInfo>
            <h1>{salon.name}</h1>
            <p>{salon.member_count} membres • {salon.city || salon.category}</p>
          </SalonInfo>
        </HeaderLeft>
        <ShareButton onClick={() => setShareModalOpen(true)}>
          <FiShare2 /> Inviter
        </ShareButton>
      </SalonHeader>

      {/* CHAT ET SIDEBAR */}
      <ChatContainer>
        <ChatSection>
          <ChatRoom 
            salonId={params.id}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
            mentionName={mentionName}
            onMentionHandled={() => setMentionName('')}
          />
        </ChatSection>
        
        <SidebarSection>
          <MembersSidebar 
            salonId={params.id}
            onMentionMember={handleMentionMember} 
          />
        </SidebarSection>
        
        <MobileSidebarWrapper $isOpen={sidebarOpen}>
          <MembersSidebar 
            salonId={params.id}
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(false)}
            onMentionMember={handleMentionMember}
          />
        </MobileSidebarWrapper>
        
        <Overlay $isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      </ChatContainer>

      {/* MODAL DE PARTAGE */}
      <Modal $isOpen={shareModalOpen}>
        <ModalContent>
          <ModalTitle>Inviter dans ce salon</ModalTitle>
          
          <ShareCode>
            <div className="label">Code d'invitation</div>
            <div className="code">{salon.share_code}</div>
          </ShareCode>
          
          <CopyButton onClick={handleCopyCode}>
            {copied ? (
              <>
                <FiCheck /> Code copié !
              </>
            ) : (
              <>
                <FiCopy /> Copier le code
              </>
            )}
          </CopyButton>
          
          <ShareInstructions>
            <h3>Comment partager sur Facebook :</h3>
            <ol>
              <li>Copiez le code ci-dessus</li>
              <li>Postez dans votre groupe Facebook</li>
              <li>Ajoutez un message comme : "Rejoignez mon salon privé Aurora50 avec le code : {salon.share_code}"</li>
              <li>Les femmes pourront rejoindre directement avec ce code !</li>
            </ol>
          </ShareInstructions>
          
          <CloseButton onClick={() => setShareModalOpen(false)}>
            Fermer
          </CloseButton>
        </ModalContent>
      </Modal>
    </FullScreenContainer>
  );
}
