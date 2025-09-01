import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createDevSupabaseClient } from '@/lib/supabase/client-dev';
import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { UserStatus } from '@/components/ui/StatusSelector';

interface OnlineUser {
  user_id: string;
  full_name: string;
  avatar_url: string;
  last_seen: string;
  status?: UserStatus;
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
  
  // Déterminer si on est en mode dev
  const isDevMode = process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';
  
  // Créer le client Supabase approprié
  const supabase = useMemo(() => {
    return isDevMode ? createDevSupabaseClient() : createClient();
  }, [isDevMode]);
  
  useEffect(() => {
    console.log('🔍 usePresence - Mounting');
    console.log('- isDevMode:', isDevMode);
    
    if (isDevMode) {
      // Mode dev : utiliser les données mockées
      console.log('📦 Loading mock data...');
      
      // En mode dev, on simule l'utilisateur courant (Léa Pipot)
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
      
      console.log('✅ Mock data loaded (current user excluded from list)');
      
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
      
      const setupPresence = async () => {
        try {
          // Charger tous les utilisateurs
          await loadAllUsers();
          
          // Channel pour écouter les changements sur la table profiles
          profilesChannel = supabase
            .channel('profiles-changes')
            .on(
              'postgres_changes',
              {
                event: '*', // Écouter INSERT, UPDATE, DELETE
                schema: 'public',
                table: 'profiles'
              },
              async (payload: any) => {
                console.log('📊 Changement détecté sur profiles:', payload);
                
                if (payload.eventType === 'INSERT') {
                  // Nouveau membre ajouté
                  const newUser: OnlineUser = {
                    user_id: payload.new.id,
                    full_name: payload.new.full_name || 'Membre Aurora',
                    avatar_url: payload.new.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.new.id}`,
                    last_seen: '',
                    status: payload.new.status || 'offline'
                  };
                  
                  // Ajouter seulement si ce n'est pas l'utilisateur courant
                  if (payload.new.id !== currentUserId) {
                    setAllUsers(prev => [...prev, newUser]);
                  }
                  
                } else if (payload.eventType === 'UPDATE') {
                  // Membre mis à jour
                  const updatedUser: OnlineUser = {
                    user_id: payload.new.id,
                    full_name: payload.new.full_name || 'Membre Aurora',
                    avatar_url: payload.new.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.new.id}`,
                    last_seen: '',
                    status: payload.new.status || 'offline'
                  };
                  
                  // Mettre à jour l'utilisateur courant si c'est lui
                  if (payload.new.id === currentUserId) {
                    setCurrentUser(updatedUser);
                  } else {
                    // Sinon mettre à jour dans la liste
                    setAllUsers(prev => 
                      prev.map(u => u.user_id === payload.new.id ? updatedUser : u)
                    );
                  }
                  
                } else if (payload.eventType === 'DELETE') {
                  // Membre supprimé
                  setAllUsers(prev => prev.filter(u => u.user_id !== payload.old.id));
                }
              }
            )
            .subscribe();
          
          // Channel de présence
          presenceChannel = supabase.channel('online-users')
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
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  await presenceChannel?.track({ 
                    user_id: user.id,
                    online_at: new Date().toISOString()
                  });
                }
              }
            });
        } catch (error) {
          console.error('Erreur lors de la configuration de la présence:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      setupPresence();
      
      return () => {
        if (presenceChannel) {
          presenceChannel.unsubscribe();
        }
        if (profilesChannel) {
          profilesChannel.unsubscribe();
        }
      };
    }
  }, [isDevMode, supabase]);
  
  const loadAllUsers = async () => {
    try {
      // Récupérer l'utilisateur courant
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, status')
        .order('full_name');
      
      if (error) throw error;
      
      if (data && user) {
        // Définir l'utilisateur courant
        const currentUserData = data.find((u: any) => u.id === user.id);
        if (currentUserData) {
          setCurrentUserId(user.id);
          setCurrentUser({
            user_id: currentUserData.id,
            full_name: currentUserData.full_name || 'Membre Aurora',
            avatar_url: currentUserData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserData.id}`,
            last_seen: '',
            status: currentUserData.status || 'offline'
          });
        }
        
        // Filtrer l'utilisateur courant de la liste
        const filteredData = data.filter((u: any) => u.id !== user.id);
        setAllUsers(filteredData.map((u: any) => ({
          user_id: u.id,
          full_name: u.full_name || 'Membre Aurora',
          avatar_url: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`,
          last_seen: '',
          status: u.status || 'offline'
        })));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      // En cas d'erreur, utiliser les données mockées
      setAllUsers(MOCK_ALL_USERS);
    }
  };
  
  // Séparer et trier les utilisateurs
  const sortedUsers = useMemo(() => {
    const online = allUsers.filter(u => onlineUsers.has(u.user_id))
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
    const offline = allUsers.filter(u => !onlineUsers.has(u.user_id))
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
    
    return { online, offline };
  }, [allUsers, onlineUsers]);
  
  return {
    onlineUsers: Array.from(onlineUsers),
    allUsers,
    onlineMembers: sortedUsers.online,
    offlineMembers: sortedUsers.offline,
    isOnline: (userId: string) => onlineUsers.has(userId),
    isLoading,
    totalOnline: sortedUsers.online.length,
    totalOffline: sortedUsers.offline.length,
    currentUser,
    currentUserId,
    isCurrentUserOnline: currentUserId ? onlineUsers.has(currentUserId) : false
  };
}
