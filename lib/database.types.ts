export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          cover_url: string | null
          bio: string | null
          email: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          email?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          bio?: string | null
          email?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
