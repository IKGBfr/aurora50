import { useEffect, useState } from 'react'
import { createClient } from 'lib/supabase/client'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

interface EmailVerificationState {
  isVerified: boolean | null
  loading: boolean
  user: User | null
}

export function useEmailVerification() {
  const [state, setState] = useState<EmailVerificationState>({
    isVerified: null,
    loading: true,
    user: null
  })
  const supabase = createClient()

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      setState({
        isVerified: !!user?.email_confirmed_at,
        loading: false,
        user
      })
    }

    checkVerificationStatus()
    
    // Listener pour changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setState({
        isVerified: !!session?.user?.email_confirmed_at,
        loading: false,
        user: session?.user ?? null
      })
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const resendVerificationEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return { error: { message: 'Email manquant' } }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    })

    return { error }
  }

  return {
    ...state,
    resendVerificationEmail,
  }
}
