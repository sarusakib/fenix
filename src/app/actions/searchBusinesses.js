'use server'

import { generateEmbedding } from './generateEmbedding'
import { createClient } from '../../utils/supabase/server'

const MAX_QUERY_LENGTH = 120
const MAX_RESULTS = 10

export async function searchBusinesses(query) {
  try {
    if (typeof query !== 'string') {
      return {
        success: false,
        error: 'Invalid search query.',
      }
    }

    const cleanQuery = query.trim().slice(0, MAX_QUERY_LENGTH)

    if (!cleanQuery) {
      return {
        success: false,
        error: 'Search query প্রয়োজন।',
      }
    }

    if (cleanQuery.length < 2) {
      return {
        success: false,
        error: 'কমপক্ষে ২টি অক্ষর লিখুন।',
      }
    }

    const embedding = await generateEmbedding(cleanQuery)

    if (!Array.isArray(embedding) || embedding.length !== 384) {
      return {
        success: false,
        error: 'Search service বর্তমানে unavailable.',
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.rpc('match_businesses', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: MAX_RESULTS,
    })

    if (error) {
      console.error('Feni Brain database search failed:', {
        code: error.code,
      })

      return {
        success: false,
        error: 'Business search করা যায়নি।',
      }
    }

    return {
      success: true,
      results: Array.isArray(data) ? data.slice(0, MAX_RESULTS) : [],
    }
  } catch (error) {
    console.error('Feni Brain search failed:', {
      name: error?.name,
    })

    return {
      success: false,
      error: 'Business search বর্তমানে unavailable.',
    }
  }
}
