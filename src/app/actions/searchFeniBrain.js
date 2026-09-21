'use server'

import { generateEmbedding } from './generateEmbedding'
import { createClient } from '../../utils/supabase/server'
import {
  buildKeywordQuery,
  normalizeFeniBrainQuery,
  classifyFeniBrainQuestion,
  detectRequestedFactSubject,
} from '../../lib/feniBrainQuery'
import { FENI_ARTICLES } from '../../data/feniArticles'
import {
  canonicalBrainIntent,
  buildArticleResults,
  buildBusinessResults,
  queryTokens,
} from '../../lib/feniBrainEngine'

const MAX_QUERY_LENGTH = 120
const MAX_RESULTS = 10
const MAX_CHILD_LOCATIONS = 20

async function safeStructuredLocationSearch(supabase, normalizedQuery) {
  try {
    const [{ data: rows, error }, { data: aliases, error: aliasError }] = await Promise.all([
      supabase.from('fenix_brain_locations')
        .select('id,parent_id,level,name_bn,name_en,slug,official_code,metadata')
        .eq('is_active', true)
        .limit(500),
      supabase.from('fenix_brain_location_aliases')
        .select('location_id,alias,normalized_alias,language_code')
        .limit(1000),
    ])

    if (error || aliasError) return []
    const tokens = String(normalizedQuery || '').toLowerCase().split(/\s+/).filter((token) => token.length >= 2)
    const aliasMap = new Map()
    for (const alias of aliases || []) {
      const values = [alias.alias, alias.normalized_alias].filter(Boolean).map((x) => String(x).toLowerCase())
      aliasMap.set(alias.location_id, [...(aliasMap.get(alias.location_id) || []), ...values])
    }

    return (rows || [])
      .map((row) => {
        const values = [row.name_bn, row.name_en, row.slug, ...(aliasMap.get(row.id) || [])].filter(Boolean).map((x) => String(x).toLowerCase())
        const haystack = values.join(' ')
        const hits = tokens.reduce((n, token) => n + (haystack.includes(token) ? 1 : 0), 0)
        const exact = values.some((value) => value === String(normalizedQuery || '').toLowerCase())
        const score = exact ? 1 : (tokens.length ? hits / tokens.length : 0)
        return { ...row, similarity: score }
      })
      .filter((row) => row.similarity >= 0.25)
      .sort((a, b) => b.similarity - a.similarity || String(a.name_bn || '').localeCompare(String(b.name_bn || '')))
      .slice(0, 16)
  } catch (error) {
    console.error('Feni Brain structured location fallback failed:', { name: error?.name })
    return []
  }
}

async function safeFactFallback(supabase, parsed) {
  try {
    const { data: rows, error } = await supabase
      .from('fenix_brain_facts')
      .select('id,subject_key,subject_location_id,value_number,value_text,value_unit,confidence,valid_from,valid_until,status')
      .eq('status', 'active')
      .order('confidence', { ascending: false })
      .limit(100)

    if (error || !Array.isArray(rows)) return []

    const tokens = queryTokens(parsed)
    const requested = detectRequestedFactSubject(String(parsed?.original || ''))
    const currentTime = Date.now()

    return rows
      .filter((row) => {
        const from = row.valid_from ? Date.parse(row.valid_from) : -Infinity
        const until = row.valid_until ? Date.parse(row.valid_until) : Infinity
        return from <= currentTime && until >= currentTime
      })
      .map((row) => {
        const key = String(row.subject_key || '').toLowerCase()
        const subjectHit = requested && key === String(requested).toLowerCase()
        const tokenHit = tokens.some((token) => key.includes(token))
        const similarity = subjectHit ? 1 : tokenHit ? 0.72 : 0
        return {
          ...row,
          similarity,
          semanticSimilarity: 0,
          keywordSimilarity: similarity,
          retrieval_method: 'fact',
          source_title: 'FeniX Structured Facts',
          source_url: '/feni',
          trust_tier: 1,
          document_title: key,
          content: row.value_text || (row.value_number != null ? String(row.value_number) + (row.value_unit ? ' ' + row.value_unit : '') : ''),
          name_bn: 'ফেনী',
        }
      })
      .filter((row) => row.similarity > 0)
      .slice(0, 10)
  } catch (error) {
    console.error('Feni Brain fact fallback failed:', { name: error?.name })
    return []
  }
}

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
  return [
    'কোন কোন',
    'কি কি',
    'কী কী',
    'গুলো',
    'গুলি',
    'list',
    'which',
    'what are',
  ].some((term) => query.includes(term))
}

