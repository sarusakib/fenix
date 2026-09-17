'use server'

import { generateEmbedding } from './generateEmbedding'
import { createClient } from '../../utils/supabase/server'

const MAX_QUERY_LENGTH = 120
const MAX_RESULTS = 8

function normalize(value) {
  return value
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_QUERY_LENGTH)
}

export async function searchFeniBrain(query) {
  if (typeof query !== 'string') {
    return { success: false, error: 'Invalid search query.' }
  }

  const cleanQuery = normalize(query)

  if (cleanQuery.length < 2) {
    return { success: false, error: 'কমপক্ষে ২টি অক্ষর লিখুন।' }
  }

  try {
    const supabase = await createClient()

    const [{ data: terms }, { data: locations }] = await Promise.all([
      supabase
        .from('fenix_brain_query_terms')
        .select('intent_key, term, weight')
        .limit(2000),
      supabase.rpc('search_feni_brain_locations', {
        query_text: cleanQuery,
        match_count: 10,
      }),
    ])

    const lower = cleanQuery.toLowerCase()
    const intentScores = new Map()

    for (const item of terms ?? []) {
      const term = String(item.term ?? '').toLowerCase().trim()
      if (!term || !lower.includes(term)) continue

      const current = intentScores.get(item.intent_key) ?? 0
      intentScores.set(
        item.intent_key,
        current + Number(item.weight ?? 1),
      )
    }

    const intent =
      [...intentScores.entries()]
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'general_feni'

    const keywordResult = await supabase.rpc(
      'keyword_feni_brain_chunks',
      {
        query_text: cleanQuery,
        match_count: MAX_RESULTS,
      },
    )

    if (keywordResult.error) {
      console.error('Feni Brain keyword retrieval failed:', {
        code: keywordResult.error.code,
      })
    }

    let semantic: BrainResult[] = []

    try {
      const embedding = await generateEmbedding(cleanQuery)

      const semanticResult = await supabase.rpc(
        'match_feni_brain_chunks',
        {
          query_embedding: embedding,
          match_threshold: 0.35,
          match_count: MAX_RESULTS,
        },
      )

      if (!semanticResult.error && Array.isArray(semanticResult.data)) {
        semantic = semanticResult.data
      }
    } catch {
      // Keyword retrieval remains usable when the embedding provider is unavailable.
    }

    const keyword: BrainResult[] = Array.isArray(keywordResult.data)
      ? keywordResult.data
      : []

    const merged = new Map()

    for (const row of [...semantic, ...keyword]) {
      const existing = merged.get(row.id)

      if (!existing || Number(row.similarity ?? 0) > Number(existing.similarity ?? 0)) {
        merged.set(row.id, row)
      }
    }

    return {
      success: true,
      query: cleanQuery,
      intent,
      locations: Array.isArray(locations) ? locations : [],
      results: [...merged.values()].slice(0, MAX_RESULTS),
      sources: [...merged.values()]
        .slice(0, MAX_RESULTS)
        .map((row) => ({
          source_title: row.source_title,
          source_url: row.source_url,
          trust_tier: row.trust_tier,
          document_title: row.document_title,
        })) as BrainSource[],
    }
  } catch (error) {
    console.error('Feni Brain search failed:', {
      name: error?.name,
    })

    return {
      success: false,
      error: 'Feni Brain বর্তমানে unavailable.',
    }
  }
}
