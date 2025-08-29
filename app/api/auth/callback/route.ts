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

  // Rediriger vers /auth/confirm pour gérer les tokens dans le hash
  return NextResponse.redirect(
    new URL(`/auth/confirm?next=${encodeURIComponent(next)}`, requestUrl.origin)
  )
}
