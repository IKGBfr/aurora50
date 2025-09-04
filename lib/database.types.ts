export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: number
          is_deleted: boolean | null
          reply_to_id: number | null
          salon_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: number
          is_deleted?: boolean | null
          reply_to_id?: number | null
          salon_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: number
          is_deleted?: boolean | null
          reply_to_id?: number | null
          salon_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "my_salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          color_gradient: string | null
          created_at: string
          description: string | null
          duration_weeks: number | null
          emoji: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          pillar_number: number | null
          short_description: string | null
          slug: string | null
          title: string
        }
        Insert: {
          color_gradient?: string | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          emoji?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          pillar_number?: number | null
          short_description?: string | null
          slug?: string | null
          title: string
        }
        Update: {
          color_gradient?: string | null
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          emoji?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          pillar_number?: number | null
          short_description?: string | null
          slug?: string | null
          title?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          lesson_number: number | null
          release_day_offset: number
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          lesson_number?: number | null
          release_day_offset?: number
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          lesson_number?: number | null
          release_day_offset?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: number
          message_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: number
          message_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: number
          message_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages_with_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auto_offline_after: number | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          conversion_triggers: Json | null
          cover_url: string | null
          created_at: string | null
          current_salon_id: string | null
          daily_chat_count: number | null
          daily_profile_views: number | null
          email: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          is_manual_status: boolean | null
          last_activity: string | null
          last_activity_reset: string | null
          onboarding_answers: Json | null
          onboarding_completed: boolean | null
          presence_status: string | null
          salons_created: number | null
          salons_joined: number | null
          status: string | null
          status_updated_at: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          subscription_started_at: string | null
          subscription_type: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          auto_offline_after?: number | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          conversion_triggers?: Json | null
          cover_url?: string | null
          created_at?: string | null
          current_salon_id?: string | null
          daily_chat_count?: number | null
          daily_profile_views?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          is_manual_status?: boolean | null
          last_activity?: string | null
          last_activity_reset?: string | null
          onboarding_answers?: Json | null
          onboarding_completed?: boolean | null
          presence_status?: string | null
          salons_created?: number | null
          salons_joined?: number | null
          status?: string | null
          status_updated_at?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          subscription_started_at?: string | null
          subscription_type?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_offline_after?: number | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          conversion_triggers?: Json | null
          cover_url?: string | null
          created_at?: string | null
          current_salon_id?: string | null
          daily_chat_count?: number | null
          daily_profile_views?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          is_manual_status?: boolean | null
          last_activity?: string | null
          last_activity_reset?: string | null
          onboarding_answers?: Json | null
          onboarding_completed?: boolean | null
          presence_status?: string | null
          salons_created?: number | null
          salons_joined?: number | null
          status?: string | null
          status_updated_at?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          subscription_started_at?: string | null
          subscription_type?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_salon_id_fkey"
            columns: ["current_salon_id"]
            isOneToOne: false
            referencedRelation: "my_salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_current_salon_id_fkey"
            columns: ["current_salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_current_salon_id_fkey"
            columns: ["current_salon_id"]
            isOneToOne: false
            referencedRelation: "salons_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_invitations: {
        Row: {
          clicks: number | null
          code: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          max_uses: number | null
          salon_id: string | null
          signups: number | null
          uses_count: number | null
        }
        Insert: {
          clicks?: number | null
          code: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          max_uses?: number | null
          salon_id?: string | null
          signups?: number | null
          uses_count?: number | null
        }
        Update: {
          clicks?: number | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          max_uses?: number | null
          salon_id?: string | null
          signups?: number | null
          uses_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "salon_invitations_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "my_salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_invitations_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_invitations_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_members: {
        Row: {
          joined_at: string | null
          last_seen_at: string | null
          notifications_enabled: boolean | null
          role: string | null
          salon_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          last_seen_at?: string | null
          notifications_enabled?: boolean | null
          role?: string | null
          salon_id: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          last_seen_at?: string | null
          notifications_enabled?: boolean | null
          role?: string | null
          salon_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_members_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "my_salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_members_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_members_salon_id_fkey"
            columns: ["salon_id"]
            isOneToOne: false
            referencedRelation: "salons_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      salons: {
        Row: {
          avatar_url: string | null
          category: string | null
          city: string | null
          color_theme: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          member_count: number | null
          message_count: number | null
          name: string
          owner_id: string | null
          share_code: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          category?: string | null
          city?: string | null
          color_theme?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          message_count?: number | null
          name: string
          owner_id?: string | null
          share_code: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          category?: string | null
          city?: string | null
          color_theme?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          member_count?: number | null
          message_count?: number | null
          name?: string
          owner_id?: string | null
          share_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          badge_id: string
          description: string | null
          earned_at: string | null
          icon: string | null
          id: string
          rarity: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          badge_id: string
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          rarity?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          rarity?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          metadata: Json | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_courses: {
        Row: {
          completed_at: string | null
          course_id: string
          course_thumbnail: string | null
          course_title: string
          current_lesson: number | null
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          started_at: string | null
          total_lessons: number
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          course_thumbnail?: string | null
          course_title: string
          current_lesson?: number | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          total_lessons: number
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          course_thumbnail?: string | null
          course_title?: string
          current_lesson?: number | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          started_at?: string | null
          total_lessons?: number
          user_id?: string | null
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          id: string
          last_video_position: number | null
          lesson_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          watch_time_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          last_video_position?: number | null
          lesson_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          watch_time_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          last_video_position?: number | null
          lesson_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          watch_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress_history: {
        Row: {
          created_at: string | null
          date: string
          id: string
          lessons_completed: number | null
          points_earned: number | null
          streak_maintained: boolean | null
          study_time_minutes: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          lessons_completed?: number | null
          points_earned?: number | null
          streak_maintained?: boolean | null
          study_time_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          lessons_completed?: number | null
          points_earned?: number | null
          streak_maintained?: boolean | null
          study_time_minutes?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string | null
          level: number | null
          points: number | null
          rank: number | null
          streak_days: number | null
          total_lessons_completed: number | null
          total_study_time_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          level?: number | null
          points?: number | null
          rank?: number | null
          streak_days?: number | null
          total_lessons_completed?: number | null
          total_study_time_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          level?: number | null
          points?: number | null
          rank?: number | null
          streak_days?: number | null
          total_lessons_completed?: number | null
          total_study_time_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      chat_messages_with_profiles: {
        Row: {
          avatar_url: string | null
          content: string | null
          created_at: string | null
          full_name: string | null
          id: number | null
          user_id: string | null
        }
        Relationships: []
      }
      my_salons: {
        Row: {
          avatar_url: string | null
          category: string | null
          city: string | null
          color_theme: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          joined_at: string | null
          last_seen_at: string | null
          member_count: number | null
          message_count: number | null
          name: string | null
          owner_id: string | null
          role: string | null
          share_code: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      salons_with_details: {
        Row: {
          actual_member_count: number | null
          avatar_url: string | null
          category: string | null
          city: string | null
          color_theme: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          member_count: number | null
          message_count: number | null
          messages_today: number | null
          name: string | null
          owner_avatar: string | null
          owner_id: string | null
          owner_name: string | null
          share_code: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_inactive_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_salon_invitation: {
        Args: { p_salon_id: string }
        Returns: {
          clicks: number | null
          code: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          max_uses: number | null
          salon_id: string | null
          signups: number | null
          uses_count: number | null
        }
      }
      create_salon_with_code: {
        Args: {
          p_category?: string
          p_city?: string
          p_description: string
          p_name: string
        }
        Returns: {
          avatar_url: string | null
          category: string | null
          city: string | null
          color_theme: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          member_count: number | null
          message_count: number | null
          name: string
          owner_id: string | null
          share_code: string
          updated_at: string | null
        }
      }
      delete_message: {
        Args: { p_message_id: number }
        Returns: boolean
      }
      get_all_message_reactions_batch: {
        Args: { p_message_ids: number[] }
        Returns: Json
      }
      get_message_reactions_summary: {
        Args: { p_message_id: number }
        Returns: Json
      }
      get_reply_message_info: {
        Args: { p_message_id: number }
        Returns: {
          author_name: string
          content: string
          id: number
          is_deleted: boolean
        }[]
      }
      get_table_columns: {
        Args: { table_name: string }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: string
        }[]
      }
      handle_message_reaction: {
        Args: { p_emoji?: string; p_message_id: number }
        Returns: Json
      }
      handle_user_signin: {
        Args: { user_id: string }
        Returns: undefined
      }
      handle_user_signout: {
        Args: { user_id: string }
        Returns: undefined
      }
      join_salon_via_code: {
        Args: { p_code: string }
        Returns: Json
      }
      rpc_check_inactive_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      rpc_set_manual_status: {
        Args: { new_status: string }
        Returns: undefined
      }
      rpc_update_activity: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      toggle_message_reaction: {
        Args: { p_emoji: string; p_message_id: number }
        Returns: Json
      }
      update_user_activity: {
        Args: { user_id: string }
        Returns: undefined
      }
      user_is_salon_member: {
        Args: { p_salon_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
