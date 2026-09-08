import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  Profile,
  ProfileInsert,
  ProfileUpdate,
} from '@/types/database'

type FenixSupabaseClient = SupabaseClient<Database>

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

export async function createProfile(
  supabase: FenixSupabaseClient,
  input: ProfileInsert,
): Promise<{
  data: Profile | null
  error: Error | null
}> {
  if (!input.id.trim()) {
    return {
      data: null,
      error: new Error('Profile ID is required.'),
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(input)
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
