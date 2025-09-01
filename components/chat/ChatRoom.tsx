'use client';

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useRealtimeChat } from '@/lib/hooks/useRealtimeChat';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Avatar from '@/components/ui/Avatar';

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
`;

const AvatarWrapper = styled.div`
  flex-shrink: 0;
`;

const MessageContent = styled.div<{ $isOwn: boolean }>`
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  ${props => props.$isOwn ? `
    background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    background: #FFFFFF;
    color: #111827;
    border: 1px solid #E5E7EB;
    border-bottom-left-radius: 4px;
  `}
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
  font-size: 15px;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
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
                    
                    <MessageContent $isOwn={isOwn}>
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
          <EmojiButton type="button" onClick={() => setNewMessage(prev => prev + '🌿')}>
            😊
          </EmojiButton>
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
    </ChatContainer>
  );
}
