'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import ChatRoom from '@/components/chat/ChatRoom';
import MembersSidebar from '@/components/chat/MembersSidebar';
import { useSalon } from '@/lib/hooks/useSalons';
import { FiArrowLeft, FiShare2, FiCopy, FiCheck, FiMenu, FiX } from 'react-icons/fi';
import { HiUserGroup } from 'react-icons/hi';
import { zIndex } from '@/lib/utils/breakpoints';

// === STRUCTURE PRINCIPALE ===
const PageContainer = styled.div`
  display: grid;
  grid-template-rows: 64px 1fr;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    height: 100vh; /* Hauteur viewport complète */
    padding-top: 56px; /* 60px header mobile + 56px header salon */
    box-sizing: border-box; /* IMPORTANT: inclure le padding dans la hauteur */
    grid-template-rows: 1fr; /* Plus besoin de la ligne pour le header sur mobile */
    overflow: hidden;
  }
`;

// === HEADER FIXE ===
const SalonHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 50; // Réduit pour passer sous le header mobile sur mobile
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  grid-row: 1;
  
  /* Conteneur interne pour gérer le padding */
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    height: 64px;
    
    @media (max-width: 768px) {
      padding: 0.75rem 1rem;
      height: 56px;
    }
  }
  
  @media (max-width: 768px) {
    position: fixed;
    top: 60px; /* Décaler sous le header mobile */
    left: 0;
    right: 0;
    z-index: 80; /* Plus élevé sur mobile mais sous le header principal */
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0; /* Important pour text-overflow */
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const SalonInfo = styled.div`
  flex: 1;
  min-width: 0;
  
  h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
  
  p {
    font-size: 0.875rem;
    opacity: 0.9;
    margin: 0.25rem 0 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 40px;
  padding: 0 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    height: 36px;
    padding: 0;
    width: 36px;
    
    span {
      display: none;
    }
  }
`;

const MembersToggle = styled(ActionButton)`
  display: none;
  
  @media (max-width: 1024px) {
    display: flex;
  }
`;

// === ZONE DE CONTENU ===
const ContentArea = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;
  grid-row: 2;
  
  @media (max-width: 768px) {
    height: calc(100vh - 116px); /* Hauteur explicite sur mobile */
    grid-row: 1; /* Première ligne sur mobile car pas de header dans le grid */
  }
`;

const ChatSection = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  min-width: 0;
  overflow: hidden;
  height: 100%;
  position: relative;
  
  @media (max-width: 768px) {
    height: calc(100vh - 116px); /* Hauteur explicite sur mobile */
    position: relative; /* Pour que ChatRoom absolute fonctionne */
  }
`;

const SidebarSection = styled.aside`
  width: 320px;
  background: #fafafa;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

// === SIDEBAR MOBILE ===
const MobileSidebar = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 85%;
  max-width: 320px;
  background: white;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: ${zIndex.mobileSidebar}; // z-index: 100
  box-shadow: ${props => props.$isOpen ? '-4px 0 20px rgba(0,0,0,0.15)' : 'none'};
  display: flex;
  flex-direction: column;
  
  @media (min-width: 1025px) {
    display: none;
  }
`;

const MobileSidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
  
  h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }
  
  button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  opacity: ${props => props.$isOpen ? 1 : 0};
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transition: opacity 0.3s;
  z-index: ${zIndex.overlay}; // z-index: 95
  
  @media (min-width: 1025px) {
    display: none;
  }
