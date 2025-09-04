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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  overscroll-behavior: none;

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
    height: 100%; /* S'adapte au conteneur parent */
    
    &::before {
      font-size: 20px;
      top: 76px;
      right: 16px;
    }
  }
  
  @media (min-width: 768px) and (max-width: 1024px) {
    height: 100%; /* Idem pour tablette */
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
    top: 60px;
    left: 0;
    right: 0;
    z-index: 998;
    height: 56px;
    display: flex;
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
  padding: 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  min-height: 0;
  overscroll-behavior-y: contain;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;

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
    padding-bottom: 20px;
    padding-left: 8px;
    padding-right: 8px;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
  }
  
  @media (max-width: 480px) {
    padding-bottom: 20px;
    padding-left: 8px;
    padding-right: 8px;
  }
`;

const MessageWrapper = styled.div`
  position: relative;
`;

const MessageContentWrapper = styled.div`
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
  margin: 0 45px;
  
  @media (max-width: 768px) {
    margin: 0 35px;
  }
  
  @media (max-width: 480px) {
    margin: 0 30px;
  }
  
  &:hover .action-button {
    opacity: 0.6;
  }
`;

// Bouton d'action unifié (remplace ReactionTrigger et MessageMenuButton)
const ActionButton = styled.button<{ $isOwn: boolean }>`
  position: absolute;
  bottom: 8px;
  ${props => props.$isOwn ? 'left: -35px;' : 'right: -35px;'}
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, background 0.2s ease;
  z-index: 10;
  padding: 0;
  
  &:hover {
    background: #ffffff;
    opacity: 1 !important;
  }
  
  &:active {
    background: #ffffff;
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: #757575;
  }
  
  @media (max-width: 768px) {
    opacity: 0.1;
    ${props => props.$isOwn ? 'left: -30px;' : 'right: -30px;'}
  }
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 8px;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  position: relative;
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
  max-width: calc(70% - 45px);
  min-width: 60px;
  word-break: break-word;
  
  @media (max-width: 768px) {
    max-width: calc(90% - 45px);
  }
  
  @media (max-width: 480px) {
    max-width: calc(95% - 45px);
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
  user-select: text;
  
  /* Style de sélection personnalisé */
  &::selection {
    background-color: ${props => props.$isOwn ? 'rgba(255,255,255,0.3)' : 'rgba(139,92,246,0.2)'};
  }
  
  @media (max-width: 768px) {
    font-size: ${props => props.$isEmojiOnly ? '28px' : '16px'};
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

// Menu unifié (remplace EmojiMenu et MessageContextMenu)
const UnifiedMenu = styled.div<{ show: boolean; x: number; y: number }>`
  position: fixed;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: ${props => props.show ? 'block' : 'none'};
  z-index: 1001;
  padding: 8px;
  min-width: 280px;
  animation: ${props => props.show ? 'fadeIn 0.2s ease-out' : 'none'};
  
  .emoji-section {
    display: flex;
    gap: 8px;
    padding: 8px;
    border-bottom: 1px solid #E5E7EB;
    justify-content: center;
  }
  
  .actions-section {
    padding-top: 4px;
  }
  
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
  
  @media (max-width: 768px) {
    bottom: 100px;
    left: 50% !important;
    top: auto !important;
    transform: translateX(-50%);
    width: calc(100vw - 32px);
    max-width: 320px;
  }
`;

const EmojiButton = styled.button`
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
  border-radius: 8px;
  
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

const ReactionsContainer = styled.div<{ $isOwn: boolean }>`
  position: absolute;
  bottom: -8px;
  ${props => props.$isOwn ? 'right: 12px;' : 'left: 12px;'}
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

const InputContainer = styled.form`
  padding: 16px 20px;
  background: #f0f0f0;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 80px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    min-height: 72px;
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

const ReplyIndicator = styled.div<{ $isOwn?: boolean }>`
  background: ${props => props.$isOwn 
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(249, 250, 251, 0.95)'
  };
  border-left: 3px solid ${props => props.$isOwn ? 'rgba(255, 255, 255, 0.3)' : '#E5E7EB'};
  padding: 6px 10px;
  margin: -8px -12px 8px -12px;
  border-radius: 12px 12px 0 0;
  
  .reply-author {
    font-size: 11px;
    font-weight: 600;
    color: ${props => props.$isOwn 
      ? 'rgba(255, 255, 255, 0.9)'
      : '#374151'
    };
    margin-bottom: 2px;
  }
  
  .reply-content {
    font-size: 12px;
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
    bottom: 76px;
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

const QuickEmojiBar = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 0;
  margin-right: 8px;
  border-right: 1px solid #E5E7EB;
  
  @media (max-width: 480px) {
    display: none;
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
  salonId?: string; // AJOUT pour support des salons
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

export default function ChatRoom({ onToggleSidebar, mentionName, onMentionHandled, salonId }: ChatRoomProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { user } = useAuth();
  const { messages: originalMessages, loading, error, sendMessage, refresh } = useRealtimeChat(salonId); // PASSAGE du salonId au hook
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const [reactions, setReactions] = useState<Record<number, ReactionSummary[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // State pour détecter le double tap sur mobile
  const [lastTap, setLastTap] = useState<number>(0);

  // État unifié pour le menu
  const [unifiedMenu, setUnifiedMenu] = useState<{
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
  const quickEmojis = ['👍', '❤️', '😊', '😂'];

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

  // Charger les réactions et s'abonner aux changements
  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }
  
    loadReactions();
  
    const channel = supabase
      .channel('reactions-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'message_reactions'
      }, (payload: any) => {
        const messageId = payload.new?.message_id || payload.old?.message_id;
        
        if (messageId && messages.some(m => m.id === messageId)) {
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
        const mention = `@${mentionName} `;
        if (prev) {
          return `${prev} ${mention}`;
        }
        return mention;
      });
      
      inputRef.current?.focus();
      
      if (onMentionHandled) {
        onMentionHandled();
      }
    }
  }, [mentionName, onMentionHandled]);

  // Fermer le picker quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (emojiPickerRef.current && 
          !emojiPickerRef.current.contains(target) &&
          !target.closest('.emoji-toggle-button')) {
        setShowEmojiPicker(false);
      }
      
      // Fermer le menu unifié si on clique ailleurs
      if (unifiedMenu.show && !target.closest('.unified-menu')) {
        setUnifiedMenu(prev => ({ ...prev, show: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, unifiedMenu.show]);

  // Charger les réactions
  const loadReactions = async () => {
    if (!messages.length) return;
    
    const messageIds = messages.map(m => m.id);
    
    try {
      const { data, error } = await supabase
        .rpc('get_all_message_reactions_batch', {
          p_message_ids: messageIds
        });
      
      if (error) {
        console.error('Erreur chargement réactions:', error);
        return;
      }
      
      if (data && typeof data === 'object') {
        // Convertir l'objet retourné en format attendu
        const formattedReactions: Record<number, ReactionSummary[]> = {};
        
        Object.entries(data).forEach(([messageId, reactions]) => {
          formattedReactions[parseInt(messageId)] = reactions as ReactionSummary[];
        });
        
        setReactions(formattedReactions);
      }
    } catch (err) {
      console.error('Erreur chargement réactions:', err);
    }
  };

  // Gestionnaire du bouton d'action unifié
  const handleActionButtonClick = (e: React.MouseEvent, message: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isOwn = message.user_id === user?.id;
    
    setUnifiedMenu({
      show: true,
      messageId: message.id,
      x: rect.left + (isOwn ? -250 : 30),
      y: rect.top - 10,
      isOwn,
      content: message.content,
      author: message.profiles?.full_name || 'Membre Aurora50'
    });
  };

  // Gestionnaire de sélection d'emoji
  const handleEmojiSelect = async (emoji: string, messageId: number) => {
    if (!user) return;
    
    // Fermer le menu
    setUnifiedMenu(prev => ({ ...prev, show: false }));
    
    // Mise à jour optimiste
    setReactions(prev => {
      const messageReactions = prev[messageId] || [];
      const existingReaction = messageReactions.find(r => r.emoji === emoji);
      
      if (existingReaction) {
        if (existingReaction.has_reacted) {
          // Retirer la réaction
          if (existingReaction.count === 1) {
            return {
              ...prev,
              [messageId]: messageReactions.filter(r => r.emoji !== emoji)
            };
          } else {
            return {
              ...prev,
              [messageId]: messageReactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, has_reacted: false }
                  : r
              )
            };
          }
        } else {
          // Ajouter la réaction
          return {
            ...prev,
            [messageId]: messageReactions.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, has_reacted: true }
                : r
            )
          };
        }
      } else {
        // Nouvelle réaction
        return {
          ...prev,
          [messageId]: [...messageReactions, {
            emoji,
            count: 1,
            has_reacted: true,
            users: [{
              user_id: user.id,
              full_name: user.user_metadata?.full_name || 'Membre Aurora50',
              avatar_url: user.user_metadata?.avatar_url
            }]
          }]
        };
      }
    });
    
    // Appel API
    try {
      const { error } = await supabase
        .rpc('toggle_message_reaction', {
          p_message_id: messageId,
          p_emoji: emoji
        });
      
      if (error) {
        console.error('Erreur toggle réaction:', error);
        // Recharger les réactions en cas d'erreur
        loadReactions();
      }
    } catch (err) {
      console.error('Erreur toggle réaction:', err);
      loadReactions();
    }
  };

  // Gestionnaire de double-clic (desktop et mobile)
  const handleDoubleClick = (e: React.MouseEvent | React.TouchEvent, messageId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Empêcher la sélection de texte
    window.getSelection()?.removeAllRanges();
    
    // Utiliser directement handleEmojiSelect avec l'emoji ❤️
    handleEmojiSelect('❤️', messageId);
    
    // Afficher une animation de cœur qui monte
    showHeartAnimation(e);
  };

  // Gestionnaire pour mobile (simule double-tap)
  const handleMessageTap = (e: React.TouchEvent, messageId: number) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap détecté
      e.preventDefault();
      handleDoubleClick(e, messageId);
    }
    
    setLastTap(currentTime);
  };

  // Animation de cœur qui monte
  const showHeartAnimation = (e: React.MouseEvent | React.TouchEvent) => {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.cssText = `
      position: fixed;
      font-size: 30px;
      z-index: 9999;
      pointer-events: none;
      animation: floatHeart 1s ease-out forwards;
    `;
    
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    heart.style.left = `${x - 15}px`;
    heart.style.top = `${y - 15}px`;
    
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  };

  // Répondre à un message
  const handleReply = (message: any) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      author: message.profiles?.full_name || 'Membre Aurora50'
    });
    setUnifiedMenu(prev => ({ ...prev, show: false }));
    inputRef.current?.focus();
  };

  // Supprimer un message
  const handleDelete = async (messageId: number) => {
    setUnifiedMenu(prev => ({ ...prev, show: false }));
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ 
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user?.id);
      
      if (error) {
        console.error('Erreur suppression:', error);
        alert('Impossible de supprimer le message');
      } else {
        refresh();
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    
    try {
      await sendMessage(newMessage.trim(), replyTo?.id);
      setNewMessage('');
      setReplyTo(null);
      setShowEmojiPicker(false);
    } catch (err) {
      console.error('Erreur envoi message:', err);
    } finally {
      setSending(false);
    }
  };

  // Ajouter un emoji au message
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  // Ajouter un emoji rapide
  const handleQuickEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  if (loading) {
    return (
      <ChatContainer>
        <LoadingContainer>
          <div>Chargement des messages...</div>
        </LoadingContainer>
      </ChatContainer>
    );
  }

  if (error) {
    return (
      <ChatContainer>
        <LoadingContainer>
          <div>Erreur: {error}</div>
        </LoadingContainer>
      </ChatContainer>
    );
  }

  return (
    <ChatContainer>
      {/* Messages */}
      <MessagesContainer>
        {messages.length === 0 ? (
          <WelcomeMessage>
            <h3>Bienvenue dans le chat Aurora50 ! 🌿</h3>
            <p>Commencez une conversation avec la communauté</p>
          </WelcomeMessage>
        ) : (
          messages.map((message) => {
            const isOwn = message.user_id === user?.id;
            const messageReactions = reactions[message.id] || [];
            
            return (
              <MessageWrapper key={message.id}>
                <MessageBubble $isOwn={isOwn}>
                  <MessageWrapperWithReaction $isOwn={isOwn}>
                    {!isOwn && (
                      <AvatarWrapper>
                        <Avatar
                          userId={message.user_id}
                          fullName={message.profiles?.full_name || 'Membre Aurora50'}
                          avatarUrl={message.profiles?.avatar_url}
                          size="small"
                        />
                      </AvatarWrapper>
                    )}
                    
                    <div style={{ flex: 1 }}>
                      <MessageInfo $isOwn={isOwn}>
                        <UserName>
                          {message.profiles?.full_name || 'Membre Aurora50'}
                        </UserName>
                        <TimeStamp>
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </TimeStamp>
                      </MessageInfo>
                      
                      <MessageContentWrapper
                        onDoubleClick={(e) => handleDoubleClick(e, message.id)}
                        onTouchEnd={(e) => handleMessageTap(e, message.id)}
                      >
                        {/* Bouton d'action unifié */}
                        <ActionButton
                          className="action-button"
                          $isOwn={isOwn}
                          onClick={(e) => handleActionButtonClick(e, message)}
                          aria-label="Options du message"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                          </svg>
                        </ActionButton>
                        
                        <MessageContent 
                          $isOwn={isOwn} 
                          $isEmojiOnly={isEmojiOnly(message.content)}
                          style={{ cursor: 'pointer' }}
                        >
                          {message.reply_to_id && (
                            <MessageReplyInfo replyToId={message.reply_to_id} isOwn={isOwn} />
                          )}
                          
                          <div>
                            {message.is_deleted ? (
                              <span style={{ fontStyle: 'italic', color: '#9CA3AF' }}>
                                🚫 Message supprimé
                              </span>
                            ) : (
                              message.content
                            )}
                          </div>
                        </MessageContent>
                        
                        {/* Réactions */}
                        {messageReactions.length > 0 && (
                          <ReactionsContainer $isOwn={isOwn}>
                            {messageReactions.map((reaction) => (
                              <ReactionPill
                                key={reaction.emoji}
                                onClick={() => handleEmojiSelect(reaction.emoji, message.id)}
                                style={{
                                  background: reaction.has_reacted 
                                    ? 'linear-gradient(135deg, #10B981, #8B5CF6)' 
                                    : 'white',
                                  color: reaction.has_reacted ? 'white' : 'inherit'
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
                    
                    {isOwn && (
                      <AvatarWrapper>
                        <Avatar
                          userId={message.user_id}
                          fullName={message.profiles?.full_name || 'Vous'}
                          avatarUrl={message.profiles?.avatar_url}
                          size="small"
                        />
                      </AvatarWrapper>
                    )}
                  </MessageWrapperWithReaction>
                </MessageBubble>
              </MessageWrapper>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Menu unifié */}
      <UnifiedMenu 
        className="unified-menu"
        show={unifiedMenu.show} 
        x={unifiedMenu.x} 
        y={unifiedMenu.y}
      >
        {/* Section emojis */}
        <div className="emoji-section">
          {REACTION_EMOJIS.map(emoji => (
            <EmojiButton
              key={emoji}
              onClick={() => handleEmojiSelect(emoji, unifiedMenu.messageId!)}
            >
              {emoji}
            </EmojiButton>
          ))}
        </div>
        
        {/* Section actions */}
        <div className="actions-section">
          <MenuOption onClick={() => handleReply({
            id: unifiedMenu.messageId,
            content: unifiedMenu.content,
            profiles: { full_name: unifiedMenu.author }
          })}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Répondre
          </MenuOption>
          
          {unifiedMenu.isOwn && (
            <MenuOption className="danger" onClick={() => handleDelete(unifiedMenu.messageId!)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </MenuOption>
          )}
        </div>
      </UnifiedMenu>

      {/* Barre de réponse */}
      {replyTo && (
        <ReplyBar>
          <div className="reply-info">
            <div className="replying-to">Réponse à {replyTo.author}</div>
            <div className="reply-preview">{replyTo.content}</div>
          </div>
          <button onClick={() => setReplyTo(null)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </ReplyBar>
      )}

      {/* Zone de saisie */}
      <InputContainer onSubmit={handleSendMessage}>
        <InputWrapper>
          <QuickEmojiBar>
            {quickEmojis.map(emoji => (
              <QuickEmojiButton
                key={emoji}
                type="button"
                onClick={() => handleQuickEmoji(emoji)}
              >
                {emoji}
              </QuickEmojiButton>
            ))}
          </QuickEmojiBar>
          
          <MessageInput
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={replyTo ? `Répondre à ${replyTo.author}...` : "Tapez votre message..."}
            disabled={sending}
          />
          
          <EmojiToggleButton
            type="button"
            className="emoji-toggle-button"
            $isActive={showEmojiPicker}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </EmojiToggleButton>
        </InputWrapper>
        
        <SendButton type="submit" disabled={!newMessage.trim() || sending}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </SendButton>
      </InputContainer>

      {/* Emoji Picker */}
      <EmojiOverlay $isOpen={showEmojiPicker} onClick={() => setShowEmojiPicker(false)} />
      <EmojiPickerWrapper ref={emojiPickerRef} $isOpen={showEmojiPicker}>
        <EmojiPicker
          onEmojiClick={onEmojiClick}
          autoFocusSearch={false}
          searchDisabled
          skinTonesDisabled
          categories={[
            { category: Categories.SUGGESTED, name: 'Récents' },
            { category: Categories.SMILEYS_PEOPLE, name: 'Émotions' },
            { category: Categories.ANIMALS_NATURE, name: 'Nature' },
            { category: Categories.FOOD_DRINK, name: 'Nourriture' },
            { category: Categories.ACTIVITIES, name: 'Activités' },
            { category: Categories.OBJECTS, name: 'Objets' },
            { category: Categories.SYMBOLS, name: 'Symboles' },
            { category: Categories.FLAGS, name: 'Drapeaux' }
          ]}
        />
      </EmojiPickerWrapper>
    </ChatContainer>
  );
}
