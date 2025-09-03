'use client';

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useRealtimeChat } from '@/lib/hooks/useRealtimeChat';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Avatar from '@/components/ui/Avatar';
import EmojiPicker, { EmojiClickData, Categories } from 'emoji-picker-react';
import { createBrowserClient } from '@supabase/ssr';

// === STYLED COMPONENTS AURORA50 ===

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%);
  overflow: hidden;
  position: relative;
  /* Pas de margin ni padding externe */
  margin: 0;
  padding: 0;

  &::before {
    content: '🌿';
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 24px;
    opacity: 0.5;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    height: calc(100vh - 60px); /* Moins la hauteur du header LMS mobile */
    
    &::before {
      font-size: 20px;
      top: 76px; /* 60px (header LMS) + 16px */
      right: 16px;
    }
  }
`;

const ChatHeader = styled.div`
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (min-width: 1024px) {
    display: none;
  }
  
  @media (max-width: 768px) {
    position: fixed;
    top: 60px; /* BIEN positionné sous le header LMS */
    left: 0;
    right: 0;
    z-index: 998;
    height: 56px;
    display: flex;
    background: white; /* S'assurer que le fond est opaque */
    box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* Petite ombre pour la séparation */
  }
`;

const ToggleSidebarButton = styled.button`
  padding: 8px 16px;
  background: linear-gradient(135deg, #10B981, #8B5CF6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ChatTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #EC4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px; /* Réduire l'espacement entre messages */
  width: 100%;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #F3F4F6;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #10B981, #8B5CF6);
    border-radius: 10px;
  }
  
  @media (max-width: 768px) {
    /* IMPORTANT : Ajouter l'espace pour les 2 headers */
    padding-top: 126px; /* 60px (header LMS) + 56px (header chat) + 10px marge */
    padding-bottom: 100px; /* AUGMENTÉ pour l'input + marge */
    padding-left: 8px;
    padding-right: 8px;
  }
  
  @media (max-width: 480px) {
    padding-bottom: 110px; /* Encore plus sur petit écran */
    padding-left: 8px;
    padding-right: 8px;
  }
`;

const MessageWrapper = styled.div`
  position: relative;
`;

// Nouveau wrapper pour MessageContent + bouton de réaction
const MessageContentWrapper = styled.div`
  position: relative;
  display: inline-block;
  padding-bottom: 10px; /* Espace pour les réactions */
  margin: 0 45px; /* Espace pour le bouton sur desktop */
  
  @media (max-width: 768px) {
    margin: 0 35px; /* Réduire la marge sur mobile */
  }
  
  @media (max-width: 480px) {
    margin: 0 30px; /* Encore moins sur très petit écran */
  }
  
  &:hover .reaction-trigger {
    opacity: 0.6;
  }
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  position: relative;
  margin-bottom: 8px; /* Espace pour les réactions */
  transition: all 0.2s;
  
  &:hover {
    filter: brightness(0.98);
  }
`;

const MessageWrapperWithReaction = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: ${props => props.$isOwn ? 'row-reverse' : 'row'};
  align-items: flex-end;
  gap: 12px;
  max-width: calc(70% - 45px); /* Réduire pour le bouton */
  min-width: 60px;
  word-break: break-word;
  
  @media (max-width: 768px) {
    max-width: calc(90% - 45px); /* Augmenter de 85% à 90% */
  }
  
  @media (max-width: 480px) {
    max-width: calc(95% - 45px); /* Encore plus large sur très petit écran */
  }
`;

const AvatarWrapper = styled.div`
  flex-shrink: 0;
`;

const MessageContent = styled.div<{ $isOwn: boolean; $isEmojiOnly?: boolean }>`
  padding: ${props => props.$isEmojiOnly ? '8px 12px' : '12px 16px'};
  border-radius: 18px;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  box-shadow: ${props => props.$isEmojiOnly ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'};
  font-size: ${props => props.$isEmojiOnly ? '32px' : '18px'};
  line-height: ${props => props.$isEmojiOnly ? '1' : '1.5'};
  min-width: ${props => props.$isEmojiOnly ? 'auto' : '60px'};
  
  @media (max-width: 768px) {
    font-size: ${props => props.$isEmojiOnly ? '28px' : '16px'}; /* Taille adaptée mobile */
    padding: ${props => props.$isEmojiOnly ? '6px 10px' : '10px 14px'};
  }
  
  ${props => {
    if (props.$isEmojiOnly) {
      return `
        background: transparent;
        color: inherit;
        border: none;
      `;
    }
    return props.$isOwn ? `
      background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
      color: white;
      border-bottom-right-radius: 4px;
    ` : `
      background: #FFFFFF;
      color: #111827;
      border: 1px solid #E5E7EB;
      border-bottom-left-radius: 4px;
    `;
  }}
`;