function wantsDirectory(intent, parsed) {
  return ['business', 'service', 'supplier'].includes(canonicalBrainIntent(intent || parsed?.intentKey))
}

function wantsCommerce(parsed) {
  const text = String(parsed?.normalized || '').toLowerCase()
  return ['পণ্য', 'product', 'seller', 'দাম', 'price', 'cart', 'order', 'অর্ডার', 'বিক্রি'].some((term) => text.includes(term))
}

function locationUpazila(locations) {
  return (locations || []).find((item) => item.level === 'upazila')?.name_bn || undefined
}

function mergeRows(groups, parsed) {
  const merged = new Map()
  const intent = canonicalBrainIntent(parsed?.intentKey)
  const tokens = queryTokens(parsed)

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
      const isFact = row.retrieval_method === 'fact' || current?.retrieval_method === 'fact'
      const retrievalMethod = isFact ? 'fact' : (row.retrieval_method || current?.retrieval_method || 'matched')
      const content = String(row.content || '')
      const tokenHits = tokens.reduce((count, token) => count + (content.toLowerCase().includes(token) ? 1 : 0), 0)
      const tokenCoverage = tokens.length ? tokenHits / tokens.length : 0
      const methodBase =
        retrievalMethod === 'business' ? 0.66 :
        retrievalMethod === 'knowledge' ? 0.54 :
        retrievalMethod === 'fact' ? 0.74 :
        retrievalMethod === 'hybrid' ? 0.58 :
        retrievalMethod === 'keyword' ? 0.46 :
        0.40
      const intentBoost =
        (intent === 'business' && retrievalMethod === 'business') ||
        (intent === 'service' && retrievalMethod === 'business') ||
        (intent === 'supplier' && retrievalMethod === 'business') ||
        (intent === 'start' && retrievalMethod === 'knowledge') ||
        (intent === 'government' && retrievalMethod === 'knowledge')
          ? 0.14
          : 0
      const semanticBoost = semanticSimilarity > 0 ? Math.min(semanticSimilarity, 1) * 0.48 : 0
      const keywordBoost = keywordSimilarity > 0 ? Math.min(keywordSimilarity, 1) * 0.28 : 0
      const freshnessBoost = Number(row.trust_tier ?? 99) <= 1 ? 0.08 : 0
      const score = Math.min(
        0.995,
        methodBase + semanticBoost + keywordBoost + tokenCoverage * 0.20 + intentBoost + freshnessBoost,
      )

      merged.set(row.id, {
        ...(current ?? {}),
        ...row,
        semanticSimilarity,
        keywordSimilarity,
        similarity: Math.max(Number(current?.similarity ?? 0), score),
        retrieval_method: retrievalMethod,
      })
    }
  }

  return [...merged.values()]
}

async function safeDirectorySearch(supabase, parsed, locations) {
  const genericTerms = new Set(['ব্যবসা', 'business', 'দোকান', 'shop', 'সেবা', 'service', 'supplier', 'সরবরাহকারী', 'পণ্য', 'product'])
  const tokenQueries = queryTokens(parsed)
    .filter((token) => token.length >= 3 && !genericTerms.has(token))
    .slice(0, 6)

  const queries = [
    String(parsed?.original || '').trim().slice(0, MAX_QUERY_LENGTH),
    buildKeywordQuery(parsed?.normalized || ''),
    ...tokenQueries,
  ]
    .map((value) => value.trim().slice(0, MAX_QUERY_LENGTH))
    .filter(Boolean)

  const upazila = locationUpazila(locations)
  const merged = new Map()

  for (const query of [...new Set(queries)]) {
    try {
      const { data, error } = await supabase.rpc('search_directory_businesses', {
        p_query: query,
        p_category: undefined,
        p_upazila: upazila,
        p_limit: 12,
        p_offset: 0,
      })

      if (error) {
        console.error('Feni Brain directory retrieval failed:', { code: error.code, query })
        continue
      }

      for (const row of data || []) {
        if (row?.id) merged.set(row.id, row)
      }

      if (merged.size >= 12) break
    } catch (error) {
      console.error('Feni Brain directory retrieval exception:', { name: error?.name, query })
    }
  }

  return [...merged.values()].slice(0, 12)
}

