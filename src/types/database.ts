export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
type ProductStatus = 'draft' | 'pending' | 'published' | 'paused' | 'archived'
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'

export type Database = {
  public: {
    Tables: {
      profiles: { Row: { id: string; full_name: string | null; role: string; phone: string | null; created_at: string; updated_at: string }; Insert: { id: string; full_name?: string | null; role?: string; phone?: string | null; created_at?: string; updated_at?: string }; Update: { id?: string; full_name?: string | null; role?: string; phone?: string | null; created_at?: string; updated_at?: string }; Relationships: [] }
      businesses: { Row: { id: string; owner_id: string | null; name: string; updated_at: string; title_bn: string | null; title_en: string | null; description: string | null; category: string | null; feni_brain_embedding: number[] | null; created_at: string }; Insert: { id?: string; owner_id?: string | null; name: string; updated_at?: string; title_bn?: string | null; title_en?: string | null; description?: string | null; category?: string | null; feni_brain_embedding?: number[] | null; created_at?: string }; Update: { id?: string; owner_id?: string | null; name?: string; updated_at?: string; title_bn?: string | null; title_en?: string | null; description?: string | null; category?: string | null; feni_brain_embedding?: number[] | null; created_at?: string }; Relationships: [] }
      product_categories: { Row: { id: string; name_bn: string | null; name_en: string | null; slug: string; description_bn: string | null; description_en: string | null; parent_id: string | null; image_url: string | null; is_active: boolean; sort_order: number; created_at: string; updated_at: string }; Insert: { id?: string; name_bn?: string | null; name_en?: string | null; slug: string; description_bn?: string | null; description_en?: string | null; parent_id?: string | null; image_url?: string | null; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string }; Update: { id?: string; name_bn?: string | null; name_en?: string | null; slug?: string; description_bn?: string | null; description_en?: string | null; parent_id?: string | null; image_url?: string | null; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string }; Relationships: [] }
      vendor_profiles: { Row: { id: string; user_id: string; business_id: string | null; display_name: string; display_name_bn: string | null; display_name_en: string | null; description_bn: string | null; description_en: string | null; phone: string | null; shop_slug: string | null; status: VendorStatus; is_verified: boolean; created_at: string; updated_at: string }; Insert: { id?: string; user_id: string; business_id?: string | null; display_name: string; display_name_bn?: string | null; display_name_en?: string | null; description_bn?: string | null; description_en?: string | null; phone?: string | null; shop_slug?: string | null; status?: VendorStatus; is_verified?: boolean; created_at?: string; updated_at?: string }; Update: { id?: string; user_id?: string; business_id?: string | null; display_name?: string; display_name_bn?: string | null; display_name_en?: string | null; description_bn?: string | null; description_en?: string | null; phone?: string | null; shop_slug?: string | null; status?: VendorStatus; is_verified?: boolean; created_at?: string; updated_at?: string }; Relationships: [] }
      products: { Row: { id: string; vendor_id: string; business_id: string | null; category_id: string | null; name_bn: string; name_en: string; slug: string; description_bn: string | null; description_en: string | null; sku: string | null; price: number; compare_at_price: number | null; currency: string; status: ProductStatus; is_active: boolean; is_featured: boolean; allow_guest_purchase: boolean; created_at: string; updated_at: string }; Insert: { id?: string; vendor_id: string; business_id?: string | null; category_id?: string | null; name_bn: string; name_en: string; slug: string; description_bn?: string | null; description_en?: string | null; sku?: string | null; price: number; compare_at_price?: number | null; currency?: string; status?: ProductStatus; is_active?: boolean; is_featured?: boolean; allow_guest_purchase?: boolean; created_at?: string; updated_at?: string }; Update: { id?: string; vendor_id?: string; business_id?: string | null; category_id?: string | null; name_bn?: string; name_en?: string; slug?: string; description_bn?: string | null; description_en?: string | null; sku?: string | null; price?: number; compare_at_price?: number | null; currency?: string; status?: ProductStatus; is_active?: boolean; is_featured?: boolean; allow_guest_purchase?: boolean; created_at?: string; updated_at?: string }; Relationships: [] }
      product_images: { Row: { id: string; product_id: string; storage_bucket: string; storage_path: string; alt_text_bn: string | null; alt_text_en: string | null; sort_order: number; is_primary: boolean; created_at: string }; Insert: { id?: string; product_id: string; storage_bucket: string; storage_path: string; alt_text_bn?: string | null; alt_text_en?: string | null; sort_order?: number; is_primary?: boolean; created_at?: string }; Update: { id?: string; product_id?: string; storage_bucket?: string; storage_path?: string; alt_text_bn?: string | null; alt_text_en?: string | null; sort_order?: number; is_primary?: boolean; created_at?: string }; Relationships: [] }
      inventory: { Row: { id: string; product_id: string; quantity: number; reserved_quantity: number; low_stock_threshold: number; updated_at: string }; Insert: { id?: string; product_id: string; quantity?: number; reserved_quantity?: number; low_stock_threshold?: number; updated_at?: string }; Update: { id?: string; product_id?: string; quantity?: number; reserved_quantity?: number; low_stock_threshold?: number; updated_at?: string }; Relationships: [] }
      orders: { Row: { id: string; order_number: string; customer_id: string | null; guest_name: string | null; guest_phone: string | null; guest_email: string | null; status: OrderStatus; payment_status: PaymentStatus; payment_method: 'cash_on_delivery' | 'online' | 'manual'; currency: string; subtotal: number; delivery_fee: number; discount_amount: number; total_amount: number; shipping_name: string; shipping_phone: string; shipping_address: string; shipping_area: string | null; shipping_upazila: string | null; shipping_district: string | null; customer_note: string | null; created_at: string; updated_at: string }; Insert: { id?: string; order_number?: string; customer_id?: string | null; guest_name?: string | null; guest_phone?: string | null; guest_email?: string | null; status?: OrderStatus; payment_status?: PaymentStatus; payment_method?: 'cash_on_delivery' | 'online' | 'manual'; currency?: string; subtotal?: number; delivery_fee?: number; discount_amount?: number; total_amount?: number; shipping_name: string; shipping_phone: string; shipping_address: string; shipping_area?: string | null; shipping_upazila?: string | null; shipping_district?: string | null; customer_note?: string | null; created_at?: string; updated_at?: string }; Update: Partial<Database['public']['Tables']['orders']['Insert']> }
      order_items: { Row: { id: string; order_id: string; product_id: string | null; vendor_id: string | null; product_name: string; product_sku: string | null; quantity: number; unit_price: number; discount_amount: number; line_total: number; created_at: string }; Insert: { id?: string; order_id: string; product_id?: string | null; vendor_id?: string | null; product_name: string; product_sku?: string | null; quantity: number; unit_price: number; discount_amount?: number; line_total: number; created_at?: string }; Update: Partial<Database['public']['Tables']['order_items']['Insert']> }
      commerce_delivery_rules: { Row: { id: string; district: string | null; upazila: string | null; fee: number; free_shipping_minimum: number | null; is_active: boolean; sort_order: number; created_at: string; updated_at: string }; Insert: { id?: string; district?: string | null; upazila?: string | null; fee?: number; free_shipping_minimum?: number | null; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string }; Update: Partial<Database['public']['Tables']['commerce_delivery_rules']['Insert']> }
      commerce_order_vendor_status: { Row: { id: string; order_id: string; vendor_id: string; status: string; inventory_finalized: boolean; created_at: string; updated_at: string }; Insert: { id?: string; order_id: string; vendor_id: string; status?: string; inventory_finalized?: boolean; created_at?: string; updated_at?: string }; Update: Partial<Database['public']['Tables']['commerce_order_vendor_status']['Insert']> }
      product_reviews: { Row: { id: string; product_id: string; order_id: string; customer_id: string; rating: number; title: string | null; body: string | null; status: 'pending' | 'published' | 'rejected'; seller_response: string | null; seller_responded_at: string | null; created_at: string; updated_at: string }; Insert: { id?: string; product_id: string; order_id: string; customer_id: string; rating: number; title?: string | null; body?: string | null; status?: 'pending' | 'published' | 'rejected'; seller_response?: string | null; seller_responded_at?: string | null; created_at?: string; updated_at?: string }; Update: Partial<Database['public']['Tables']['product_reviews']['Insert']> }
      commerce_return_requests: { Row: { id: string; order_id: string; order_item_id: string; customer_id: string; reason: string; details: string | null; status: 'requested' | 'approved' | 'rejected' | 'received' | 'refunded' | 'cancelled'; resolution_note: string | null; refund_amount: number | null; created_at: string; updated_at: string }; Insert: { id?: string; order_id: string; order_item_id: string; customer_id: string; reason: string; details?: string | null; status?: 'requested' | 'approved' | 'rejected' | 'received' | 'refunded' | 'cancelled'; resolution_note?: string | null; refund_amount?: number | null; created_at?: string; updated_at?: string }; Update: Partial<Database['public']['Tables']['commerce_return_requests']['Insert']> }
    }
    Views: {
      commerce_public_products: { Row: { id: string; vendor_id: string; category_id: string | null; name_bn: string; name_en: string; slug: string; description_bn: string | null; description_en: string | null; sku: string | null; price: number; compare_at_price: number | null; currency: string; allow_guest_purchase: boolean; is_featured: boolean; created_at: string; vendor_display_name: string; vendor_display_name_bn: string | null; vendor_display_name_en: string | null; vendor_is_verified: boolean; shop_slug: string | null; image_id: string | null; image_bucket: string | null; image_path: string | null; image_alt_bn: string | null; image_alt_en: string | null } }
    }
    Functions: {
      create_commerce_order: { Args: { p_items: Json; p_customer_id?: string | null; p_guest_name?: string | null; p_guest_phone?: string | null; p_guest_email?: string | null; p_shipping_name?: string | null; p_shipping_phone?: string | null; p_shipping_address?: string | null; p_shipping_area?: string | null; p_shipping_upazila?: string | null; p_shipping_district?: string | null; p_customer_note?: string | null }; Returns: { order_id: string; order_number: string; total_amount: number }[] }
      generate_commerce_order_number: { Args: Record<string, never>; Returns: string }
      set_vendor_product_inventory: { Args: { p_product_id: string; p_quantity: number; p_low_stock_threshold?: number }; Returns: boolean }
      publish_vendor_product: { Args: { p_product_id: string }; Returns: boolean }
      archive_vendor_product: { Args: { p_product_id: string }; Returns: boolean }
      update_vendor_profile: { Args: { p_display_name: string; p_display_name_bn?: string | null; p_display_name_en?: string | null; p_description_bn?: string | null; p_description_en?: string | null; p_phone?: string | null; p_shop_slug?: string | null }; Returns: boolean }
      update_vendor_product: { Args: { p_product_id: string; p_name_bn: string; p_name_en: string; p_slug: string; p_description_bn?: string | null; p_description_en?: string | null; p_sku?: string | null; p_price?: number; p_compare_at_price?: number | null; p_category_id?: string | null; p_allow_guest_purchase?: boolean }; Returns: boolean }
      set_product_primary_image: { Args: { p_image_id: string }; Returns: boolean }
      get_public_vendor_shop: { Args: { p_slug: string }; Returns: { id: string; shop_slug: string; display_name: string; display_name_bn: string | null; display_name_en: string | null; description_bn: string | null; description_en: string | null; is_verified: boolean; business_id: string | null }[] }
      calculate_commerce_delivery_fee: { Args: { p_district: string | null; p_upazila: string | null; p_subtotal: number }; Returns: number }
      set_vendor_order_status: { Args: { p_order_id: string; p_status: string }; Returns: boolean }
      create_product_review: { Args: { p_product_id: string; p_rating: number; p_title?: string | null; p_body?: string | null }; Returns: string }
      seller_reply_to_product_review: { Args: { p_review_id: string; p_response: string }; Returns: boolean }
      create_commerce_return_request: { Args: { p_order_item_id: string; p_reason: string; p_details?: string | null }; Returns: string }
      set_commerce_return_status: { Args: { p_request_id: string; p_status: string; p_resolution_note?: string | null; p_refund_amount?: number | null }; Returns: boolean }
      is_fenix_admin: { Args: Record<string, never>; Returns: boolean }
      admin_set_vendor_status: { Args: { p_vendor_id: string; p_status: string; p_is_verified?: boolean }; Returns: boolean }
      admin_upsert_delivery_rule: { Args: { p_rule_id?: string | null; p_district?: string | null; p_upazila?: string | null; p_fee?: number; p_free_shipping_minimum?: number | null; p_is_active?: boolean; p_sort_order?: number }; Returns: string }
      admin_delete_delivery_rule: { Args: { p_rule_id: string }; Returns: boolean }
      admin_set_review_status: { Args: { p_review_id: string; p_status: string }; Returns: boolean }
      admin_set_order_payment_status: { Args: { p_order_id: string; p_payment_status: string }; Returns: boolean }
      match_businesses: { Args: { query_embedding: number[]; match_threshold: number; match_count: number }; Returns: { id: string; name: string; description: string | null; similarity: number }[] }
      save_business_embedding: { Args: { p_business_id: string; p_embedding: number[] }; Returns: boolean }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']
export type ProductCategory = Database['public']['Tables']['product_categories']['Row']
export type ProductCategoryInsert = Database['public']['Tables']['product_categories']['Insert']
export type ProductCategoryUpdate = Database['public']['Tables']['product_categories']['Update']
export type VendorProfile = Database['public']['Tables']['vendor_profiles']['Row']
export type VendorProfileInsert = Database['public']['Tables']['vendor_profiles']['Insert']
export type VendorProfileUpdate = Database['public']['Tables']['vendor_profiles']['Update']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type ProductImageInsert = Database['public']['Tables']['product_images']['Insert']
export type ProductImageUpdate = Database['public']['Tables']['product_images']['Update']
export type Inventory = Database['public']['Tables']['inventory']['Row']
export type InventoryInsert = Database['public']['Tables']['inventory']['Insert']
export type InventoryUpdate = Database['public']['Tables']['inventory']['Update']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update']
export type ProductReview = Database['public']['Tables']['product_reviews']['Row']
export type ProductReviewInsert = Database['public']['Tables']['product_reviews']['Insert']
export type ProductReviewUpdate = Database['public']['Tables']['product_reviews']['Update']
export type CommerceReturnRequest = Database['public']['Tables']['commerce_return_requests']['Row']
export type CommerceReturnRequestInsert = Database['public']['Tables']['commerce_return_requests']['Insert']
export type CommerceReturnRequestUpdate = Database['public']['Tables']['commerce_return_requests']['Update']
