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
      chat_messages: {
        Row: {
          id: number
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          content?: string
          created_at?: string
        }
      }
    }
    Views: {
      chat_messages_with_profiles: {
        Row: {
          id: number
          content: string
          created_at: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
        }
      }
    }
  }
}
