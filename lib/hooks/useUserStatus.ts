'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createDevSupabaseClient } from '@/lib/supabase/client-dev';
import { UserStatus } from '@/components/ui/StatusSelector';

interface UseUserStatusReturn {
  status: UserStatus;
  isLoading: boolean;
  updateStatus: (newStatus: UserStatus) => Promise<void>;
  error: string | null;
}

// Données mockées pour le mode dev
const MOCK_USER_STATUSES: Record<string, UserStatus> = {
  'dev-user-123': 'online', // Léa Pipot
  '6969a149-b953-4693-8f01-208ca2c61c31': 'online', // Marie Dubois
  '912390b3-4799-46de-ab83-bf6b55c3a563': 'busy', // Sylvie Martin
  'ed8b0772-e900-4d17-b65c-d30f33c25548': 'online', // Catherine Leroy
  '8d0156db-6efc-445b-a58f-e6e449ed7037': 'dnd', // Isabelle Moreau
  '58194944-6a0b-4bfd-97a1-ef370e785dfe': 'offline', // Nathalie Bernard
  '35035f64-880a-4c98-9027-ce2e522bf4bf': 'online', // Christine Petit
  '4e946aee-1048-4634-bb54-a5d81cffbb7c': 'offline', // Brigitte Rousseau
  '5a84d1d0-bd15-4e02-9145-c171196a2440': 'busy', // Véronique Durand
  '9b6ed8bf-47cb-438a-9081-cb33bf7a7fec': 'offline', // Philippe Lefebvre
  '65529356-54a1-420c-b037-44f7529cc738': 'offline', // Jean-Marc Thomas
};

export function useUserStatus(userId: string): UseUserStatusReturn {
  const [status, setStatus] = useState<UserStatus>('offline');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isDevMode = process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';
  const supabase = isDevMode ? createDevSupabaseClient() : createClient();
  
  // Charger le statut initial
  useEffect(() => {
    const loadStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      if (isDevMode) {
        // En mode dev, utiliser les données mockées
        const mockStatus = MOCK_USER_STATUSES[userId] || 'offline';
        setStatus(mockStatus);
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', userId)
          .single();
        
        if (fetchError) throw fetchError;
        
        if (data && data.status) {
          setStatus(data.status as UserStatus);
        } else {
          // Si pas de statut, définir par défaut à online
          setStatus('online');
          // Mettre à jour dans la base
          await supabase
            .from('profiles')
            .update({ 
              status: 'online',
              status_updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
      } catch (err) {
        console.error('Erreur lors du chargement du statut:', err);
        setError('Impossible de charger le statut');
        setStatus('offline');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStatus();
  }, [userId, supabase, isDevMode]);
  
  // Écouter les changements en temps réel
  useEffect(() => {
    if (isDevMode) return;
    
    const channel = supabase
      .channel(`user-status-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload: any) => {
          if (payload.new && payload.new.status) {
            setStatus(payload.new.status as UserStatus);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, isDevMode]);
  
  // Fonction pour mettre à jour le statut
  const updateStatus = useCallback(async (newStatus: UserStatus) => {
    setError(null);
    
    if (isDevMode) {
      // En mode dev, simuler la mise à jour
      MOCK_USER_STATUSES[userId] = newStatus;
      setStatus(newStatus);
      return;
    }
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          status: newStatus,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      setStatus(newStatus);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError('Impossible de mettre à jour le statut');
      throw err;
    }
  }, [userId, supabase, isDevMode]);
  
  return {
    status,
    isLoading,
    updateStatus,
    error
  };
}

// Hook pour obtenir le statut de tous les utilisateurs
export function useAllUserStatuses() {
  const [statuses, setStatuses] = useState<Record<string, UserStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const isDevMode = process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';
  const supabase = isDevMode ? createDevSupabaseClient() : createClient();
  
  useEffect(() => {
    const loadStatuses = async () => {
      if (isDevMode) {
        // En mode dev, utiliser les données mockées
        setStatuses(MOCK_USER_STATUSES);
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, status');
        
        if (error) throw error;
        
        if (data) {
          const statusMap: Record<string, UserStatus> = {};
          data.forEach((profile: any) => {
            if (profile.status) {
              statusMap[profile.id] = profile.status as UserStatus;
            }
          });
          setStatuses(statusMap);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStatuses();
  }, [supabase, isDevMode]);
  
  // Écouter les changements en temps réel
  useEffect(() => {
    if (isDevMode) {
      // En mode dev, simuler des changements aléatoires
      const interval = setInterval(() => {
        const userIds = Object.keys(MOCK_USER_STATUSES);
        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        const statuses: UserStatus[] = ['online', 'busy', 'dnd', 'offline'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        setStatuses(prev => ({
          ...prev,
          [randomUserId]: randomStatus
        }));
      }, 30000); // Changement toutes les 30 secondes
      
      return () => clearInterval(interval);
    }
    
    const channel = supabase
      .channel('all-user-statuses')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload: any) => {
          if (payload.new && payload.new.id && payload.new.status) {
            setStatuses(prev => ({
              ...prev,
              [payload.new.id]: payload.new.status as UserStatus
            }));
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, isDevMode]);
  
  return {
    statuses,
    isLoading,
    getUserStatus: (userId: string) => statuses[userId] || 'offline'
  };
}
