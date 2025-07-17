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
      acc_contracts: {
        Row: {
          advance_amount_usd: number | null
          advance_percentage: number | null
          amount_brl: number | null
          amount_usd: number
          bank_code: string | null
          bank_name: string
          contract_date: string
          contract_number: string
          created_at: string | null
          created_by: string | null
          exchange_rate: number
          expedition_id: string | null
          id: string
          interest_rate: number
          iof_rate: number | null
          liquidation_date: string | null
          liquidation_rate: number | null
          maturity_date: string
          notes: string | null
          producer_id: string | null
          status: Database["public"]["Enums"]["acc_status"] | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          advance_amount_usd?: number | null
          advance_percentage?: number | null
          amount_brl?: number | null
          amount_usd: number
          bank_code?: string | null
          bank_name: string
          contract_date: string
          contract_number: string
          created_at?: string | null
          created_by?: string | null
          exchange_rate: number
          expedition_id?: string | null
          id?: string
          interest_rate: number
          iof_rate?: number | null
          liquidation_date?: string | null
          liquidation_rate?: number | null
          maturity_date: string
          notes?: string | null
          producer_id?: string | null
          status?: Database["public"]["Enums"]["acc_status"] | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          advance_amount_usd?: number | null
          advance_percentage?: number | null
          amount_brl?: number | null
          amount_usd?: number
          bank_code?: string | null
          bank_name?: string
          contract_date?: string
          contract_number?: string
          created_at?: string | null
          created_by?: string | null
          exchange_rate?: number
          expedition_id?: string | null
          id?: string
          interest_rate?: number
          iof_rate?: number | null
          liquidation_date?: string | null
          liquidation_rate?: number | null
          maturity_date?: string
          notes?: string | null
          producer_id?: string | null
          status?: Database["public"]["Enums"]["acc_status"] | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acc_contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acc_contracts_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acc_contracts_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_payable: {
        Row: {
          account_id: string | null
          amount: number
          amount_brl: number | null
          amount_paid: number | null
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          discount_amount: number | null
          due_date: string
          exchange_rate: number | null
          id: string
          interest_amount: number | null
          invoice_number: string | null
          issue_date: string
          notes: string | null
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          producer_id: string | null
          reception_id: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          supplier_document: string | null
          supplier_name: string
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          amount_brl?: number | null
          amount_paid?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          discount_amount?: number | null
          due_date: string
          exchange_rate?: number | null
          id?: string
          interest_amount?: number | null
          invoice_number?: string | null
          issue_date: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          producer_id?: string | null
          reception_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          supplier_document?: string | null
          supplier_name: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          amount_brl?: number | null
          amount_paid?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          discount_amount?: number | null
          due_date?: string
          exchange_rate?: number | null
          id?: string
          interest_amount?: number | null
          invoice_number?: string | null
          issue_date?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          producer_id?: string | null
          reception_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          supplier_document?: string | null
          supplier_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          acc_id: string | null
          amount: number
          amount_brl: number | null
          amount_paid: number | null
          client_document: string | null
          client_name: string
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          discount_amount: number | null
          due_date: string
          exchange_rate: number | null
          expedition_id: string | null
          id: string
          interest_amount: number | null
          invoice_number: string
          issue_date: string
          lc_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          updated_at: string | null
        }
        Insert: {
          acc_id?: string | null
          amount: number
          amount_brl?: number | null
          amount_paid?: number | null
          client_document?: string | null
          client_name: string
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          discount_amount?: number | null
          due_date: string
          exchange_rate?: number | null
          expedition_id?: string | null
          id?: string
          interest_amount?: number | null
          invoice_number: string
          issue_date: string
          lc_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          updated_at?: string | null
        }
        Update: {
          acc_id?: string | null
          amount?: number
          amount_brl?: number | null
          amount_paid?: number | null
          client_document?: string | null
          client_name?: string
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          discount_amount?: number | null
          due_date?: string
          exchange_rate?: number | null
          expedition_id?: string | null
          id?: string
          interest_amount?: number | null
          invoice_number?: string
          issue_date?: string
          lc_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_accounts_receivable_acc"
            columns: ["acc_id"]
            isOneToOne: false
            referencedRelation: "acc_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_accounts_receivable_lc"
            columns: ["lc_id"]
            isOneToOne: false
            referencedRelation: "letter_of_credit"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_flow: {
        Row: {
          amount: number
          amount_brl: number | null
          bank_account: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          description: string
          exchange_rate: number | null
          flow_date: string
          flow_type: Database["public"]["Enums"]["cash_flow_type"]
          id: string
          notes: string | null
          origin: Database["public"]["Enums"]["cash_flow_origin"]
          reference_id: string | null
          reference_type: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          amount_brl?: number | null
          bank_account?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description: string
          exchange_rate?: number | null
          flow_date: string
          flow_type: Database["public"]["Enums"]["cash_flow_type"]
          id?: string
          notes?: string | null
          origin: Database["public"]["Enums"]["cash_flow_origin"]
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          amount_brl?: number | null
          bank_account?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description?: string
          exchange_rate?: number | null
          flow_date?: string
          flow_type?: Database["public"]["Enums"]["cash_flow_type"]
          id?: string
          notes?: string | null
          origin?: Database["public"]["Enums"]["cash_flow_origin"]
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_flow_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          cost_center: Database["public"]["Enums"]["cost_center_type"]
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          parent_account_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: Database["public"]["Enums"]["account_type"]
          cost_center?: Database["public"]["Enums"]["cost_center_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: Database["public"]["Enums"]["account_type"]
          cost_center?: Database["public"]["Enums"]["cost_center_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          parent_account_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      consolidated_lot_items: {
        Row: {
          consolidated_lot_id: string
          created_at: string | null
          id: string
          original_reception_id: string
          quantity_used_kg: number
        }
        Insert: {
          consolidated_lot_id: string
          created_at?: string | null
          id?: string
          original_reception_id: string
          quantity_used_kg: number
        }
        Update: {
          consolidated_lot_id?: string
          created_at?: string | null
          id?: string
          original_reception_id?: string
          quantity_used_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "consolidated_lot_items_consolidated_lot_id_fkey"
            columns: ["consolidated_lot_id"]
            isOneToOne: false
            referencedRelation: "consolidated_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consolidated_lot_items_original_reception_id_fkey"
            columns: ["original_reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
        ]
      }
      consolidated_lots: {
        Row: {
          client_lot_number: string | null
          client_name: string | null
          consolidated_by: string | null
          consolidation_code: string
          consolidation_date: string | null
          created_at: string | null
          id: string
          internal_lot_number: string | null
          notes: string | null
          product_type: string
          status: string | null
          total_quantity_kg: number
        }
        Insert: {
          client_lot_number?: string | null
          client_name?: string | null
          consolidated_by?: string | null
          consolidation_code: string
          consolidation_date?: string | null
          created_at?: string | null
          id?: string
          internal_lot_number?: string | null
          notes?: string | null
          product_type: string
          status?: string | null
          total_quantity_kg: number
        }
        Update: {
          client_lot_number?: string | null
          client_name?: string | null
          consolidated_by?: string | null
          consolidation_code?: string
          consolidation_date?: string | null
          created_at?: string | null
          id?: string
          internal_lot_number?: string | null
          notes?: string | null
          product_type?: string
          status?: string | null
          total_quantity_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "consolidated_lots_consolidated_by_fkey"
            columns: ["consolidated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consolidation_documents: {
        Row: {
          consolidated_lot_id: string
          document_type: string
          file_name: string
          file_path: string
          id: string
          producer_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          consolidated_lot_id: string
          document_type: string
          file_name: string
          file_path: string
          id?: string
          producer_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          consolidated_lot_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          producer_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consolidation_documents_consolidated_lot_id_fkey"
            columns: ["consolidated_lot_id"]
            isOneToOne: false
            referencedRelation: "consolidated_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consolidation_documents_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consolidation_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          assigned_to: string | null
          city: string | null
          company_name: string
          contact_name: string
          country: string | null
          created_at: string
          created_by: string | null
          email: string
          general_notes: string | null
          id: string
          phone: string | null
          segment: Database["public"]["Enums"]["business_segment"]
          state: string | null
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          assigned_to?: string | null
          city?: string | null
          company_name: string
          contact_name: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          general_notes?: string | null
          id?: string
          phone?: string | null
          segment?: Database["public"]["Enums"]["business_segment"]
          state?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          assigned_to?: string | null
          city?: string | null
          company_name?: string
          contact_name?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          general_notes?: string | null
          id?: string
          phone?: string | null
          segment?: Database["public"]["Enums"]["business_segment"]
          state?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_documents: {
        Row: {
          contact_id: string | null
          description: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          opportunity_id: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          contact_id?: string | null
          description?: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          opportunity_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          contact_id?: string | null
          description?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          opportunity_id?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_documents_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          contact_id: string
          created_at: string
          created_by: string | null
          feedback: string
          id: string
          interaction_date: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          next_action_date: string | null
          next_action_description: string | null
          result: Database["public"]["Enums"]["interaction_result"] | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          created_by?: string | null
          feedback: string
          id?: string
          interaction_date?: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          next_action_date?: string | null
          next_action_description?: string | null
          result?: Database["public"]["Enums"]["interaction_result"] | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          created_by?: string | null
          feedback?: string
          id?: string
          interaction_date?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          next_action_date?: string | null
          next_action_description?: string | null
          result?: Database["public"]["Enums"]["interaction_result"] | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_opportunities: {
        Row: {
          actual_close_date: string | null
          assigned_to: string | null
          contact_id: string
          created_at: string
          created_by: string | null
          currency: string | null
          description: string | null
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          lost_reason: string | null
          probability: number | null
          product_interest: string | null
          stage: Database["public"]["Enums"]["funnel_stage"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_close_date?: string | null
          assigned_to?: string | null
          contact_id: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          probability?: number | null
          product_interest?: string | null
          stage?: Database["public"]["Enums"]["funnel_stage"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_close_date?: string | null
          assigned_to?: string | null
          contact_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          probability?: number | null
          product_interest?: string | null
          stage?: Database["public"]["Enums"]["funnel_stage"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_opportunities_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          assigned_to: string
          completed_at: string | null
          contact_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string
          google_calendar_event_id: string | null
          id: string
          opportunity_id: string | null
          reminder_date: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string
          whatsapp_reminder_sent: boolean | null
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date: string
          google_calendar_event_id?: string | null
          id?: string
          opportunity_id?: string | null
          reminder_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string
          whatsapp_reminder_sent?: boolean | null
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string
          google_calendar_event_id?: string | null
          id?: string
          opportunity_id?: string | null
          reminder_date?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string
          whatsapp_reminder_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      current_lot_positions: {
        Row: {
          current_location_id: string
          entry_date: string | null
          id: string
          last_movement_id: string | null
          reception_id: string
          updated_at: string | null
        }
        Insert: {
          current_location_id: string
          entry_date?: string | null
          id?: string
          last_movement_id?: string | null
          reception_id: string
          updated_at?: string | null
        }
        Update: {
          current_location_id?: string
          entry_date?: string | null
          id?: string
          last_movement_id?: string | null
          reception_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "current_lot_positions_current_location_id_fkey"
            columns: ["current_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "current_lot_positions_last_movement_id_fkey"
            columns: ["last_movement_id"]
            isOneToOne: false
            referencedRelation: "lot_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "current_lot_positions_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: true
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
        ]
      }
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
      expedition_documents: {
        Row: {
          expedition_code: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          status: string
          type: string
          upload_date: string
          uploaded_by: string | null
        }
        Insert: {
          expedition_code: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          status?: string
          type: string
          upload_date?: string
          uploaded_by?: string | null
        }
        Update: {
          expedition_code?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          status?: string
          type?: string
          upload_date?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expedition_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expedition_items: {
        Row: {
          consolidated_lot_id: string | null
          expedition_id: string | null
          id: string
          lot_reference: string | null
          quantity_kg: number
          reception_id: string | null
        }
        Insert: {
          consolidated_lot_id?: string | null
          expedition_id?: string | null
          id?: string
          lot_reference?: string | null
          quantity_kg: number
          reception_id?: string | null
        }
        Update: {
          consolidated_lot_id?: string | null
          expedition_id?: string | null
          id?: string
          lot_reference?: string | null
          quantity_kg?: number
          reception_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expedition_items_consolidated_lot_id_fkey"
            columns: ["consolidated_lot_id"]
            isOneToOne: false
            referencedRelation: "consolidated_lots"
            referencedColumns: ["id"]
          },
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
      export_insurance: {
        Row: {
          bill_of_lading: string | null
          cargo_description: string | null
          claim_amount: number | null
          claim_date: string | null
          claim_status: string | null
          coverage_amount: number
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          deductible_amount: number | null
          expedition_id: string | null
          id: string
          insurance_company: string
          insurance_type: Database["public"]["Enums"]["insurance_type"]
          lc_id: string | null
          notes: string | null
          policy_end_date: string
          policy_number: string
          policy_start_date: string
          premium_amount: number
          route_destination: string | null
          route_origin: string | null
          updated_at: string | null
          vessel_name: string | null
        }
        Insert: {
          bill_of_lading?: string | null
          cargo_description?: string | null
          claim_amount?: number | null
          claim_date?: string | null
          claim_status?: string | null
          coverage_amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          deductible_amount?: number | null
          expedition_id?: string | null
          id?: string
          insurance_company: string
          insurance_type: Database["public"]["Enums"]["insurance_type"]
          lc_id?: string | null
          notes?: string | null
          policy_end_date: string
          policy_number: string
          policy_start_date: string
          premium_amount: number
          route_destination?: string | null
          route_origin?: string | null
          updated_at?: string | null
          vessel_name?: string | null
        }
        Update: {
          bill_of_lading?: string | null
          cargo_description?: string | null
          claim_amount?: number | null
          claim_date?: string | null
          claim_status?: string | null
          coverage_amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          deductible_amount?: number | null
          expedition_id?: string | null
          id?: string
          insurance_company?: string
          insurance_type?: Database["public"]["Enums"]["insurance_type"]
          lc_id?: string | null
          notes?: string | null
          policy_end_date?: string
          policy_number?: string
          policy_start_date?: string
          premium_amount?: number
          route_destination?: string | null
          route_origin?: string | null
          updated_at?: string | null
          vessel_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "export_insurance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_insurance_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_insurance_lc_id_fkey"
            columns: ["lc_id"]
            isOneToOne: false
            referencedRelation: "letter_of_credit"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_documents: {
        Row: {
          document_number: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          reference_id: string
          reference_type: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          document_number?: string | null
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          reference_id: string
          reference_type: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          document_number?: string | null
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          reference_id?: string
          reference_type?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          account_id: string
          amount: number
          amount_brl: number | null
          cost_center: Database["public"]["Enums"]["cost_center_type"]
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          description: string
          exchange_rate: number | null
          id: string
          reference_document: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          transaction_date: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          amount: number
          amount_brl?: number | null
          cost_center: Database["public"]["Enums"]["cost_center_type"]
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description: string
          exchange_rate?: number | null
          id?: string
          reference_document?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          transaction_date: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          amount_brl?: number | null
          cost_center?: Database["public"]["Enums"]["cost_center_type"]
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description?: string
          exchange_rate?: number | null
          id?: string
          reference_document?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          transaction_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_labels: {
        Row: {
          client_customization: Json | null
          consolidated_lot_id: string
          generated_at: string | null
          generated_by: string | null
          id: string
          label_layout: string
          language: string | null
          pdf_file_path: string | null
          qr_code_data: string
          status: string | null
        }
        Insert: {
          client_customization?: Json | null
          consolidated_lot_id: string
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          label_layout: string
          language?: string | null
          pdf_file_path?: string | null
          qr_code_data: string
          status?: string | null
        }
        Update: {
          client_customization?: Json | null
          consolidated_lot_id?: string
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          label_layout?: string
          language?: string | null
          pdf_file_path?: string | null
          qr_code_data?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_labels_consolidated_lot_id_fkey"
            columns: ["consolidated_lot_id"]
            isOneToOne: false
            referencedRelation: "consolidated_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_labels_generated_by_fkey"
            columns: ["generated_by"]
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
      letter_of_credit: {
        Row: {
          amount: number
          applicant: string
          beneficiary: string
          confirmation_date: string | null
          confirming_bank: string | null
          created_at: string | null
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          description_of_goods: string | null
          discrepancies: string | null
          expedition_id: string | null
          expiry_date: string
          id: string
          issue_date: string
          issuing_bank: string
          latest_shipment_date: string | null
          lc_number: string
          negotiation_date: string | null
          notes: string | null
          partial_shipment: boolean | null
          payment_terms: string | null
          port_of_discharge: string | null
          port_of_loading: string | null
          presentation_date: string | null
          shipment_date: string | null
          status: Database["public"]["Enums"]["lc_status"] | null
          transshipment: boolean | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          applicant: string
          beneficiary: string
          confirmation_date?: string | null
          confirming_bank?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description_of_goods?: string | null
          discrepancies?: string | null
          expedition_id?: string | null
          expiry_date: string
          id?: string
          issue_date: string
          issuing_bank: string
          latest_shipment_date?: string | null
          lc_number: string
          negotiation_date?: string | null
          notes?: string | null
          partial_shipment?: boolean | null
          payment_terms?: string | null
          port_of_discharge?: string | null
          port_of_loading?: string | null
          presentation_date?: string | null
          shipment_date?: string | null
          status?: Database["public"]["Enums"]["lc_status"] | null
          transshipment?: boolean | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          applicant?: string
          beneficiary?: string
          confirmation_date?: string | null
          confirming_bank?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description_of_goods?: string | null
          discrepancies?: string | null
          expedition_id?: string | null
          expiry_date?: string
          id?: string
          issue_date?: string
          issuing_bank?: string
          latest_shipment_date?: string | null
          lc_number?: string
          negotiation_date?: string | null
          notes?: string | null
          partial_shipment?: boolean | null
          payment_terms?: string | null
          port_of_discharge?: string | null
          port_of_loading?: string | null
          presentation_date?: string | null
          shipment_date?: string | null
          status?: Database["public"]["Enums"]["lc_status"] | null
          transshipment?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "letter_of_credit_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "letter_of_credit_expedition_id_fkey"
            columns: ["expedition_id"]
            isOneToOne: false
            referencedRelation: "expeditions"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_movements: {
        Row: {
          created_at: string | null
          from_location_id: string | null
          id: string
          moved_by: string | null
          movement_date: string | null
          movement_type: string
          notes: string | null
          reception_id: string
          to_location_id: string | null
        }
        Insert: {
          created_at?: string | null
          from_location_id?: string | null
          id?: string
          moved_by?: string | null
          movement_date?: string | null
          movement_type: string
          notes?: string | null
          reception_id: string
          to_location_id?: string | null
        }
        Update: {
          created_at?: string | null
          from_location_id?: string | null
          id?: string
          moved_by?: string | null
          movement_date?: string | null
          movement_type?: string
          notes?: string | null
          reception_id?: string
          to_location_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lot_movements_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_movements_moved_by_fkey"
            columns: ["moved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_movements_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_movements_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          additional_notes: string | null
          address: string | null
          certificate_expiry: string
          certificate_number: string | null
          created_at: string | null
          email: string | null
          farm_name: string | null
          fruit_varieties: string | null
          ggn: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          production_volume_tons: number | null
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          address?: string | null
          certificate_expiry: string
          certificate_number?: string | null
          created_at?: string | null
          email?: string | null
          farm_name?: string | null
          fruit_varieties?: string | null
          ggn?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          production_volume_tons?: number | null
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          address?: string | null
          certificate_expiry?: string
          certificate_number?: string | null
          created_at?: string | null
          email?: string | null
          farm_name?: string | null
          fruit_varieties?: string | null
          ggn?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          production_volume_tons?: number | null
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
          qr_code: string | null
          temperature_range_max: number | null
          temperature_range_min: number | null
          zone_type: string | null
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
          qr_code?: string | null
          temperature_range_max?: number | null
          temperature_range_min?: number | null
          zone_type?: string | null
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
          qr_code?: string | null
          temperature_range_max?: number | null
          temperature_range_min?: number | null
          zone_type?: string | null
        }
        Relationships: []
      }
      storage_checklists: {
        Row: {
          additional_notes: string | null
          checked_by: string | null
          created_at: string | null
          id: string
          location_id: string
          pallet_integrity: boolean | null
          photos: Json | null
          reception_id: string
          temperature_ambient: number | null
          third_party_document: string | null
          visual_separation_confirmed: boolean | null
        }
        Insert: {
          additional_notes?: string | null
          checked_by?: string | null
          created_at?: string | null
          id?: string
          location_id: string
          pallet_integrity?: boolean | null
          photos?: Json | null
          reception_id: string
          temperature_ambient?: number | null
          third_party_document?: string | null
          visual_separation_confirmed?: boolean | null
        }
        Update: {
          additional_notes?: string | null
          checked_by?: string | null
          created_at?: string | null
          id?: string
          location_id?: string
          pallet_integrity?: boolean | null
          photos?: Json | null
          reception_id?: string
          temperature_ambient?: number | null
          third_party_document?: string | null
          visual_separation_confirmed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_checklists_checked_by_fkey"
            columns: ["checked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_checklists_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_checklists_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_locations: {
        Row: {
          area_id: string
          capacity_units: number | null
          created_at: string | null
          current_units: number | null
          id: string
          is_occupied: boolean | null
          location_code: string
          position_x: number | null
          position_y: number | null
          qr_code: string | null
        }
        Insert: {
          area_id: string
          capacity_units?: number | null
          created_at?: string | null
          current_units?: number | null
          id?: string
          is_occupied?: boolean | null
          location_code: string
          position_x?: number | null
          position_y?: number | null
          qr_code?: string | null
        }
        Update: {
          area_id?: string
          capacity_units?: number | null
          created_at?: string | null
          current_units?: number | null
          id?: string
          is_occupied?: boolean | null
          location_code?: string
          position_x?: number | null
          position_y?: number | null
          qr_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_locations_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "storage_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_google_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string | null
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token?: string | null
          scope: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string | null
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_current_user_admin_or_supervisor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      acc_status: "aberto" | "liquidado" | "vencido" | "cancelado"
      account_type:
        | "receita"
        | "custo"
        | "despesa"
        | "ativo"
        | "passivo"
        | "patrimonio"
      business_segment:
        | "importador"
        | "distribuidor"
        | "varejo"
        | "atacado"
        | "industria"
        | "outros"
      cash_flow_origin:
        | "vendas"
        | "acc"
        | "lc"
        | "emprestimo"
        | "capital"
        | "outros"
      cash_flow_type: "entrada" | "saida"
      contact_status: "ativo" | "desqualificado" | "em_negociacao"
      cost_center_type:
        | "producao"
        | "comercial"
        | "administrativo"
        | "financeiro"
        | "exportacao"
      currency_code: "BRL" | "USD" | "EUR" | "ARS" | "CNY"
      funnel_stage:
        | "contato_inicial"
        | "qualificado"
        | "proposta_enviada"
        | "negociacao"
        | "fechado_ganhou"
        | "fechado_perdeu"
      insurance_type:
        | "transporte"
        | "credito"
        | "cargo"
        | "responsabilidade_civil"
      interaction_result:
        | "sucesso"
        | "follow_up"
        | "sem_interesse"
        | "proposta_enviada"
        | "agendamento"
        | "outros"
      interaction_type:
        | "ligacao"
        | "reuniao"
        | "email"
        | "whatsapp"
        | "visita"
        | "outros"
      lc_status:
        | "emitida"
        | "confirmada"
        | "embarcada"
        | "liberada"
        | "vencida"
        | "cancelada"
      movement_type: "entrada" | "saida" | "transferencia" | "consolidacao"
      payment_method:
        | "boleto"
        | "transferencia"
        | "cheque"
        | "cartao"
        | "pix"
        | "swift"
      product_type:
        | "tomate"
        | "alface"
        | "pepino"
        | "pimentao"
        | "outros"
        | "abacate_hass"
        | "abacate_geada"
        | "abacate_brede"
        | "abacate_margarida"
        | "manga_tommy"
        | "manga_maca"
        | "manga_palmer"
        | "mel"
        | "limao_tahiti"
      reception_status: "pending" | "approved" | "rejected"
      task_status: "pendente" | "em_andamento" | "concluida" | "cancelada"
      task_type:
        | "ligacao"
        | "reuniao"
        | "email"
        | "follow_up"
        | "proposta"
        | "visita"
        | "outros"
      transaction_status: "previsto" | "realizado" | "cancelado"
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
      acc_status: ["aberto", "liquidado", "vencido", "cancelado"],
      account_type: [
        "receita",
        "custo",
        "despesa",
        "ativo",
        "passivo",
        "patrimonio",
      ],
      business_segment: [
        "importador",
        "distribuidor",
        "varejo",
        "atacado",
        "industria",
        "outros",
      ],
      cash_flow_origin: [
        "vendas",
        "acc",
        "lc",
        "emprestimo",
        "capital",
        "outros",
      ],
      cash_flow_type: ["entrada", "saida"],
      contact_status: ["ativo", "desqualificado", "em_negociacao"],
      cost_center_type: [
        "producao",
        "comercial",
        "administrativo",
        "financeiro",
        "exportacao",
      ],
      currency_code: ["BRL", "USD", "EUR", "ARS", "CNY"],
      funnel_stage: [
        "contato_inicial",
        "qualificado",
        "proposta_enviada",
        "negociacao",
        "fechado_ganhou",
        "fechado_perdeu",
      ],
      insurance_type: [
        "transporte",
        "credito",
        "cargo",
        "responsabilidade_civil",
      ],
      interaction_result: [
        "sucesso",
        "follow_up",
        "sem_interesse",
        "proposta_enviada",
        "agendamento",
        "outros",
      ],
      interaction_type: [
        "ligacao",
        "reuniao",
        "email",
        "whatsapp",
        "visita",
        "outros",
      ],
      lc_status: [
        "emitida",
        "confirmada",
        "embarcada",
        "liberada",
        "vencida",
        "cancelada",
      ],
      movement_type: ["entrada", "saida", "transferencia", "consolidacao"],
      payment_method: [
        "boleto",
        "transferencia",
        "cheque",
        "cartao",
        "pix",
        "swift",
      ],
      product_type: [
        "tomate",
        "alface",
        "pepino",
        "pimentao",
        "outros",
        "abacate_hass",
        "abacate_geada",
        "abacate_brede",
        "abacate_margarida",
        "manga_tommy",
        "manga_maca",
        "manga_palmer",
        "mel",
        "limao_tahiti",
      ],
      reception_status: ["pending", "approved", "rejected"],
      task_status: ["pendente", "em_andamento", "concluida", "cancelada"],
      task_type: [
        "ligacao",
        "reuniao",
        "email",
        "follow_up",
        "proposta",
        "visita",
        "outros",
      ],
      transaction_status: ["previsto", "realizado", "cancelado"],
      user_role: ["admin", "operator", "supervisor"],
    },
  },
} as const
