import { useEffect, useState, useCallback, useMemo } from 'react';
import supabase from '@/lib/supabase/client';
import { createDevSupabaseClient } from '@/lib/supabase/client-dev';

interface Salon {
  id: string;
  name: string;
  description: string | null;
  category: string;
  city: string | null;
  owner_id: string;
  share_code: string;
  member_count: number;
  message_count: number;
  avatar_url: string | null;
  color_theme: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  owner_avatar?: string | null;
  role?: string;
  joined_at?: string;
}

interface CreateSalonData {
  name: string;
  description: string;
  category: string;
  city?: string;
}

export function useSalons() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [mySalons, setMySalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isDevMode = process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';
  
  const supabaseClient = useMemo(() => {
    return isDevMode ? createDevSupabaseClient() : supabase;
  }, [isDevMode]);

  // Charger tous les salons publics
  const loadSalons = useCallback(async () => {
    try {
      setLoading(true);
      
      // En mode dev, utiliser des salons mockés
      if (isDevMode) {
        const mockSalons: Salon[] = [
          {
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Chat Général Aurora50',
            description: 'Espace de discussion ouvert à toutes les membres',
            category: 'general',
            city: null,
            owner_id: 'test-user',
            share_code: 'general',
            member_count: 13,
            message_count: 42,
            avatar_url: null,
            color_theme: '#8B5CF6',
            is_active: true,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            owner_name: 'Aurora50',
            owner_avatar: null
          },
          {
            id: 'salon-1',
            name: 'Femmes de Paris',
            description: 'Salon pour les femmes 50+ de la région parisienne',
            category: 'local',
            city: 'Paris',
            owner_id: 'user-2',
            share_code: 'femmes-paris-a1b2',
            member_count: 25,
            message_count: 150,
            avatar_url: null,
            color_theme: '#EC4899',
            is_active: true,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            owner_name: 'Marie Dubois',
            owner_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie'
          },
          {
            id: 'salon-2',
            name: 'Yoga & Bien-être',
            description: 'Pratique du yoga et partage de conseils bien-être',
            category: 'wellness',
            city: null,
            owner_id: 'user-3',
            share_code: 'yoga-bien-c3d4',
            member_count: 18,
            message_count: 89,
            avatar_url: null,
            color_theme: '#10B981',
            is_active: true,
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            owner_name: 'Sophie Martin',
            owner_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie'
          }
        ];
        
        setSalons(mockSalons);
        setLoading(false);
        return mockSalons;
      }
      
      // Code production avec Supabase
      const { data, error } = await supabaseClient
        .from('salons_with_details')
        .select('*')
        .eq('is_active', true)
        .order('member_count', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement salons:', error);
        throw error;
      }

      setSalons(data || []);
      return data || [];
    } catch (err) {
      console.error('❌ Erreur dans loadSalons:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des salons');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isDevMode, supabaseClient]);

  // Charger mes salons
  const loadMySalons = useCallback(async () => {
    try {
      // En mode dev, retourner des salons mockés
      if (isDevMode) {
        const mockMySalons: Salon[] = [
          {
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Chat Général Aurora50',
            description: 'Espace de discussion ouvert à toutes les membres',
            category: 'general',
            city: null,
            owner_id: 'test-user',
            share_code: 'general',
            member_count: 13,
            message_count: 42,
            avatar_url: null,
            color_theme: '#8B5CF6',
            is_active: true,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            role: 'member',
            joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setMySalons(mockMySalons);
        return mockMySalons;
      }
      
      // Code production avec Supabase
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabaseClient
        .from('my_salons')
        .select('*')
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur chargement mes salons:', error);
        throw error;
      }

      setMySalons(data || []);
      return data || [];
    } catch (err) {
      console.error('❌ Erreur dans loadMySalons:', err);
      return [];
    }
  }, [isDevMode, supabaseClient]);

  // Créer un salon
  const createSalon = useCallback(async (data: CreateSalonData) => {
    try {
      // En mode dev, simuler la création
      if (isDevMode) {
        const newSalon: Salon = {
          id: `salon-${Date.now()}`,
          name: data.name,
          description: data.description,
          category: data.category,
          city: data.city || null,
          owner_id: 'test-user',
          share_code: `${data.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 4)}`,
          member_count: 1,
          message_count: 0,
          avatar_url: null,
          color_theme: '#8B5CF6',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_name: 'Test User',
          owner_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test'
        };
        
        setSalons(prev => [newSalon, ...prev]);
        setMySalons(prev => [newSalon, ...prev]);
        
        return { success: true, salon: newSalon };
      }
      
      // Code production avec Supabase
      const { data: salon, error } = await supabaseClient
        .rpc('create_salon_with_code', {
          p_name: data.name,
          p_description: data.description,
          p_category: data.category,
          p_city: data.city
        });

      if (error) {
        console.error('❌ Erreur création salon:', error);
        
        if (error.message.includes('premium')) {
          throw new Error('Seuls les membres premium peuvent créer des salons');
        }
        throw error;
      }

      // Recharger les listes
      await Promise.all([loadSalons(), loadMySalons()]);
      
      return { success: true, salon };
    } catch (err) {
      console.error('❌ Erreur dans createSalon:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur lors de la création du salon' 
      };
    }
  }, [isDevMode, supabaseClient, loadSalons, loadMySalons]);

  // Rejoindre un salon via code
  const joinSalonViaCode = useCallback(async (code: string) => {
    try {
      // En mode dev, simuler
      if (isDevMode) {
        const salon = salons.find(s => s.share_code === code);
        if (!salon) {
          return { success: false, error: 'Code invalide' };
        }
        
        // Ajouter aux mes salons si pas déjà présent
        if (!mySalons.find(s => s.id === salon.id)) {
          setMySalons(prev => [...prev, { ...salon, role: 'member', joined_at: new Date().toISOString() }]);
        }
        
        return { success: true, salon_id: salon.id, salon_name: salon.name };
      }
      
      // Code production avec Supabase
      const { data, error } = await supabaseClient
        .rpc('join_salon_via_code', {
          p_code: code
        });

      if (error) {
        console.error('❌ Erreur rejoindre salon:', error);
        throw error;
      }

      if (!data.success) {
        return data;
      }

      // Recharger mes salons
      await loadMySalons();
      
      return data;
    } catch (err) {
      console.error('❌ Erreur dans joinSalonViaCode:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur lors de la tentative de rejoindre le salon' 
      };
    }
  }, [isDevMode, salons, mySalons, supabaseClient, loadMySalons]);

  // Créer une invitation
  const createInvitation = useCallback(async (salonId: string) => {
    try {
      // En mode dev, générer un code mock
      if (isDevMode) {
        const code = `INV-${Math.random().toString(36).substr(2, 8)}`;
        return { 
          success: true, 
          invitation: {
            id: `inv-${Date.now()}`,
            salon_id: salonId,
            code,
            created_by: 'test-user',
            clicks: 0,
            signups: 0,
            created_at: new Date().toISOString()
          }
        };
      }
      
      // Code production avec Supabase
      const { data: invitation, error } = await supabaseClient
        .rpc('create_salon_invitation', {
          p_salon_id: salonId
        });

      if (error) {
        console.error('❌ Erreur création invitation:', error);
        throw error;
      }

      return { success: true, invitation };
    } catch (err) {
      console.error('❌ Erreur dans createInvitation:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur lors de la création de l\'invitation' 
      };
    }
  }, [isDevMode, supabaseClient]);

  // Charger un salon spécifique
  const getSalon = useCallback(async (salonId: string) => {
    try {
      // En mode dev, retourner un salon mocké
      if (isDevMode) {
        const salon = salons.find(s => s.id === salonId);
        if (salon) return salon;
        
        // Si pas trouvé, retourner le salon général
        return {
          id: salonId,
          name: 'Salon Test',
          description: 'Description du salon test',
          category: 'general',
          city: null,
          owner_id: 'test-user',
          share_code: 'test-code',
          member_count: 5,
          message_count: 10,
          avatar_url: null,
          color_theme: '#8B5CF6',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      // Code production avec Supabase
      const { data, error } = await supabaseClient
        .from('salons')
        .select('*')
        .eq('id', salonId)
        .single();

      if (error) {
        console.error('❌ Erreur chargement salon:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error('❌ Erreur dans getSalon:', err);
      return null;
    }
  }, [isDevMode, salons, supabaseClient]);

  // Charger les salons au montage
  useEffect(() => {
    loadSalons();
    loadMySalons();
  }, [loadSalons, loadMySalons]);

  return {
    salons,
    mySalons,
    loading,
    error,
    createSalon,
    joinSalonViaCode,
    createInvitation,
    getSalon,
    refresh: () => {
      loadSalons();
      loadMySalons();
    }
  };
}

// Hook pour un salon spécifique
export function useSalon(salonId?: string) {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isDevMode = process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true';
  
  const supabaseClient = useMemo(() => {
    return isDevMode ? createDevSupabaseClient() : supabase;
  }, [isDevMode]);

  useEffect(() => {
    if (!salonId) {
      setSalon(null);
      setLoading(false);
      return;
    }

    const loadSalon = async () => {
      try {
        setLoading(true);
        
        // En mode dev, retourner un salon mocké
        if (isDevMode) {
          setSalon({
            id: salonId,
            name: salonId === '00000000-0000-0000-0000-000000000000' ? 'Chat Général Aurora50' : 'Salon Test',
            description: 'Description du salon',
            category: 'general',
            city: null,
            owner_id: 'test-user',
            share_code: 'test-code',
            member_count: 5,
            message_count: 10,
            avatar_url: null,
            color_theme: '#8B5CF6',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          return;
        }
        
        // Code production
        const { data, error } = await supabaseClient
          .from('salons')
          .select('*')
          .eq('id', salonId)
          .single();

        if (error) {
          console.error('❌ Erreur chargement salon:', error);
        } else {
          setSalon(data);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSalon();
  }, [salonId, isDevMode, supabaseClient]);

  return { salon, loading };
}
