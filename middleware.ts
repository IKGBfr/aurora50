import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // En mode dev avec auth simulée, bypass toute vérification
  const isDevMode = process.env.NODE_ENV === 'development' && 
                    process.env.NEXT_PUBLIC_USE_DEV_AUTH === 'true'
  
  if (isDevMode) {
    // Permettre l'accès à toutes les routes en mode dev
    return NextResponse.next()
  }

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = [
    '/',
    '/connexion',
    '/inscription',
    '/confirmation-attente',
    '/auth/confirmer',
    '/mot-de-passe-oublie',
    '/charte',
    '/cours/guide-demarrage',
    '/programme',
    '/sigrid-larsen',
    '/merci',
    '/auth/confirm',
    '/inscription/confirmation',
  ]

  // Routes API qui ne nécessitent pas d'authentification
  const publicApiRoutes = [
    '/api/auth/callback',
    '/api/auth/confirm',
    '/api/webhooks',
  ]
  
  // Routes qui nécessitent une authentification mais pas de vérification supplémentaire
  // (comme l'onboarding qui est accessible aux nouveaux utilisateurs)
  const semiProtectedRoutes = [
    '/onboarding',
  ]

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.includes(pathname) || 
    publicApiRoutes.some(route => pathname.startsWith(route))
  
  // Vérifier si c'est une route semi-protégée (nécessite auth mais pas de profil complet)
  const isSemiProtectedRoute = semiProtectedRoutes.includes(pathname)

  // Vérifier si c'est une route protégée (LMS)
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
    pathname.startsWith('/cours') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/messages') ||
    pathname.startsWith('/membres') ||
    pathname.startsWith('/profil')

  // Rafraîchir la session et récupérer l'utilisateur
  const { supabaseResponse, user } = await updateSession(request)

  // Si route protégée ou semi-protégée et pas d'utilisateur
  if ((isProtectedRoute || isSemiProtectedRoute) && !user) {
    // Rediriger vers connexion
    const redirectUrl = new URL('/connexion', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si utilisateur connecté essaie d'accéder à la page de connexion, rediriger vers dashboard
  // MAIS permettre l'accès à /inscription pour les nouveaux utilisateurs
  if (pathname === '/connexion' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need protection
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
