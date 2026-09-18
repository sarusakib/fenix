'use server'

import { generateEmbedding } from './generateEmbedding'
import { createClient } from '../../utils/supabase/server'
import {
  buildKeywordQuery,
  normalizeFeniBrainQuery,
} from '../../lib/feniBrainQuery'

const MAX_QUERY_LENGTH = 120
const MAX_RESULTS = 8

export async function searchFeniBrain(query) {
  if (typeof query !== 'string') {
    return { success: false, error: 'Invalid search query.' }
  }

  const parsed = normalizeFeniBrainQuery(query)
  const cleanQuery = parsed.original.trim().slice(0, MAX_QUERY_LENGTH)
  const normalizedQuery = parsed.normalized

  if (cleanQuery.length < 2 || normalizedQuery.length < 2) {
    return { success: false, error: 'কমপক্ষে ২টি অক্ষর লিখুন।' }
  }

  try {
    const supabase = await createClient()

    const [{ data: terms, error: termsError }, { data: locations, error: locationError }] =
      await Promise.all([
        supabase
          .from('fenix_brain_query_terms')
          .select('intent_key, term, weight')
          .limit(2000),
        supabase.rpc('search_feni_brain_locations', {
          query_text: normalizedQuery,
          match_count: 10,
        }),
      ])

    if (termsError) {
      console.error('Feni Brain intent terms retrieval failed:', {
        code: termsError.code,
      })
    }

    if (locationError) {
      console.error('Feni Brain location retrieval failed:', {
        code: locationError.code,
      })
    }

    const lower = normalizedQuery.toLowerCase()
    const intentScores = new Map()

    for (const item of terms ?? []) {
      const term = String(item.term ?? '').toLowerCase().trim()
      if (!term || !lower.includes(term)) continue

      const current = intentScores.get(item.intent_key) ?? 0
      const phraseBonus = Math.min(term.length / 40, 1)
      intentScores.set(
        item.intent_key,
        current + Number(item.weight ?? 1) + phraseBonus,
      )
    }

    const intent =
      [...intentScores.entries()]
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'general_feni'

    const keywordQuery = buildKeywordQuery(normalizedQuery)

    const keywordResult = await supabase.rpc(
      'keyword_feni_brain_chunks',
      {
        query_text: keywordQuery || normalizedQuery,
        match_count: MAX_RESULTS,
      },
    )

    if (keywordResult.error) {
      console.error('Feni Brain keyword retrieval failed:', {
        code: keywordResult.error.code,
      })
    }

    let semantic = []

    try {
      const embedding = await generateEmbedding(normalizedQuery)

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
      } else if (semanticResult.error) {
        console.error('Feni Brain semantic retrieval failed:', {
          code: semanticResult.error.code,
        })
      }
    } catch (error) {
      console.error('Feni Brain embedding unavailable:', {
        name: error?.name,
      })
    }

    const keyword = Array.isArray(keywordResult.data)
      ? keywordResult.data
      : []

    const semanticMap = new Map(
      semantic.map((row) => [
        row.id,
        {
          ...row,
          semanticSimilarity: Number(row.similarity ?? 0),
        },
      ]),
    )

    const keywordMap = new Map(
      keyword.map((row) => [
        row.id,
        {
          ...row,
          keywordSimilarity: Number(row.similarity ?? 0),
        },
      ]),
    )

    const merged = new Map()

    for (const row of [...semantic, ...keyword]) {
      const current = merged.get(row.id) ?? { ...row }
      const semanticSimilarity =
        semanticMap.get(row.id)?.semanticSimilarity ??
        Number(current.semanticSimilarity ?? 0)
      const keywordSimilarity =
        keywordMap.get(row.id)?.keywordSimilarity ??
        Number(current.keywordSimilarity ?? 0)

      const normalizedSemantic = Math.max(
        0,
        Math.min((semanticSimilarity - 0.35) / 0.65, 1),
      )

      const hybridScore =
        semanticSimilarity > 0
          ? 0.65 * normalizedSemantic + 0.35 * keywordSimilarity
          : 0.35 * keywordSimilarity

      merged.set(row.id, {
        ...current,
        semanticSimilarity,
        keywordSimilarity,
        similarity: hybridScore,
        retrieval_method:
          semanticSimilarity > 0 && keywordSimilarity > 0
            ? 'hybrid'
            : semanticSimilarity > 0
              ? 'semantic'
              : 'keyword',
      })
    }

    const ranked = [...merged.values()]
      .sort((a, b) => {
        const scoreDiff =
          Number(b.similarity ?? 0) - Number(a.similarity ?? 0)

        if (scoreDiff !== 0) return scoreDiff

        return (
          Number(a.trust_tier ?? 99) -
          Number(b.trust_tier ?? 99)
        )
      })
      .slice(0, MAX_RESULTS)

    return {
      success: true,
      query: cleanQuery,
      normalizedQuery,
      keywordQuery,
      intent,
      locations: Array.isArray(locations) ? locations : [],
      results: ranked,
      sources: ranked.map((row) => ({
        source_title: row.source_title,
        source_url: row.source_url,
        trust_tier: row.trust_tier,
        document_title: row.document_title,
      })),
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
