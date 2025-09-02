import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createDevSupabaseClient } from '@/lib/supabase/client-dev';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatMessage {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  reply_to_id?: number | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
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
  
  const isDevMode = process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';
  
  // Mémoriser le client Supabase pour éviter les re-créations
  const supabase = useMemo(() => {
    return isDevMode ? createDevSupabaseClient() : createClient();
  }, [isDevMode]);

  // Charger les messages initiaux
  const loadMessages = useCallback(async () => {
    try {
      console.log('🔄 Chargement des messages...');
      
      // En mode dev, utiliser des messages mockés
      if (isDevMode) {
        const mockMessages: ChatMessage[] = [
          {
            id: 1,
            user_id: 'user-2',
            content: 'Salut tout le monde ! Comment allez-vous ? 🌿',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            profiles: {
              full_name: 'Marie Dubois',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie'
            }
          },
          {
            id: 2,
            user_id: 'user-3',
            content: 'Super bien ! Je viens de terminer le module sur la confiance en soi 💪',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            profiles: {
              full_name: 'Sophie Martin',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie'
            }
          },
          {
            id: 3,
            user_id: 'test-user',
            content: 'Bienvenue dans Aurora50 ! 🌟',
            created_at: new Date(Date.now() - 900000).toISOString(),
            profiles: {
              full_name: 'Test User',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
            }
          }
        ];
        
        console.log(`✅ ${mockMessages.length} messages mockés chargés`);
        setMessages(mockMessages);
        setLoading(false);
        return;
      }
      
      // Code production avec Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('❌ Erreur auth:', authError);
        throw new Error(`Erreur d'authentification: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error('Vous devez être connecté pour accéder au chat');
      }
      
      console.log('✅ Utilisateur connecté:', user.email);
      
      // Ensuite, charger les messages avec les profils
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) {
        console.error('❌ Erreur Supabase:', messagesError);
        
        // Détails spécifiques selon le code d'erreur
        if (messagesError.code === '42P01') {
          throw new Error('La table chat_messages n\'existe pas. Veuillez exécuter le script setup-chat-tables.sql dans Supabase.');
        } else if (messagesError.code === '42501') {
          throw new Error('Permissions insuffisantes. Vérifiez les policies RLS dans Supabase.');
        } else {
          throw new Error(`Erreur base de données: ${messagesError.message} (Code: ${messagesError.code})`);
        }
      }

      // Charger les profils séparément pour éviter les problèmes de jointure
      if (messages && messages.length > 0) {
        const userIds = [...new Set(messages.map((m: any) => m.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        // Mapper les profils aux messages
        const messagesWithProfiles = messages.map((message: any) => ({
          ...message,
          profiles: profiles?.find((p: any) => p.id === message.user_id) || null
        }));

        console.log(`✅ ${messagesWithProfiles.length} messages chargés`);
        setMessages(messagesWithProfiles);
      } else {
        console.log('✅ Aucun message');
        setMessages([]);
      }

    } catch (err) {
      console.error('❌ Erreur dans loadMessages:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [isDevMode, supabase]);

  // Envoyer un message
  const sendMessage = useCallback(async (content: string, replyToId?: number) => {
    try {
      // En mode dev, ajouter directement le message
      if (isDevMode) {
        const newMessage: ChatMessage = {
          id: Date.now(),
          user_id: 'test-user',
          content,
          created_at: new Date().toISOString(),
          reply_to_id: replyToId || null,
          profiles: {
            full_name: 'Test User',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
          }
        };
        
        setMessages(prev => [...prev, newMessage]);
        console.log('✅ Message envoyé (mode dev)');
        return;
      }
      
      // Code production avec Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Erreur auth lors de l\'envoi:', authError);
        throw new Error(`Erreur d'authentification: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error('Vous devez être connecté pour envoyer un message');
      }

      console.log('📤 Envoi du message...');
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content,
          user_id: user.id,
          reply_to_id: replyToId || null
        });

      if (error) {
        console.error('❌ Erreur envoi message:', error);
        
        if (error.code === '42P01') {
          throw new Error('La table chat_messages n\'existe pas. Veuillez exécuter le script setup-chat-tables.sql.');
        } else if (error.code === '42501') {
          throw new Error('Permissions insuffisantes pour envoyer un message.');
        } else {
          throw new Error(`Erreur: ${error.message}`);
        }
      }
      
      console.log('✅ Message envoyé avec succès');
      
      // Toujours recharger les messages après envoi pour s'assurer qu'ils apparaissent
      // (Realtime peut avoir un délai ou ne pas fonctionner correctement)
      await loadMessages();
    } catch (err) {
      console.error('❌ Erreur dans sendMessage:', err);
      throw err;
    }
  }, [isDevMode, supabase, loadMessages]);

  // Setup Realtime subscription
  useEffect(() => {
    const setupChat = async () => {
      await loadMessages();
    };
    
    setupChat();

    // En mode dev, pas de realtime
    if (isDevMode) {
      return;
    }

    // Créer le channel Realtime seulement en production
    const newChannel = supabase
      .channel('chat-room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload: any) => {
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
      if (newChannel) {
        newChannel.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dépendances vides pour éviter la boucle

  return {
    messages,
    loading,
    error,
    sendMessage,
    refresh: loadMessages
  };
}
