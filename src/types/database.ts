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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      business_claim_requests: {
        Row: {
          business_id: string
          claimant_id: string
          created_at: string
          id: string
          note: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          claimant_id: string
          created_at?: string
          id?: string
          note?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          claimant_id?: string
          created_at?: string
          id?: string
          note?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_claim_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_claim_requests_claimant_id_fkey"
            columns: ["claimant_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "business_claim_requests_claimant_id_fkey"
            columns: ["claimant_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_claim_requests_claimant_id_fkey"
            columns: ["claimant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_claim_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "business_claim_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_claim_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_directory_aliases: {
        Row: {
          alias: string
          business_id: string
          created_at: string
          id: string
          language_code: string
        }
        Insert: {
          alias: string
          business_id: string
          created_at?: string
          id?: string
          language_code?: string
        }
        Update: {
          alias?: string
          business_id?: string
          created_at?: string
          id?: string
          language_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_directory_aliases_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_directory_contacts: {
        Row: {
          business_id: string
          created_at: string
          facebook_url: string | null
          is_phone_public: boolean
          is_website_public: boolean
          is_whatsapp_public: boolean
          phone: string | null
          updated_at: string
          website_url: string | null
          whatsapp: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          facebook_url?: string | null
          is_phone_public?: boolean
          is_website_public?: boolean
          is_whatsapp_public?: boolean
          phone?: string | null
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          facebook_url?: string | null
          is_phone_public?: boolean
          is_website_public?: boolean
          is_whatsapp_public?: boolean
          phone?: string | null
          updated_at?: string
          website_url?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_directory_contacts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_directory_locations: {
        Row: {
          address: string | null
          area: string | null
          business_id: string
          created_at: string
          district: string
          is_public: boolean
          latitude: number | null
          location_source: string | null
          longitude: number | null
          map_label: string | null
          market: string | null
          postal_code: string | null
          upazila: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          area?: string | null
          business_id: string
          created_at?: string
          district?: string
          is_public?: boolean
          latitude?: number | null
          location_source?: string | null
          longitude?: number | null
          map_label?: string | null
          market?: string | null
          postal_code?: string | null
          upazila?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          area?: string | null
          business_id?: string
          created_at?: string
          district?: string
          is_public?: boolean
          latitude?: number | null
          location_source?: string | null
          longitude?: number | null
          map_label?: string | null
          market?: string | null
          postal_code?: string | null
          upazila?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_directory_locations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_directory_profiles: {
        Row: {
          about_bn: string | null
          about_en: string | null
          business_id: string
          business_type: string | null
          created_at: string
          last_verified_at: string | null
          listing_status: string
          location_verified: boolean
          owner_claimed: boolean
          phone_verified: boolean
          slug: string | null
          tagline_bn: string | null
          tagline_en: string | null
          updated_at: string
          verification_level: string
        }
        Insert: {
          about_bn?: string | null
          about_en?: string | null
          business_id: string
          business_type?: string | null
          created_at?: string
          last_verified_at?: string | null
          listing_status?: string
          location_verified?: boolean
          owner_claimed?: boolean
          phone_verified?: boolean
          slug?: string | null
          tagline_bn?: string | null
          tagline_en?: string | null
          updated_at?: string
          verification_level?: string
        }
        Update: {
          about_bn?: string | null
          about_en?: string | null
          business_id?: string
          business_type?: string | null
          created_at?: string
          last_verified_at?: string | null
          listing_status?: string
          location_verified?: boolean
          owner_claimed?: boolean
          phone_verified?: boolean
          slug?: string | null
          tagline_bn?: string | null
          tagline_en?: string | null
          updated_at?: string
          verification_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_directory_profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reports: {
        Row: {
          business_id: string
          created_at: string
          details: string
          id: string
          reason: string
          reporter_id: string
          resolution_note: string | null
          resolved_at: string | null
          reviewer_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          details: string
          id?: string
          reason: string
          reporter_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          reviewer_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          details?: string
          id?: string
          reason?: string
          reporter_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          reviewer_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "business_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reports_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "business_reports_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reports_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_reviews: {
        Row: {
          admin_note: string | null
          author_id: string
          body: string
          business_id: string
          created_at: string
          id: string
          rating: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          author_id: string
          body: string
          business_id: string
          created_at?: string
          id?: string
          rating: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          author_id?: string
          body?: string
          business_id?: string
          created_at?: string
          id?: string
          rating?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "business_reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "business_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_reviews_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_start_activity: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json
          project_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          project_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_start_activity_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_start_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_start_documents: {
        Row: {
          created_at: string
          document_type: string
          id: string
          owner_id: string
          project_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_bucket: string
          storage_path: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          document_type: string
          id?: string
          owner_id: string
          project_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_bucket?: string
          storage_path: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          id?: string
          owner_id?: string
          project_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_bucket?: string
          storage_path?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_start_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_start_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_start_finance: {
        Row: {
          created_at: string
          emergency_buffer: number
          equipment: number
          estimated_monthly_sales: number
          gross_margin_pct: number
          id: string
          interior: number
          inventory_cost: number
          license_cost: number
          marketing_cost: number
          monthly_fixed_cost: number
          other_cost: number
          project_id: string
          rent: number
          staff_cost: number
          transport_cost: number
          updated_at: string
          utility_cost: number
          working_capital: number
        }
        Insert: {
          created_at?: string
          emergency_buffer?: number
          equipment?: number
          estimated_monthly_sales?: number
          gross_margin_pct?: number
          id?: string
          interior?: number
          inventory_cost?: number
          license_cost?: number
          marketing_cost?: number
          monthly_fixed_cost?: number
          other_cost?: number
          project_id: string
          rent?: number
          staff_cost?: number
          transport_cost?: number
          updated_at?: string
          utility_cost?: number
          working_capital?: number
        }
        Update: {
          created_at?: string
          emergency_buffer?: number
          equipment?: number
          estimated_monthly_sales?: number
          gross_margin_pct?: number
          id?: string
          interior?: number
          inventory_cost?: number
          license_cost?: number
          marketing_cost?: number
          monthly_fixed_cost?: number
          other_cost?: number
          project_id?: string
          rent?: number
          staff_cost?: number
          transport_cost?: number
          updated_at?: string
          utility_cost?: number
          working_capital?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_start_finance_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "business_start_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_start_legal_items: {
        Row: {
          applicability: string
          created_at: string
          guidance_bn: string | null
          guidance_en: string | null
          id: string
          is_active: boolean
          last_verified_at: string | null
          official_url: string | null
          sort_order: number
          source_name: string | null
          task_key: string
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          applicability?: string
          created_at?: string
          guidance_bn?: string | null
          guidance_en?: string | null
          id?: string
          is_active?: boolean
          last_verified_at?: string | null
          official_url?: string | null
          sort_order?: number
          source_name?: string | null
          task_key: string
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          applicability?: string
          created_at?: string
          guidance_bn?: string | null
          guidance_en?: string | null
          id?: string
          is_active?: boolean
          last_verified_at?: string | null
          official_url?: string | null
          sort_order?: number
          source_name?: string | null
          task_key?: string
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_start_legal_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          legal_item_id: string
          notes: string | null
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          legal_item_id: string
          notes?: string | null
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          legal_item_id?: string
          notes?: string | null
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_start_legal_progress_legal_item_id_fkey"
            columns: ["legal_item_id"]
            isOneToOne: false
            referencedRelation: "business_start_legal_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_start_legal_progress_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_start_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_start_locations: {
        Row: {
          area: string | null
          created_at: string
          data_confidence: string
          district: string
          id: string
          market_name: string | null
          project_id: string
          selection_reason: string | null
          upazila: string | null
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          data_confidence?: string
          district?: string
          id?: string
          market_name?: string | null
          project_id: string
          selection_reason?: string | null
          upazila?: string | null
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          data_confidence?: string
          district?: string
          id?: string
          market_name?: string | null
          project_id?: string
          selection_reason?: string | null
          upazila?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_start_locations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "business_start_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_start_plans: {
        Row: {
          created_at: string
          customer_profile: string | null
          id: string
          marketing: string | null
          operations: string | null
          products_services: string | null
          project_id: string
          risks: string | null
          updated_at: string
          value_proposition: string | null
        }
        Insert: {
          created_at?: string
          customer_profile?: string | null
          id?: string
          marketing?: string | null
          operations?: string | null
          products_services?: string | null
          project_id: string
          risks?: string | null
          updated_at?: string
          value_proposition?: string | null
        }
        Update: {
          created_at?: string
          customer_profile?: string | null
          id?: string
          marketing?: string | null
          operations?: string | null
          products_services?: string | null
          project_id?: string
          risks?: string | null
          updated_at?: string
          value_proposition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_start_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "business_start_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_start_preferences: {
        Row: {
          budget_max: number
          budget_min: number
          business_summary: string | null
          category: string | null
          created_at: string
          experience_level: string
          goal: string
          id: string
          project_id: string
          risk_preference: string
          updated_at: string
        }
        Insert: {
          budget_max?: number
          budget_min?: number
          business_summary?: string | null
          category?: string | null
          created_at?: string
          experience_level?: string
          goal?: string
          id?: string
          project_id: string
          risk_preference?: string
          updated_at?: string
        }
        Update: {
          budget_max?: number
          budget_min?: number
          business_summary?: string | null
          category?: string | null
          created_at?: string
          experience_level?: string
          goal?: string
          id?: string
          project_id?: string
          risk_preference?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_start_preferences_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "business_start_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_start_projects: {
        Row: {
          business_id: string | null
          business_type: string | null
          completed_at: string | null
          created_at: string
          current_step: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          business_type?: string | null
          completed_at?: string | null
          created_at?: string
          current_step?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          business_type?: string | null
          completed_at?: string | null
          created_at?: string
          current_step?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_start_projects_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_start_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          priority: string
          project_id: string
          sort_order: number
          stage: string
          status: string
          task_key: string
          title_bn: string
          title_en: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          priority?: string
          project_id: string
          sort_order?: number
          stage: string
          status?: string
          task_key: string
          title_bn: string
          title_en: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          priority?: string
          project_id?: string
          sort_order?: number
          stage?: string
          status?: string
          task_key?: string
          title_bn?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_start_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "business_start_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_start_validation: {
        Row: {
          competition_status: string
          created_at: string
          data_confidence: string
          demand_status: string
          evidence_notes: string | null
          id: string
          legal_status: string
          location_status: string
          project_id: string
          risks: string | null
          supplier_status: string
          updated_at: string
        }
        Insert: {
          competition_status?: string
          created_at?: string
          data_confidence?: string
          demand_status?: string
          evidence_notes?: string | null
          id?: string
          legal_status?: string
          location_status?: string
          project_id: string
          risks?: string | null
          supplier_status?: string
          updated_at?: string
        }
        Update: {
          competition_status?: string
          created_at?: string
          data_confidence?: string
          demand_status?: string
          evidence_notes?: string | null
          id?: string
          legal_status?: string
          location_status?: string
          project_id?: string
          risks?: string | null
          supplier_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_start_validation_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "business_start_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_verification_requests: {
        Row: {
          business_id: string
          created_at: string
          evidence_note: string
          id: string
          requester_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          verification_type: string
        }
        Insert: {
          business_id: string
          created_at?: string
          evidence_note?: string
          id?: string
          requester_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          verification_type: string
        }
        Update: {
          business_id?: string
          created_at?: string
          evidence_note?: string
          id?: string
          requester_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_verification_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "business_verification_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "business_verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          feni_brain_embedding: string | null
          id: string
          name: string
          owner_id: string | null
          title_bn: string | null
          title_en: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          feni_brain_embedding?: string | null
          id?: string
          name: string
          owner_id?: string | null
          title_bn?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          feni_brain_embedding?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          title_bn?: string | null
          title_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_delivery_rules: {
        Row: {
          created_at: string
          district: string | null
          fee: number
          free_shipping_minimum: number | null
          id: string
          is_active: boolean
          sort_order: number
          upazila: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          fee?: number
          free_shipping_minimum?: number | null
          id?: string
          is_active?: boolean
          sort_order?: number
          upazila?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          district?: string | null
          fee?: number
          free_shipping_minimum?: number | null
          id?: string
          is_active?: boolean
          sort_order?: number
          upazila?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      commerce_order_vendor_status: {
        Row: {
          created_at: string
          id: string
          inventory_finalized: boolean
          order_id: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_finalized?: boolean
          order_id: string
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_finalized?: boolean
          order_id?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_order_vendor_status_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_order_vendor_status_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_return_requests: {
        Row: {
          created_at: string
          customer_id: string
          details: string | null
          id: string
          order_id: string
          order_item_id: string
          reason: string
          refund_amount: number | null
          resolution_note: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          details?: string | null
          id?: string
          order_id: string
          order_item_id: string
          reason: string
          refund_amount?: number | null
          resolution_note?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          details?: string | null
          id?: string
          order_id?: string
          order_item_id?: string
          reason?: string
          refund_amount?: number | null
          resolution_note?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_return_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "commerce_return_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_return_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_return_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_return_requests_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_ambulance_providers: {
        Row: {
          ac_available: boolean
          ambulance_type: string
          available_24_7: boolean
          base_area: string | null
          created_at: string
          display_name: string
          id: string
          is_verified: boolean
          owner_id: string | null
          oxygen_available: boolean
          phone: string | null
          service_area: string | null
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ac_available?: boolean
          ambulance_type?: string
          available_24_7?: boolean
          base_area?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_verified?: boolean
          owner_id?: string | null
          oxygen_available?: boolean
          phone?: string | null
          service_area?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ac_available?: boolean
          ambulance_type?: string
          available_24_7?: boolean
          base_area?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_verified?: boolean
          owner_id?: string | null
          oxygen_available?: boolean
          phone?: string | null
          service_area?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fenix_ambulance_providers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_ambulance_providers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_ambulance_providers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_ambulance_requests: {
        Row: {
          ambulance_type: string
          condition_category: string
          created_at: string
          destination_hospital: string | null
          id: string
          note: string | null
          oxygen_needed: boolean
          pickup_area: string
          pickup_upazila_id: string | null
          provider_id: string | null
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          ambulance_type?: string
          condition_category?: string
          created_at?: string
          destination_hospital?: string | null
          id?: string
          note?: string | null
          oxygen_needed?: boolean
          pickup_area: string
          pickup_upazila_id?: string | null
          provider_id?: string | null
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          ambulance_type?: string
          condition_category?: string
          created_at?: string
          destination_hospital?: string | null
          id?: string
          note?: string | null
          oxygen_needed?: boolean
          pickup_area?: string
          pickup_upazila_id?: string | null
          provider_id?: string | null
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_ambulance_requests_pickup_upazila_id_fkey"
            columns: ["pickup_upazila_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_ambulance_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "fenix_ambulance_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_ambulance_requests_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_ambulance_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_ambulance_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_ambulance_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_ambulance_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_answers: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          question_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          question_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_answers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_answers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_answers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_question_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "fenix_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_blood_donors: {
        Row: {
          area_text: string | null
          availability: string
          blood_group: string
          created_at: string
          is_public: boolean
          last_donation_date: string | null
          note: string | null
          preferred_contact: string
          upazila_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_text?: string | null
          availability?: string
          blood_group: string
          created_at?: string
          is_public?: boolean
          last_donation_date?: string | null
          note?: string | null
          preferred_contact?: string
          upazila_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_text?: string | null
          availability?: string
          blood_group?: string
          created_at?: string
          is_public?: boolean
          last_donation_date?: string | null
          note?: string | null
          preferred_contact?: string
          upazila_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_blood_donors_upazila_id_fkey"
            columns: ["upazila_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_blood_donors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_blood_donors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_blood_donors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_blood_requests: {
        Row: {
          area_text: string | null
          blood_group: string
          contact_method: string
          created_at: string
          hospital_area: string | null
          hospital_name: string
          id: string
          needed_at: string | null
          note: string | null
          requester_id: string
          status: string
          units: number
          upazila_id: string | null
          updated_at: string
          urgency: string
        }
        Insert: {
          area_text?: string | null
          blood_group: string
          contact_method?: string
          created_at?: string
          hospital_area?: string | null
          hospital_name: string
          id?: string
          needed_at?: string | null
          note?: string | null
          requester_id: string
          status?: string
          units: number
          upazila_id?: string | null
          updated_at?: string
          urgency?: string
        }
        Update: {
          area_text?: string | null
          blood_group?: string
          contact_method?: string
          created_at?: string
          hospital_area?: string | null
          hospital_name?: string
          id?: string
          needed_at?: string | null
          note?: string | null
          requester_id?: string
          status?: string
          units?: number
          upazila_id?: string | null
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_blood_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_blood_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_blood_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_blood_requests_upazila_id_fkey"
            columns: ["upazila_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_blood_responses: {
        Row: {
          created_at: string
          donor_id: string
          id: string
          message: string | null
          request_id: string
          status: string
        }
        Insert: {
          created_at?: string
          donor_id: string
          id?: string
          message?: string | null
          request_id: string
          status?: string
        }
        Update: {
          created_at?: string
          donor_id?: string
          id?: string
          message?: string | null
          request_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_blood_responses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_blood_responses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_blood_responses_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_blood_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "fenix_blood_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_blood_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_blood_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_brain_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          embedding_model: string | null
          id: string
          source_locator: string | null
          status: string
          token_count: number | null
          updated_at: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          embedding_model?: string | null
          id?: string
          source_locator?: string | null
          status?: string
          token_count?: number | null
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          embedding_model?: string | null
          id?: string
          source_locator?: string | null
          status?: string
          token_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_brain_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_brain_documents: {
        Row: {
          content: string
          created_at: string
          document_type: string
          effective_from: string | null
          effective_until: string | null
          id: string
          language_code: string
          metadata: Json
          source_id: string
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          document_type?: string
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          language_code?: string
          metadata?: Json
          source_id: string
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          document_type?: string
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          language_code?: string
          metadata?: Json
          source_id?: string
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_brain_documents_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_brain_facts: {
        Row: {
          confidence: number
          created_at: string
          id: string
          metadata: Json
          source_id: string
          status: string
          subject_key: string
          subject_location_id: string | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          value_number: number | null
          value_text: string | null
          value_unit: string | null
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          metadata?: Json
          source_id: string
          status?: string
          subject_key: string
          subject_location_id?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          value_number?: number | null
          value_text?: string | null
          value_unit?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          metadata?: Json
          source_id?: string
          status?: string
          subject_key?: string
          subject_location_id?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          value_number?: number | null
          value_text?: string | null
          value_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fenix_brain_facts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_brain_facts_subject_location_id_fkey"
            columns: ["subject_location_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_brain_intents: {
        Row: {
          created_at: string
          description: string | null
          examples: Json
          intent_key: string
          is_active: boolean
          name_bn: string
          name_en: string
          priority: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          examples?: Json
          intent_key: string
          is_active?: boolean
          name_bn: string
          name_en: string
          priority?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          examples?: Json
          intent_key?: string
          is_active?: boolean
          name_bn?: string
          name_en?: string
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      fenix_brain_location_aliases: {
        Row: {
          alias: string
          alias_type: string
          created_at: string
          id: string
          language_code: string
          location_id: string
          normalized_alias: string | null
        }
        Insert: {
          alias: string
          alias_type?: string
          created_at?: string
          id?: string
          language_code?: string
          location_id: string
          normalized_alias?: string | null
        }
        Update: {
          alias?: string
          alias_type?: string
          created_at?: string
          id?: string
          language_code?: string
          location_id?: string
          normalized_alias?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fenix_brain_location_aliases_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_brain_locations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          level: string
          metadata: Json
          name_bn: string
          name_en: string | null
          official_code: string | null
          parent_id: string | null
          slug: string
          source_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          level: string
          metadata?: Json
          name_bn: string
          name_en?: string | null
          official_code?: string | null
          parent_id?: string | null
          slug: string
          source_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          level?: string
          metadata?: Json
          name_bn?: string
          name_en?: string | null
          official_code?: string | null
          parent_id?: string | null
          slug?: string
          source_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_brain_locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_brain_locations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_brain_pulse_intents_public: {
        Row: {
          intent_key: string
          searches_30d: number
          searches_7d: number
        }
        Insert: {
          intent_key: string
          searches_30d?: number
          searches_7d?: number
        }
        Update: {
          intent_key?: string
          searches_30d?: number
          searches_7d?: number
        }
        Relationships: []
      }
      fenix_brain_pulse_terms_public: {
        Row: {
          searches_30d: number
          searches_7d: number
          term: string
          unique_queries_7d: number
        }
        Insert: {
          searches_30d?: number
          searches_7d?: number
          term: string
          unique_queries_7d?: number
        }
        Update: {
          searches_30d?: number
          searches_7d?: number
          term?: string
          unique_queries_7d?: number
        }
        Relationships: []
      }
      fenix_brain_query_events: {
        Row: {
          created_at: string
          id: string
          intent_key: string
          language_code: string
          query_hash: string
          result_count: number
          term: string
        }
        Insert: {
          created_at?: string
          id?: string
          intent_key?: string
          language_code?: string
          query_hash: string
          result_count?: number
          term: string
        }
        Update: {
          created_at?: string
          id?: string
          intent_key?: string
          language_code?: string
          query_hash?: string
          result_count?: number
          term?: string
        }
        Relationships: []
      }
      fenix_brain_query_terms: {
        Row: {
          created_at: string
          id: string
          intent_key: string
          language_code: string
          term: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          intent_key: string
          language_code?: string
          term: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          intent_key?: string
          language_code?: string
          term?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "fenix_brain_query_terms_intent_key_fkey"
            columns: ["intent_key"]
            isOneToOne: false
            referencedRelation: "fenix_brain_intents"
            referencedColumns: ["intent_key"]
          },
        ]
      }
      fenix_brain_source_refresh: {
        Row: {
          auto_publish: boolean
          created_at: string
          enabled: boolean
          etag: string | null
          last_checked_at: string | null
          last_content_hash: string | null
          last_error: string | null
          last_http_status: number | null
          last_modified: string | null
          last_success_at: string | null
          max_bytes: number
          next_refresh_at: string
          parser_key: string
          refresh_interval_hours: number
          source_id: string
          updated_at: string
        }
        Insert: {
          auto_publish?: boolean
          created_at?: string
          enabled?: boolean
          etag?: string | null
          last_checked_at?: string | null
          last_content_hash?: string | null
          last_error?: string | null
          last_http_status?: number | null
          last_modified?: string | null
          last_success_at?: string | null
          max_bytes?: number
          next_refresh_at?: string
          parser_key?: string
          refresh_interval_hours?: number
          source_id: string
          updated_at?: string
        }
        Update: {
          auto_publish?: boolean
          created_at?: string
          enabled?: boolean
          etag?: string | null
          last_checked_at?: string | null
          last_content_hash?: string | null
          last_error?: string | null
          last_http_status?: number | null
          last_modified?: string | null
          last_success_at?: string | null
          max_bytes?: number
          next_refresh_at?: string
          parser_key?: string
          refresh_interval_hours?: number
          source_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_brain_source_refresh_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: true
            referencedRelation: "fenix_brain_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_brain_sources: {
        Row: {
          content_hash: string | null
          created_at: string
          effective_from: string | null
          effective_until: string | null
          id: string
          language_code: string
          metadata: Json
          published_at: string | null
          publisher: string
          source_type: string
          status: string
          title: string
          trust_tier: number
          updated_at: string
          url: string | null
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          language_code?: string
          metadata?: Json
          published_at?: string | null
          publisher: string
          source_type: string
          status?: string
          title: string
          trust_tier?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          language_code?: string
          metadata?: Json
          published_at?: string | null
          publisher?: string
          source_type?: string
          status?: string
          title?: string
          trust_tier?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      fenix_brain_update_candidates: {
        Row: {
          change_summary: string | null
          content_hash: string
          discovered_at: string
          extracted_content: string
          id: string
          metadata: Json
          previous_hash: string | null
          published_document_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_id: string
          source_url: string | null
          status: string
          title: string
        }
        Insert: {
          change_summary?: string | null
          content_hash: string
          discovered_at?: string
          extracted_content: string
          id?: string
          metadata?: Json
          previous_hash?: string | null
          published_document_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id: string
          source_url?: string | null
          status?: string
          title: string
        }
        Update: {
          change_summary?: string | null
          content_hash?: string
          discovered_at?: string
          extracted_content?: string
          id?: string
          metadata?: Json
          previous_hash?: string | null
          published_document_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_id?: string
          source_url?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_brain_update_candidates_published_document_id_fkey"
            columns: ["published_document_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_brain_update_candidates_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_brain_update_runs: {
        Row: {
          bytes_read: number | null
          completed_at: string | null
          content_hash: string | null
          error: string | null
          http_status: number | null
          id: string
          metadata: Json
          source_id: string
          started_at: string
          status: string
        }
        Insert: {
          bytes_read?: number | null
          completed_at?: string | null
          content_hash?: string | null
          error?: string | null
          http_status?: number | null
          id?: string
          metadata?: Json
          source_id: string
          started_at?: string
          status?: string
        }
        Update: {
          bytes_read?: number | null
          completed_at?: string | null
          content_hash?: string | null
          error?: string | null
          http_status?: number | null
          id?: string
          metadata?: Json
          source_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_brain_update_runs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_content_bookmarks: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_content_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_content_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_content_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_content_comments: {
        Row: {
          author_id: string
          body: string
          content_id: string
          content_type: string
          created_at: string
          deleted_at: string | null
          id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          content_id: string
          content_type: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          content_id?: string
          content_type?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_content_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_content_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_content_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_content_reports: {
        Row: {
          admin_note: string | null
          content_id: string
          content_type: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_note?: string | null
          content_id: string
          content_type: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_note?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_content_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_content_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_content_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_content_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_content_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_content_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_content_votes: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          user_id: string
          value: number
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          user_id: string
          value?: number
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fenix_content_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_content_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_content_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_direct_messages: {
        Row: {
          attachment_name: string | null
          attachment_path: string | null
          attachment_size: number | null
          attachment_type: string | null
          body: string
          created_at: string
          deleted_for_recipient_at: string | null
          deleted_for_sender_at: string | null
          edited_at: string | null
          id: string
          read_at: string | null
          recipient_id: string
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_path?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          body: string
          created_at?: string
          deleted_for_recipient_at?: string | null
          deleted_for_sender_at?: string | null
          edited_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id: string
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_path?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          body?: string
          created_at?: string
          deleted_for_recipient_at?: string | null
          deleted_for_sender_at?: string | null
          edited_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_direct_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "fenix_direct_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_feature_flags: {
        Row: {
          description: string | null
          enabled: boolean
          key: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          enabled?: boolean
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      fenix_message_reactions: {
        Row: {
          created_at: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "fenix_direct_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_notifications: {
        Row: {
          body: string
          created_at: string
          href: string | null
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          href?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          href?: string | null
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_questions: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          title: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          title: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          title?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_questions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_questions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_questions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "fenix_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_topic_follows: {
        Row: {
          created_at: string
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_topic_follows_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "fenix_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_topic_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_topic_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_topic_follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_topics: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          name_bn: string
          name_en: string
          slug: string
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          name_bn: string
          name_en: string
          slug: string
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          name_bn?: string
          name_en?: string
          slug?: string
        }
        Relationships: []
      }
      fenix_user_moderation: {
        Row: {
          banned_until: string | null
          changed_at: string
          changed_by: string | null
          reason: string | null
          status: string
          user_id: string
        }
        Insert: {
          banned_until?: string | null
          changed_at?: string
          changed_by?: string | null
          reason?: string | null
          status?: string
          user_id: string
        }
        Update: {
          banned_until?: string | null
          changed_at?: string
          changed_by?: string | null
          reason?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fenix_user_moderation_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_user_moderation_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_user_moderation_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_user_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_user_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_user_moderation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          id: string
          low_stock_threshold: number
          product_id: string
          quantity: number
          reserved_quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          low_stock_threshold?: number
          product_id: string
          quantity?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Update: {
          id?: string
          low_stock_threshold?: number
          product_id?: string
          quantity?: number
          reserved_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "commerce_public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
          opportunity_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
          opportunity_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
          opportunity_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_audit_logs_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "investment_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_deals: {
        Row: {
          agreed_amount: number
          completed_at: string | null
          created_at: string
          funded_at: string | null
          id: string
          investor_confirmed_at: string | null
          investor_id: string
          opportunity_id: string
          owner_confirmed_at: string | null
          ownership_percentage: number | null
          started_at: string | null
          status: string
          structure: string
          terms_note: string | null
          updated_at: string
        }
        Insert: {
          agreed_amount: number
          completed_at?: string | null
          created_at?: string
          funded_at?: string | null
          id?: string
          investor_confirmed_at?: string | null
          investor_id: string
          opportunity_id: string
          owner_confirmed_at?: string | null
          ownership_percentage?: number | null
          started_at?: string | null
          status?: string
          structure?: string
          terms_note?: string | null
          updated_at?: string
        }
        Update: {
          agreed_amount?: number
          completed_at?: string | null
          created_at?: string
          funded_at?: string | null
          id?: string
          investor_confirmed_at?: string | null
          investor_id?: string
          opportunity_id?: string
          owner_confirmed_at?: string | null
          ownership_percentage?: number | null
          started_at?: string | null
          status?: string
          structure?: string
          terms_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_deals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "investment_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_documents: {
        Row: {
          created_at: string
          document_type: string
          id: string
          opportunity_id: string
          owner_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_bucket: string
          storage_path: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          document_type: string
          id?: string
          opportunity_id: string
          owner_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_bucket?: string
          storage_path: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          id?: string
          opportunity_id?: string
          owner_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_bucket?: string
          storage_path?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "investment_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_due_diligence_checks: {
        Row: {
          check_key: string
          created_at: string
          id: string
          investor_id: string
          note: string | null
          opportunity_id: string
          status: string
          updated_at: string
        }
        Insert: {
          check_key: string
          created_at?: string
          id?: string
          investor_id: string
          note?: string | null
          opportunity_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          check_key?: string
          created_at?: string
          id?: string
          investor_id?: string
          note?: string | null
          opportunity_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_due_diligence_checks_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "investment_due_diligence_checks_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_due_diligence_checks_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_due_diligence_checks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "investment_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_interests: {
        Row: {
          created_at: string
          id: string
          investor_id: string
          message: string | null
          offered_amount: number
          opportunity_id: string
          owner_note: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          investor_id: string
          message?: string | null
          offered_amount: number
          opportunity_id: string
          owner_note?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          investor_id?: string
          message?: string | null
          offered_amount?: number
          opportunity_id?: string
          owner_note?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_interests_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "investment_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_messages: {
        Row: {
          body: string
          created_at: string
          deal_id: string | null
          id: string
          opportunity_id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          deal_id?: string | null
          id?: string
          opportunity_id: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          deal_id?: string | null
          id?: string
          opportunity_id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "investment_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_messages_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "investment_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_opportunities: {
        Row: {
          business_id: string | null
          category: string
          created_at: string
          description_bn: string
          description_en: string
          district: string
          expected_return_pct: number | null
          expected_term_months: number | null
          funding_deadline: string | null
          id: string
          location_details: string | null
          min_investment: number
          offer_type: string
          owner_id: string
          ownership_percentage: number | null
          raised_amount: number
          risk_disclosure: string | null
          risk_level: string
          shariah_preference: string
          status: string
          target_amount: number
          title_bn: string
          title_en: string
          upazila: string | null
          updated_at: string
          verification_note: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          business_id?: string | null
          category: string
          created_at?: string
          description_bn: string
          description_en: string
          district?: string
          expected_return_pct?: number | null
          expected_term_months?: number | null
          funding_deadline?: string | null
          id?: string
          location_details?: string | null
          min_investment: number
          offer_type?: string
          owner_id: string
          ownership_percentage?: number | null
          raised_amount?: number
          risk_disclosure?: string | null
          risk_level?: string
          shariah_preference?: string
          status?: string
          target_amount: number
          title_bn: string
          title_en: string
          upazila?: string | null
          updated_at?: string
          verification_note?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          business_id?: string | null
          category?: string
          created_at?: string
          description_bn?: string
          description_en?: string
          district?: string
          expected_return_pct?: number | null
          expected_term_months?: number | null
          funding_deadline?: string | null
          id?: string
          location_details?: string | null
          min_investment?: number
          offer_type?: string
          owner_id?: string
          ownership_percentage?: number | null
          raised_amount?: number
          risk_disclosure?: string | null
          risk_level?: string
          shariah_preference?: string
          status?: string
          target_amount?: number
          title_bn?: string
          title_en?: string
          upazila?: string | null
          updated_at?: string
          verification_note?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_opportunities_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_profiles: {
        Row: {
          bio: string | null
          created_at: string
          horizon_months: number | null
          investor_type: string
          max_budget: number
          min_budget: number
          preferred_sectors: string[]
          preferred_upazilas: string[]
          risk_preference: string
          shariah_preference: string
          updated_at: string
          user_id: string
          verification_note: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          horizon_months?: number | null
          investor_type?: string
          max_budget?: number
          min_budget?: number
          preferred_sectors?: string[]
          preferred_upazilas?: string[]
          risk_preference?: string
          shariah_preference?: string
          updated_at?: string
          user_id: string
          verification_note?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          horizon_months?: number | null
          investor_type?: string
          max_budget?: number
          min_budget?: number
          preferred_sectors?: string[]
          preferred_upazilas?: string[]
          risk_preference?: string
          shariah_preference?: string
          updated_at?: string
          user_id?: string
          verification_note?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      investment_reports: {
        Row: {
          created_at: string
          details: string
          id: string
          opportunity_id: string
          reason: string
          reporter_id: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details: string
          id?: string
          opportunity_id: string
          reason: string
          reporter_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          opportunity_id?: string
          reason?: string
          reporter_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_reports_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "investment_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_updates: {
        Row: {
          author_id: string
          body: string
          created_at: string
          customers_actual: number | null
          id: string
          opportunity_id: string
          period_label: string | null
          profit_actual: number | null
          return_actual_pct: number | null
          revenue_actual: number | null
          risk_note: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          customers_actual?: number | null
          id?: string
          opportunity_id: string
          period_label?: string | null
          profit_actual?: number | null
          return_actual_pct?: number | null
          revenue_actual?: number | null
          risk_note?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          customers_actual?: number | null
          id?: string
          opportunity_id?: string
          period_label?: string | null
          profit_actual?: number | null
          return_actual_pct?: number | null
          revenue_actual?: number | null
          risk_note?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_updates_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "investment_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          author_id: string | null
          breaking: boolean
          category: string
          content_bn: string
          content_en: string
          created_at: string
          excerpt_bn: string | null
          excerpt_en: string | null
          featured: boolean
          id: string
          image_url: string | null
          published_at: string | null
          slug: string
          source_name: string | null
          source_url: string | null
          status: string
          title_bn: string
          title_en: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          author_id?: string | null
          breaking?: boolean
          category: string
          content_bn: string
          content_en: string
          created_at?: string
          excerpt_bn?: string | null
          excerpt_en?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug: string
          source_name?: string | null
          source_url?: string | null
          status?: string
          title_bn: string
          title_en: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          author_id?: string | null
          breaking?: boolean
          category?: string
          content_bn?: string
          content_en?: string
          created_at?: string
          excerpt_bn?: string | null
          excerpt_en?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug?: string
          source_name?: string | null
          source_url?: string | null
          status?: string
          title_bn?: string
          title_en?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "news_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          discount_amount: number
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          unit_price: number
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity: number
          unit_price: number
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          discount_amount?: number
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          unit_price?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "commerce_public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          customer_id: string | null
          customer_note: string | null
          delivery_fee: number
          discount_amount: number
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          order_number: string
          payment_method: string
          payment_status: string
          shipping_address: string
          shipping_area: string | null
          shipping_district: string | null
          shipping_name: string
          shipping_phone: string
          shipping_upazila: string | null
          status: string
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_note?: string | null
          delivery_fee?: number
          discount_amount?: number
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          order_number?: string
          payment_method?: string
          payment_status?: string
          shipping_address: string
          shipping_area?: string | null
          shipping_district?: string | null
          shipping_name: string
          shipping_phone: string
          shipping_upazila?: string | null
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          customer_note?: string | null
          delivery_fee?: number
          discount_amount?: number
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          order_number?: string
          payment_method?: string
          payment_status?: string
          shipping_address?: string
          shipping_area?: string | null
          shipping_district?: string | null
          shipping_name?: string
          shipping_phone?: string
          shipping_upazila?: string | null
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description_bn: string | null
          description_en: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name_bn: string | null
          name_en: string | null
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_bn?: string | null
          name_en?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_bn?: string | null
          name_en?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text_bn: string | null
          alt_text_en: string | null
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          storage_bucket: string
          storage_path: string
        }
        Insert: {
          alt_text_bn?: string | null
          alt_text_en?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          storage_bucket?: string
          storage_path: string
        }
        Update: {
          alt_text_bn?: string | null
          alt_text_en?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          storage_bucket?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "commerce_public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          body: string | null
          created_at: string
          customer_id: string
          id: string
          order_id: string
          product_id: string
          rating: number
          seller_responded_at: string | null
          seller_response: string | null
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          product_id: string
          rating: number
          seller_responded_at?: string | null
          seller_response?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          product_id?: string
          rating?: number
          seller_responded_at?: string | null
          seller_response?: string | null
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "product_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "commerce_public_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_guest_purchase: boolean
          business_id: string | null
          category_id: string | null
          compare_at_price: number | null
          created_at: string
          currency: string
          description_bn: string | null
          description_en: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          name_bn: string | null
          name_en: string | null
          price: number
          sku: string | null
          slug: string
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          allow_guest_purchase?: boolean
          business_id?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name_bn?: string | null
          name_en?: string | null
          price: number
          sku?: string | null
          slug: string
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          allow_guest_purchase?: boolean
          business_id?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description_bn?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name_bn?: string | null
          name_en?: string | null
          price?: number
          sku?: string | null
          slug?: string
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_contacts: {
        Row: {
          created_at: string
          facebook_public: boolean
          facebook_url: string | null
          instagram_public: boolean
          instagram_url: string | null
          linkedin_public: boolean
          linkedin_url: string | null
          phone_public: boolean
          public_facebook_url: string | null
          public_instagram_url: string | null
          public_linkedin_url: string | null
          public_whatsapp: string | null
          public_youtube_url: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
          whatsapp_public: boolean
          youtube_public: boolean
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          facebook_public?: boolean
          facebook_url?: string | null
          instagram_public?: boolean
          instagram_url?: string | null
          linkedin_public?: boolean
          linkedin_url?: string | null
          phone_public?: boolean
          public_facebook_url?: string | null
          public_instagram_url?: string | null
          public_linkedin_url?: string | null
          public_whatsapp?: string | null
          public_youtube_url?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
          whatsapp_public?: boolean
          youtube_public?: boolean
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          facebook_public?: boolean
          facebook_url?: string | null
          instagram_public?: boolean
          instagram_url?: string | null
          linkedin_public?: boolean
          linkedin_url?: string | null
          phone_public?: boolean
          public_facebook_url?: string | null
          public_instagram_url?: string | null
          public_linkedin_url?: string | null
          public_whatsapp?: string | null
          public_youtube_url?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
          whatsapp_public?: boolean
          youtube_public?: boolean
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "profile_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_settings: {
        Row: {
          feed_visibility: string
          interests: string[]
          locale: string
          message_permissions: string
          onboarding_completed: boolean
          onboarding_dismissed: boolean
          onboarding_step: string
          profile_visibility: string
          reduced_motion: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          feed_visibility?: string
          interests?: string[]
          locale?: string
          message_permissions?: string
          onboarding_completed?: boolean
          onboarding_dismissed?: boolean
          onboarding_step?: string
          profile_visibility?: string
          reduced_motion?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          feed_visibility?: string
          interests?: string[]
          locale?: string
          message_permissions?: string
          onboarding_completed?: boolean
          onboarding_dismissed?: boolean
          onboarding_step?: string
          profile_visibility?: string
          reduced_motion?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "profile_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area_text: string | null
          avatar_url: string | null
          bio: string | null
          country_code: string
          cover_url: string | null
          created_at: string
          district_id: string | null
          exact_location_visibility: string
          feed_public: boolean
          full_name: string | null
          holding_no: string | null
          house_details: string | null
          id: string
          is_public: boolean
          locality_id: string | null
          location_public_level: string
          location_text: string | null
          phone: string | null
          road_text: string | null
          role: string | null
          upazila_id: string | null
          updated_at: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          area_text?: string | null
          avatar_url?: string | null
          bio?: string | null
          country_code?: string
          cover_url?: string | null
          created_at?: string
          district_id?: string | null
          exact_location_visibility?: string
          feed_public?: boolean
          full_name?: string | null
          holding_no?: string | null
          house_details?: string | null
          id: string
          is_public?: boolean
          locality_id?: string | null
          location_public_level?: string
          location_text?: string | null
          phone?: string | null
          road_text?: string | null
          role?: string | null
          upazila_id?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          area_text?: string | null
          avatar_url?: string | null
          bio?: string | null
          country_code?: string
          cover_url?: string | null
          created_at?: string
          district_id?: string | null
          exact_location_visibility?: string
          feed_public?: boolean
          full_name?: string | null
          holding_no?: string | null
          house_details?: string | null
          id?: string
          is_public?: boolean
          locality_id?: string | null
          location_public_level?: string
          location_text?: string | null
          phone?: string | null
          road_text?: string | null
          role?: string | null
          upazila_id?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_district_id_fkey"
            columns: ["district_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_locality_id_fkey"
            columns: ["locality_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_upazila_id_fkey"
            columns: ["upazila_id"]
            isOneToOne: false
            referencedRelation: "fenix_brain_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          business_id: string | null
          created_at: string
          description_bn: string | null
          description_en: string | null
          display_name: string
          display_name_bn: string | null
          display_name_en: string | null
          id: string
          is_verified: boolean
          phone: string | null
          shop_slug: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          display_name: string
          display_name_bn?: string | null
          display_name_en?: string | null
          id?: string
          is_verified?: boolean
          phone?: string | null
          shop_slug?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          description_bn?: string | null
          description_en?: string | null
          display_name?: string
          display_name_bn?: string | null
          display_name_en?: string | null
          id?: string
          is_verified?: boolean
          phone?: string | null
          shop_slug?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "vendor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      commerce_public_products: {
        Row: {
          allow_guest_purchase: boolean | null
          category_id: string | null
          compare_at_price: number | null
          created_at: string | null
          currency: string | null
          description_bn: string | null
          description_en: string | null
          id: string | null
          image_alt_bn: string | null
          image_alt_en: string | null
          image_bucket: string | null
          image_id: string | null
          image_path: string | null
          is_featured: boolean | null
          name_bn: string | null
          name_en: string | null
          price: number | null
          shop_slug: string | null
          sku: string | null
          slug: string | null
          vendor_display_name: string | null
          vendor_display_name_bn: string | null
          vendor_display_name_en: string | null
          vendor_id: string | null
          vendor_is_verified: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_brain_pulse_intents: {
        Row: {
          intent_key: string | null
          searches_30d: number | null
          searches_7d: number | null
        }
        Relationships: []
      }
      fenix_brain_pulse_terms: {
        Row: {
          searches_30d: number | null
          searches_7d: number | null
          term: string | null
          unique_queries_7d: number | null
        }
        Relationships: []
      }
      fenix_public_ambulance_providers: {
        Row: {
          ac_available: boolean | null
          ambulance_type: string | null
          available_24_7: boolean | null
          base_area: string | null
          display_name: string | null
          id: string | null
          is_verified: boolean | null
          oxygen_available: boolean | null
          phone: string | null
          service_area: string | null
          whatsapp: string | null
        }
        Insert: {
          ac_available?: boolean | null
          ambulance_type?: string | null
          available_24_7?: boolean | null
          base_area?: string | null
          display_name?: string | null
          id?: string | null
          is_verified?: boolean | null
          oxygen_available?: boolean | null
          phone?: string | null
          service_area?: string | null
          whatsapp?: string | null
        }
        Update: {
          ac_available?: boolean | null
          ambulance_type?: string | null
          available_24_7?: boolean | null
          base_area?: string | null
          display_name?: string | null
          id?: string | null
          is_verified?: boolean | null
          oxygen_available?: boolean | null
          phone?: string | null
          service_area?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      fenix_public_answer_feed: {
        Row: {
          author_avatar_url: string | null
          author_id: string | null
          author_name: string | null
          author_username: string | null
          body: string | null
          created_at: string | null
          id: string | null
          question_id: string | null
          score: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fenix_answers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_answers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_answers_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_question_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "fenix_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      fenix_public_blood_donors: {
        Row: {
          area_text: string | null
          availability: string | null
          avatar_url: string | null
          blood_group: string | null
          full_name: string | null
          last_donation_date: string | null
          preferred_contact: string | null
          upazila_bn: string | null
          upazila_en: string | null
          username: string | null
        }
        Relationships: []
      }
      fenix_public_blood_requests: {
        Row: {
          area_text: string | null
          blood_group: string | null
          created_at: string | null
          hospital_area: string | null
          hospital_name: string | null
          id: string | null
          needed_at: string | null
          status: string | null
          units: number | null
          upazila_bn: string | null
          upazila_en: string | null
          urgency: string | null
        }
        Relationships: []
      }
      fenix_public_feed: {
        Row: {
          author_avatar_url: string | null
          author_id: string | null
          author_name: string | null
          author_username: string | null
          body: string | null
          created_at: string | null
          id: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      fenix_public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string | null
          facebook_url: string | null
          full_name: string | null
          id: string | null
          instagram_url: string | null
          linkedin_url: string | null
          location_text: string | null
          phone: string | null
          public_location: string | null
          username: string | null
          website_url: string | null
          whatsapp: string | null
          youtube_url: string | null
        }
        Relationships: []
      }
      fenix_public_question_feed: {
        Row: {
          answer_count: number | null
          author_avatar_url: string | null
          author_id: string | null
          author_name: string | null
          author_username: string | null
          body: string | null
          created_at: string | null
          id: string | null
          score: number | null
          title: string | null
          topic_id: string | null
          topic_name_bn: string | null
          topic_name_en: string | null
          topic_slug: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fenix_questions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_feed"
            referencedColumns: ["author_id"]
          },
          {
            foreignKeyName: "fenix_questions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "fenix_public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_questions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fenix_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "fenix_topics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_delete_delivery_rule: {
        Args: { p_rule_id: string }
        Returns: boolean
      }
      admin_set_order_payment_status: {
        Args: { p_order_id: string; p_payment_status: string }
        Returns: boolean
      }
      admin_set_review_status: {
        Args: { p_review_id: string; p_status: string }
        Returns: boolean
      }
      admin_set_vendor_status: {
        Args: { p_is_verified?: boolean; p_status: string; p_vendor_id: string }
        Returns: boolean
      }
      admin_upsert_delivery_rule: {
        Args: {
          p_district?: string
          p_fee?: number
          p_free_shipping_minimum?: number
          p_is_active?: boolean
          p_rule_id?: string
          p_sort_order?: number
          p_upazila?: string
        }
        Returns: string
      }
      calculate_commerce_delivery_fee: {
        Args: { p_district: string; p_subtotal: number; p_upazila: string }
        Returns: number
      }
      claim_due_feni_brain_sources: {
        Args: { p_limit?: number }
        Returns: {
          auto_publish: boolean
          etag: string
          last_modified: string
          max_bytes: number
          parser_key: string
          publisher: string
          source_id: string
          title: string
          trust_tier: number
          url: string
        }[]
      }
      claim_due_feni_brain_sources_v2: {
        Args: { p_limit?: number }
        Returns: {
          auto_publish: boolean
          etag: string
          last_modified: string
          max_bytes: number
          parser_key: string
          publisher: string
          refresh_interval_hours: number
          source_id: string
          title: string
          trust_tier: number
          url: string
        }[]
      }
      create_commerce_order: {
        Args: {
          p_customer_id?: string
          p_customer_note?: string
          p_guest_email?: string
          p_guest_name?: string
          p_guest_phone?: string
          p_items: Json
          p_shipping_address?: string
          p_shipping_area?: string
          p_shipping_district?: string
          p_shipping_name?: string
          p_shipping_phone?: string
          p_shipping_upazila?: string
        }
        Returns: {
          order_id: string
          order_number: string
          total_amount: number
        }[]
      }
      create_commerce_return_request: {
        Args: { p_details?: string; p_order_item_id: string; p_reason: string }
        Returns: string
      }
      create_product_review: {
        Args: {
          p_body?: string
          p_product_id: string
          p_rating: number
          p_title?: string
        }
        Returns: string
      }
      fenix_brain_internal_refresh_secret: { Args: never; Returns: string }
      generate_commerce_order_number: { Args: never; Returns: string }
      get_public_vendor_shop: {
        Args: { p_slug: string }
        Returns: {
          business_id: string
          description_bn: string
          description_en: string
          display_name: string
          display_name_bn: string
          display_name_en: string
          id: string
          is_verified: boolean
          shop_slug: string
        }[]
      }
      investor_confirm_investment_deal: {
        Args: { p_deal_id: string }
        Returns: boolean
      }
      is_fenix_admin: { Args: never; Returns: boolean }
      is_fenix_username_available: {
        Args: { p_exclude_user_id?: string; p_username: string }
        Returns: boolean
      }
      keyword_feni_brain_chunks: {
        Args: { match_count?: number; query_text: string }
        Returns: {
          content: string
          document_id: string
          document_title: string
          id: string
          similarity: number
          source_id: string
          source_title: string
          source_url: string
          trust_tier: number
        }[]
      }
      list_directory_categories: {
        Args: never
        Returns: {
          business_count: number
          category: string
        }[]
      }
      list_directory_upazilas: {
        Args: never
        Returns: {
          business_count: number
          upazila: string
        }[]
      }
      mark_investment_message_read: {
        Args: { p_message_id: string }
        Returns: boolean
      }
      match_businesses: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          description: string
          id: string
          name: string
          similarity: number
        }[]
      }
      match_feni_brain_chunks: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          document_title: string
          id: string
          similarity: number
          source_id: string
          source_title: string
          source_url: string
          trust_tier: number
        }[]
      }
      match_investment_opportunities: {
        Args: { p_limit?: number }
        Returns: {
          category: string
          district: string
          match_reasons: string[]
          match_score: number
          min_investment: number
          opportunity_id: string
          raised_amount: number
          risk_level: string
          target_amount: number
          title_bn: string
          title_en: string
          upazila: string
          verification_status: string
        }[]
      }
      owner_confirm_investment_deal: {
        Args: { p_deal_id: string }
        Returns: boolean
      }
      owner_progress_investment_deal: {
        Args: {
          p_agreed_amount?: number
          p_deal_id: string
          p_ownership_percentage?: number
          p_status: string
          p_terms_note?: string
        }
        Returns: boolean
      }
      owner_update_investment_interest: {
        Args: { p_interest_id: string; p_owner_note?: string; p_status: string }
        Returns: boolean
      }
      record_feni_brain_events: {
        Args: {
          p_intent_key: string
          p_language_code: string
          p_query_hash: string
          p_result_count?: number
          p_terms: string[]
        }
        Returns: number
      }
      save_business_embedding: {
        Args: { p_business_id: string; p_embedding: string }
        Returns: boolean
      }
      search_directory_businesses: {
        Args: {
          p_category?: string
          p_limit?: number
          p_offset?: number
          p_query?: string
          p_upazila?: string
        }
        Returns: {
          address: string
          area: string
          category: string
          created_at: string
          description: string
          district: string
          facebook_url: string
          has_investment: boolean
          id: string
          latitude: number
          listing_status: string
          location_verified: boolean
          longitude: number
          map_label: string
          market: string
          name: string
          owner_claimed: boolean
          phone: string
          phone_verified: boolean
          product_count: number
          tagline_bn: string
          tagline_en: string
          title_bn: string
          title_en: string
          upazila: string
          updated_at: string
          verification_level: string
          website_url: string
          whatsapp: string
        }[]
      }
      search_feni_brain_facts: {
        Args: { match_count?: number; query_text: string }
        Returns: {
          content: string
          document_id: string
          document_title: string
          id: string
          name_bn: string
          name_en: string
          similarity: number
          source_id: string
          source_title: string
          source_url: string
          subject_key: string
          trust_tier: number
          value_number: number
          value_text: string
          value_unit: string
        }[]
      }
      search_feni_brain_locations: {
        Args: { match_count?: number; query_text: string }
        Returns: {
          alias: string
          id: string
          level: string
          match_type: string
          name_bn: string
          name_en: string
          slug: string
        }[]
      }
      seller_reply_to_product_review: {
        Args: { p_response: string; p_review_id: string }
        Returns: boolean
      }
      set_commerce_return_status: {
        Args: {
          p_refund_amount?: number
          p_request_id: string
          p_resolution_note?: string
          p_status: string
        }
        Returns: boolean
      }
      set_product_primary_image: {
        Args: { p_image_id: string }
        Returns: boolean
      }
      set_vendor_order_status: {
        Args: { p_order_id: string; p_status: string }
        Returns: boolean
      }
      submit_investment_opportunity: {
        Args: { p_opportunity_id: string }
        Returns: boolean
      }
      update_vendor_product: {
        Args: {
          p_allow_guest_purchase?: boolean
          p_category_id?: string
          p_compare_at_price?: number
          p_description_bn?: string
          p_description_en?: string
          p_name_bn: string
          p_name_en: string
          p_price?: number
          p_product_id: string
          p_sku?: string
          p_slug: string
        }
        Returns: boolean
      }
      update_vendor_profile: {
        Args: {
          p_description_bn?: string
          p_description_en?: string
          p_display_name: string
          p_display_name_bn?: string
          p_display_name_en?: string
          p_phone?: string
          p_shop_slug?: string
        }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

/** FeniX application compatibility aliases. Keep these alongside generated Supabase types. */
export type Business = Database["public"]["Tables"]["businesses"]["Row"]
export type BusinessInsert = Database["public"]["Tables"]["businesses"]["Insert"]
export type BusinessUpdate = Database["public"]["Tables"]["businesses"]["Update"]

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

export type VendorProfile = Database["public"]["Tables"]["vendor_profiles"]["Row"]
export type VendorProfileInsert = Database["public"]["Tables"]["vendor_profiles"]["Insert"]
export type VendorProfileUpdate = Database["public"]["Tables"]["vendor_profiles"]["Update"]

export type InvestmentDocument = Database["public"]["Tables"]["investment_documents"]["Row"]
export type InvestmentInterest = Database["public"]["Tables"]["investment_interests"]["Row"]
export type InvestmentOpportunity = Database["public"]["Tables"]["investment_opportunities"]["Row"]
export type InvestmentProfile = Database["public"]["Tables"]["investment_profiles"]["Row"]
export type InvestmentReport = Database["public"]["Tables"]["investment_reports"]["Row"]
export type InvestmentDeal = Database["public"]["Tables"]["investment_deals"]["Row"]
export type InvestmentUpdate = Database["public"]["Tables"]["investment_updates"]["Row"]
export type InvestmentMessage = Database["public"]["Tables"]["investment_messages"]["Row"]

export const Constants = {
  public: {
    Enums: {},
  },
} as const
