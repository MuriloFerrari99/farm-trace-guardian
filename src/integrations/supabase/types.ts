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
      documents: {
        Row: {
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          reception_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          reception_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          reception_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expedition_items: {
        Row: {
          expedition_id: string | null
          id: string
          lot_reference: string | null
          quantity_kg: number
          reception_id: string | null
        }
        Insert: {
          expedition_id?: string | null
          id?: string
          lot_reference?: string | null
          quantity_kg: number
          reception_id?: string | null
        }
        Update: {
          expedition_id?: string | null
          id?: string
          lot_reference?: string | null
          quantity_kg?: number
          reception_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expedition_items_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expedition_items_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
        ]
      }
      expeditions: {
        Row: {
          created_at: string | null
          destination: string
          executed_by: string | null
          expedition_code: string
          expedition_date: string
          expedition_documents: string[] | null
          id: string
          total_weight_kg: number
          transporter: string | null
          vehicle_plate: string | null
        }
        Insert: {
          created_at?: string | null
          destination: string
          executed_by?: string | null
          expedition_code: string
          expedition_date?: string
          expedition_documents?: string[] | null
          id?: string
          total_weight_kg: number
          transporter?: string | null
          vehicle_plate?: string | null
        }
        Update: {
          created_at?: string | null
          destination?: string
          executed_by?: string | null
          expedition_code?: string
          expedition_date?: string
          expedition_documents?: string[] | null
          id?: string
          total_weight_kg?: number
          transporter?: string | null
          vehicle_plate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expeditions_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          created_at: string | null
          id: string
          label_code: string
          printed_at: string | null
          printed_by: string | null
          qr_code: string | null
          reception_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label_code: string
          printed_at?: string | null
          printed_by?: string | null
          qr_code?: string | null
          reception_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label_code?: string
          printed_at?: string | null
          printed_by?: string | null
          qr_code?: string | null
          reception_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "labels_printed_by_fkey"
            columns: ["printed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labels_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          address: string | null
          certificate_expiry: string
          certificate_number: string
          created_at: string | null
          email: string | null
          ggn: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          certificate_expiry: string
          certificate_number: string
          created_at?: string | null
          email?: string | null
          ggn: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          certificate_expiry?: string
          certificate_number?: string
          created_at?: string | null
          email?: string | null
          ggn?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      receptions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          harvest_date: string | null
          id: string
          lot_number: string | null
          notes: string | null
          producer_id: string
          product_type: Database["public"]["Enums"]["product_type"]
          quantity_kg: number
          received_by: string | null
          reception_code: string
          reception_date: string
          status: Database["public"]["Enums"]["reception_status"] | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          harvest_date?: string | null
          id?: string
          lot_number?: string | null
          notes?: string | null
          producer_id: string
          product_type: Database["public"]["Enums"]["product_type"]
          quantity_kg: number
          received_by?: string | null
          reception_code: string
          reception_date?: string
          status?: Database["public"]["Enums"]["reception_status"] | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          harvest_date?: string | null
          id?: string
          lot_number?: string | null
          notes?: string | null
          producer_id?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          quantity_kg?: number
          received_by?: string | null
          reception_code?: string
          reception_date?: string
          status?: Database["public"]["Enums"]["reception_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receptions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receptions_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receptions_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          destination_area_id: string | null
          executed_by: string | null
          id: string
          movement_date: string | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          notes: string | null
          origin_area_id: string | null
          quantity_kg: number
          reception_id: string | null
          storage_area_id: string | null
        }
        Insert: {
          destination_area_id?: string | null
          executed_by?: string | null
          id?: string
          movement_date?: string | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          notes?: string | null
          origin_area_id?: string | null
          quantity_kg: number
          reception_id?: string | null
          storage_area_id?: string | null
        }
        Update: {
          destination_area_id?: string | null
          executed_by?: string | null
          id?: string
          movement_date?: string | null
          movement_type?: Database["public"]["Enums"]["movement_type"]
          notes?: string | null
          origin_area_id?: string | null
          quantity_kg?: number
          reception_id?: string | null
          storage_area_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_destination_area_id_fkey"
            columns: ["destination_area_id"]
            isOneToOne: false
            referencedRelation: "storage_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_executed_by_fkey"
            columns: ["executed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_origin_area_id_fkey"
            columns: ["origin_area_id"]
            isOneToOne: false
            referencedRelation: "storage_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_storage_area_id_fkey"
            columns: ["storage_area_id"]
            isOneToOne: false
            referencedRelation: "storage_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_areas: {
        Row: {
          area_code: string
          capacity_kg: number | null
          created_at: string | null
          current_stock_kg: number | null
          id: string
          is_active: boolean | null
          is_certified: boolean | null
          name: string
        }
        Insert: {
          area_code: string
          capacity_kg?: number | null
          created_at?: string | null
          current_stock_kg?: number | null
          id?: string
          is_active?: boolean | null
          is_certified?: boolean | null
          name: string
        }
        Update: {
          area_code?: string
          capacity_kg?: number | null
          created_at?: string | null
          current_stock_kg?: number | null
          id?: string
          is_active?: boolean | null
          is_certified?: boolean | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      movement_type: "entrada" | "saida" | "transferencia" | "consolidacao"
      product_type: "tomate" | "alface" | "pepino" | "pimentao" | "outros"
      reception_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "operator" | "supervisor"
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
      movement_type: ["entrada", "saida", "transferencia", "consolidacao"],
      product_type: ["tomate", "alface", "pepino", "pimentao", "outros"],
      reception_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "operator", "supervisor"],
    },
  },
} as const
