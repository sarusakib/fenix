const PHRASE_MAP = new Map([
  ['trade license', 'ট্রেড লাইসেন্স'], ['trade lisence', 'ট্রেড লাইসেন্স'], ['trade licence', 'ট্রেড লাইসেন্স'],
  ['business start', 'ব্যবসা শুরু'], ['business shuru', 'ব্যবসা শুরু'], ['business suru', 'ব্যবসা শুরু'],
  ['business korte chai', 'ব্যবসা করতে চাই'], ['business korte cahi', 'ব্যবসা করতে চাই'],
  ['byabsha korte chai', 'ব্যবসা করতে চাই'], ['bebsha korte chai', 'ব্যবসা করতে চাই'],
  ['business dite chai', 'ব্যবসা দিতে চাই'], ['byabsha dite chai', 'ব্যবসা দিতে চাই'],
  ['invest korte chai', 'বিনিয়োগ করতে চাই'], ['investment korte chai', 'বিনিয়োগ করতে চাই'],
  ['invest korbo', 'বিনিয়োগ করবো'], ['investment korbo', 'বিনিয়োগ করবো'],
  ['paikari mal', 'পাইকারি মাল'], ['mal kothay pabo', 'মাল কোথায় পাবো'],
  ['fire service', 'ফায়ার সার্ভিস'], ['ambulance chai', 'অ্যাম্বুলেন্স চাই'],
  ['feni te', 'ফেনীতে'], ['feni zila', 'ফেনী জেলা'], ['feni district', 'ফেনী জেলা'], ['feni sadar', 'ফেনী সদর'],
  ['chhagalnaiya', 'ছাগলনাইয়া'], ['chagalnaiya', 'ছাগলনাইয়া'], ['chhagolnaiya', 'ছাগলনাইয়া'],
  ['daganbhuiyan', 'দাগনভূঞা'], ['daganbhuiya', 'দাগনভূঞা'],
  ['fulgazi', 'ফুলগাজী'], ['fulgaji', 'ফুলগাজী'], ['phulgazi', 'ফুলগাজী'],
  ['parshuram', 'পরশুরাম'], ['parosuram', 'পরশুরাম'], ['porosuram', 'পরশুরাম'], ['poroshuram', 'পরশুরাম'],
  ['sonagazi', 'সোনাগাজী'], ['sonagaji', 'সোনাগাজী'], ['shonagazi', 'সোনাগাজী'],
]);

