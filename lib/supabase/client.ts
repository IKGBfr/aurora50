import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

/**
 * Client Supabase pour le navigateur (pattern Singleton)
 * Assure qu'une seule instance du client est créée et utilisée dans toute l'application.
 */

// Crée une seule instance du client Supabase
const supabaseClient = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Export par défaut pour la compatibilité existante
export default supabaseClient

// Export nommé pour la nouvelle convention
export function createClient() {
  return supabaseClient
}