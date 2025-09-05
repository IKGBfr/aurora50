'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import supabase from '@/lib/supabase/client';
import { UserStatus } from '@/components/ui/StatusSelector';

interface StatusContextType {
  userStatuses: Map<string, UserStatus>;
  updateMyStatus: (status: UserStatus) => Promise<void>;
  getStatus: (userId: string) => UserStatus;
  isLoading: boolean;
}

const StatusContext = createContext<StatusContextType>({
  userStatuses: new Map(),
  updateMyStatus: async () => {},
  getStatus: () => 'offline',
  isLoading: true
});

export function StatusProvider({ children }: { children: ReactNode }) {
  const [userStatuses, setUserStatuses] = useState<Map<string, UserStatus>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('🚀 StatusContext: Initialisation...');
    
    // Charger tous les statuts au démarrage
    const loadStatuses = async () => {
      try {
        // Récupérer l'utilisateur courant
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          console.log('👤 StatusContext: Utilisateur courant:', user.id);
        }
        
        // Charger tous les profils avec leurs statuts
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, presence_status, status, is_manual_status');
        
        if (error) {
          console.error('❌ StatusContext: Erreur chargement profiles:', error);
          throw error;
        }
        
        if (data) {
          console.log('📊 StatusContext: Profiles chargés:', data.length);
          const statusMap = new Map<string, UserStatus>();
          
          data.forEach(user => {
            // Calculer le statut effectif UNE SEULE FOIS
            const effectiveStatus = user.is_manual_status && user.presence_status
              ? user.presence_status as UserStatus
              : (user.status as UserStatus || 'offline');
            
            statusMap.set(user.id, effectiveStatus);
            
            console.log(`📍 StatusContext: ${user.full_name} -> ${effectiveStatus}`);
          });
          
          setUserStatuses(statusMap);
        }
      } catch (error) {
        console.error('❌ StatusContext: Erreur dans loadStatuses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStatuses();
    
    // UNE SEULE subscription pour TOUS les changements
    console.log('📡 StatusContext: Configuration de la subscription Realtime...');
    const channel = supabase
      .channel('global-status-sync')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: undefined // Écouter TOUS les changements
      }, (payload) => {
        console.log('🔄 StatusContext: Changement détecté:', payload);
        
        if (payload.eventType === 'UPDATE' && payload.new) {
          const userId = payload.new.id;
          const fullName = payload.new.full_name || 'Utilisateur';
          
          // Calculer le nouveau statut effectif
          const effectiveStatus = payload.new.is_manual_status && payload.new.presence_status
            ? payload.new.presence_status as UserStatus
            : (payload.new.status as UserStatus || 'offline');
          
          console.log(`🔄 StatusContext: Mise à jour ${fullName} (${userId}) -> ${effectiveStatus}`);
          
          setUserStatuses(prev => {
            const newMap = new Map(prev);
            newMap.set(userId, effectiveStatus);
            return newMap;
          });
        } else if (payload.eventType === 'INSERT' && payload.new) {
          const userId = payload.new.id;
          const effectiveStatus = payload.new.is_manual_status && payload.new.presence_status
            ? payload.new.presence_status as UserStatus
            : (payload.new.status as UserStatus || 'offline');
          
          console.log(`➕ StatusContext: Nouvel utilisateur ${userId} -> ${effectiveStatus}`);
          
          setUserStatuses(prev => {
            const newMap = new Map(prev);
            newMap.set(userId, effectiveStatus);
            return newMap;
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          console.log(`➖ StatusContext: Suppression utilisateur ${payload.old.id}`);
          
          setUserStatuses(prev => {
            const newMap = new Map(prev);
            newMap.delete(payload.old.id);
            return newMap;
          });
        }
      })
      .subscribe((status) => {
        console.log('📡 StatusContext: Subscription status:', status);
      });
    
    return () => {
      console.log('🔌 StatusContext: Nettoyage...');
      supabase.removeChannel(channel);
    };
  }, []);
  
  const updateMyStatus = async (newStatus: UserStatus) => {
    console.log('🔧 StatusContext: updateMyStatus appelé avec:', newStatus);
    
    if (!currentUserId) {
      console.error('❌ StatusContext: Pas d\'utilisateur courant');
      return;
    }
    
    // Mise à jour optimiste locale
    console.log('⚡ StatusContext: Mise à jour optimiste pour', currentUserId);
    setUserStatuses(prev => {
      const newMap = new Map(prev);
      newMap.set(currentUserId, newStatus);
      return newMap;
    });
    
    try {
      // Mise à jour en base
      console.log('💾 StatusContext: Envoi mise à jour en base...');
      const { error } = await supabase
        .from('profiles')
        .update({
          presence_status: newStatus,
          is_manual_status: true,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', currentUserId);
      
      if (error) {
        console.error('❌ StatusContext: Erreur mise à jour:', error);
        throw error;
      }
      
      console.log('✅ StatusContext: Statut mis à jour avec succès');
    } catch (error) {
      console.error('❌ StatusContext: Erreur dans updateMyStatus:', error);
      
      // Rollback en cas d'erreur
      const { data } = await supabase
        .from('profiles')
        .select('presence_status, status, is_manual_status')
        .eq('id', currentUserId)
        .single();
      
      if (data) {
        const effectiveStatus = data.is_manual_status && data.presence_status
          ? data.presence_status as UserStatus
          : (data.status as UserStatus || 'offline');
        
        setUserStatuses(prev => {
          const newMap = new Map(prev);
          newMap.set(currentUserId, effectiveStatus);
          return newMap;
        });
      }
    }
  };
  
  const getStatus = (userId: string): UserStatus => {
    const status = userStatuses.get(userId) || 'offline';
    console.log(`🔍 StatusContext: getStatus(${userId}) -> ${status}`);
    return status;
  };
  
  // Log périodique pour debug
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('📊 StatusContext: État actuel des statuts:', 
        Array.from(userStatuses.entries()).map(([id, status]) => ({ id, status }))
      );
    }, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [userStatuses]);
  
  return (
    <StatusContext.Provider value={{ 
      userStatuses, 
      updateMyStatus, 
      getStatus, 
      isLoading 
    }}>
      {children}
    </StatusContext.Provider>
  );
}

export function useStatus(userId?: string) {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useStatus must be used within StatusProvider');
  }
  
  if (userId) {
    return context.getStatus(userId);
  }
  
  return context;
}
