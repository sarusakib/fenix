'use server'

import { generateEmbedding } from './generateEmbedding'
import { createClient } from '../../utils/supabase/server'
import { buildKeywordQuery, normalizeFeniBrainQuery, classifyFeniBrainQuestion, detectRequestedFactSubject } from '../../lib/feniBrainQuery'

const MAX_QUERY_LENGTH = 120
const MAX_RESULTS = 8
const MAX_CHILD_LOCATIONS = 12

function requestedChildLevel(normalizedQuery) {
  const query = normalizedQuery.toLowerCase()
  if (query.includes('উপজেলা')) return 'upazila'
  if (query.includes('ইউনিয়ন')) return 'union'
  if (query.includes('ওয়ার্ড')) return 'ward'
  if (query.includes('পৌরসভা')) return 'municipality'
  if (query.includes('গ্রাম')) return 'village'
  if (query.includes('মৌজা')) return 'mouza'
  if (query.includes('বাজার') || query.includes('হাট')) return 'market'
  if (query.includes('এলাকা')) return 'area'
  return null
}

function wantsNamedList(normalizedQuery) {
  const query = normalizedQuery.toLowerCase()
  return (
    query.includes('কোন কোন') ||
    query.includes('কি কি') ||
    query.includes('গুলো') ||
    query.includes('গুলি') ||
    query.includes('list') ||
    query.includes('which') ||
    query.includes('what are')
  )
}

function mergeRows(groups) {
  const merged = new Map()

  for (const group of groups) {
    for (const row of Array.isArray(group) ? group : []) {
      if (!row?.id) continue

      const current = merged.get(row.id)
      const semanticSimilarity = Math.max(
        Number(current?.semanticSimilarity ?? 0),
        Number(row.semanticSimilarity ?? 0),
      )
      const keywordSimilarity = Math.max(
        Number(current?.keywordSimilarity ?? 0),
        Number(row.keywordSimilarity ?? 0),
      )
      const isFact =
        row.retrieval_method === 'fact' ||
        current?.retrieval_method === 'fact'

      const semanticScore = semanticSimilarity > 0
        ? Math.max(0, Math.min((semanticSimilarity - 0.35) / 0.65, 1))
        : 0

      const retrievalScore = semanticSimilarity > 0
        ? 0.60 * semanticScore + 0.25 * keywordSimilarity
        : 0.25 * keywordSimilarity

      const score = Math.min(
        0.995,
        retrievalScore + (isFact ? 0.24 : 0),
      )

      merged.set(row.id, {
        ...(current ?? {}),
        ...row,
        semanticSimilarity,
        keywordSimilarity,
        similarity: Math.max(
          Number(current?.similarity ?? 0),
          score,
        ),
        retrieval_method: isFact
          ? 'fact'
          : semanticSimilarity > 0 && keywordSimilarity > 0
            ? 'hybrid'
            : semanticSimilarity > 0
              ? 'semantic'
              : 'keyword',
      })
    }
  }

  return [...merged.values()]
}

