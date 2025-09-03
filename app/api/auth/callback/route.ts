import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const codeVerifier = requestUrl.searchParams.get('code_verifier')
  const error = requestUrl.searchParams.get('error')
  const errorCode = requestUrl.searchParams.get('error_code')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next')

  // Log tous les paramètres reçus pour le débogage
  console.log('Auth callback received params:', {
    code: code ? 'present' : 'absent',
    codeVerifier: codeVerifier ? 'present' : 'absent',
    error,
    errorCode,
    errorDescription,
    allParams: Object.fromEntries(requestUrl.searchParams.entries())
  })

  // Gérer les erreurs explicites de Supabase
  if (error || errorCode) {
    console.error('Auth callback error:', { error, errorCode, errorDescription })
    
    // Rediriger vers la page de connexion avec un message d'erreur
    const redirectUrl = new URL('/connexion', requestUrl.origin)
    
    // Ajouter un message d'erreur approprié
    if (errorCode === 'otp_expired') {
      redirectUrl.searchParams.set('error', 'expired')
    } else if (error === 'access_denied') {
      redirectUrl.searchParams.set('error', 'denied')
    } else {
      redirectUrl.searchParams.set('error', 'invalid')
    }
    
    return NextResponse.redirect(redirectUrl)
  }

  if (code) {
    const supabase = await createClient()
    
    try {
      let exchangeResult
      let sessionEstablished = false
      
      // Détection Magic Link : code présent MAIS pas de code_verifier
      if (!codeVerifier) {
        console.log('Magic Link detected (no code_verifier), attempting exchange without PKCE')
        
        // Pour les Magic Links, essayer d'abord sans code_verifier
        try {
          exchangeResult = await supabase.auth.exchangeCodeForSession(code)
          const { error: exchangeError, data } = exchangeResult
          
          if (!exchangeError && data?.session) {
            console.log('Session exchange successful without PKCE')
            sessionEstablished = true
            
            // Vérifier le profil pour déterminer la redirection
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single()
            
            // Si le profil n'est pas complet ou nouveau
            if (!profile?.full_name || !profile?.onboarding_completed) {
              return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
            }
            
            // Sinon rediriger vers la page demandée ou le dashboard
            return NextResponse.redirect(new URL(next || '/dashboard', requestUrl.origin))
          } else {
            console.log('Exchange without PKCE failed:', exchangeError?.message)
            
            // Si l'erreur mentionne spécifiquement le code_verifier
            if (exchangeError?.message?.includes('code verifier')) {
              console.log('PKCE is strictly required, trying alternative methods...')
              
              // Alternative 1: Essayer avec verifyOtp pour Magic Links
              try {
                console.log('Attempting verifyOtp with token_hash')
                const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
                  token_hash: code,
                  type: 'magiclink'
                })
                
                if (!otpError && otpData?.session) {
                  console.log('verifyOtp successful')
                  return NextResponse.redirect(new URL(next || '/dashboard', requestUrl.origin))
                } else {
                  console.log('verifyOtp failed:', otpError?.message)
                }
              } catch (otpErr) {
                console.error('verifyOtp error:', otpErr)
              }
              
              // Note: verifyOtp avec 'token' nécessite aussi un email, 
              // ce qui n'est pas disponible dans le callback
              // Seule l'option token_hash est viable pour les Magic Links
            }
          }
        } catch (e) {
          console.error('Exchange without PKCE exception:', e)
        }
      } else {
        // Si code_verifier est présent, c'est un flow OAuth standard avec PKCE
        console.log('OAuth flow detected (code_verifier present), using standard PKCE')
        exchangeResult = await supabase.auth.exchangeCodeForSession(code)
        
        const { error: exchangeError, data } = exchangeResult
        
        if (!exchangeError && data?.session) {
          console.log('Session exchange successful with PKCE')
          
          // Vérifier le profil pour déterminer la redirection
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single()
          
          // Si le profil n'est pas complet ou nouveau
          if (!profile?.full_name || !profile?.onboarding_completed) {
            return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
          }
          
          // Sinon rediriger vers la page demandée ou le dashboard
          return NextResponse.redirect(new URL(next || '/dashboard', requestUrl.origin))
        }
      }
      
      // Si on arrive ici, toutes les tentatives ont échoué
      if (!sessionEstablished) {
        console.error('All authentication attempts failed')
        
        // Rediriger vers connexion avec erreur
        const redirectUrl = new URL('/connexion', requestUrl.origin)
        
        if (exchangeResult?.error?.message?.includes('expired')) {
          redirectUrl.searchParams.set('error', 'expired')
        } else if (exchangeResult?.error?.message?.includes('code verifier')) {
          console.error('PKCE incompatibility with Magic Links detected')
          console.error('Consider disabling PKCE in Supabase Dashboard for Magic Links to work')
          redirectUrl.searchParams.set('error', 'invalid')
        } else {
          redirectUrl.searchParams.set('error', 'invalid')
        }
        
        return NextResponse.redirect(redirectUrl)
      }
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      
      // Rediriger vers connexion avec erreur générique
      const redirectUrl = new URL('/connexion', requestUrl.origin)
      redirectUrl.searchParams.set('error', 'invalid')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Si pas de code et pas d'erreur, rediriger vers /auth/confirm pour gérer les tokens dans le hash
  return NextResponse.redirect(
    new URL(`/auth/confirm?next=${encodeURIComponent(next || '/dashboard')}`, requestUrl.origin)
  )
}
