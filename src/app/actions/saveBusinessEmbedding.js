'use server'

import { generateEmbedding } from './generateEmbedding'
import { createClient } from '../../utils/supabase/server'

const MAX_TEXT_LENGTH = 1200

export async function saveBusinessEmbedding(businessId, text) {
  try {
    if (typeof businessId !== 'string' || !businessId.trim()) {
      return {
        success: false,
        error: 'Business ID প্রয়োজন।',
      }
    }

    if (typeof text !== 'string') {
      return {
        success: false,
        error: 'Business text প্রয়োজন।',
      }
    }

    const cleanText = text.trim().slice(0, MAX_TEXT_LENGTH)

    if (!cleanText) {
      return {
        success: false,
        error: 'Business text প্রয়োজন।',
      }
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: 'User authenticated নয়।',
      }
    }

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, owner_id')
      .eq('id', businessId.trim())
      .single()

    if (businessError || !business) {
      return {
        success: false,
        error: 'Business পাওয়া যায়নি।',
      }
    }

    if (business.owner_id !== user.id) {
      return {
        success: false,
        error: 'এই business update করার অনুমতি নেই।',
      }
    }

    const embedding = await generateEmbedding(cleanText)

    if (!Array.isArray(embedding) || embedding.length !== 384) {
      return {
        success: false,
        error: 'Valid embedding তৈরি করা যায়নি।',
      }
    }

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        feni_brain_embedding: embedding,
      })
      .eq('id', business.id)

    if (updateError) {
      console.error('Embedding update failed:', {
        code: updateError.code,
      })

      return {
        success: false,
        error: 'Embedding database-এ save করা যায়নি।',
      }
    }

    return {
      success: true,
      message: 'Feni Brain embedding successfully saved.',
    }
  } catch (error) {
    console.error('saveBusinessEmbedding failed:', {
      name: error?.name,
    })

    return {
      success: false,
      error: 'Embedding save করা যায়নি।',
    }
  }
}
