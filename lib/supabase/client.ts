import { createBrowserClient } from '@supabase/ssr'

/**
 * Client Supabase pour les composants côté client
 * Utilise les variables d'environnement publiques
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
