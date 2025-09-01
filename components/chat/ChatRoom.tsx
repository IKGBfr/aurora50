'use client';

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useRealtimeChat } from '@/lib/hooks/useRealtimeChat';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Avatar from '@/components/ui/Avatar';
import EmojiPicker, { EmojiClickData, Categories } from 'emoji-picker-react';

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
    top: 60px; /* Positionné sous la topbar LMS (60px) */
    left: 0;
    right: 0;
    z-index: 998; /* Sous la topbar LMS mais au-dessus du reste */
    height: 56px;
    display: flex;
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
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px; /* Réduire l'espacement entre messages */

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
    padding-top: 116px; /* 60px (header LMS) + 56px (header chat) */
    padding-bottom: 80px; /* Pour l'input fixé en bas */
  }
`;

const MessageBubble = styled.div<{ $isOwn: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
`;

const MessageWrapper = styled.div<{ $isOwn: boolean }>`
  display: flex;
  flex-direction: ${props => props.$isOwn ? 'row-reverse' : 'row'};
  align-items: flex-end;
  gap: 12px;
  max-width: 70%;
  min-width: 60px;
`;

const AvatarWrapper = styled.div`
  flex-shrink: 0;
`;

const MessageContent = styled.div<{ $isOwn: boolean; $isEmojiOnly?: boolean }>`
  padding: ${props => props.$isEmojiOnly ? '8px 12px' : '12px 16px'};
  border-radius: 18px;
  word-wrap: break-word;
  box-shadow: ${props => props.$isEmojiOnly ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)'};
  font-size: ${props => props.$isEmojiOnly ? '32px' : '18px'};
  line-height: ${props => props.$isEmojiOnly ? '1' : '1.5'};
  min-width: ${props => props.$isEmojiOnly ? 'auto' : '60px'};
  
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
  
  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 998;
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

// === COMPOSANT PRINCIPAL ===

interface ChatRoomProps {
  onToggleSidebar?: () => void;
  mentionName?: string;
  onMentionHandled?: () => void;
}

export default function ChatRoom({ onToggleSidebar, mentionName, onMentionHandled }: ChatRoomProps) {
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useRealtimeChat();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Emojis rapides populaires
  const quickEmojis = ['👍', '❤️', '😊', '😂', '🎉', '🌿', '💪', '🙏'];

  // Fonction pour détecter si un message contient uniquement des emojis
  const isEmojiOnly = (text: string): boolean => {
    const emojiRegex = /^[\p{Emoji}\p{Emoji_Component}\s]+$/u;
    return emojiRegex.test(text.trim()) && text.trim().length <= 6;
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Gérer la sélection d'emoji
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setShowEmojiPicker(false); // Fermer le picker lors de l'envoi
    try {
      await sendMessage(newMessage.trim());
      setNewMessage('');
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
              <MessageBubble key={message.id} $isOwn={isOwn}>
                <MessageWrapper $isOwn={isOwn}>
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
                    
                    <MessageContent $isOwn={isOwn} $isEmojiOnly={isEmojiOnly(message.content)}>
                      {message.content}
                    </MessageContent>
                  </div>
                </MessageWrapper>
              </MessageBubble>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

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
