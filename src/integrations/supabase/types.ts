export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accommodations: {
        Row: {
          album_url: string | null
          block_note: string | null
          block_period: Json | null
          block_reason: string | null
          capacity: number
          category: string
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          images: string[] | null
          is_blocked: boolean | null
          name: string
          room_number: string
          updated_at: string | null
        }
        Insert: {
          album_url?: string | null
          block_note?: string | null
          block_period?: Json | null
          block_reason?: string | null
          capacity: number
          category: string
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_blocked?: boolean | null
          name: string
          room_number: string
          updated_at?: string | null
        }
        Update: {
          album_url?: string | null
          block_note?: string | null
          block_period?: Json | null
          block_reason?: string | null
          capacity?: number
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_blocked?: boolean | null
          name?: string
          room_number?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      areas: {
        Row: {
          accommodation_id: string | null
          area_type: Database["public"]["Enums"]["area_type"] | null
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          accommodation_id?: string | null
          area_type?: Database["public"]["Enums"]["area_type"] | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          accommodation_id?: string | null
          area_type?: Database["public"]["Enums"]["area_type"] | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          maintenance_order_id: string
          notes: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          maintenance_order_id: string
          notes?: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          maintenance_order_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_history_maintenance_order_id_fkey"
            columns: ["maintenance_order_id"]
            isOneToOne: false
            referencedRelation: "maintenance_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_orders: {
        Row: {
          actual_hours: number | null
          area_id: string
          assigned_to: string | null
          completed_at: string | null
          cost: number | null
          created_at: string
          description: string
          estimated_hours: number | null
          id: string
          notes: string | null
          order_number: string
          priority: Database["public"]["Enums"]["maintenance_priority"]
          requested_by: string
          scheduled_date: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          area_id: string
          assigned_to?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          description: string
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          order_number: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          requested_by: string
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          area_id?: string
          assigned_to?: string | null
          completed_at?: string | null
          cost?: number | null
          created_at?: string
          description?: string
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          requested_by?: string
          scheduled_date?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_orders_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      module_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module_name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module_name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module_name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      price_periods: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_holiday: boolean | null
          minimum_stay: number | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_holiday?: boolean | null
          minimum_stay?: number | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_holiday?: boolean | null
          minimum_stay?: number | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prices_by_category_and_people: {
        Row: {
          category: string
          created_at: string
          id: string
          min_nights: number | null
          number_of_people: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          period_id: string
          price_per_night: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          min_nights?: number | null
          number_of_people: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          period_id: string
          price_per_night: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          min_nights?: number | null
          number_of_people?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          period_id?: string
          price_per_night?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_by_category_and_people_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "price_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      prices_by_people: {
        Row: {
          accommodation_id: string | null
          created_at: string | null
          id: string
          includes_breakfast: boolean | null
          people: number
          period_id: string | null
          price_per_night: number
          updated_at: string | null
        }
        Insert: {
          accommodation_id?: string | null
          created_at?: string | null
          id?: string
          includes_breakfast?: boolean | null
          people: number
          period_id?: string | null
          price_per_night: number
          updated_at?: string | null
        }
        Update: {
          accommodation_id?: string | null
          created_at?: string | null
          id?: string
          includes_breakfast?: boolean | null
          people?: number
          period_id?: string | null
          price_per_night?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_by_people_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prices_by_people_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "price_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      role_module_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          module_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          module_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          module_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
        }[]
      }
      get_compatible_prices: {
        Args: {
          p_category: string
          p_capacity: number
          p_period_id: string
          p_guests: number
        }
        Returns: {
          id: string
          category: string
          number_of_people: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          period_id: string
          price_per_night: number
          min_nights: number
        }[]
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          full_name: string
          role: Database["public"]["Enums"]["user_role"]
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string
        }[]
      }
      get_current_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_current_user_admin_or_master: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_master: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_admin_or_master: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      area_type:
        | "accommodation"
        | "common"
        | "maintenance"
        | "restaurant"
        | "recreation"
      maintenance_priority: "low" | "medium" | "high" | "urgent"
      maintenance_status: "pending" | "in_progress" | "completed" | "cancelled"
      payment_method: "pix" | "credit_card"
      user_role: "master" | "reception" | "maintenance" | "cleaning" | "admin"
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
    Enums: {
      area_type: [
        "accommodation",
        "common",
        "maintenance",
        "restaurant",
        "recreation",
      ],
      maintenance_priority: ["low", "medium", "high", "urgent"],
      maintenance_status: ["pending", "in_progress", "completed", "cancelled"],
      payment_method: ["pix", "credit_card"],
      user_role: ["master", "reception", "maintenance", "cleaning", "admin"],
    },
  },
} as const
