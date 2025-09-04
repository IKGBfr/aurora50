'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/database.types';

// Utilisateur de test pour le développement
const DEV_USER: User = {
  id: 'dev-user-123',
  email: 'test@aurora50.dev',
  app_metadata: {},
  user_metadata: {
    full_name: 'Marie Dupont (Dev)',
  },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  confirmed_at: '2024-01-01T00:00:00.000Z',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  phone: '',
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

// Hook principal d'authentification
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En mode développement, utiliser l'utilisateur de test
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true') {
      setUser(DEV_USER);
      setLoading(false);
      return;
    }

    // En production ou si dev auth désactivé, utiliser Supabase normal
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Récupérer l'utilisateur actuel
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fonction de déconnexion
  const signOut = async () => {
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    await supabase.auth.signOut();
  };

  return { 
    user, 
    loading, 
    isAuthenticated: !!user,
    signOut 
  };
}

// Hook pour protéger les pages qui nécessitent une authentification
export function useRequireAuth(redirectUrl = '/connexion') {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      console.log('[useRequireAuth] Pas d\'utilisateur, redirection vers:', redirectUrl);
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);
  
  return { user, loading, signOut };
}

// Hook pour rediriger les utilisateurs connectés (utile pour les pages de connexion/inscription)
export function useRedirectIfAuthenticated(redirectUrl = '/dashboard') {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && user) {
      console.log('[useRedirectIfAuthenticated] Utilisateur connecté, redirection vers:', redirectUrl);
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);
  
  return { user, loading };
}