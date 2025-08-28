import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Échanger le code contre une session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirection vers la page demandée ou le dashboard
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // En cas d'erreur, rediriger vers la page de connexion
  return NextResponse.redirect(new URL('/connexion', requestUrl.origin))
}
