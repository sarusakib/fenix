/**
 * Feni Brain 3.0 — deterministic local intelligence helpers.
 *
 * The LLM is optional. These helpers keep the Brain useful when an AI
 * provider is unavailable by ranking structured evidence, businesses and
 * FeniX's public knowledge articles directly.
 */

const CANONICAL_INTENTS = {
  START_BUSINESS: 'start',
  BUSINESS_START: 'start',
  INVEST: 'investment',
  INVESTMENT: 'investment',
  FIND_SUPPLIER: 'supplier',
  SUPPLIER_SEARCH: 'supplier',
  FIND_BUSINESS: 'business',
  BUSINESS_SEARCH: 'business',
  FIND_SERVICE: 'service',
  HEALTH_SERVICE: 'service',
  GOVERNMENT_SERVICE: 'government',
  EDUCATION: 'education',
  TOURISM: 'tourism',
  AGRICULTURE: 'agriculture',
  EMERGENCY: 'emergency',
  LOCATION_INFO: 'location',
  BUSINESS_REGISTRATION: 'government',
  DUE_DILIGENCE: 'trust',
  BUSINESS_COMPARISON: 'business',
  CALCULATOR: 'start',
  MARKET_RESEARCH: 'research',
  GENERAL_GUIDANCE: 'general',
  GENERAL_FENI: 'general',
}

export function canonicalBrainIntent(value) {
  const key = String(value || '').trim().toUpperCase()
  return CANONICAL_INTENTS[key] || 'general'
}

function compact(value, max = 800) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function lower(value) {
  return String(value || '').toLowerCase()
}

export function queryTokens(parsed) {
  return Array.isArray(parsed?.meaningfulTokens)
    ? [...new Set(parsed.meaningfulTokens.map((x) => lower(x)).filter((x) => x.length >= 2))]
    : []
}

function overlapScore(tokens, text) {
  const value = lower(text)
  if (!value || !tokens.length) return 0
  let matches = 0
  for (const token of tokens) {
    if (value.includes(token)) matches += 1
  }
  return matches / tokens.length
}

export function scoreFeniArticle(article, parsed) {
  const tokens = queryTokens(parsed)
  const haystack = [
    article?.titleBn,
    article?.titleEn,
    article?.descriptionBn,
    article?.descriptionEn,
    ...(article?.tags || []),
    ...(article?.sections || []).flatMap((s) => [s.headingBn, s.headingEn, s.bodyBn, s.bodyEn]),
  ].join(' ')

  const tokenScore = overlapScore(tokens, haystack)
  const query = lower(parsed?.normalized || parsed?.original)
  const title = lower(article?.titleBn) + ' ' + lower(article?.titleEn)
  const titleBoost = query && title.includes(query) ? 0.35 : 0
  const feniBoost = haystack.includes('ফেনী') || haystack.includes('feni') ? 0.08 : 0

  return Math.min(0.99, tokenScore * 0.62 + titleBoost + feniBoost)
}

export function buildArticleResults(articles, parsed, limit = 5) {
  const rows = (articles || [])
    .map((article) => ({ article, score: scoreFeniArticle(article, parsed) }))
    .filter((item) => item.score >= 0.16)
    .sort((a, b) => b.score - a.score || String(b.article?.updated || '').localeCompare(String(a.article?.updated || '')))
    .slice(0, limit)
    .map(({ article, score }) => {
      const section = article?.sections?.[0]
      return {
        id: 'article:' + article.slug,
        content: compact(article.descriptionBn || article.descriptionEn || section?.bodyBn || section?.bodyEn),
        similarity: Number(score.toFixed(3)),
        source_title: 'FeniX Knowledge',
        source_url: '/feni/' + encodeURIComponent(article.slug),
        trust_tier: 2,
        document_title: article.titleBn || article.titleEn,
        retrieval_method: 'knowledge',
        subject_key: 'article',
      }
    })
  return rows
}

export function scoreDirectoryBusiness(row, parsed, requestedTerms = []) {
  const tokens = [...queryTokens(parsed), ...requestedTerms.map((x) => lower(x))]
  const text = [
    row?.name,
    row?.title_bn,
    row?.title_en,
    row?.description,
    row?.category,
    row?.tagline_bn,
    row?.tagline_en,
    row?.about_bn,
    row?.about_en,
    row?.district,
    row?.upazila,
    row?.area,
    row?.market,
  ].join(' ')

  const tokenScore = overlapScore([...new Set(tokens)], text)
  const verificationBoost = row?.verification_level === 'verified' ? 0.12 : 0
  const locationBoost = row?.district ? 0.04 : 0

  return Math.min(0.99, 0.5 * tokenScore + verificationBoost + locationBoost)
}

