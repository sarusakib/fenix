/**
 * FeniX — Database Contract
 *
 * Verified against the current Supabase public schema.
 *
 * Tables:
 * - public.profiles
 * - public.businesses
 *
 * Important:
 * - Keep this synchronized with Supabase schema changes.
 * - Never put secrets in this file.
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string | null
          phone: string | null
          created_at: string
        }

        Insert: {
          id: string
          full_name?: string | null
          role?: string | null
          phone?: string | null
          created_at?: string
        }

        Update: {
          id?: string
          full_name?: string | null
          role?: string | null
          phone?: string | null
          created_at?: string
        }

        Relationships: []
      }

      businesses: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          updated_at: string
          title_bn: string | null
          title_en: string | null
          description: string | null
          category: string | null
          feni_brain_embedding: number[] | null
        }

        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          updated_at?: string
          title_bn?: string | null
          title_en?: string | null
          description?: string | null
          category?: string | null
          feni_brain_embedding?: number[] | null
        }

        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          updated_at?: string
          title_bn?: string | null
          title_en?: string | null
          description?: string | null
          category?: string | null
          feni_brain_embedding?: number[] | null
        }

        Relationships: [
          {
            foreignKeyName: 'businesses_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }

    Views: Record<string, never>

    Functions: Record<string, never>

    Enums: Record<string, never>

    CompositeTypes: Record<string, never>
  }
}

export type Profile =
  Database['public']['Tables']['profiles']['Row']

export type ProfileInsert =
  Database['public']['Tables']['profiles']['Insert']

export type ProfileUpdate =
  Database['public']['Tables']['profiles']['Update']

export type Business =
  Database['public']['Tables']['businesses']['Row']

export type BusinessInsert =
  Database['public']['Tables']['businesses']['Insert']

export type BusinessUpdate =
  Database['public']['Tables']['businesses']['Update']