`;

// === MODAL D'INVITATION ===
const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 200;
  padding: 1rem;
  animation: ${props => props.$isOpen ? 'fadeIn 0.2s' : 'none'};
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 1rem;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ShareCode = styled.div`
  background: linear-gradient(135deg, #f0f9ff, #fdf4ff);
  border: 2px dashed #8B5CF6;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  
  .label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .code {
    font-family: 'Courier New', monospace;
    font-size: 1.75rem;
    font-weight: 700;
    color: #8B5CF6;
    margin: 0.5rem 0;
    letter-spacing: 0.1em;
  }
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ShareInstructions = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 0.75rem;
  
  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #92400e;
    margin: 0 0 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  ol {
    margin: 0;
    padding-left: 1.5rem;
    color: #78350f;
    font-size: 0.875rem;
    line-height: 1.6;
    
    li {
      margin-bottom: 0.5rem;
    }
  }
`;

const CloseModalButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
    color: #4b5563;
  }
`;

// === ÉTATS DE CHARGEMENT ===
const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #6b7280;
  
  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #f3f4f6;
    border-top-color: #8B5CF6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 2rem;
  text-align: center;
  
  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h2 {
    font-size: 1.5rem;
    color: #111827;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }
  
  button {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

export default function SalonChatPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const router = useRouter();
  const { salon, loading } = useSalon(id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mentionName, setMentionName] = useState<string>('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleMentionMember = (name: string) => {
    setMentionName(name);
    setSidebarOpen(false);
  };

  const handleCopyCode = async () => {
    if (salon?.share_code) {
      try {
        await navigator.clipboard.writeText(salon.share_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Erreur lors de la copie:', err);
      }
    }
  };

  if (loading) {
    return (
      <LoadingState>
        <div className="spinner" />
        <div>Chargement du salon...</div>
      </LoadingState>
    );
  }

  if (!salon) {
    return (
      <ErrorState>
        <div className="error-icon">❌</div>
        <h2>Salon introuvable</h2>
        <p>Ce salon n'existe pas ou vous n'y avez pas accès.</p>
        <button onClick={() => router.push('/salons')}>
          Retour aux salons
        </button>
      </ErrorState>
    );
  }
  
  return (
    <PageContainer>
      {/* HEADER PRINCIPAL */}
      <SalonHeader>
        <div className="header-content">
          <HeaderLeft>
            <BackButton 
              onClick={() => router.push('/salons')}
              aria-label="Retour aux salons"
            >
              <FiArrowLeft />
            </BackButton>
            
            <SalonInfo>
              <h1>{salon.name}</h1>
              <p>
                {salon.member_count || 0} membres • {salon.city || salon.category || 'Général'}
              </p>
            </SalonInfo>
          </HeaderLeft>
          
          <HeaderRight>
            <ActionButton 
              onClick={() => setShareModalOpen(true)}
              aria-label="Inviter des membres"
            >
              <FiShare2 />
              <span>Inviter</span>
            </ActionButton>
            
            <MembersToggle
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Fermer la liste des membres" : "Voir les membres"}
            >
              {sidebarOpen ? <FiX /> : <HiUserGroup />}
            </MembersToggle>
          </HeaderRight>
        </div>
      </SalonHeader>

      {/* ZONE DE CONTENU */}
      <ContentArea>
        {/* Chat principal */}
        <ChatSection>
          <ChatRoom 
            salonId={id}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            mentionName={mentionName}
            onMentionHandled={() => setMentionName('')}
          />
        </ChatSection>
        
        {/* Sidebar desktop */}
        <SidebarSection>
          <MembersSidebar 
            salonId={id}
            onMentionMember={handleMentionMember}
          />
        </SidebarSection>
      </ContentArea>

      {/* Sidebar mobile */}
      <MobileSidebar $isOpen={sidebarOpen}>
        <MobileSidebarHeader>
          <h2>Membres du salon</h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            aria-label="Fermer"
          >
            <FiX />
          </button>
        </MobileSidebarHeader>
        <MembersSidebar 
          salonId={id}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(false)}
          onMentionMember={handleMentionMember}
        />
      </MobileSidebar>
      
      {/* Overlay mobile */}
      <Overlay 
        $isOpen={sidebarOpen} 
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Modal d'invitation */}
      <Modal $isOpen={shareModalOpen} aria-modal="true">
        <ModalContent>
          <ModalTitle>Inviter dans ce salon</ModalTitle>
          
          <ShareCode>
            <div className="label">Code d'invitation unique</div>
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
            <h3>💡 Comment inviter des membres :</h3>
            <ol>
              <li>Copiez le code d'invitation ci-dessus</li>
              <li>Partagez-le dans votre groupe Facebook</li>
              <li>Les membres pourront rejoindre avec ce code</li>
              <li>Le code est unique à ce salon</li>
            </ol>
          </ShareInstructions>
          
          <CloseModalButton onClick={() => setShareModalOpen(false)}>
            Fermer
          </CloseModalButton>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
}
