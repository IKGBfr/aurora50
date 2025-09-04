import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
      cookieEncoding: 'base64url',
    }
  )

  // Récupérer la session
  const { data: { user } } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname

  // Définir les types de routes
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                           pathname.startsWith('/cours') ||
                           pathname.startsWith('/chat') ||
                           pathname.startsWith('/messages') ||
                           pathname.startsWith('/membres') ||
                           pathname.startsWith('/profil')
  
  const isOnboardingRoute = pathname === '/onboarding'
  const isAuthRoute = pathname === '/connexion' || 
                      pathname === '/inscription' ||
                      pathname === '/reinitialiser-mot-de-passe'

  // 1. Si pas connecté et route protégée → connexion
  if (!user && (isProtectedRoute || isOnboardingRoute)) {
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  // 2. Si connecté
  if (user) {
    // Si sur page auth → rediriger vers dashboard
    if (isAuthRoute && pathname !== '/reinitialiser-mot-de-passe') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Si route protégée (pas onboarding), vérifier si onboarding complété
    if (isProtectedRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      // Si onboarding non complété → forcer onboarding
      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }

    // Si sur onboarding et déjà complété → dashboard
    if (isOnboardingRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}