const MessageInfo = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  gap: 4px;
  margin-bottom: 4px;
  padding: 0 4px;
`;

const UserName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
`;

const TimeStamp = styled.div`
  font-size: 11px;
  color: #9CA3AF;
`;

const InputContainer = styled.form`
  padding: 16px 20px;
  background: #f0f0f0;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 80px; /* Hauteur minimum garantie */
  
  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 998;
    padding: 12px 16px; /* Ajuster le padding */
    min-height: 72px; /* Hauteur cohérente sur mobile */
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 24px;
  padding: 0 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 0;
  border: none;
  font-size: 18px;
  line-height: 1.4;
  outline: none;
  background: transparent;
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const EmojiButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const SendButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #6B7280;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #6B7280;
  
  h3 {
    color: #111827;
    margin-bottom: 8px;
    font-size: 20px;
  }
  
  p {
    font-size: 14px;
  }
`;

// === COMPOSANTS POUR SUPPRESSION ET RÉPONSE ===

const MessageContextMenu = styled.div<{ show: boolean; x: number; y: number }>`
  position: fixed;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: ${props => props.show ? 'block' : 'none'};
  z-index: 1001;
  overflow: hidden;
  min-width: 160px;
  animation: ${props => props.show ? 'fadeIn 0.2s ease-out' : 'none'};
  
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
`;