export function buildBusinessResults(rows, parsed, limit = 8) {
  return (rows || [])
    .map((row) => ({ row, score: scoreDirectoryBusiness(row, parsed) }))
    .filter((item) => item.score >= 0.14)
    .sort((a, b) => b.score - a.score || String(a.row?.name || '').localeCompare(String(b.row?.name || '')))
    .slice(0, limit)
    .map(({ row, score }) => ({
      id: 'business:' + row.id,
      content: [
        row.title_bn || row.title_en || row.name,
        row.category ? 'Category: ' + row.category : '',
        row.upazila || row.area || row.district ? [row.district, row.upazila, row.area].filter(Boolean).join(' · ') : '',
        row.description || row.about_bn || row.about_en || '',
      ].filter(Boolean).join(' — '),
      similarity: Number(score.toFixed(3)),
      source_title: 'FeniX Directory',
      source_url: row.slug ? '/directory/' + encodeURIComponent(row.slug) : '/directory/' + encodeURIComponent(row.id),
      trust_tier: row.verification_level === 'verified' ? 1 : 3,
      document_title: row.title_bn || row.title_en || row.name,
      retrieval_method: 'business',
      subject_key: 'business',
      business: row,
    }))
}

export function buildBrainSuggestions(parsed, max = 8) {
  const intent = canonicalBrainIntent(parsed?.intentKey)
  const suggestions = {
    start: [
      'ফেনীতে কম বাজেটে কোন business শুরু করা যায়?',
      'Feni te business korte chai — ki diye shuru korbo?',
      'ট্রেড লাইসেন্স সম্পর্কে জানতে চাই',
    ],
    investment: [
      'ফেনীতে investment opportunity কী আছে?',
      'বিনিয়োগের আগে কী কী যাচাই করব?',
      'Investment due diligence কীভাবে করব?',
    ],
    supplier: [
      'ফেনীতে পাইকারি supplier কোথায়?',
      'পাইকারি কাপড় কোথায় পাব?',
      'ফেনীতে distributor খুঁজছি',
    ],
    business: [
      'ফেনী সদরে restaurant কোথায়?',
      'Feni te fashion business খুঁজছি',
      'কাছাকাছি local business দেখাও',
    ],
    service: [
      'ফেনীতে pharmacy কোথায়?',
      'ফেনী সদরে hospital কোথায়?',
      'ডাক্তার বা clinic খুঁজছি',
    ],
    government: [
      'ফেনীতে trade license কীভাবে করব?',
      'Feni business registration guide',
      'সরকারি business service কোথায় পাব?',
    ],
    education: [
      'ফেনীতে school কোথায়?',
      'ফেনীর college ও education তথ্য',
      'ফেনী শিক্ষা সম্পর্কে জানতে চাই',
    ],
    tourism: [
      'ফেনীতে কোথায় ঘুরতে যাওয়া যায়?',
      'ফেনীর দর্শনীয় জায়গা',
      'Feni tourist places',
    ],
    agriculture: [
      'ফেনীতে কোন কৃষি বেশি হয়?',
      'ফেনী কৃষি ও বাজার তথ্য',
      'কৃষিভিত্তিক business idea চাই',
    ],
    emergency: [
      'ফেনীতে ambulance কোথায় পাব?',
      'ফেনীতে blood help চাই',
      'ফেনীর জরুরি hospital তথ্য',
    ],
    location: [
      'ফেনীতে কয়টি উপজেলা আছে?',
      'ফেনীর উপজেলাগুলো কী কী?',
      'ফেনী সদরের ইউনিয়নগুলো কী?',
    ],
    research: [
      'ফেনীতে কোন business-এর demand আছে?',
      'ফেনীর market সম্পর্কে জানতে চাই',
      'Business opportunity কীভাবে খুঁজব?',
    ],
    general: [
      'ফেনীতে কী খুঁজছেন?',
      'ফেনীতে business শুরু করতে চাই',
      'Feni local business খুঁজছি',
      'ফেনী সম্পর্কে জানতে চাই',
    ],
  }

  const base = [...(suggestions[intent] || suggestions.general), ...suggestions.general]
  return [...new Set(base)].slice(0, max)
}

export function buildZeroResultHints(parsed) {
  const intent = canonicalBrainIntent(parsed?.intentKey)
  const hints = []

  if (intent === 'business' || intent === 'service' || intent === 'supplier') {
    hints.push({ label: 'Explore Directory', href: '/directory', reason: 'প্রকাশিত local business ও service listing দেখুন।' })
  }
  if (intent === 'start') {
    hints.push({ label: 'Start a Business', href: '/start', reason: 'Business idea থেকে step-by-step journey শুরু করুন।' })
  }
  if (intent === 'investment') {
    hints.push({ label: 'Explore Investment', href: '/invest', reason: 'Opportunity ও due-diligence workflow দেখুন।' })
  }
  if (intent === 'emergency' || intent === 'service') {
    hints.push({ label: 'Open Services', href: '/services', reason: 'Health, emergency ও local service paths এক জায়গায় দেখুন।' })
  }

  if (!hints.length) {
    hints.push({ label: 'Explore Feni Knowledge', href: '/feni', reason: 'FeniX-এর public local guides দেখুন।' })
  }

  return hints.slice(0, 2)
}
