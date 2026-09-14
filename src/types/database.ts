export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'admin' | 'vendor' | 'customer'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'admin' | 'vendor' | 'customer'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'admin' | 'vendor' | 'customer'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
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
          created_at: string
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
          created_at?: string
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
          created_at?: string
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

      product_categories: {
        Row: {
          id: string
          name_bn: string
          name_en: string
          slug: string
          description_bn: string | null
          description_en: string | null
          parent_id: string | null
          image_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_bn: string
          name_en: string
          slug: string
          description_bn?: string | null
          description_en?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_bn?: string
          name_en?: string
          slug?: string
          description_bn?: string | null
          description_en?: string | null
          parent_id?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_categories_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'product_categories'
            referencedColumns: ['id']
          },
        ]
      }

      vendor_profiles: {
        Row: {
          id: string
          user_id: string
          business_id: string | null
          display_name: string
          display_name_bn: string | null
          display_name_en: string | null
          description_bn: string | null
          description_en: string | null
          phone: string | null
          status: 'pending' | 'approved' | 'rejected' | 'suspended'
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id?: string | null
          display_name: string
          display_name_bn?: string | null
          display_name_en?: string | null
          description_bn?: string | null
          description_en?: string | null
          phone?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_id?: string | null
          display_name?: string
          display_name_bn?: string | null
          display_name_en?: string | null
          description_bn?: string | null
          description_en?: string | null
          phone?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'vendor_profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vendor_profiles_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }

      products: {
        Row: {
          id: string
          vendor_id: string
          business_id: string | null
          category_id: string | null
          name_bn: string
          name_en: string
          slug: string
          description_bn: string | null
          description_en: string | null
          sku: string | null
          price: number
          compare_at_price: number | null
          currency: string
          status:
            | 'draft'
            | 'pending'
            | 'published'
            | 'paused'
            | 'archived'
          is_active: boolean
          is_featured: boolean
          allow_guest_purchase: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          business_id?: string | null
          category_id?: string | null
          name_bn: string
          name_en: string
          slug: string
          description_bn?: string | null
          description_en?: string | null
          sku?: string | null
          price: number
          compare_at_price?: number | null
          currency?: string
          status?:
            | 'draft'
            | 'pending'
            | 'published'
            | 'paused'
            | 'archived'
          is_active?: boolean
          is_featured?: boolean
          allow_guest_purchase?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          business_id?: string | null
          category_id?: string | null
          name_bn?: string
          name_en?: string
          slug?: string
          description_bn?: string | null
          description_en?: string | null
          sku?: string | null
          price?: number
          compare_at_price?: number | null
          currency?: string
          status?:
            | 'draft'
            | 'pending'
            | 'published'
            | 'paused'
            | 'archived'
          is_active?: boolean
          is_featured?: boolean
          allow_guest_purchase?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendor_profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'products_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'product_categories'
            referencedColumns: ['id']
          },
        ]
      }

      product_images: {
        Row: {
          id: string
          product_id: string
          storage_bucket: string
          storage_path: string
          alt_text_bn: string | null
          alt_text_en: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          storage_bucket: string
          storage_path: string
          alt_text_bn?: string | null
          alt_text_en?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          storage_bucket?: string
          storage_path?: string
          alt_text_bn?: string | null
          alt_text_en?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }

      inventory: {
        Row: {
          id: string
          product_id: string
          quantity: number
          reserved_quantity: number
          low_stock_threshold: number
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity?: number
          reserved_quantity?: number
          low_stock_threshold?: number
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          reserved_quantity?: number
          low_stock_threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_product_id_fkey'
            columns: ['product_id']
            isOneToOne: true
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }

      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          guest_name: string | null
          guest_phone: string | null
          guest_email: string | null
          status:
            | 'pending'
            | 'confirmed'
            | 'processing'
            | 'ready'
            | 'shipped'
            | 'delivered'
            | 'cancelled'
            | 'returned'
          payment_status:
            | 'unpaid'
            | 'pending'
            | 'paid'
            | 'failed'
            | 'refunded'
            | 'partially_refunded'
          payment_method:
            | 'cash_on_delivery'
            | 'online'
            | 'manual'
          currency: string
          subtotal: number
          delivery_fee: number
          discount_amount: number
          total_amount: number
          shipping_name: string
          shipping_phone: string
          shipping_address: string
          shipping_area: string | null
          shipping_upazila: string | null
          shipping_district: string | null
          customer_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guest_email?: string | null
          status?:
            | 'pending'
            | 'confirmed'
            | 'processing'
            | 'ready'
            | 'shipped'
            | 'delivered'
            | 'cancelled'
            | 'returned'
          payment_status?:
            | 'unpaid'
            | 'pending'
            | 'paid'
            | 'failed'
            | 'refunded'
            | 'partially_refunded'
          payment_method?:
            | 'cash_on_delivery'
            | 'online'
            | 'manual'
          currency?: string
          subtotal?: number
          delivery_fee?: number
          discount_amount?: number
          total_amount?: number
          shipping_name: string
          shipping_phone: string
          shipping_address: string
          shipping_area?: string | null
          shipping_upazila?: string | null
          shipping_district?: string | null
          customer_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          guest_email?: string | null
          status?:
            | 'pending'
            | 'confirmed'
            | 'processing'
            | 'ready'
            | 'shipped'
            | 'delivered'
            | 'cancelled'
            | 'returned'
          payment_status?:
            | 'unpaid'
            | 'pending'
            | 'paid'
            | 'failed'
            | 'refunded'
            | 'partially_refunded'
          payment_method?:
            | 'cash_on_delivery'
            | 'online'
            | 'manual'
          currency?: string
          subtotal?: number
          delivery_fee?: number
          discount_amount?: number
          total_amount?: number
          shipping_name?: string
          shipping_phone?: string
          shipping_address?: string
          shipping_area?: string | null
          shipping_upazila?: string | null
          shipping_district?: string | null
          customer_note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }

      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          vendor_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          unit_price: number
          discount_amount: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          vendor_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity: number
          unit_price: number
          discount_amount?: number
          line_total: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          vendor_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          unit_price?: number
          discount_amount?: number
          line_total?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_vendor_id_fkey'
            columns: ['vendor_id']
            isOneToOne: false
            referencedRelation: 'vendor_profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      create_commerce_order: {
        Args: {
          p_customer_id: string | null
          p_guest_name: string | null
          p_guest_phone: string | null
          p_guest_email: string | null
          p_items: Json
          p_shipping_name: string
          p_shipping_phone: string
          p_shipping_address: string
          p_shipping_area: string | null
          p_shipping_upazila: string | null
          p_shipping_district: string | null
          p_customer_note: string | null
        }
        Returns: string
      }

      generate_commerce_order_number: {
        Args: Record<string, never>
        Returns: string
      }

      match_businesses: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          name: string
          description: string | null
          similarity: number
        }[]
      }

      save_business_embedding: {
        Args: {
          p_business_id: string
          p_embedding: number[]
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

/* -------------------------------------------------------------------------- */
/* Convenience aliases                                                        */
/* -------------------------------------------------------------------------- */

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert =
  Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate =
  Database['public']['Tables']['profiles']['Update']

export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert =
  Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate =
  Database['public']['Tables']['businesses']['Update']

export type ProductCategory =
  Database['public']['Tables']['product_categories']['Row']
export type ProductCategoryInsert =
  Database['public']['Tables']['product_categories']['Insert']
export type ProductCategoryUpdate =
  Database['public']['Tables']['product_categories']['Update']

export type VendorProfile =
  Database['public']['Tables']['vendor_profiles']['Row']
export type VendorProfileInsert =
  Database['public']['Tables']['vendor_profiles']['Insert']
export type VendorProfileUpdate =
  Database['public']['Tables']['vendor_profiles']['Update']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert =
  Database['public']['Tables']['products']['Insert']
export type ProductUpdate =
  Database['public']['Tables']['products']['Update']

export type ProductImage =
  Database['public']['Tables']['product_images']['Row']
export type ProductImageInsert =
  Database['public']['Tables']['product_images']['Insert']
export type ProductImageUpdate =
  Database['public']['Tables']['product_images']['Update']

export type Inventory = Database['public']['Tables']['inventory']['Row']
export type InventoryInsert =
  Database['public']['Tables']['inventory']['Insert']
export type InventoryUpdate =
  Database['public']['Tables']['inventory']['Update']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert =
  Database['public']['Tables']['orders']['Insert']
export type OrderUpdate =
  Database['public']['Tables']['orders']['Update']

export type OrderItem =
  Database['public']['Tables']['order_items']['Row']
export type OrderItemInsert =
  Database['public']['Tables']['order_items']['Insert']
export type OrderItemUpdate =
  Database['public']['Tables']['order_items']['Update']
