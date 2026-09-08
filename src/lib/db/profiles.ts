import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  Profile,
  ProfileInsert,
  ProfileUpdate,
} from '@/types/database'

type FenixSupabaseClient = SupabaseClient<Database>

/**
 * Get a public profile by user ID.
 *
 * Current RLS allows public SELECT.
 */
export async function getProfileById(
  supabase: FenixSupabaseClient,
  userId: string,
): Promise<{
  data: Profile | null
  error: Error | null
}> {
  const id = userId.trim()

  if (!id) {
    return {
      data: null,
      error: new Error('User ID is required.'),
    }
  }

  const { data, error } = await supabase
    .from('profiles')
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
 * Create a profile.
 *
 * Database RLS enforces:
 * auth.uid() = id
 */
export async function createProfile(
  supabase: FenixSupabaseClient,
  input: ProfileInsert,
): Promise<{
  data: Profile | null
  error: Error | null
}> {
  const id = input.id.trim()

  if (!id) {
    return {
      data: null,
      error: new Error('Profile ID is required.'),
    }
  }

  const payload: ProfileInsert = {
    ...input,
    id,
  }

  const { data, error } = await supabase
    .from('profiles')
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
 * Update a profile.
 *
 * Database RLS ensures users can update only
 * their own profile.
 */
export async function updateProfile(
  supabase: FenixSupabaseClient,
  userId: string,
  input: ProfileUpdate,
): Promise<{
  data: Profile | null
  error: Error | null
}> {
  const id = userId.trim()

  if (!id) {
    return {
      data: null,
      error: new Error('User ID is required.'),
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(input)
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