export async function searchFeniBrain(query) {
  if (typeof query !== 'string') {
    return { success: false, error: 'Invalid search query.' }
  }

  const parsed = normalizeFeniBrainQuery(query)
  const cleanQuery = parsed.original.trim().slice(0, MAX_QUERY_LENGTH)
  const questionClass = classifyFeniBrainQuestion(cleanQuery)
  const requestedFactSubject = detectRequestedFactSubject(cleanQuery)
  const normalizedQuery = parsed.normalized

  if (cleanQuery.length < 2 || normalizedQuery.length < 2) {
    return { success: false, error: 'কমপক্ষে ২টি অক্ষর লিখুন।' }
  }

  try {
    const supabase = await createClient()

    const [
      { data: terms, error: termsError },
      { data: locations, error: locationError },
    ] = await Promise.all([
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
      console.error('Feni Brain intent terms retrieval failed:', { code: termsError.code })
    }
    if (locationError) {
      console.error('Feni Brain location retrieval failed:', { code: locationError.code })
    }

    const lower = normalizedQuery.toLowerCase()
    const originalLower = cleanQuery.toLowerCase()
    const intentScores = new Map()

    for (const item of terms ?? []) {
      const term = String(item.term ?? '').toLowerCase().trim()
      if (!term) continue

      if (lower.includes(term) || originalLower.includes(term)) {
        const current = intentScores.get(item.intent_key) ?? 0
        intentScores.set(
          item.intent_key,
          current + Number(item.weight ?? 1) + Math.min(term.length / 30, 1),
        )
      }
    }

    const intent = [...intentScores.entries()]
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'general_feni'

    const keywordQuery = buildKeywordQuery(normalizedQuery)

    const [
      keywordNormalized,
      keywordOriginal,
      factResult,
    ] = await Promise.all([
      supabase.rpc('keyword_feni_brain_chunks', {
        query_text: keywordQuery || normalizedQuery,
        match_count: MAX_RESULTS,
      }),
      supabase.rpc('keyword_feni_brain_chunks', {
        query_text: cleanQuery,
        match_count: MAX_RESULTS,
      }),
      supabase.rpc('search_feni_brain_facts', {
        query_text: normalizedQuery || cleanQuery,
        match_count: 6,
      }),
    ])

    if (keywordNormalized.error) {
      console.error('Feni Brain normalized keyword retrieval failed:', { code: keywordNormalized.error.code })
    }
    if (keywordOriginal.error) {
      console.error('Feni Brain original keyword retrieval failed:', { code: keywordOriginal.error.code })
    }
    if (factResult.error) {
      console.error('Feni Brain fact retrieval failed:', { code: factResult.error.code })
    }

    let semantic = []

    try {
      const embeddingInput = [cleanQuery, normalizedQuery]
        .filter(Boolean)
        .join('\n')
        .slice(0, 1200)

      const embedding = await generateEmbedding(embeddingInput)

      const semanticResult = await supabase.rpc('match_feni_brain_chunks', {
        query_embedding: embedding,
        match_threshold: 0.35,
        match_count: MAX_RESULTS,
      })

      if (!semanticResult.error && Array.isArray(semanticResult.data)) {
        semantic = semanticResult.data.map((row) => ({
          ...row,
          retrieval_method: 'semantic',
        }))
      }
    } catch (error) {
      console.error('Feni Brain embedding unavailable:', {
        name: error?.name,
      })
    }

    const keyword = [
      ...(Array.isArray(keywordNormalized.data) ? keywordNormalized.data : []),
      ...(Array.isArray(keywordOriginal.data) ? keywordOriginal.data : []),
    ].map((row) => ({
      ...row,
      retrieval_method: 'keyword',
    }))

    const facts = (
      Array.isArray(factResult.data) ? factResult.data : []
    ).map((row) => ({
      ...row,
      retrieval_method: 'fact',
      semanticSimilarity: 0,
      keywordSimilarity: Number(row.similarity ?? 0),
      similarity: Number(row.similarity ?? 0),
    }))

    const ranked = mergeRows([facts, semantic, keyword])
      .sort((a, b) => {
        const af = requestedFactSubject && a.retrieval_method === 'fact' && a.subject_key === requestedFactSubject ? 1 : 0
        const bf = requestedFactSubject && b.retrieval_method === 'fact' && b.subject_key === requestedFactSubject ? 1 : 0
        if (af !== bf) return bf - af
        const scoreDiff =
          Number(b.similarity ?? 0) -
          Number(a.similarity ?? 0)

        if (scoreDiff !== 0) return scoreDiff

        return (
          Number(a.trust_tier ?? 99) -
          Number(b.trust_tier ?? 99)
        )
      })
      .slice(0, MAX_RESULTS)

    let childLocations = []
    const childLevel = requestedChildLevel(normalizedQuery)

    if (
      childLevel &&
      wantsNamedList(normalizedQuery) &&
      Array.isArray(locations) &&
      locations.length > 0
    ) {
      const parent =
        locations.find((location) => location.level !== childLevel) ??
        locations[0]

      const { data: children, error: childError } = await supabase
        .from('fenix_brain_locations')
        .select('id, level, name_bn, name_en, slug, official_code')
        .eq('parent_id', parent.id)
        .eq('level', childLevel)
        .eq('is_active', true)
        .order('name_bn', { ascending: true })
        .limit(MAX_CHILD_LOCATIONS)

      if (childError) {
        console.error(
          'Feni Brain child location retrieval failed:',
          { code: childError.code },
        )
      } else {
        childLocations = children ?? []
      }
    }

    const sourcesMap = new Map()

    for (const row of ranked) {
      const key = row.source_url || row.source_title
      if (!key || sourcesMap.has(key)) continue

      sourcesMap.set(key, {
        source_title: row.source_title,
        source_url: row.source_url,
        trust_tier: row.trust_tier,
        document_title: row.document_title,
      })
    }

    return {
      success: true,
      query: cleanQuery,
      normalizedQuery,
      keywordQuery,
      intent,
      intentKey: questionClass.intentKey,
      language: questionClass.language,
      budget: questionClass.budgetBDT,
      entities: questionClass.entities,
      locations: Array.isArray(locations) ? locations : [],
      childLocations,
      results: ranked,
      sources: [...sourcesMap.values()],
      retrievalConfidence: Number(ranked[0]?.similarity ?? 0),
      requestedFactSubject,
      queryClass: questionClass,
    }
  } catch (error) {
    console.error('Feni Brain search failed:', { name: error?.name })
    return {
      success: false,
      error: 'Feni Brain বর্তমানে unavailable.',
    }
  }
}