const TOKEN_MAP = new Map([
  ['feni', 'ফেনী'], ['feni-te', 'ফেনীতে'], ['feni-teke', 'ফেনী থেকে'],
  ['zila', 'জেলা'], ['district', 'জেলা'], ['sadar', 'সদর'],
  ['paurashava', 'পৌরসভা'], ['municipality', 'পৌরসভা'],
  ['upazila', 'উপজেলা'], ['upazillas', 'উপজেলা'], ['upojela', 'উপজেলা'],
  ['union', 'ইউনিয়ন'], ['unions', 'ইউনিয়ন'], ['ward', 'ওয়ার্ড'], ['wards', 'ওয়ার্ড'],
  ['elaka', 'এলাকা'], ['area', 'এলাকা'], ['areas', 'এলাকা'],
  ['bazar', 'বাজার'], ['bazaar', 'বাজার'], ['market', 'বাজার'], ['markets', 'বাজার'],
  ['village', 'গ্রাম'], ['gram', 'গ্রাম'], ['mouza', 'মৌজা'],
  ['business', 'ব্যবসা'], ['businesses', 'ব্যবসা'], ['shop', 'দোকান'], ['shops', 'দোকান'],
  ['supplier', 'সরবরাহকারী'], ['suppliers', 'সরবরাহকারী'],
  ['wholesale', 'পাইকারি'], ['wholesaler', 'পাইকার'], ['wholesalers', 'পাইকার'],
  ['invest', 'বিনিয়োগ'], ['investment', 'বিনিয়োগ'], ['investor', 'বিনিয়োগকারী'], ['investors', 'বিনিয়োগকারী'],
  ['biniyog', 'বিনিয়োগ'], ['binioyog', 'বিনিয়োগ'], ['byabsha', 'ব্যবসা'], ['bebsha', 'ব্যবসা'], ['bebshaay', 'ব্যবসায়'],
  ['dokan', 'দোকান'], ['dokaan', 'দোকান'], ['paikar', 'পাইকার'], ['paikari', 'পাইকারি'], ['paiker', 'পাইকার'],
  ['mal', 'মাল'], ['kapor', 'কাপড়'], ['sharee', 'শাড়ি'], ['sari', 'শাড়ি'],
  ['pharmacy', 'ফার্মেসি'], ['medicine', 'ওষুধ'], ['oushodh', 'ওষুধ'],
  ['hospital', 'হাসপাতাল'], ['hospitals', 'হাসপাতাল'], ['haspatal', 'হাসপাতাল'],
  ['clinic', 'ক্লিনিক'], ['doctor', 'ডাক্তার'], ['daktar', 'ডাক্তার'],
  ['school', 'স্কুল'], ['college', 'কলেজ'], ['madrasa', 'মাদ্রাসা'], ['madrasah', 'মাদ্রাসা'],
  ['emergency', 'জরুরি'], ['joruri', 'জরুরি'], ['ambulance', 'অ্যাম্বুলেন্স'], ['police', 'পুলিশ'], ['fire', 'আগুন'],
  ['tourist', 'পর্যটন'], ['tourism', 'পর্যটন'], ['tour', 'ঘোরা'], ['ghurte', 'ঘুরতে'], ['ghurar', 'ঘোরার'],
  ['krishi', 'কৃষি'], ['chash', 'চাষ'], ['fosol', 'ফসল'],
  ['registration', 'নিবন্ধন'], ['license', 'লাইসেন্স'], ['licence', 'লাইসেন্স'], ['lisence', 'লাইসেন্স'],
  ['koi', 'কোথায়'], ['kothay', 'কোথায়'], ['kothai', 'কোথায়'], ['koyta', 'কয়টা'], ['koita', 'কয়টা'],
  ['kota', 'কত'], ['koto', 'কত'], ['ki', 'কি'], ['kon', 'কোন'], ['konta', 'কোনটা'],
  ['gula', 'গুলো'], ['gulo', 'গুলো'], ['guli', 'গুলি'], ['ase', 'আছে'], ['ache', 'আছে'], ['nai', 'নেই'],
  ['chai', 'চাই'], ['korbo', 'করবো'], ['korte', 'করতে'], ['shuru', 'শুরু'], ['suru', 'শুরু'], ['dite', 'দিতে'],
  ['lagbe', 'লাগবে'], ['pabo', 'পাবো'], ['pabe', 'পাবে'], ['kivabe', 'কিভাবে'], ['kibhabe', 'কিভাবে'],
  ['ami', 'আমি'], ['amar', 'আমার'], ['tmi', 'তুমি'], ['tumi', 'তুমি'], ['tmr', 'তোমার'], ['tomar', 'তোমার'],
  ['kisu', 'কিছু'], ['kichu', 'কিছু'], ['ektu', 'একটু'], ['jonno', 'জন্য'], ['diye', 'দিয়ে'], ['ebong', 'এবং'],
  ['ar', 'আর'], ['o', 'ও'], ['te', 'তে'], ['theke', 'থেকে'], ['er', 'এর'], ['r', 'এর'], ['e', 'এ'], ['a', 'এ'],
  ['ekta', 'একটা'], ['akta', 'একটা'], ['ekti', 'একটি'],
]);

const STOP_WORDS = new Set([
  'ফেনী','জেলা','তে','এ','এর','ও','আর','থেকে','জন্য','কি','কোন','কোনটা','কোথায়','কয়টা','কত','আছে','চাই',
  'করতে','করবো','দিতে','লাগবে','আমি','আমার','তুমি','তোমার','একটা','একটি','একটু','কিছু','নাকি',
  'the','in','to','of','for','and','is','are','a','an','ami','amar','tmi','tumi','tmr','te','theke','er','r','e','a',
]);

const BANGLA_DIGITS = '০১২৩৪৫৬৭৮৯';
const ARABIC_DIGITS = '0123456789';
const BUDGET_UNITS = new Map([
  ['lakh', 100000], ['লক্ষ', 100000], ['লাখ', 100000],
  ['crore', 10000000], ['crores', 10000000], ['কোটি', 10000000],
  ['k', 1000], ['হাজার', 1000], ['thousand', 1000],
]);

