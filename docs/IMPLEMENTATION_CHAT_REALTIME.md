# Instructions d'Implémentation - Chat Temps Réel Aurora50

**Date:** 29/08/2025  
**Version:** 1.0.0  
**Priorité:** Phase 1 - Haute

## 📋 Vue d'ensemble

Implémentation d'un système de chat communautaire temps réel pour l'espace membre Aurora50 LMS.

## 🎯 Objectifs

- Permettre aux membres de communiquer en temps réel
- Créer un espace d'échange bienveillant et sécurisé
- Utiliser Supabase Realtime pour la synchronisation instantanée
- Respecter le Design System Aurora50

## 📚 Prérequis

- Table `chat_messages` existante (voir SUPABASE_SCHEMA.md)
- Authentification Supabase configurée
- Emotion installé pour les styles

## 🔧 Étapes d'implémentation

### Étape 1: Configuration Supabase

#### 1.1 Activer Realtime
Exécuter dans Supabase SQL Editor :

```sql
-- Activer Realtime sur la table chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Vérifier que RLS est activé
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
```

#### 1.2 Configurer les politiques RLS

```sql
-- Politique de lecture : tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Authenticated users can read messages" ON chat_messages;
CREATE POLICY "Authenticated users can read messages" ON chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique d'insertion : seulement pour son propre user_id
DROP POLICY IF EXISTS "Users can insert own messages" ON chat_messages;
CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Pas de UPDATE ni DELETE pour préserver l'historique
```

#### 1.3 Créer une vue enrichie (recommandé)

```sql
-- Vue avec les informations de profil
CREATE OR REPLACE VIEW chat_messages_with_profiles AS
SELECT 
  cm.id,
  cm.content,
  cm.created_at,
  cm.user_id,
  p.full_name,
  p.avatar_url
FROM chat_messages cm
LEFT JOIN profiles p ON cm.user_id = p.id
ORDER BY cm.created_at ASC;

-- Activer la sécurité sur la vue
ALTER VIEW chat_messages_with_profiles SET (security_invoker = true);
```

### Étape 2: Hook Realtime

#### 2.1 Créer `/lib/hooks/useRealtimeChat.ts`

```typescript
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatMessage {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useRealtimeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  
  const supabase = createClient();

  // Charger les messages initiaux
  const loadMessages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Envoyer un message
  const sendMessage = useCallback(async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        user_id: user.id
      });

    if (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }, [supabase]);

  // Setup Realtime subscription
  useEffect(() => {
    loadMessages();

    // Créer le channel Realtime
    const newChannel = supabase
      .channel('chat-room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          // Enrichir avec le profil
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const newMessage = {
            ...payload.new,
            profiles: profile
          } as ChatMessage;

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [supabase, loadMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    refresh: loadMessages
  };
}
```

### Étape 3: Composant Chat

