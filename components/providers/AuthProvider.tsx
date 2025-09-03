'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Vérifier la session actuelle
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        // Gestion automatique du statut de présence
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Appeler la fonction pour mettre le statut en ligne
            const { error } = await supabase.rpc('handle_user_signin', {
              user_id: session.user.id
            })
            
            if (error) {
              console.error('Erreur lors de la mise à jour du statut à la connexion:', error)
            } else {
              console.log('✅ Statut mis à jour: En ligne')
            }
          } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error)
          }
        }
        
        // Redirection après déconnexion seulement
        if (event === 'SIGNED_OUT') {
          // Mettre le statut hors ligne avant la redirection
          if (session?.user) {
            try {
              await supabase.rpc('handle_user_signout', {
                user_id: session.user.id
              })
              console.log('✅ Statut mis à jour: Hors ligne')
            } catch (error) {
              console.error('Erreur lors de la mise à jour du statut à la déconnexion:', error)
            }
          }
          router.push('/connexion')
        }

        // Gestion de l'expiration de session
        if (event === 'TOKEN_REFRESHED') {
          console.log('Session rafraîchie avec succès')
        }

        // Log pour debug (peut être supprimé en production)
        if (event === 'SIGNED_IN') {
          console.log('Événement SIGNED_IN détecté - statut mis à jour automatiquement')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Récupérer l'utilisateur actuel avant la déconnexion
      const currentUser = user
      
      // Se déconnecter
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Mettre le statut hors ligne
      if (currentUser) {
        try {
          await supabase.rpc('handle_user_signout', {
            user_id: currentUser.id
          })
          console.log('✅ Statut mis à jour lors de la déconnexion: Hors ligne')
        } catch (statusError) {
          console.error('Erreur lors de la mise à jour du statut:', statusError)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
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