const MenuOption = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #111827;
  transition: background 0.2s;
  
  &:hover {
    background: #F3F4F6;
  }
  
  &.danger {
    color: #EF4444;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ReplyIndicator = styled.div<{ $isOwn?: boolean }>`
  /* Fond blanc/gris clair pour un bon contraste */
  background: ${props => props.$isOwn 
    ? 'rgba(255, 255, 255, 0.15)'  /* Blanc transparent pour messages à droite */
    : 'rgba(249, 250, 251, 0.95)'  /* Gris très clair pour messages à gauche */
  };
  border-left: 3px solid ${props => props.$isOwn ? 'rgba(255, 255, 255, 0.3)' : '#E5E7EB'};
  padding: 6px 10px;
  margin: -8px -12px 8px -12px;
  border-radius: 12px 12px 0 0;
  
  .reply-author {
    font-size: 11px;
    font-weight: 600;
    /* Texte foncé pour une bonne lisibilité */
    color: ${props => props.$isOwn 
      ? 'rgba(255, 255, 255, 0.9)'  /* Blanc pour messages à droite */
      : '#374151'                    /* Gris foncé pour messages à gauche */
    };
    margin-bottom: 2px;
  }
  
  .reply-content {
    font-size: 12px;
    /* Texte légèrement plus clair mais toujours lisible */
    color: ${props => props.$isOwn 
      ? 'rgba(255, 255, 255, 0.75)' 
      : '#6B7280'
    };
    max-height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
  }
  
  @media (max-width: 768px) {
    margin: -6px -10px 6px -10px;
    padding: 5px 8px;
    
    .reply-author {
      font-size: 10px;
    }
    
    .reply-content {
      font-size: 11px;
    }
  }
`;

const ReplyBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #F9FAFB;
  border-top: 1px solid #E5E7EB;
  gap: 12px;
  
  @media (max-width: 768px) {
    position: fixed;
    bottom: 76px; /* Au-dessus de l'input */
    left: 0;
    right: 0;
    z-index: 997;
  }
  
  .reply-info {
    flex: 1;
    
    .replying-to {
      font-size: 12px;
      color: #8B5CF6;
      font-weight: 600;
    }
    
    .reply-preview {
      font-size: 13px;
      color: #6B7280;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    
    &:hover {
      background: #E5E7EB;
      border-radius: 4px;
    }
  }
`;

// === NOUVEAUX COMPOSANTS POUR EMOJI PICKER ===

const EmojiPickerWrapper = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: 70px;
  right: 80px;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'scale(1)' : 'scale(0.95)'};
  transition: all 0.2s ease;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 768px) {
    position: fixed;
    bottom: 80px;
    left: 50%;
    right: auto;
    transform: translateX(-50%) ${props => props.$isOpen ? 'scale(1)' : 'scale(0.95)'};
    width: calc(100vw - 32px);
    max-width: 350px;
  }
  
  .EmojiPickerReact {
    border: none !important;
    border-radius: 12px !important;
    box-shadow: none !important;
    
    @media (max-width: 768px) {
      width: 100% !important;
      height: 350px !important;
    }
  }
  
  /* Masquer la recherche et les tons de peau */
  .epr-search-container {
    display: none !important;
  }
  
  .epr-skin-tones {
    display: none !important;
  }
  
  /* Masquer la barre de navigation des catégories (icônes) */
  .epr-category-nav {
    display: none !important;
  }
  
  /* Ajuster le header après suppression de la navigation */
  .epr-header {
    min-height: auto !important;
    padding: 0 !important;
    border-bottom: none !important;
  }
  
  /* Style pour les labels de catégories en français */
  .epr-emoji-category-label {
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #6B7280 !important;
    padding: 8px 12px !important;
    background: #F9FAFB !important;
    border-radius: 8px !important;
    margin: 8px 8px 4px 8px !important;
  }
  
  /* Augmenter la taille des emojis dans le picker */
  .epr-emoji-img,
  .epr-emoji {
    width: 36px !important;
    height: 36px !important;
    font-size: 28px !important;
  }
  
  /* Ajuster l'espacement pour les emojis plus grands */
  .epr-emoji-category > .epr-grid {
    gap: 8px !important;
    padding: 8px !important;
  }
  
  /* Ajuster la taille du conteneur d'emoji au survol */
  button.epr-emoji {
    width: 42px !important;
    height: 42px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
`;

// Menu contextuel des emojis
const EmojiMenu = styled.div<{ show: boolean; x: number; y: number }>`
  position: fixed;
  background: white;
  border-radius: 20px;
  padding: 8px 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: ${props => props.show ? 'flex' : 'none'};
  gap: 8px;
  z-index: 1000;
  
  /* Desktop - position calculée */
  @media (min-width: 769px) {
    left: ${props => props.x}px;
    top: ${props => props.y}px;
    animation: fadeIn 0.2s ease-out;
  }
  
  /* MOBILE - toujours centré en bas */
  @media (max-width: 768px) {
    bottom: 100px !important; /* Au-dessus du clavier/input */
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: auto !important;
    max-width: calc(100vw - 32px) !important;
    justify-content: center !important;
    animation: slideUp 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;

const EmojiOption = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f0f0;
    transform: scale(1.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

// Nouveau bouton de réaction dédié
const ReactionTrigger = styled.button<{ $isOwn: boolean }>`
  position: absolute;
  bottom: 8px;  /* Aligner avec le bas de la bulle */
  ${props => props.$isOwn 
    ? 'left: -50px;'   /* À GAUCHE et à l'EXTÉRIEUR pour nos messages */
    : 'right: -50px;'  /* À DROITE et à l'EXTÉRIEUR pour les autres */
  }
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #F5F5F5;  /* Gris très clair */
  border: 1px solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: #EBEBEB;
    opacity: 1 !important;
  }
  
  &:active {
    background: #E0E0E0;
  }
  
  /* Icône SVG au lieu d'emoji */
  svg {
    width: 18px;
    height: 18px;
    color: #757575;
  }
`;

// Container pour les réactions affichées - DANS la bulle
const ReactionsContainer = styled.div<{ $isOwn: boolean }>`
  position: absolute;
  bottom: -8px; /* À cheval sur le bord BAS */
  ${props => props.$isOwn 
    ? 'right: 12px;'  /* En bas à DROITE pour nos messages */
    : 'left: 12px;'   /* En bas à GAUCHE pour les autres */
  }
  display: flex;
  gap: 2px;
  z-index: 2;
`;

const ReactionPill = styled.div`
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1px 6px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  &:hover {
    transform: scale(1.1);
  }
  
  span {
    font-size: 10px;
    color: #6B7280;
    font-weight: 500;
  }
`;

const QuickEmojiBar = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 0;
  margin-right: 8px;
  border-right: 1px solid #E5E7EB;
  
  @media (max-width: 480px) {
    display: none; // Masquer sur très petits écrans
  }
`;

const QuickEmojiButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #F3F4F6;
    transform: scale(1.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const EmojiToggleButton = styled.button<{ $isActive: boolean }>`
  background: ${props => props.$isActive ? 'linear-gradient(135deg, #10B981, #8B5CF6)' : 'none'};
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$isActive ? 1 : 0.6};
  transition: all 0.2s;
  border-radius: 8px;
  
  &:hover {
    opacity: 1;
    background: ${props => props.$isActive ? 'linear-gradient(135deg, #10B981, #8B5CF6)' : '#F3F4F6'};
  }
`;

const EmojiOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  position: fixed;
  inset: 0;
  z-index: 999;
  
  @media (max-width: 768px) {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
  }
`;

// === COMPOSANT MessageReplyInfo ===
interface MessageReplyInfoProps {
  replyToId: number;
  isOwn: boolean;
}

const MessageReplyInfo: React.FC<MessageReplyInfoProps> = ({ replyToId, isOwn }) => {
  const [replyMessage, setReplyMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  useEffect(() => {
    const fetchReplyMessage = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_reply_message_info', {
            p_message_id: replyToId
          });
        
        if (data && data.length > 0) {
          setReplyMessage(data[0]);
        }
      } catch (err) {
        console.error('Erreur chargement réponse:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReplyMessage();
  }, [replyToId, supabase]);
  
  if (loading || !replyMessage) return null;
  
  return (
    <ReplyIndicator $isOwn={isOwn}>
      <div className="reply-author">
        {replyMessage.author_name || 'Membre Aurora50'}
      </div>
      <div className="reply-content">
        {replyMessage.is_deleted ? '🚫 Message supprimé' : replyMessage.content}
      </div>
    </ReplyIndicator>
  );
};

// === COMPOSANT PRINCIPAL ===

interface ChatRoomProps {
  onToggleSidebar?: () => void;
  mentionName?: string;
  onMentionHandled?: () => void;
}

interface ReactionSummary {
  emoji: string;
  count: number;
  has_reacted: boolean;
  users: {
    user_id?: string;
    id?: string;
    full_name?: string;
    avatar_url?: string | null;
  }[];
}

interface MessageWithReply {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  is_deleted?: boolean;
  deleted_at?: string;
  reply_to_id?: number;
  reply_to?: {
    id: number;
    content: string;
    author_name: string;
    is_deleted: boolean;
  };
  profiles?: {
    full_name?: string;
    avatar_url?: string | null;
  };
}

export default function ChatRoom({ onToggleSidebar, mentionName, onMentionHandled }: ChatRoomProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { user } = useAuth();
  const { messages: originalMessages, loading, error, sendMessage, refresh } = useRealtimeChat();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const [emojiMenu, setEmojiMenu] = useState<{
    show: boolean;
    messageId: number | null;
    x: number;
    y: number;
  }>({ show: false, messageId: null, x: 0, y: 0 });

  const [reactions, setReactions] = useState<Record<number, ReactionSummary[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // States pour suppression et réponse
  const [messageMenu, setMessageMenu] = useState<{
    show: boolean;
    messageId: number | null;
    x: number;
    y: number;
    isOwn: boolean;
    content: string;
    author: string;
  }>({ show: false, messageId: null, x: 0, y: 0, isOwn: false, content: '', author: '' });

  const [replyTo, setReplyTo] = useState<{
    id: number;
    content: string;
    author: string;
  } | null>(null);

  const [replyMessages, setReplyMessages] = useState<Record<number, any>>({});

  // Emojis rapides populaires
  const quickEmojis = ['👍', '❤️', '😊', '😂', '🎉', '🌿', '💪', '🙏'];

  // Fonction pour détecter si un message contient uniquement des emojis
  const isEmojiOnly = (text: string): boolean => {
    const emojiRegex = /^[\p{Emoji}\p{Emoji_Component}\s]+$/u;
    return emojiRegex.test(text.trim()) && text.trim().length <= 6;
  };

  // Synchroniser les messages originaux avec l'état local
  useEffect(() => {
    setMessages(originalMessages);
  }, [originalMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Charger les réactions et s'abonner aux changements - OPTIMISÉ
  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }
  
    // Charger initial
    loadReactions();
  
    const channel = supabase
      .channel('reactions-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'message_reactions'
      }, (payload: any) => {
        // Rafraîchir SEULEMENT le message concerné
        const messageId = payload.new?.message_id || payload.old?.message_id;
        
        if (messageId && messages.some(m => m.id === messageId)) {
          // Charger les réactions pour CE message uniquement
          supabase
            .rpc('get_message_reactions_summary', {
              p_message_id: messageId
            })
            .then(({ data, error }) => {
              if (!error && data) {
                setReactions(prev => ({
                  ...prev,
                  [messageId]: data
                }));
              }
            });
        }
      })
      .subscribe();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [messages, supabase]);


  // Gérer les mentions
  useEffect(() => {
    if (mentionName) {
      setNewMessage(prev => {
        // Ajouter la mention au début ou après un espace si du texte existe déjà
        const mention = `@${mentionName} `;
        if (prev) {
          return `${prev} ${mention}`;
        }
        return mention;
      });
      
      // Focus sur l'input
      inputRef.current?.focus();
      
      // Notifier que la mention a été gérée
      if (onMentionHandled) {
        onMentionHandled();
      }
    }
  }, [mentionName, onMentionHandled]);

  // Fermer le picker quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Ne pas fermer si on clique sur le picker lui-même ou le bouton toggle
      if (emojiPickerRef.current && 
          !emojiPickerRef.current.contains(target) &&
          !target.closest('.emoji-toggle-btn')) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showEmojiPicker]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEmojiPicker) {
        setShowEmojiPicker(false);
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showEmojiPicker]);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setEmojiMenu({ show: false, messageId: null, x: 0, y: 0 });
    };

    if (emojiMenu.show) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [emojiMenu.show]);

  // Fermer le menu contextuel des messages si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = () => {
      setMessageMenu({ show: false, messageId: null, x: 0, y: 0, isOwn: false, content: '', author: '' });
    };

    if (messageMenu.show) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [messageMenu.show]);

  // Charger les infos de réponse pour les messages
  useEffect(() => {
    const loadReplyInfo = async () => {
      const messagesWithReply = messages.filter((m: any) => m.reply_to_id);
      
      for (const message of messagesWithReply) {
        const msg = message as any;
        if (!replyMessages[msg.reply_to_id]) {
          const { data, error } = await supabase
            .rpc('get_reply_message_info', {
              p_message_id: msg.reply_to_id
            });
          
          if (data && data.length > 0) {
            setReplyMessages(prev => ({
              ...prev,
              [msg.reply_to_id]: data[0]
            }));
          }
        }
      }
    };
    
    if (messages.length > 0) {
      loadReplyInfo();
    }
  }, [messages, supabase]);

  // Gestionnaire de clic sur le bouton de réaction
  const handleReactionButtonClick = (e: React.MouseEvent, messageId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Sur mobile, on ignore x et y car le CSS centrera le menu
      setEmojiMenu({
        show: true,
        messageId,
        x: 0, // Ignoré sur mobile
        y: 0  // Ignoré sur mobile  
      });
    } else {
      // Desktop uniquement - logique de positionnement
      const rect = e.currentTarget.getBoundingClientRect();
      const isOwn = messages.find(m => m.id === messageId)?.user_id === user?.id;
      
      // Dimensions du menu
      const menuWidth = 280;
      const menuHeight = 60;
      
      let x = isOwn 
        ? rect.left - menuWidth - 10
        : rect.right + 10;
        
      // Vérifier les limites de l'écran
      if (x < 10) x = 10;
      if (x + menuWidth > window.innerWidth - 10) {
        x = window.innerWidth - menuWidth - 10;
      }
      
      let y = rect.top + (rect.height / 2) - (menuHeight / 2);
      y = Math.max(10, Math.min(y, window.innerHeight - menuHeight - 10));
      
      setEmojiMenu({
        show: true,
        messageId,
        x,
        y
      });
    }
  };

  // Gérer la sélection d'emoji avec OPTIMISTIC UI - CORRIGÉ pour REMPLACER
  const handleEmojiSelect = async (emoji: string, messageId?: number) => {
    if (!user) return;
    
    const targetMessageId = messageId || emojiMenu.messageId;
    if (!targetMessageId) return;
    
    // OPTIMISTIC UPDATE - Logique corrigée pour REMPLACER au lieu d'AJOUTER
    setReactions(prev => {
      const messageReactions = prev[targetMessageId] || [];
      
      // Vérifier si l'utilisateur a DÉJÀ une réaction sur ce message
      const userExistingReaction = messageReactions.find(r => r.has_reacted);
      const targetReaction = messageReactions.find(r => r.emoji === emoji);
      
      if (userExistingReaction && userExistingReaction.emoji === emoji) {
        // L'utilisateur clique sur SA réaction actuelle = la retirer
        if (userExistingReaction.count === 1) {
          // Dernière réaction de ce type, la supprimer
          return {
            ...prev,
            [targetMessageId]: messageReactions.filter(r => r.emoji !== emoji)
          };
        } else {
          // D'autres ont aussi cette réaction
          return {
            ...prev,
            [targetMessageId]: messageReactions.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count - 1, has_reacted: false }
                : r
            )
          };
        }
      } else if (userExistingReaction && userExistingReaction.emoji !== emoji) {
        // L'utilisateur CHANGE de réaction - REMPLACER l'ancienne par la nouvelle
        let updatedReactions = [...messageReactions];
        
        // 1. Retirer l'ancienne réaction
        if (userExistingReaction.count === 1) {
          // Supprimer l'ancienne si c'était la seule
          updatedReactions = updatedReactions.filter(r => r.emoji !== userExistingReaction.emoji);
        } else {
          // Décrémenter l'ancienne
          updatedReactions = updatedReactions.map(r => 
            r.emoji === userExistingReaction.emoji 
              ? { ...r, count: r.count - 1, has_reacted: false }
              : r
          );
        }
        
        // 2. Ajouter la nouvelle réaction
        if (targetReaction) {
          // Cette réaction existe déjà (par d'autres)
          updatedReactions = updatedReactions.map(r => 
            r.emoji === emoji 
              ? { ...r, count: r.count + 1, has_reacted: true }
              : r
          );
        } else {
          // Nouvelle réaction
          updatedReactions.push({
            emoji,
            count: 1,
            has_reacted: true,
            users: [{
              user_id: user.id,
              full_name: user.user_metadata?.full_name || 'Membre',
              avatar_url: user.user_metadata?.avatar_url
            }]
          });
        }
        
        return {
          ...prev,
          [targetMessageId]: updatedReactions
        };
        
      } else if (!userExistingReaction) {
        // L'utilisateur n'a pas encore de réaction - AJOUTER normalement
        if (targetReaction) {
          // Cette réaction existe déjà (par d'autres)
          return {
            ...prev,
            [targetMessageId]: messageReactions.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, has_reacted: true }
                : r
            )
          };
        } else {
          // Nouvelle réaction
          return {
            ...prev,
            [targetMessageId]: [...messageReactions, {
              emoji,
              count: 1,
              has_reacted: true,
              users: [{
                user_id: user.id,
                full_name: user.user_metadata?.full_name || 'Membre',
                avatar_url: user.user_metadata?.avatar_url
              }]
            }]
          };
        }
      }
      
      return prev;
    });
    
    // Fermer le menu
    if (emojiMenu.show) {
      setEmojiMenu({ show: false, messageId: null, x: 0, y: 0 });
    }
    
    // Appel serveur en arrière-plan (sans attendre)
    supabase
      .rpc('toggle_message_reaction', {
        p_message_id: targetMessageId,
        p_emoji: emoji
      })
      .then(({ error }) => {
        if (error) {
          console.error('Erreur réaction:', error);
          // En cas d'erreur, recharger les vraies données
          loadReactions();
        }
      });
  };
  
  // Charger toutes les réactions en UN SEUL appel - OPTIMISÉ
  const loadReactions = async () => {
    if (!messages || messages.length === 0) return;
    
    try {
      const messageIds = messages.map(m => m.id);
      
      // UN SEUL appel RPC pour TOUS les messages
      const { data, error } = await supabase
        .rpc('get_all_message_reactions_batch', {
          p_message_ids: messageIds
        });
      
      if (!error && data) {
        // Convertir l'objet retourné en format attendu
        const formattedReactions: Record<number, any[]> = {};
        
        Object.entries(data).forEach(([messageId, reactions]) => {
          formattedReactions[parseInt(messageId)] = reactions as any[];
        });
        
        setReactions(formattedReactions);
      }
    } catch (err) {
      console.error('Erreur chargement réactions:', err);
    }
  };

  // Récupérer les réactions pour l'affichage
  const getGroupedReactions = (messageId: number) => {
    // Les réactions sont déjà groupées par la fonction RPC
    const messageReactions = reactions[messageId] || [];
    return messageReactions;
  };

  // Gérer la sélection d'emoji du picker
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      const newText = 
        newMessage.substring(0, start) + 
        emojiData.emoji + 
        newMessage.substring(end);
      
      setNewMessage(newText);
      
      // Replacer le curseur après l'emoji
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = start + emojiData.emoji.length;
          inputRef.current.setSelectionRange(newPosition, newPosition);
          inputRef.current.focus();
        }
      }, 0);
    }
    
    // Ne pas fermer le picker après sélection pour permettre plusieurs emojis
    // setShowEmojiPicker(false);
  };

  // Ajouter un emoji rapide
  const handleQuickEmoji = (emoji: string) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || 0;
      const newText = 
        newMessage.substring(0, start) + 
        emoji + 
        newMessage.substring(end);
      
      setNewMessage(newText);
      
      // Focus et repositionner le curseur
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = start + emoji.length;
          inputRef.current.setSelectionRange(newPosition, newPosition);
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  // Gérer le clic long/droit sur un message
  const handleMessageContextMenu = (e: React.MouseEvent | React.TouchEvent, message: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isTouch = 'touches' in e;
    const x = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Ajuster la position pour ne pas sortir de l'écran
    const menuWidth = 180;
    const menuHeight = 120;
    
    let adjustedX = x;
    let adjustedY = y;
    
    if (x + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - 10;
    }
    
    if (y + menuHeight > window.innerHeight) {
      adjustedY = y - menuHeight;
    }
    
    setMessageMenu({
      show: true,
      messageId: message.id,
      x: adjustedX,
      y: adjustedY,
      isOwn: message.user_id === user?.id,
      content: message.content,
      author: message.profiles?.full_name || 'Membre Aurora50'
    });
  };

  // Supprimer un message avec optimistic update
  const handleDeleteMessage = async () => {
    if (!messageMenu.messageId) return;
    
    // OPTIMISTIC UPDATE - Marquer immédiatement comme supprimé
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageMenu.messageId 
          ? { ...msg, is_deleted: true, content: '🚫 Message supprimé', deleted_at: new Date().toISOString() } as any
          : msg
      )
    );
    
    // Fermer le menu
    setMessageMenu({ show: false, messageId: null, x: 0, y: 0, isOwn: false, content: '', author: '' });
    
    // Appel serveur en arrière-plan
    const { error } = await supabase
      .rpc('delete_message', {
        p_message_id: messageMenu.messageId
      });
    
    if (error) {
      console.error('Erreur suppression:', error);
      // En cas d'erreur, recharger les vrais messages
      refresh();
    }
  };

  // Répondre à un message
  const handleReplyMessage = () => {
    if (!messageMenu.messageId) return;
    
    setReplyTo({
      id: messageMenu.messageId,
      content: messageMenu.content,
      author: messageMenu.author
    });
    
    setMessageMenu({ show: false, messageId: null, x: 0, y: 0, isOwn: false, content: '', author: '' });
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setShowEmojiPicker(false); // Fermer le picker lors de l'envoi
    try {
      // Passer le reply_to_id si on répond à un message
      if (replyTo) {
        await sendMessage(newMessage.trim(), replyTo.id);
      } else {
        await sendMessage(newMessage.trim());
      }
      
      setNewMessage('');
      setReplyTo(null); // Réinitialiser la réponse
    } catch (err) {
      console.error('Erreur envoi:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <ChatContainer>
        <LoadingContainer>
          <span>🌿 Chargement du chat...</span>
        </LoadingContainer>
      </ChatContainer>
    );
  }

  if (error) {
    return (
      <ChatContainer>
        <LoadingContainer>
          <span>❌ Erreur: {error}</span>
        </LoadingContainer>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>Chat Communautaire</ChatTitle>
        {onToggleSidebar && (
          <ToggleSidebarButton onClick={onToggleSidebar}>
            <span>👥</span>
            <span>Membres</span>
          </ToggleSidebarButton>
        )}
      </ChatHeader>
      <MessagesContainer>
        {messages.length === 0 ? (
          <WelcomeMessage>
            <h3>Bienvenue dans l'espace communautaire 🌿</h3>
            <p>Soyez la première à lancer la conversation !</p>
          </WelcomeMessage>
        ) : (
          messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            return (
              <MessageWrapper key={message.id}>
                <MessageBubble $isOwn={isOwn}>
                  <MessageWrapperWithReaction $isOwn={isOwn}>
                    {!isOwn && (
                      <AvatarWrapper>
                        <Avatar
                          userId={message.user_id}
                          fullName={message.profiles?.full_name}
                          avatarUrl={message.profiles?.avatar_url}
                          size="small"
                        />
                      </AvatarWrapper>
                    )}
                    
                    <div>
                      <MessageInfo $isOwn={isOwn}>
                        {!isOwn && (
                          <UserName>{message.profiles?.full_name || 'Membre Aurora'}</UserName>
                        )}
                        <TimeStamp>
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </TimeStamp>
                      </MessageInfo>
                      
                      {/* WRAPPER AUTOUR DE MessageContent UNIQUEMENT */}
                      <MessageContentWrapper
                        onContextMenu={(e) => handleMessageContextMenu(e, message)}
                        onTouchStart={(e) => {
                          const touch = e.touches[0];
                          longPressTimer.current = setTimeout(() => {
                            handleMessageContextMenu(e, message);
                          }, 500); // Long press 500ms
                        }}
                        onTouchEnd={() => {
                          if (longPressTimer.current) {
                            clearTimeout(longPressTimer.current);
                            longPressTimer.current = null;
                          }
                        }}
                        onTouchMove={() => {
                          if (longPressTimer.current) {
                            clearTimeout(longPressTimer.current);
                            longPressTimer.current = null;
                          }
                        }}
                      >
                        <MessageContent $isOwn={isOwn} $isEmojiOnly={isEmojiOnly(message.content)}>
                          {/* Afficher l'indicateur de réponse DANS la bulle */}
                          {(message as any).reply_to_id && (
                            <MessageReplyInfo 
                              replyToId={(message as any).reply_to_id} 
                              isOwn={isOwn}
                            />
                          )}
                          
                          {/* Contenu du message */}
                          {(message as any).is_deleted ? (
                            <span style={{ fontStyle: 'italic', color: '#9CA3AF' }}>
                              🚫 Message supprimé
                            </span>
                          ) : (
                            <div>{message.content}</div>
                          )}
                        </MessageContent>
                        
                        {/* Bouton de réaction */}
                        <ReactionTrigger
                          className="reaction-trigger"
                          $isOwn={isOwn}
                          onClick={(e) => handleReactionButtonClick(e, message.id)}
                          aria-label="Ajouter une réaction"
                        >
                          {/* Icône emoji SVG style WhatsApp */}
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            <line x1="9" y1="9" x2="9.01" y2="9"/>
                            <line x1="15" y1="9" x2="15.01" y2="9"/>
                          </svg>
                        </ReactionTrigger>
                        
                        {/* RÉACTIONS À L'INTÉRIEUR DE LA BULLE */}
                        {reactions[message.id] && reactions[message.id].length > 0 && (
                          <ReactionsContainer $isOwn={isOwn}>
                            {getGroupedReactions(message.id).map((reaction: any) => (
                              <ReactionPill 
                                key={reaction.emoji}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmojiSelect(reaction.emoji, message.id);
                                }}
                                style={{
                                  opacity: reaction.has_reacted ? 1 : 0.8
                                }}
                              >
                                {reaction.emoji}
                                {reaction.count > 1 && <span>{reaction.count}</span>}
                              </ReactionPill>
                            ))}
                          </ReactionsContainer>
                        )}
                      </MessageContentWrapper>
                    </div>
                  </MessageWrapperWithReaction>
                </MessageBubble>
              </MessageWrapper>
            );
          })
        )}
        {/* Spacer additionnel pour garantir la visibilité du dernier message */}
        <div style={{ height: '20px' }} />
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Overlay sombre pour mobile */}
      {emojiMenu.show && window.innerWidth <= 768 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 999
          }}
          onClick={() => setEmojiMenu({ show: false, messageId: null, x: 0, y: 0 })}
        />
      )}

      {/* Menu contextuel des emojis */}
      <EmojiMenu 
        show={emojiMenu.show} 
        x={emojiMenu.x} 
        y={emojiMenu.y}
        onClick={(e) => e.stopPropagation()}
      >
        {REACTION_EMOJIS.map(emoji => (
          <EmojiOption
            key={emoji}
            onClick={() => handleEmojiSelect(emoji)}
          >
            {emoji}
          </EmojiOption>
        ))}
      </EmojiMenu>

      {/* Menu contextuel du message */}
      <MessageContextMenu 
        show={messageMenu.show} 
        x={messageMenu.x} 
        y={messageMenu.y}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuOption onClick={handleReplyMessage}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
          </svg>
          Répondre
        </MenuOption>
        
        {messageMenu.isOwn && (
          <MenuOption className="danger" onClick={handleDeleteMessage}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Supprimer
          </MenuOption>
        )}
      </MessageContextMenu>

      {/* Barre de réponse avant l'input */}
      {replyTo && (
        <ReplyBar>
          <div className="reply-info">
            <div className="replying-to">Réponse à {replyTo.author}</div>
            <div className="reply-preview">{replyTo.content}</div>
          </div>
          <button onClick={() => setReplyTo(null)}>✕</button>
        </ReplyBar>
      )}

      <InputContainer onSubmit={handleSubmit}>
        <InputWrapper>
          {/* Emojis rapides */}
          <QuickEmojiBar>
            {quickEmojis.map(emoji => (
              <QuickEmojiButton
                key={emoji}
                type="button"
                onClick={() => handleQuickEmoji(emoji)}
                title={`Ajouter ${emoji}`}
              >
                {emoji}
              </QuickEmojiButton>
            ))}
          </QuickEmojiBar>
          
          {/* Bouton toggle emoji picker */}
          <EmojiToggleButton
            type="button"
            className="emoji-toggle-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            $isActive={showEmojiPicker}
            title="Ouvrir le sélecteur d'emojis"
          >
            😊
          </EmojiToggleButton>
          
          <MessageInput
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            disabled={sending}
            maxLength={500}
            autoFocus
          />
        </InputWrapper>
        
        <SendButton type="submit" disabled={!newMessage.trim() || sending}>
          {sending ? (
            '...'
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </SendButton>
      </InputContainer>
      
      {/* Overlay pour mobile */}
      <EmojiOverlay $isOpen={showEmojiPicker} onClick={() => setShowEmojiPicker(false)} />
      
      {/* Emoji Picker */}
      <EmojiPickerWrapper $isOpen={showEmojiPicker} ref={emojiPickerRef}>
        {showEmojiPicker && (
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={350}
            height={350}  // Hauteur réduite car pas de barre de recherche
            previewConfig={{ 
              showPreview: false,
              defaultCaption: "Choisissez un emoji"
            }}
            searchDisabled={true}  // Désactive la barre de recherche
            skinTonesDisabled={true}  // Désactive le sélecteur de tons de peau
            lazyLoadEmojis={true}
            categories={[
              {
                category: Categories.SUGGESTED,
                name: 'Récents'
              },
              {
                category: Categories.SMILEYS_PEOPLE,
                name: 'Émotions'
              },
              {
                category: Categories.ANIMALS_NATURE,
                name: 'Nature'
              },
              {
                category: Categories.FOOD_DRINK,
                name: 'Nourriture'
              },
              {
                category: Categories.TRAVEL_PLACES,
                name: 'Voyages'
              },
              {
                category: Categories.ACTIVITIES,
                name: 'Activités'
              },
              {
                category: Categories.OBJECTS,
                name: 'Objets'
              },
              {
                category: Categories.SYMBOLS,
                name: 'Symboles'
              },
              {
                category: Categories.FLAGS,
                name: 'Drapeaux'
              }
            ]}
          />
        )}
      </EmojiPickerWrapper>
    </ChatContainer>
  );
}
