export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      highlights: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          trip_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          trip_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          trip_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "highlights_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          created_at: string | null
          date: string | null
          gps_reference: unknown | null
          id: number
          is_cover_photo: boolean
          location: unknown | null
          metadata: Json
          name: string | null
          note: string | null
          title: string | null
          trip_id: number | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          gps_reference?: unknown | null
          id?: number
          is_cover_photo?: boolean
          location?: unknown | null
          metadata?: Json
          name?: string | null
          note?: string | null
          title?: string | null
          trip_id?: number | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          gps_reference?: unknown | null
          id?: number
          is_cover_photo?: boolean
          location?: unknown | null
          metadata?: Json
          name?: string | null
          note?: string | null
          title?: string | null
          trip_id?: number | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      species_observations: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          gps_location: unknown | null
          id: number
          photo_url: string | null
          species_name: string
          trip_id: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          gps_location?: unknown | null
          id?: number
          photo_url?: string | null
          species_name: string
          trip_id?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          gps_location?: unknown | null
          id?: number
          photo_url?: string | null
          species_name?: string
          trip_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "species_observations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: number
          name: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          usage_count?: number
        }
        Relationships: []
      }
      trip_tags: {
        Row: {
          created_at: string
          tag_id: number
          trip_id: number
        }
        Insert: {
          created_at?: string
          tag_id: number
          trip_id: number
        }
        Update: {
          created_at?: string
          tag_id?: number
          trip_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "trip_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "popular_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_tags_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string | null
          description: string | null
          gps_reference: unknown | null
          gpx_file: string | null
          id: number
          search_vector_cs: unknown | null
          search_vector_en: unknown | null
          title: string
          title_trigram: string | null
          trip_date: string | null
          trip_path: unknown | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          gps_reference?: unknown | null
          gpx_file?: string | null
          id?: number
          search_vector_cs?: unknown | null
          search_vector_en?: unknown | null
          title: string
          title_trigram?: string | null
          trip_date?: string | null
          trip_path?: unknown | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          gps_reference?: unknown | null
          gpx_file?: string | null
          id?: number
          search_vector_cs?: unknown | null
          search_vector_en?: unknown | null
          title?: string
          title_trigram?: string | null
          trip_date?: string | null
          trip_path?: unknown | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      popular_tags: {
        Row: {
          id: number | null
          name: string | null
          usage_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_trips: {
        Args: {
          cur_user_id: string
        }
        Returns: {
          trip_id: string
          title: string
          description: string
          trip_date: string
          lat: number
          long: number
          trip_path: Json
          photos: Json
          tags: string[]
        }[]
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      unaccent: {
        Args: {
          "": string
        }
        Returns: string
      }
      unaccent_init: {
        Args: {
          "": unknown
        }
        Returns: unknown
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
