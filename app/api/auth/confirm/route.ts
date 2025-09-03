import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  console.log('Auth confirm received params:', {
    token_hash: token_hash ? 'present' : 'absent',
    type,
    next
  })

  if (token_hash && type) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (!error) {
        console.log('Email confirmed successfully')
        
        // Vérifier si l'utilisateur a un profil complet
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          // Si le profil n'est pas complet ou l'onboarding n'est pas fait
          if (!profile?.onboarding_completed) {
            console.log('Redirecting to onboarding (profile not complete)')
            return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
          }
        }
        
        // Email confirmé avec succès, rediriger vers la destination
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      } else {
        console.error('Email confirmation error:', error)
      }
    } catch (err) {
      console.error('Unexpected error in auth confirm:', err)
    }
  }

  // En cas d'erreur ou de paramètres manquants
  console.log('Invalid confirmation link, redirecting to login')
  return NextResponse.redirect(
    new URL(`/connexion?error=invalid_link`, requestUrl.origin)
  )
}
