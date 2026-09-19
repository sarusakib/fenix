import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/database'

export type DirectoryBusiness =
  Database['public']['Functions']['search_directory_businesses']['Returns'][number]

export type DirectoryCategory =
  Database['public']['Functions']['list_directory_categories']['Returns'][number]

export type DirectoryUpazila =
  Database['public']['Functions']['list_directory_upazilas']['Returns'][number]

export type DirectoryDetail = Omit<DirectoryBusiness, 'district' | 'upazila' | 'area'> & {\n  district: string | null\n  upazila: string | null\n  area: string | null
  slug: string | null
  about_bn: string | null
  about_en: string | null
  business_type: string | null
}

type SearchArgs = {
  query?: string
  category?: string
  upazila?: string
  limit?: number
  offset?: number
}

export async function searchDirectoryBusinesses(
  args: SearchArgs = {},
): Promise<{ data: DirectoryBusiness[]; error: Error | null }> {
  const supabase = createClient()
  const query = args.query?.trim().slice(0, 120) || null
  const category = args.category?.trim().slice(0, 80) || null
  const upazila = args.upazila?.trim().slice(0, 80) || null

  const { data, error } = await supabase.rpc('search_directory_businesses', {
    p_query: query,
    p_category: category,
    p_upazila: upazila,
    p_limit: Math.min(Math.max(args.limit ?? 24, 1), 50),
    p_offset: Math.max(args.offset ?? 0, 0),
  })

  if (error) return { data: [], error }
  return { data: (data ?? []) as DirectoryBusiness[], error: null }
}

export async function getDirectoryCategories(): Promise<{
  data: DirectoryCategory[]
  error: Error | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('list_directory_categories')

  if (error) return { data: [], error }
  return { data: (data ?? []) as DirectoryCategory[], error: null }
}

export async function getDirectoryUpazilas(): Promise<{
  data: DirectoryUpazila[]
  error: Error | null
}> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('list_directory_upazilas')

  if (error) return { data: [], error }
  return { data: (data ?? []) as DirectoryUpazila[], error: null }
}

export async function getDirectoryBusiness(
  identifier: string,
): Promise<{ data: DirectoryDetail | null; error: Error | null }> {
  const supabase = createClient()
  const value = identifier.trim()

  if (!value) return { data: null, error: new Error('Business is required.') }

  let businessId = value

  const slugResult = await supabase
    .from('business_directory_profiles')
    .select('business_id, slug')
    .eq('slug', value)
    .maybeSingle()

  if (slugResult.error) return { data: null, error: slugResult.error }
  if (slugResult.data?.business_id) businessId = slugResult.data.business_id

  const [businessResult, profileResult, locationResult, contactResult, productsResult, investmentResult] =
    await Promise.all([
      supabase
        .from('businesses')
        .select('id, name, title_bn, title_en, description, category, created_at, updated_at')
        .eq('id', businessId)
        .maybeSingle(),
      supabase
        .from('business_directory_profiles')
        .select(
          'business_id, slug, tagline_bn, tagline_en, about_bn, about_en, business_type, listing_status, verification_level, owner_claimed, phone_verified, location_verified',
        )
        .eq('business_id', businessId)
        .maybeSingle(),
      supabase
        .from('business_directory_locations')
        .select('district, upazila, area, market, address, postal_code, latitude, longitude, map_label, is_public')
        .eq('business_id', businessId)
        .maybeSingle(),
      supabase
        .from('business_directory_contacts')
        .select('phone, whatsapp, website_url, facebook_url')
        .eq('business_id', businessId)
        .maybeSingle(),
      supabase
        .from('products')
        .select('id, name_bn, name_en, price, currency, slug')
        .eq('business_id', businessId)
        .eq('status', 'published')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(8),
      supabase
        .from('investment_opportunities')
        .select('id, title_bn, title_en, category')
        .eq('business_id', businessId)
        .eq('status', 'published')
        .eq('verification_status', 'verified')
        .order('updated_at', { ascending: false })
        .limit(6),
    ])

  if (businessResult.error) return { data: null, error: businessResult.error }
  if (!businessResult.data) return { data: null, error: null }

  if (profileResult.error && profileResult.error.code !== 'PGRST116') {
    return { data: null, error: profileResult.error }
  }
  if (locationResult.error && locationResult.error.code !== 'PGRST116') {
    return { data: null, error: locationResult.error }
  }
  if (contactResult.error && contactResult.error.code !== 'PGRST116') {
    return { data: null, error: contactResult.error }
  }
  if (productsResult.error) return { data: null, error: productsResult.error }
  if (investmentResult.error) return { data: null, error: investmentResult.error }

  if (
    profileResult.data &&
    profileResult.data.listing_status !== 'published'
  ) {
    return { data: null, error: null }
  }

  const profile = profileResult.data
  const location =
    locationResult.data?.is_public === false ? null : locationResult.data
  const contact = contactResult.data ?? null

  return {
    data: {
      id: businessResult.data.id,
      name: businessResult.data.name,
      title_bn: businessResult.data.title_bn,
      title_en: businessResult.data.title_en,
      description: businessResult.data.description,
      category: businessResult.data.category,
      created_at: businessResult.data.created_at,
      updated_at: businessResult.data.updated_at,
      tagline_bn: profile?.tagline_bn ?? null,
      tagline_en: profile?.tagline_en ?? null,
      listing_status: profile?.listing_status ?? 'published',
      verification_level: profile?.verification_level ?? 'unverified',
      owner_claimed: profile?.owner_claimed ?? false,
      phone_verified: profile?.phone_verified ?? false,
      location_verified: profile?.location_verified ?? false,
      district: location?.district ?? 'Feni',
      upazila: location?.upazila ?? null,
      area: location?.area ?? null,
      market: location?.market ?? null,
      address: location?.address ?? null,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      map_label: location?.map_label ?? null,
      phone: contact?.phone ?? null,
      whatsapp: contact?.whatsapp ?? null,
      website_url: contact?.website_url ?? null,
      facebook_url: contact?.facebook_url ?? null,
      product_count: productsResult.data?.length ?? 0,
      has_investment: (investmentResult.data?.length ?? 0) > 0,
      slug: profile?.slug ?? null,
      about_bn: profile?.about_bn ?? null,
      about_en: profile?.about_en ?? null,
      business_type: profile?.business_type ?? null,
    } as DirectoryDetail,
    error: null,
  }
}

export function getBusinessDisplayName(
  business: Pick<DirectoryBusiness, 'name' | 'title_bn' | 'title_en'>,
): string {
  return business.title_bn?.trim() || business.title_en?.trim() || business.name
}

export function getBusinessSecondaryName(
  business: Pick<DirectoryBusiness, 'name' | 'title_bn' | 'title_en'>,
): string | null {
  const primary = getBusinessDisplayName(business)
  const alternatives = [business.title_en, business.name, business.title_bn]
    .map((value) => value?.trim())
    .filter(Boolean) as string[]

  return alternatives.find((value) => value !== primary) ?? null
}

export function getDirectionsUrl(business: Pick<DirectoryBusiness, 'latitude' | 'longitude' | 'address' | 'map_label'>): string | null {
  if (business.latitude != null && business.longitude != null) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(
      business.latitude + ',' + business.longitude,
    )
  }

  const destination = business.address || business.map_label
  return destination
    ? 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(destination)
    : null
}

export function getBusinessPath(
  business: Pick<DirectoryBusiness, 'id'> & { slug?: string | null },
): string {
  return '/directory/' + encodeURIComponent(business.slug?.trim() || business.id)
}