#### 3.1 Créer `/components/chat/ChatRoom.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { useRealtimeChat } from '@/lib/hooks/useRealtimeChat';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// === STYLED COMPONENTS AURORA50 ===

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  background: linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%);
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;

  &::before {
    content: '🌿';
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 24px;
    opacity: 0.5;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

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
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-direction: ${props => props.isOwn ? 'row-reverse' : 'row'};
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  object-fit: cover;
  border: 2px solid transparent;
  background: linear-gradient(white, white) padding-box,
              linear-gradient(135deg, #10B981, #8B5CF6) border-box;
`;

const MessageContent = styled.div<{ isOwn: boolean }>`
  max-width: 70%;
  background: ${props => props.isOwn 
    ? 'linear-gradient(135deg, #10B981, #8B5CF6, #EC4899)' 
    : '#FFFFFF'};
  color: ${props => props.isOwn ? '#FFFFFF' : '#111827'};
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MessageMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
`;

const UserName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
`;

const TimeStamp = styled.span`
  font-size: 11px;
  color: #9CA3AF;
`;

const InputContainer = styled.form`
  padding: 20px;
  background: #FFFFFF;
  border-top: 1px solid #E5E7EB;
  display: flex;
  gap: 12px;
  align-items: center;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #E5E7EB;
  border-radius: 25px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &::placeholder {
    color: #9CA3AF;
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #10B981, #8B5CF6, #EC4899);
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

export default function ChatRoom() {
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useRealtimeChat();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
              <MessageBubble key={message.id} isOwn={isOwn}>
                <Avatar 
                  src={message.profiles?.avatar_url || '/images/default-avatar.png'}
                  alt={message.profiles?.full_name || 'Utilisateur'}
                />
                <div style={{ flex: 1 }}>
                  <MessageMeta>
                    {!isOwn && (
                      <UserName>
                        {message.profiles?.full_name || 'Membre Aurora'}
                      </UserName>
                    )}
                    <TimeStamp>
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </TimeStamp>
                  </MessageMeta>
                  <MessageContent isOwn={isOwn}>
                    {message.content}
                  </MessageContent>
                </div>
              </MessageBubble>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer onSubmit={handleSubmit}>
        <MessageInput
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez votre message... 🌿"
          disabled={sending}
          maxLength={500}
        />
        <SendButton type="submit" disabled={!newMessage.trim() || sending}>
          {sending ? '...' : 'Envoyer'}
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
}
```

### Étape 4: Page Chat

#### 4.1 Mettre à jour `/app/(lms)/chat/page.tsx`

```typescript
import ChatRoom from '@/components/chat/ChatRoom';
import styled from '@emotion/styled';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #10B981, #8B5CF6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 8px;
  }
  
  p {
    color: #6B7280;
    font-size: 16px;
  }
`;

export default function ChatPage() {
  return (
    <PageContainer>
      <PageHeader>
        <h1>Espace Communautaire 🌿</h1>
        <p>Échangez avec les autres membres de la communauté Aurora50</p>
      </PageHeader>
      <ChatRoom />
    </PageContainer>
  );
}
```

### Étape 5: Types TypeScript

#### 5.1 Ajouter dans `/lib/database.types.ts`

```typescript
export interface Database {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: number;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      // ... autres tables
    };
  };
}
```

## 🎨 Design System Aurora50 - Spécifications

### Couleurs
- **Dégradé principal** : `linear-gradient(135deg, #10B981, #8B5CF6, #EC4899)`
- **Fond principal** : #FFFFFF
- **Fond secondaire** : #F9FAFB
- **Texte principal** : #111827
- **Texte secondaire** : #4B5636
- **Bordures** : #E5E7EB

### Composants
- **Border radius** : 16px à 20px pour containers, 25px pour boutons
- **Ombres** : `0 2px 4px rgba(0, 0, 0, 0.1)` (légère), `0 4px 6px -1px rgba(0, 0, 0, 0.1)` (moyenne)
- **Transitions** : 0.2s à 0.3s ease
- **Emoji signature** : 🌿

## ✅ Checklist de validation

### Configuration
- [ ] Realtime activé sur `chat_messages` dans Supabase
- [ ] Politiques RLS configurées et testées
- [ ] Vue `chat_messages_with_profiles` créée

### Code
- [ ] Hook `useRealtimeChat` créé et fonctionnel
- [ ] Composant `ChatRoom` implémenté avec styles Aurora50
- [ ] Page chat intégrée dans l'espace membre
- [ ] Types TypeScript ajoutés

### Fonctionnalités
- [ ] Messages s'affichent en temps réel
- [ ] Envoi de messages fonctionnel
- [ ] Auto-scroll vers le bas
- [ ] Profils utilisateurs affichés (nom + avatar)
- [ ] Timestamps relatifs en français
- [ ] Gestion des erreurs

### UX/UI
- [ ] Design Aurora50 respecté
- [ ] Messages propres vs autres différenciés
- [ ] États de chargement
- [ ] Message de bienvenue si chat vide
- [ ] Responsive mobile

## 🚨 Points d'attention

1. **Sécurité**
   - Vérifier que les RLS policies sont bien actives
   - Limiter la longueur des messages (500 caractères)
   - Sanitizer le contenu si nécessaire

2. **Performance**
   - Limiter à 100 messages chargés initialement
   - Implémenter pagination si besoin
   - Optimiser les re-renders React

3. **Accessibilité**
   - Ajouter les attributs ARIA appropriés
   - Support clavier complet
   - Contraste des couleurs conforme WCAG

4. **Mobile**
   - Adapter la hauteur du container
   - Gérer le clavier virtuel
   - Touch-friendly sur les interactions

## 📊 Tests recommandés

1. **Test multi-utilisateurs** : Ouvrir 2 sessions différentes
2. **Test de charge** : Envoyer plusieurs messages rapidement
3. **Test réseau** : Simuler perte de connexion
4. **Test mobile** : Vérifier sur différents appareils

## 🔄 Améliorations futures

- [ ] Indicateurs de présence (qui est en ligne)
- [ ] Typing indicators (X est en train d'écrire...)
- [ ] Réactions aux messages (emojis)
- [ ] Modération automatique
- [ ] Recherche dans l'historique
- [ ] Export de conversations
- [ ] Notifications push

## 📚 Ressources

- [Documentation Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Emotion Styled Components](https://emotion.sh/docs/styled)
- [Date-fns](https://date-fns.org/)

---

*Document créé le 29/08/2025*  
*Projet Aurora50 LMS*  
*Version 1.0.0*