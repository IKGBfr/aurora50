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
          // Nouveaux champs freemium
          onboarding_completed: boolean
          onboarding_answers: any | null
          subscription_type: 'free' | 'trial' | 'premium'
          subscription_started_at: string | null
          trial_ends_at: string | null
          conversion_triggers: any[]
          daily_chat_count: number
          daily_profile_views: number
          last_activity_reset: string
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
          // Nouveaux champs freemium
          onboarding_completed?: boolean
          onboarding_answers?: any | null
          subscription_type?: 'free' | 'trial' | 'premium'
          subscription_started_at?: string | null
          trial_ends_at?: string | null
          conversion_triggers?: any[]
          daily_chat_count?: number
          daily_profile_views?: number
          last_activity_reset?: string
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
          // Nouveaux champs freemium
          onboarding_completed?: boolean
          onboarding_answers?: any | null
          subscription_type?: 'free' | 'trial' | 'premium'
          subscription_started_at?: string | null
          trial_ends_at?: string | null
          conversion_triggers?: any[]
          daily_chat_count?: number
          daily_profile_views?: number
          last_activity_reset?: string
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
      premium_users: {
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
          onboarding_completed: boolean
          onboarding_answers: any | null
          subscription_type: 'trial' | 'premium'
          subscription_started_at: string | null
          trial_ends_at: string | null
          conversion_triggers: any[]
          daily_chat_count: number
          daily_profile_views: number
          last_activity_reset: string
        }
      }
    }
  }
}

// Types utilitaires pour l'onboarding
export type OnboardingAnswers = {
  situation?: 'active' | 'transition' | 'retired' | 'searching'
  motivation?: 'change' | 'loneliness' | 'learning' | 'curiosity'
  priority?: 'emotional' | 'physical' | 'career' | 'relationships'
}

// Types pour les triggers de conversion
export type ConversionTrigger = {
  type: 'limit_reached' | 'premium_content' | 'trial_ending' | 'engagement'
  timestamp: string
  details?: any
}

// Type pour le profil utilisateur complet
export type UserProfile = Database['public']['Tables']['profiles']['Row']

// Type pour les limites freemium
export type SubscriptionType = 'free' | 'trial' | 'premium'

export type FreemiumLimits = {
  chat_messages_per_day: number | 'unlimited'
  profile_views_per_day: number | 'unlimited'
  courses_accessible: string[] | 'all'
  live_access: boolean
  private_messages: boolean
  sigrid_qa: boolean
  downloads: boolean
}
