import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Business,
  BusinessInsert,
  BusinessUpdate,
  Database,
} from '@/types/database'

type FenixSupabaseClient = SupabaseClient<Database>

/**
 * Get publicly visible businesses.
 *
 * RLS currently allows public SELECT.
 */
export async function getPublicBusinesses(
  supabase: FenixSupabaseClient,
): Promise<{
  data: Business[] | null
  error: Error | null
}> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('updated_at', {
      ascending: false,
    })

  if (error) {
    return {
      data: null,
      error,
    }
  }

  return {
    data: data ?? [],
    error: null,
  }
}

/**
 * Get a single public business by ID.
 */
export async function getBusinessById(
  supabase: FenixSupabaseClient,
  businessId: string,
): Promise<{
  data: Business | null
  error: Error | null
}> {
  const id = businessId.trim()

  if (!id) {
    return {
      data: null,
      error: new Error('Business ID is required.'),
    }
  }

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return {
      data: null,
      error,
    }
  }

  return {
    data,
    error: null,
  }
}

/**
 * Create a business.
 *
 * Database RLS enforces:
 * auth.uid() = owner_id
 */
export async function createBusiness(
  supabase: FenixSupabaseClient,
  input: BusinessInsert,
): Promise<{
  data: Business | null
  error: Error | null
}> {
  const name = input.name.trim()

  if (!name) {
    return {
      data: null,
      error: new Error('Business name is required.'),
    }
  }

  const payload: BusinessInsert = {
    ...input,
    name,
  }

  const { data, error } = await supabase
    .from('businesses')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    return {
      data: null,
      error,
    }
  }

  return {
    data,
    error: null,
  }
}

/**
 * Update an existing business.
 *
 * Database RLS ensures only the owner can update it.
 */
export async function updateBusiness(
  supabase: FenixSupabaseClient,
  businessId: string,
  input: BusinessUpdate,
): Promise<{
  data: Business | null
  error: Error | null
}> {
  const id = businessId.trim()

  if (!id) {
    return {
      data: null,
      error: new Error('Business ID is required.'),
    }
  }

  const payload: BusinessUpdate = {
    ...input,
  }

  if (typeof payload.name === 'string') {
    const trimmedName = payload.name.trim()

    if (!trimmedName) {
      return {
        data: null,
        error: new Error(
          'Business name cannot be empty.',
        ),
      }
    }

    payload.name = trimmedName
  }

  const { data, error } = await supabase
    .from('businesses')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    return {
      data: null,
      error,
    }
  }

  return {
    data,
    error: null,
  }
}

/**
 * Delete a business.
 *
 * Database RLS ensures only the owner can delete it.
 */
export async function deleteBusiness(
  supabase: FenixSupabaseClient,
  businessId: string,
): Promise<{
  success: boolean
  error: Error | null
}> {
  const id = businessId.trim()

  if (!id) {
    return {
      success: false,
      error: new Error('Business ID is required.'),
    }
  }

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id)

  if (error) {
    return {
      success: false,
      error,
    }
  }

  return {
    success: true,
    error: null,
  }
}
