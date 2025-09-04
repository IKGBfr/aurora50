import { useEffect, useState, useCallback, useMemo } from 'react';
import supabase from '@/lib/supabase/client';
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

export function useRealtimeChat(salonId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  
  const isDevMode = process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';
  
  // Mémoriser le client Supabase pour éviter les re-créations
  const supabaseClient = useMemo(() => {
    return isDevMode ? createDevSupabaseClient() : supabase;
  }, [isDevMode]);
  
  // Fonction helper pour créer un timeout
  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout après ' + timeoutMs + 'ms')), timeoutMs)
      )
    ]);
  };

  // Charger les messages initiaux
  const loadMessages = useCallback(async () => {
    try {
      console.log(`🔄 Chargement des messages${salonId ? ` du salon ${salonId}` : ' (chat général)'}...`);
      
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
      let user = null;
      try {
        const authResult = await withTimeout(supabaseClient.auth.getUser(), 3000) as any;
        user = authResult?.data?.user;
        
        if (!user) {
          throw new Error('Vous devez être connecté pour accéder au chat');
        }
        
        console.log('✅ Utilisateur connecté:', user.email);
      } catch (authError) {
        console.error('❌ Erreur auth:', authError);
        throw new Error(`Erreur d'authentification`);
      }
      
      // Ensuite, charger les messages avec timeout
      let messages = null;
      let messagesError = null;
      
      try {
        let query = supabaseClient
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(100);
        
        // Filtrer par salon si fourni, sinon chat général
        if (salonId) {
          query = query.eq('salon_id', salonId);
        } else {
          query = query.is('salon_id', null);
        }
        
        const result = await withTimeout(query, 5000) as any;
        messages = result?.data;
        messagesError = result?.error;
      } catch (err) {
        console.error('❌ Timeout ou erreur requête messages:', err);
        messagesError = err;
      }

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
        
        try {
          const profilesResult = await withTimeout(
            supabaseClient
              .from('profiles')
              .select('id, full_name, avatar_url')
              .in('id', userIds),
            3000
          ) as any;
          
          const profiles = profilesResult?.data;

          // Mapper les profils aux messages
          const messagesWithProfiles = messages.map((message: any) => ({
            ...message,
            profiles: profiles?.find((p: any) => p.id === message.user_id) || null
          }));

          console.log(`✅ ${messagesWithProfiles.length} messages chargés`);
          setMessages(messagesWithProfiles);
        } catch (profileError) {
          console.error('❌ Erreur chargement profils:', profileError);
          // Utiliser les messages sans profils en mode dégradé
          console.log('⚠️ Mode dégradé: messages sans profils');
          setMessages(messages);
        }
      } else {
        console.log('✅ Aucun message');
        setMessages([]);
      }

    } catch (err) {
      console.error('❌ Erreur dans loadMessages:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      // Mode dégradé : afficher une liste vide
      setMessages([]);
    } finally {
      // TOUJOURS mettre loading à false pour débloquer l'UI
      console.log('✅ Fin du chargement des messages (loading = false)');
      setLoading(false);
    }
  }, [isDevMode, supabaseClient, salonId]);

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
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError) {
        console.error('❌ Erreur auth lors de l\'envoi:', authError);
        throw new Error(`Erreur d'authentification: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error('Vous devez être connecté pour envoyer un message');
      }

      console.log('📤 Envoi du message...');
      
      const { error } = await supabaseClient
        .from('chat_messages')
        .insert({
          content,
          user_id: user.id,
          reply_to_id: replyToId || null,
          salon_id: salonId || null // Ajouter le salon_id si fourni
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
  }, [isDevMode, supabaseClient, loadMessages, salonId]);

  // Setup Realtime subscription
  useEffect(() => {
    const setupChat = async () => {
      try {
        // Ajouter un timeout global pour éviter le blocage
        await withTimeout(loadMessages(), 10000);
      } catch (error) {
        console.error('❌ Timeout global chargement chat:', error);
        setError('Chargement trop long');
        setMessages([]);
        setLoading(false);
      }
    };
    
    setupChat();

    // En mode dev, pas de realtime
    if (isDevMode) {
      return;
    }

    // Créer le channel Realtime seulement en production
    // Utiliser un channel différent par salon pour éviter les conflits
    const channelName = salonId ? `salon-${salonId}` : 'chat-room';
    const newChannel = supabaseClient
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: salonId ? `salon_id=eq.${salonId}` : 'salon_id=is.null'
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
  }, [salonId]); // Re-souscrire si le salon change

  return {
    messages,
    loading,
    error,
    sendMessage,
    refresh: loadMessages
  };
}