function toArabicDigits(value) {
  return String(value ?? '').replace(/[০-৯]/g, (digit) => {
    const index = BANGLA_DIGITS.indexOf(digit);
    return index >= 0 ? ARABIC_DIGITS[index] : digit;
  });
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&');
}

function cleanToken(token) {
  return token
    .toLowerCase()
    .normalize('NFKC')
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

function normalizeAttachedBangla(token) {
  const value = token.normalize('NFKC').trim();
  if (value.length < 4) return value;
  if (value.endsWith('তে') && value.length > 4) return value.slice(0, -2);
  return value;
}

export function normalizeFeniBrainQuery(input) {
  if (typeof input !== 'string') return { original: '', normalized: '', meaningfulTokens: [] };

  let value = toArabicDigits(input)
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[–—_/-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 120);

  for (const [phrase, replacement] of [...PHRASE_MAP.entries()].sort((a,b)=>b[0].length-a[0].length)) {
    value = value.replace(
      new RegExp('(^|\\s)' + escapeRegExp(phrase) + '(?=\\s|$)', 'gi'),
      '$1' + replacement,
    );
  }

  const rawTokens = value.split(/\s+/).map(cleanToken).filter(Boolean);
  const tokens = rawTokens.map((token) => {
    const mapped = TOKEN_MAP.get(token);
    if (mapped) return mapped;
    const attached = normalizeAttachedBangla(token);
    return TOKEN_MAP.get(attached) ?? attached;
  });

  const normalized = tokens.join(' ').slice(0, 120);
  const meaningfulTokens = [...new Set(tokens.filter((token) => token.length >= 2 && !STOP_WORDS.has(token)))];
  return { original: input.slice(0, 120), normalized, meaningfulTokens };
}

export function buildKeywordQuery(input) {
  return normalizeFeniBrainQuery(input).meaningfulTokens.join(' ').slice(0, 500);
}

export function detectLanguage(input) {
  if (typeof input !== 'string') return 'unknown';
  const value = input.trim();
  const bangla = (value.match(/[\u0980-\u09FF]/g) || []).length;
  const latin = (value.match(/[A-Za-z]+/g) || []).length;
  if (bangla > 0 && latin > 0) return 'mixed';
  if (bangla > 0) return 'bn';
  if (latin > 0) {
    const lower = value.toLowerCase();
    if (/\b(ami|amar|feni|kothay|kivabe|chai|korbo|diye)\b/.test(lower)) return 'banglish';
    return 'en';
  }
  return 'unknown';
}

export function extractBudgetBDT(input) {
  if (typeof input !== 'string') return null;

  const text = toArabicDigits(input).normalize('NFKC').toLowerCase().replace(/,/g, '');
  const patterns = [
    /(?:৳|tk|bdt)?\s*([0-9]+(?:\.[0-9]+)?)\s*(কোটি|crore|crores|লক্ষ|লাখ|lakh|হাজার|thousand|k)(?=\s|$|[^\p{L}\p{N}])/iu,
    /(?:budget|বাজেট)\s*(?:of|=|:)?\s*(?:৳|tk|bdt)?\s*([0-9]+(?:\.[0-9]+)?)\s*(কোটি|crore|crores|লক্ষ|লাখ|lakh|হাজার|thousand|k)?(?=\s|$|[^\p{L}\p{N}])/iu,
    /(?:৳|tk|bdt)\s*([0-9]{3,})(?=\s|$|[^\p{L}\p{N}])/iu,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    const amount = Number(match[1]);
    if (!Number.isFinite(amount)) continue;

    const unit = String(match[2] ?? '').trim().toLowerCase().replace(/\s+/g, '');
    const multiplier = BUDGET_UNITS.get(unit) ?? 1;
    const total = amount * multiplier;
    if (total >= 0 && total <= 1000000000) return Math.round(total);
  }

  return null;
}

export function detectFeniBrainIntent(input) {
  const parsed = normalizeFeniBrainQuery(input);
  const text = (parsed.normalized + ' ' + parsed.original).toLowerCase();
  const definitions = [
    ['START_BUSINESS', ['ব্যবসা শুরু','ব্যবসা করতে চাই','দোকান দিতে চাই','business start','start a business','কিভাবে ব্যবসা']],
    ['INVEST', ['বিনিয়োগ','investment','invest','funding','capital','অর্থায়ন']],
    ['FIND_SUPPLIER', ['সরবরাহকারী','supplier','পাইকার','পাইকারি','wholesale','distributor']],
    ['FIND_BUSINESS', ['দোকান','business','shop','ব্যবসা কোথায়','রেস্টুরেন্ট','restaurant','হোটেল','hotel','ক্যাফে','cafe','বেকারি','bakery','ফ্যাশন','fashion']],
    ['EMERGENCY', ['জরুরি','জরুরী','emergency','ambulance','অ্যাম্বুলেন্স','blood','রক্ত','oxygen','অক্সিজেন','fire service','পুলিশ জরুরি']],
    ['FIND_SERVICE', ['সেবা','service','হাসপাতাল','ক্লিনিক','ডাক্তার','ফার্মেসি','pharmacy','medicine','school','college','পুলিশ','ফায়ার','ডেন্টাল','dental','ল্যাব','lab']],
    ['LOCATION_INFO', ['উপজেলা','ইউনিয়ন','ওয়ার্ড','পৌরসভা','গ্রাম','মৌজা','বাজার','এলাকা','কোথায়','location']],
    ['BUSINESS_REGISTRATION', ['ট্রেড লাইসেন্স','নিবন্ধন','registration','license','licence']],
    ['DUE_DILIGENCE', ['যাচাই','ভেরিফাই','verify','verification','due diligence','মালিকানা','ownership']],
    ['BUSINESS_COMPARISON', ['তুলনা','compare','comparison','পার্থক্য']],
    ['CALCULATOR', ['হিসাব','calculator','ক্যালকুলেট','খরচ কত','লাভ হিসাব']],
    ['MARKET_RESEARCH', ['বাজার গবেষণা','market research','চাহিদা','demand','competition','প্রতিযোগিতা']],
    ['GENERAL_GUIDANCE', ['কিভাবে','how','guide','guidance','কি করব','what should i do']],
  ];

  let bestKey = 'GENERAL_GUIDANCE';
  let bestScore = 0;
  for (const [key, terms] of definitions) {
    const score = terms.reduce((sum, term) => sum + (text.includes(term.toLowerCase()) ? 1 + Math.min(term.length / 25, 2) : 0), 0);
    if (score > bestScore) {
      bestKey = key;
      bestScore = score;
    }
  }
  return bestKey;
}

export function extractEntities(input) {
  const parsed = normalizeFeniBrainQuery(input);
  const lower = parsed.normalized.toLowerCase();
  const knownLocations = [
    ['Feni','ফেনী'], ['Feni Sadar','ফেনী সদর'], ['Chhagalnaiya','ছাগলনাইয়া'],
    ['Daganbhuiyan','দাগনভূঞা'], ['Fulgazi','ফুলগাজী'], ['Parshuram','পরশুরাম'], ['Sonagazi','সোনাগাজী'],
  ];

  return {
    locations: knownLocations.filter(([,bn]) => lower.includes(bn.toLowerCase())).map(([en]) => en),
    budget_bdt: extractBudgetBDT(input),
    keywords: parsed.meaningfulTokens.slice(0, 20),
  };
}


export function detectRequestedFactSubject(input) {
  const text = normalizeFeniBrainQuery(input).normalized.toLowerCase();
  const checks = [
    ['upazila_count', ['উপজেলা', 'upazila', 'upajila', 'upojela']],
    ['municipality_count', ['পৌরসভা', 'municipality', 'pourashava']],
    ['union_count', ['ইউনিয়ন', 'ইউনিয়ন', 'union']],
    ['village_count', ['গ্রাম', 'village', 'gram']],
    ['mouza_count', ['মৌজা', 'mouza']],
    ['market_count', ['বাজার', 'হাট', 'market', 'bazar', 'bazaar']],
    ['ward_count', ['ওয়ার্ড', 'ওয়ার্ড', 'ward']],
    ['population_density', ['জনঘনত্ব', 'population density', 'density']],
    ['population', ['জনসংখ্যা', 'population', 'মানুষ', 'লোকসংখ্যা']],
    ['male_population', ['পুরুষ জনসংখ্যা', 'male population']],
    ['female_population', ['নারী জনসংখ্যা', 'মহিলা জনসংখ্যা', 'female population']],
    ['hijra_population', ['হিজড়া জনসংখ্যা', 'হিজড়া', 'hijra population']],
    ['area', ['আয়তন', 'আয়তন', 'area', 'square kilometer', 'sq km']],
    ['cultivable_land', ['চাষযোগ্য', 'আবাদযোগ্য', 'cultivable land']],
    ['irrigated_land', ['সেচযুক্ত', 'সেচের জমি', 'irrigated land']],
    ['forest_land', ['বনভূমি', 'forest land']],
    ['heavy_industry_count', ['ভারী শিল্প', 'heavy industry']],
    ['medium_industry_count', ['মাঝারি শিল্প', 'medium industry']],
    ['small_industry_count', ['ক্ষুদ্র শিল্প', 'small industry']],
    ['cottage_industry_count', ['কুটির শিল্প', 'cottage industry']],
    ['union_land_office_count', ['ভূমি অফিস', 'land office']],
  ];
  return checks.find(([, terms]) => terms.some((term) => text.includes(term)))?.[0] ?? null;
}

export function classifyFeniBrainQuestion(input) {
  const parsed = normalizeFeniBrainQuery(input);
  const text = (parsed.normalized + ' ' + parsed.original).toLowerCase();

  const currentTerms = ['আজ','এখন','সর্বশেষ','বর্তমান','হালনাগাদ','আপডেট','নোটিশ','খবর','সাম্প্রতিক','আজকের','এই মুহূর্তে','latest','today','now','current','updated','update','notice','notices','news','new','recent','tender'];
  const highStakesTerms = ['আইন','আইনি','legal','law','চিকিৎসা','ডাক্তার','medicine','medical','স্বাস্থ্য','health','জরুরি','emergency','বিনিয়োগ','investment','return','লাভ','ক্ষতি','loan','ঋণ','tax','কর','নিরাপত্তা','security'];
  const localTerms = ['ফেনী','ফেনীতে','সদর','ছাগলনাইয়া','দাগনভূঞা','ফুলগাজী','পরশুরাম','সোনাগাজী','উপজেলা','ইউনিয়ন','ওয়ার্ড','বাজার','মৌজা','গ্রাম','এলাকা'];
  const businessTerms = ['ব্যবসা','supplier','সরবরাহকারী','পাইকারি','দোকান','business','shop','wholesale','manufacturer','distributor'];
  const commerceTerms = ['পণ্য','product','cart','order','অর্ডার','দাম','price','shop local','delivery','ডেলিভারি','return','রিটার্ন','seller','বিক্রি'];
  const investmentTerms = ['বিনিয়োগ','investment','invest','investor','বিনিয়োগকারী','funding','capital','অর্থায়ন','লাভ','return'];
  const startTerms = ['ব্যবসা শুরু','business start','start a business','শুরু করতে চাই','কিভাবে ব্যবসা','কিভাবে শুরু'];
  const hasAny = (terms) => terms.some((term) => text.includes(term));
  const current=hasAny(currentTerms), local=hasAny(localTerms), business=hasAny(businessTerms), commerce=hasAny(commerceTerms);
  const investment=hasAny(investmentTerms), start=hasAny(startTerms), highStakes=hasAny(highStakesTerms);
  const emergency = hasAny(['জরুরি','জরুরী','emergency','ambulance','অ্যাম্বুলেন্স','blood','রক্ত','oxygen','অক্সিজেন','fire service','পুলিশ জরুরি']);

  let scope='general';
  if(emergency) scope='emergency';
  else if(start) scope='start';
  else if(investment) scope='investment';
  else if(commerce) scope='commerce';
  else if(business) scope='business';
  else if(local) scope='local';

  return {
    ...parsed,
    scope, local, current, highStakes, business, commerce, investment, start, emergency,
    language: detectLanguage(input),
    intentKey: detectFeniBrainIntent(input),
    budgetBDT: extractBudgetBDT(input),
    entities: extractEntities(input),
    general: scope === 'general' && !current && !highStakes,
  };
}
