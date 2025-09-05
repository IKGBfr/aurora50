import { useEffect, useState, useMemo } from 'react';
import supabase from '@/lib/supabase/client';
import { createDevSupabaseClient } from '@/lib/supabase/client-dev';
import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { UserStatus } from '@/components/ui/StatusSelector';

interface OnlineUser {
  user_id: string;
  full_name: string;
  avatar_url: string;
  last_seen: string;
  status?: UserStatus;
  presence_status?: UserStatus;
  is_manual_status?: boolean;
  effective_status?: UserStatus;
}

// Mock data pour le mode dev
const MOCK_ONLINE_USERS = [
  '6969a149-b953-4693-8f01-208ca2c61c31', // Marie Dubois
  'ed8b0772-e900-4d17-b65c-d30f33c25548', // Catherine Leroy
  '8d0156db-6efc-445b-a58f-e6e449ed7037', // Isabelle Moreau
  '35035f64-880a-4c98-9027-ce2e522bf4bf', // Christine Petit
];

const MOCK_ALL_USERS: OnlineUser[] = [
  {
    user_id: '6969a149-b953-4693-8f01-208ca2c61c31',
    full_name: 'Marie Dubois',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
    last_seen: '',
    status: 'online'
  },
  {
    user_id: '912390b3-4799-46de-ab83-bf6b55c3a563',
    full_name: 'Sylvie Martin',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sylvie',
    last_seen: '',
    status: 'busy'
  },
  {
    user_id: 'ed8b0772-e900-4d17-b65c-d30f33c25548',
    full_name: 'Catherine Leroy',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=catherine',
    last_seen: '',
    status: 'online'
  },
  {
    user_id: '8d0156db-6efc-445b-a58f-e6e449ed7037',
    full_name: 'Isabelle Moreau',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=isabelle',
    last_seen: '',
    status: 'dnd'
  },
  {
    user_id: '58194944-6a0b-4bfd-97a1-ef370e785dfe',
    full_name: 'Nathalie Bernard',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nathalie',
    last_seen: '',
    status: 'offline'
  },
  {
    user_id: '35035f64-880a-4c98-9027-ce2e522bf4bf',
    full_name: 'Christine Petit',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=christine',
    last_seen: '',
    status: 'online'
  },
  {
    user_id: '4e946aee-1048-4634-bb54-a5d81cffbb7c',
    full_name: 'Brigitte Rousseau',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=brigitte',
    last_seen: '',
    status: 'offline'
  },
  {
    user_id: '5a84d1d0-bd15-4e02-9145-c171196a2440',
    full_name: 'Véronique Durand',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=veronique',
    last_seen: '',
    status: 'busy'
  },
  {
    user_id: '9b6ed8bf-47cb-438a-9081-cb33bf7a7fec',
    full_name: 'Philippe Lefebvre',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=philippe',
    last_seen: '',
    status: 'offline'
  },
  {
    user_id: '65529356-54a1-420c-b037-44f7529cc738',
    full_name: 'Jean-Marc Thomas',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jeanmarc',
    last_seen: '',
    status: 'offline'
  }
];

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [allUsers, setAllUsers] = useState<OnlineUser[]>([]);
  const [currentUser, setCurrentUser] = useState<OnlineUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Déterminer si on est en mode dev
  const isDevMode = process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';
  
  // Créer le client Supabase approprié
  const supabaseClient = useMemo(() => {
    return isDevMode ? createDevSupabaseClient() : supabase;
  }, [isDevMode]);
  
  // Fonction helper pour créer un timeout avec fallback
  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number = 5000, fallbackValue?: T): Promise<T> => {
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout après ' + timeoutMs + 'ms')), timeoutMs)
        )
      ]);
    } catch (error) {
      console.warn('⚠️ Timeout ou erreur, utilisation du fallback:', error);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      throw error;
    }
  };
  
  useEffect(() => {
    if (isDevMode) {
      // Mode dev : utiliser les données mockées
      const devCurrentUserId = 'dev-user-123';
      const devCurrentUser: OnlineUser = {
        user_id: devCurrentUserId,
        full_name: 'Léa Pipot',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lea',
        last_seen: '',
        status: 'online'
      };
      
      setCurrentUserId(devCurrentUserId);
      setCurrentUser(devCurrentUser);
      
      // Filtrer l'utilisateur courant de la liste
      const filteredUsers = MOCK_ALL_USERS.filter(u => u.user_id !== devCurrentUserId);
      setAllUsers(filteredUsers);
      
      // Ajouter l'utilisateur courant aux utilisateurs en ligne
      const onlineWithCurrent = new Set([...MOCK_ONLINE_USERS, devCurrentUserId]);
      setOnlineUsers(onlineWithCurrent);
      setIsLoading(false);
      
      // Simuler des changements de présence aléatoires
      const interval = setInterval(() => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          const allUserIds = MOCK_ALL_USERS.map(u => u.user_id);
          const randomUser = allUserIds[Math.floor(Math.random() * allUserIds.length)];
          
          if (newSet.has(randomUser)) {
            newSet.delete(randomUser);
          } else {
            newSet.add(randomUser);
          }
          
          return newSet;
        });
      }, 15000); // Changement toutes les 15 secondes
      
      return () => clearInterval(interval);
    } else {
      // Mode production : utiliser Supabase Realtime
      let presenceChannel: RealtimeChannel | null = null;
      let profilesChannel: RealtimeChannel | null = null;
      
      // Définir loadAllUsers AVANT setupPresence
      const loadAllUsers = async () => {
        try {
          // Récupérer l'utilisateur courant avec timeout
          const authResult = await withTimeout(
            supabaseClient.auth.getUser(),
            3000
          ) as any;
          const user = authResult?.data?.user;
          
          // Requête optimisée avec colonnes minimales et fallback
          let data = null;
          let error = null;
          
          try {
            // Première tentative avec timeout court
            const result = await withTimeout(
              supabaseClient
                .from('profiles')
                .select('id, full_name, avatar_url, status, presence_status, is_manual_status')
                .order('full_name')
                .limit(50),
              3000,
              { data: [], error: null }
            ) as any;
            
            data = result?.data;
            error = result?.error;
            
            // Si échec, deuxième tentative avec requête encore plus légère
            if (error || !data) {
              const lightResult = await withTimeout(
                supabaseClient
                  .from('profiles')
                  .select('id, full_name')
                  .limit(20),
                2000,
                { data: [], error: null }
              ) as any;
              
              data = lightResult?.data || [];
              error = lightResult?.error;
            }
          } catch (err) {
            console.error('❌ Erreur requête profiles:', err);
            data = [];
            error = null;
          }
          
          if (error) {
            console.error('❌ Erreur chargement profiles:', error);
            throw error;
          }
          
          if (data && user) {
            // Définir l'utilisateur courant avec tous les champs de statut
            const currentUserData = data.find((u: any) => u.id === user.id);
            if (currentUserData) {
              setCurrentUserId(user.id);
              
              // Calculer le statut effectif
              const effectiveStatus = currentUserData.is_manual_status && currentUserData.presence_status
                ? currentUserData.presence_status
                : currentUserData.status || 'offline';
              
              setCurrentUser({
                user_id: currentUserData.id,
                full_name: currentUserData.full_name || 'Membre Aurora',
                avatar_url: currentUserData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserData.id}`,
                last_seen: '',
                status: currentUserData.status || 'offline',
                presence_status: currentUserData.presence_status,
                is_manual_status: currentUserData.is_manual_status,
                effective_status: effectiveStatus
              });
            }
            
            // Filtrer l'utilisateur courant de la liste
            const filteredData = data.filter((u: any) => u.id !== user.id);
            console.log('🔍 DEBUG loadAllUsers - raw data:', filteredData.map((u: any) => ({
              name: u.full_name,
              status: u.status,
              presence_status: u.presence_status,
              is_manual_status: u.is_manual_status
            })));
            
            setAllUsers(filteredData.map((u: any) => {
              // Calculer le statut effectif ici avec debug
              const effectiveStatus = u.is_manual_status && u.presence_status
                ? u.presence_status
                : u.status || 'offline';
              
              console.log(`🔍 Processing ${u.full_name}: effective_status=${effectiveStatus}`);
              
              return {
                user_id: u.id,
                full_name: u.full_name || 'Membre Aurora',
                avatar_url: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
                last_seen: '',
                status: u.status || 'offline',
                presence_status: u.presence_status,
                is_manual_status: u.is_manual_status,
                effective_status: effectiveStatus
              };
            }));
          } else {
            setAllUsers([]);
          }
        } catch (error) {
          console.error('❌ Erreur dans loadAllUsers:', error);
          setError('Impossible de charger les membres');
          setAllUsers([]);
        }
      };
      
      const setupPresence = async () => {
        try {
          await loadAllUsers();
          
          // Channel pour écouter les changements sur la table profiles (autres utilisateurs)
          profilesChannel = supabaseClient
            .channel('profiles-changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'profiles'
              },
              async (payload: any) => {
                // Ne traiter que les autres utilisateurs, PAS l'utilisateur courant
                if (payload.new && payload.new.id !== currentUserId) {
                  if (payload.eventType === 'INSERT') {
                    const newUser: OnlineUser = {
                      user_id: payload.new.id,
                      full_name: payload.new.full_name || 'Membre Aurora',
                      avatar_url: payload.new.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.new.id}`,
                      last_seen: '',
                      status: payload.new.status || 'offline',
                      presence_status: payload.new.presence_status,
                      is_manual_status: payload.new.is_manual_status,
                      effective_status: payload.new.is_manual_status && payload.new.presence_status
                        ? payload.new.presence_status
                        : payload.new.status || 'offline'
                    };
                    
                    setAllUsers(prev => [...prev, newUser]);
                    
                  } else if (payload.eventType === 'UPDATE') {
                    const updatedUser: OnlineUser = {
                      user_id: payload.new.id,
                      full_name: payload.new.full_name || 'Membre Aurora',
                      avatar_url: payload.new.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.new.id}`,
                      last_seen: '',
                      status: payload.new.status || 'offline',
                      presence_status: payload.new.presence_status,
                      is_manual_status: payload.new.is_manual_status,
                      effective_status: payload.new.is_manual_status && payload.new.presence_status
                        ? payload.new.presence_status
                        : payload.new.status || 'offline'
                    };
                    
                    setAllUsers(prev => 
                      prev.map(u => u.user_id === payload.new.id ? updatedUser : u)
                    );
                  }
                } else if (payload.eventType === 'DELETE' && payload.old) {
                  setAllUsers(prev => prev.filter(u => u.user_id !== payload.old.id));
                }
              }
            )
            .subscribe();
          
          // Channel de présence
          presenceChannel = supabaseClient.channel('online-users')
            .on('presence', { event: 'sync' }, () => {
              const state = presenceChannel?.presenceState() || {};
              const userIds = Object.values(state).flat().map((u: any) => u.user_id);
              setOnlineUsers(new Set(userIds));
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string; newPresences: any[] }) => {
              const userIds = newPresences.map((p: any) => p.user_id);
              setOnlineUsers(prev => {
                const newSet = new Set(prev);
                userIds.forEach((id: string) => newSet.add(id));
                return newSet;
              });
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string; leftPresences: any[] }) => {
              const userIds = leftPresences.map((p: any) => p.user_id);
              setOnlineUsers(prev => {
                const newSet = new Set(prev);
                userIds.forEach((id: string) => newSet.delete(id));
                return newSet;
              });
            })
            .subscribe(async (status: string) => {
              if (status === 'SUBSCRIBED') {
                const { data: { user } } = await supabaseClient.auth.getUser();
                if (user) {
                  await presenceChannel?.track({ 
                    user_id: user.id,
                    online_at: new Date().toISOString()
                  });
                }
              }
            });
        } catch (error) {
          console.error('❌ Erreur lors de la configuration de la présence:', error);
          setError('Erreur de connexion');
        } finally {
          setIsLoading(false);
        }
      };
      
      // Lancer setupPresence avec un timeout global de sécurité
      const setupWithTimeout = async () => {
        try {
          await withTimeout(setupPresence(), 10000);
        } catch (error) {
          console.error('❌ Timeout global ou erreur:', error);
          setError('Chargement trop long');
        } finally {
          setIsLoading(false);
        }
      };
      
      setupWithTimeout();
      
      return () => {
        if (presenceChannel) {
          presenceChannel.unsubscribe();
        }
        if (profilesChannel) {
          profilesChannel.unsubscribe();
        }
      };
    }
  }, [isDevMode, supabaseClient]);
  
  // SUBSCRIPTION DÉDIÉE POUR L'UTILISATEUR COURANT
  useEffect(() => {
    if (!currentUserId || isDevMode) return;
    
    const currentUserChannel = supabaseClient
      .channel(`current-user-status-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${currentUserId}`
        },
        (payload: any) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            const effectiveStatus = payload.new.is_manual_status && payload.new.presence_status
              ? payload.new.presence_status
              : payload.new.status || 'offline';
            
            setCurrentUser(prev => prev ? {
              ...prev,
              status: payload.new.status || prev.status,
              presence_status: payload.new.presence_status,
              is_manual_status: payload.new.is_manual_status,
              effective_status: effectiveStatus
            } : null);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabaseClient.removeChannel(currentUserChannel);
    };
  }, [currentUserId, supabaseClient, isDevMode]);

  // Listener pour l'événement personnalisé (workaround)
  useEffect(() => {
    if (!currentUserId || isDevMode) return;
    
    const handleStatusChange = (event: CustomEvent) => {
      if (event.detail.userId === currentUserId) {
        setCurrentUser(prev => prev ? {
          ...prev,
          status: event.detail.newStatus,
          presence_status: event.detail.presence_status,
          is_manual_status: event.detail.is_manual_status,
          effective_status: event.detail.presence_status
        } : null);
      }
    };
    
    window.addEventListener('statusChanged', handleStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('statusChanged', handleStatusChange as EventListener);
    };
  }, [currentUserId, isDevMode]);
  
  // Séparer et trier les utilisateurs
  const sortedUsers = useMemo(() => {
    console.log('🔍 DEBUG sortedUsers - allUsers:', allUsers.map(u => ({
      name: u.full_name,
      status: u.status,
      presence_status: u.presence_status,
      effective_status: u.effective_status,
      is_manual_status: u.is_manual_status
    })));
    
    // Basé sur le statut effectif, pas sur la présence WebSocket
    const online = allUsers.filter(u => {
      // Utiliser le statut effectif ou le statut normal
      const status = u.effective_status || u.presence_status || u.status || 'offline';
      console.log(`🟢 Checking ${u.full_name}: status=${status}, isOnline=${status !== 'offline'}`);
      // Considérer en ligne tous les statuts SAUF 'offline'
      return status !== 'offline';
    }).sort((a, b) => a.full_name.localeCompare(b.full_name));
    
    const offline = allUsers.filter(u => {
      const status = u.effective_status || u.presence_status || u.status || 'offline';
      // Seulement 'offline' est considéré hors ligne
      return status === 'offline';
    }).sort((a, b) => a.full_name.localeCompare(b.full_name));
    
    console.log('✅ Sorted results:', {
      online: online.map(u => u.full_name),
      offline: offline.map(u => u.full_name)
    });
    
    return { online, offline };
  }, [allUsers]); // Retirer onlineUsers des dépendances car on n'en a plus besoin
  
  return {
    onlineUsers: Array.from(onlineUsers),
    allUsers,
    onlineMembers: sortedUsers.online,
    offlineMembers: sortedUsers.offline,
    isOnline: (userId: string) => onlineUsers.has(userId),
    isLoading,
    error,
    totalOnline: sortedUsers.online.length,
    totalOffline: sortedUsers.offline.length,
    currentUser,
    currentUserId,
    isCurrentUserOnline: currentUserId ? onlineUsers.has(currentUserId) : false
  };
}
