'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // Créer le client Supabase une seule fois
  const supabase = createClient()

  useEffect(() => {
    // Fonction pour charger la session initiale
    const initializeAuth = async () => {
      try {
        console.log('[AuthProvider] Initialisation...')
        
        // Récupérer la session actuelle
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('[AuthProvider] Erreur getSession:', error)
          setLoading(false)
          return
        }

        if (currentSession) {
          console.log('[AuthProvider] Session trouvée:', currentSession.user.id)
          setSession(currentSession)
          setUser(currentSession.user)
        } else {
          console.log('[AuthProvider] Aucune session active')
        }
      } catch (error) {
        console.error('[AuthProvider] Erreur initialisation:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`[AuthProvider] Event: ${event}`, {
          userId: newSession?.user?.id,
          hasSession: !!newSession
        })
        
        // Mettre à jour l'état
        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        // Gérer les événements spécifiques
        switch (event) {
          case 'SIGNED_IN':
            console.log('[AuthProvider] Connexion détectée')
            // Vérifier si on doit rediriger vers l'onboarding
            if (newSession?.user) {
              checkOnboardingStatus(newSession.user.id)
            }
            break
            
          case 'SIGNED_OUT':
            console.log('[AuthProvider] Déconnexion détectée')
            // Rediriger uniquement si on n'est pas déjà sur une page publique
            const publicPaths = ['/connexion', '/inscription', '/', '/programme', '/charte']
            if (!publicPaths.includes(pathname)) {
              router.push('/connexion')
            }
            break
            
          case 'TOKEN_REFRESHED':
            console.log('[AuthProvider] Token rafraîchi')
            break
            
          case 'USER_UPDATED':
            console.log('[AuthProvider] Utilisateur mis à jour')
            break
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Pas de dépendances pour éviter les re-renders

  // Fonction pour vérifier le statut d'onboarding
  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, full_name')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[AuthProvider] Erreur récupération profil:', error)
        // Si le profil n'existe pas, rediriger vers onboarding
        if (error.code === 'PGRST116') {
          console.log('[AuthProvider] Profil inexistant, création nécessaire')
          // Ne pas rediriger automatiquement ici
          // Laisser la page dashboard gérer cette logique
        }
        return
      }

      if (profile) {
        console.log('[AuthProvider] Profil trouvé:', {
          onboardingCompleted: profile.onboarding_completed,
          hasFullName: !!profile.full_name
        })
        
        // Ne pas faire de redirection automatique ici
        // Les pages individuelles géreront leur propre logique de redirection
      }
    } catch (error) {
      console.error('[AuthProvider] Erreur checkOnboardingStatus:', error)
    }
  }

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      console.log('[AuthProvider] Déconnexion en cours...')
      setLoading(true)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('[AuthProvider] Erreur signOut:', error)
        throw error
      }
      
      console.log('[AuthProvider] Déconnexion réussie')
      
      // L'état sera mis à jour via onAuthStateChange
      // La redirection sera gérée là aussi
    } catch (error) {
      console.error('[AuthProvider] Erreur lors de la déconnexion:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour rafraîchir manuellement la session
  const refreshSession = async () => {
    try {
      console.log('[AuthProvider] Rafraîchissement de la session...')
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('[AuthProvider] Erreur refresh:', error)
        return
      }
      
      if (newSession) {
        console.log('[AuthProvider] Session rafraîchie avec succès')
        setSession(newSession)
        setUser(newSession.user)
      }
    } catch (error) {
      console.error('[AuthProvider] Erreur refreshSession:', error)
    }
  }

  // Valeur du contexte
  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

// Hook pour protéger les pages
export function useRequireAuth(redirectUrl = '/connexion') {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      console.log('[useRequireAuth] Pas d\'utilisateur, redirection vers:', redirectUrl)
      router.push(redirectUrl)
    }
  }, [user, loading, router, redirectUrl])
  
  return { user, loading }
}

// Hook pour rediriger les utilisateurs connectés (pages publiques)
export function useRedirectIfAuthenticated(redirectUrl = '/dashboard') {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && user) {
      console.log('[useRedirectIfAuthenticated] Utilisateur connecté, redirection vers:', redirectUrl)
      router.push(redirectUrl)
    }
  }, [user, loading, router, redirectUrl])
  
  return { user, loading }
}