import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  Profile,
  ProfileInsert,
  ProfileUpdate,
} from '@/types/database'

type FenixSupabaseClient = SupabaseClient<Database>

/**
 * Fields safe for public profile display.
 *
 * Never expose through the public profile helper:
 * - role
 * - phone
 *
 * Role is authorization-related.
 * Phone is private contact information.
 */
export type PublicProfile = Pick<
  Profile,
  | 'id'
  | 'full_name'
  | 'created_at'
  | 'updated_at'
>

const PUBLIC_PROFILE_COLUMNS =
  'id, full_name, created_at, updated_at'

const PRIVATE_PROFILE_COLUMNS =
  'id, full_name, role, phone, created_at, updated_at'

/**
 * Get a publicly visible profile.
 *
 * This helper intentionally excludes role and phone.
 * Database RLS remains the final authorization boundary.
 */
export async function getPublicProfileById(
  supabase: FenixSupabaseClient,
  userId: string,
): Promise<{
  data: PublicProfile | null
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
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return {
      data: null,
      error,
    }
  }

  return {
    data: data as PublicProfile | null,
    error: null,
  }
}

/**
 * Get the authenticated user's own profile.
 *
 * This includes role and phone because those fields are private
 * account data. Database RLS must ensure the caller can only
 * access their own profile.
 */
export async function getOwnProfile(
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
    .select(PRIVATE_PROFILE_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return {
      data: null,
      error,
    }
  }

  return {
    data: data as Profile | null,
    error: null,
  }
}

/**
 * Create a profile.
 *
 * Database RLS enforces:
 * auth.uid() = id
 *
 * Normally profiles are created automatically by the
 * auth.users trigger. This helper remains available for
 * controlled future use.
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
    .select(PRIVATE_PROFILE_COLUMNS)
    .single()

  if (error) {
    return {
      data: null,
      error,
    }
  }

  return {
    data: data as Profile,
    error: null,
  }
}

/**
 * Update a profile.
 *
 * Database RLS must ensure users can update only
 * their own profile.
 *
 * Authorization-sensitive fields such as role should
 * NOT be changed through an ordinary profile update.
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

  const payload: ProfileUpdate = {
    ...input,
  }

  /**
   * Role changes belong to the future authorization/admin
   * layer, not ordinary profile editing.
   */
  delete payload.role

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select(PRIVATE_PROFILE_COLUMNS)
    .single()

  if (error) {
    return {
      data: null,
      error,
    }
  }

  return {
    data: data as Profile,
    error: null,
  }
}