async function safeCommerceSearch(supabase, parsed) {
  if (!wantsCommerce(parsed)) return []

  try {
    const query = String(parsed?.original || '').replace(/[%_]/g, ' ').trim().slice(0, 80)
    if (!query) return []

    const { data, error } = await supabase
      .from('products')
      .select('id, vendor_id, business_id, name_bn, name_en, description_bn, description_en, price, currency, slug')
      .eq('status', 'published')
      .eq('is_active', true)
      .or('name_bn.ilike.%' + query + '%,name_en.ilike.%' + query + '%,description_bn.ilike.%' + query + '%,description_en.ilike.%' + query + '%')
      .order('updated_at', { ascending: false })
      .limit(8)

    if (error) {
      console.error('Feni Brain product retrieval failed:', { code: error.code })
      return []
    }

    return (data || []).map((row) => ({
      id: 'product:' + row.id,
      content: [
        row.name_bn || row.name_en,
        row.price != null ? String(row.price) + ' ' + String(row.currency || 'BDT') : '',
        row.description_bn || row.description_en || '',
      ].filter(Boolean).join(' — '),
      similarity: 0.62,
      source_title: 'FeniX Commerce',
      source_url: row.slug ? '/product/' + encodeURIComponent(row.slug) : '/product',
      trust_tier: 2,
      document_title: row.name_bn || row.name_en || 'Local product',
      retrieval_method: 'product',
      subject_key: 'product',
      product: row,
    }))
  } catch (error) {
    console.error('Feni Brain product retrieval exception:', { name: error?.name })
    return []
  }
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
    const canonicalIntent = canonicalBrainIntent(questionClass.intentKey)

    const [locationResult, factResult, keywordNormalized, keywordOriginal] = await Promise.all([
      supabase.rpc('search_feni_brain_locations', { query_text: normalizedQuery, match_count: 16 }),
      supabase.rpc('search_feni_brain_facts', { query_text: normalizedQuery || cleanQuery, match_count: 10 }),
      supabase.rpc('keyword_feni_brain_chunks', { query_text: buildKeywordQuery(normalizedQuery) || normalizedQuery, match_count: MAX_RESULTS }),
      supabase.rpc('keyword_feni_brain_chunks', { query_text: cleanQuery, match_count: MAX_RESULTS }),
    ])

    if (locationResult.error) console.error('Feni Brain location retrieval failed:', { code: locationResult.error.code })
    if (factResult.error) console.error('Feni Brain fact retrieval failed:', { code: factResult.error.code })
    if (keywordNormalized.error) console.error('Feni Brain keyword retrieval failed:', { code: keywordNormalized.error.code })
    if (keywordOriginal.error) console.error('Feni Brain original keyword retrieval failed:', { code: keywordOriginal.error.code })

    let locations = Array.isArray(locationResult.data) ? locationResult.data : []
    if (locations.length < 2) {
      const fallbackLocations = await safeStructuredLocationSearch(supabase, normalizedQuery || cleanQuery)
      if (fallbackLocations.length > locations.length) locations = fallbackLocations
    }

    let rawFacts = Array.isArray(factResult.data) ? factResult.data : []
    if (rawFacts.length === 0) {
      rawFacts = await safeFactFallback(supabase, parsed)
    }
    const facts = rawFacts.map((row) => ({
      ...row,
      retrieval_method: 'fact',
      semanticSimilarity: 0,
      keywordSimilarity: Number(row.similarity || 0),
    }))

    const keyword = [
      ...(Array.isArray(keywordNormalized.data) ? keywordNormalized.data : []),
      ...(Array.isArray(keywordOriginal.data) ? keywordOriginal.data : []),
    ].map((row) => ({
      ...row,
      retrieval_method: 'keyword',
      semanticSimilarity: 0,
      keywordSimilarity: Number(row.similarity || 0),
    }))

    const directoryRows = wantsDirectory(canonicalIntent, questionClass)
      ? await safeDirectorySearch(supabase, parsed, locations)
      : []
    const businesses = buildBusinessResults(directoryRows, parsed, 10)

    const articles = buildArticleResults(FENI_ARTICLES, parsed, 6)
    const products = await safeCommerceSearch(supabase, parsed)

    let semantic = []
    try {
      const embeddingInput = [cleanQuery, normalizedQuery].filter(Boolean).join('\n').slice(0, 1200)
      const embedding = await generateEmbedding(embeddingInput)
      if (Array.isArray(embedding) && embedding.length === 384) {
        const semanticResult = await supabase.rpc('match_feni_brain_chunks', {
          query_embedding: embedding,
          match_threshold: 0.30,
          match_count: MAX_RESULTS,
        })
        if (!semanticResult.error && Array.isArray(semanticResult.data)) {
          semantic = semanticResult.data.map((row) => ({
            ...row,
            retrieval_method: 'semantic',
            semanticSimilarity: Number(row.similarity || 0),
            keywordSimilarity: 0,
          }))
        } else if (semanticResult.error) {
          console.error('Feni Brain semantic retrieval failed:', { code: semanticResult.error.code })
        }
      }
    } catch (error) {
      console.error('Feni Brain embedding unavailable:', { name: error?.name })
    }

    let childLocations = []
    const childLevel = requestedChildLevel(normalizedQuery)
    if (childLevel && (wantsNamedList(normalizedQuery) || requestedFactSubject === childLevel + '_count')) {
      const parent =
        locations.find((location) => location.level === 'district') ||
        locations.find((location) => location.level !== childLevel) ||
        locations[0]

      if (parent?.id) {
        const { data: children, error: childError } = await supabase
          .from('fenix_brain_locations')
          .select('id, level, name_bn, name_en, slug, official_code')
          .eq('parent_id', parent.id)
          .eq('level', childLevel)
          .eq('is_active', true)
          .order('name_bn', { ascending: true })
          .limit(MAX_CHILD_LOCATIONS)

        if (childError) {
          console.error('Feni Brain child location retrieval failed:', { code: childError.code })
        } else {
          childLocations = children || []
        }
      }
    }

    const ranked = mergeRows(
      [facts, semantic, keyword, articles, businesses, products],
      { ...parsed, intentKey: canonicalIntent },
    )
      .sort((a, b) => {
        const af = requestedFactSubject && a.retrieval_method === 'fact' && a.subject_key === requestedFactSubject ? 1 : 0
        const bf = requestedFactSubject && b.retrieval_method === 'fact' && b.subject_key === requestedFactSubject ? 1 : 0
        if (af !== bf) return bf - af
        const methodPriority = { fact: 6, business: 5, product: 4, knowledge: 3, hybrid: 2, keyword: 1, semantic: 0 }
        const ap = methodPriority[a.retrieval_method] ?? 0
        const bp = methodPriority[b.retrieval_method] ?? 0
        if (ap !== bp && (af || bf || canonicalIntent === 'business' || canonicalIntent === 'service' || canonicalIntent === 'supplier')) {
          return bp - ap
        }
        const scoreDiff = Number(b.similarity || 0) - Number(a.similarity || 0)
        if (scoreDiff) return scoreDiff
        return Number(a.trust_tier || 99) - Number(b.trust_tier || 99)
      })
      .slice(0, MAX_RESULTS)

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

    const bestEvidence = ranked[0]?.similarity ?? 0
    const structuredSignal =
      facts.some((row) => requestedFactSubject && row.subject_key === requestedFactSubject) ? 0.22 :
      childLocations.length ? 0.16 :
      businesses.length ? 0.15 :
      articles.length ? 0.10 :
      0

    return {
      success: true,
      query: cleanQuery,
      normalizedQuery,
      keywordQuery: buildKeywordQuery(normalizedQuery),
      intent: canonicalIntent,
      intentKey: questionClass.intentKey,
      language: questionClass.language,
      budget: questionClass.budgetBDT,
      entities: questionClass.entities,
      locations,
      childLocations,
      results: ranked,
      sources: [...sourcesMap.values()],
      retrievalConfidence: Math.min(0.995, Number(bestEvidence) + structuredSignal),
      requestedFactSubject,
      queryClass: questionClass,
      engineVersion: '3.0',
    }
  } catch (error) {
    console.error('Feni Brain search failed:', { name: error?.name })
    return {
      success: false,
      error: 'Feni Brain বর্তমানে unavailable.',
    }
  }
}
