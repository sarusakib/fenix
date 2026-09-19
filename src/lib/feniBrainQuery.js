const PHRASE_MAP = new Map([
  ['trade license', 'ট্রেড লাইসেন্স'],
  ['trade lisence', 'ট্রেড লাইসেন্স'],
  ['trade licence', 'ট্রেড লাইসেন্স'],
  ['business start', 'ব্যবসা শুরু'],
  ['business shuru', 'ব্যবসা শুরু'],
  ['business suru', 'ব্যবসা শুরু'],
  ['business korte chai', 'ব্যবসা করতে চাই'],
  ['business korte cahi', 'ব্যবসা করতে চাই'],
  ['byabsha korte chai', 'ব্যবসা করতে চাই'],
  ['bebsha korte chai', 'ব্যবসা করতে চাই'],
  ['business dite chai', 'ব্যবসা দিতে চাই'],
  ['byabsha dite chai', 'ব্যবসা দিতে চাই'],
  ['invest korte chai', 'বিনিয়োগ করতে চাই'],
  ['investment korte chai', 'বিনিয়োগ করতে চাই'],
  ['invest korbo', 'বিনিয়োগ করবো'],
  ['investment korbo', 'বিনিয়োগ করবো'],
  ['paikari mal', 'পাইকারি মাল'],
  ['mal kothay pabo', 'মাল কোথায় পাবো'],
  ['fire service', 'ফায়ার সার্ভিস'],
  ['ambulance chai', 'অ্যাম্বুলেন্স চাই'],
  ['feni te', 'ফেনীতে'],
  ['feni zila', 'ফেনী জেলা'],
  ['feni district', 'ফেনী জেলা'],
  ['feni sadar', 'ফেনী সদর'],
  ['chhagalnaiya', 'ছাগলনাইয়া'],
  ['chagalnaiya', 'ছাগলনাইয়া'],
  ['chhagolnaiya', 'ছাগলনাইয়া'],
  ['daganbhuiyan', 'দাগনভূঞা'],
  ['daganbhuiya', 'দাগনভূঞা'],
  ['fulgazi', 'ফুলগাজী'],
  ['fulgaji', 'ফুলগাজী'],
  ['phulgazi', 'ফুলগাজী'],
  ['parshuram', 'পরশুরাম'],
  ['parosuram', 'পরশুরাম'],
  ['porosuram', 'পরশুরাম'],
  ['poroshuram', 'পরশুরাম'],
  ['sonagazi', 'সোনাগাজী'],
  ['sonagaji', 'সোনাগাজী'],
  ['shonagazi', 'সোনাগাজী'],
]);

const TOKEN_MAP = new Map([
  ['feni', 'ফেনী'], ['feni-te', 'ফেনীতে'], ['feni-teke', 'ফেনী থেকে'],
  ['zila', 'জেলা'], ['district', 'জেলা'], ['sadar', 'সদর'],
  ['paurashava', 'পৌরসভা'], ['municipality', 'পৌরসভা'],
  ['upazila', 'উপজেলা'], ['upazillas', 'উপজেলা'], ['upojela', 'উপজেলা'],
  ['union', 'ইউনিয়ন'], ['unions', 'ইউনিয়ন'],
  ['ward', 'ওয়ার্ড'], ['wards', 'ওয়ার্ড'],
  ['elaka', 'এলাকা'], ['area', 'এলাকা'], ['areas', 'এলাকা'],
  ['bazar', 'বাজার'], ['bazaar', 'বাজার'], ['market', 'বাজার'], ['markets', 'বাজার'],
  ['village', 'গ্রাম'], ['gram', 'গ্রাম'], ['mouza', 'মৌজা'],
  ['business', 'ব্যবসা'], ['businesses', 'ব্যবসা'], ['shop', 'দোকান'], ['shops', 'দোকান'],
  ['supplier', 'সরবরাহকারী'], ['suppliers', 'সরবরাহকারী'],
  ['wholesale', 'পাইকারি'], ['wholesaler', 'পাইকার'], ['wholesalers', 'পাইকার'],
  ['invest', 'বিনিয়োগ'], ['investment', 'বিনিয়োগ'], ['investor', 'বিনিয়োগকারী'],
  ['investors', 'বিনিয়োগকারী'], ['biniyog', 'বিনিয়োগ'], ['binioyog', 'বিনিয়োগ'],
  ['byabsha', 'ব্যবসা'], ['bebsha', 'ব্যবসা'], ['bebshaay', 'ব্যবসায়'],
  ['dokan', 'দোকান'], ['dokaan', 'দোকান'], ['paikar', 'পাইকার'],
  ['paikari', 'পাইকারি'], ['paiker', 'পাইকার'],
  ['mal', 'মাল'], ['kapor', 'কাপড়'], ['sharee', 'শাড়ি'], ['sari', 'শাড়ি'],
  ['pharmacy', 'ফার্মেসি'], ['medicine', 'ওষুধ'], ['oushodh', 'ওষুধ'],
  ['hospital', 'হাসপাতাল'], ['hospitals', 'হাসপাতাল'], ['haspatal', 'হাসপাতাল'],
  ['clinic', 'ক্লিনিক'], ['doctor', 'ডাক্তার'], ['daktar', 'ডাক্তার'],
  ['school', 'স্কুল'], ['college', 'কলেজ'], ['madrasa', 'মাদ্রাসা'], ['madrasah', 'মাদ্রাসা'],
  ['emergency', 'জরুরি'], ['joruri', 'জরুরি'], ['ambulance', 'অ্যাম্বুলেন্স'],
  ['police', 'পুলিশ'], ['fire', 'আগুন'], ['tourist', 'পর্যটন'],
  ['tourism', 'পর্যটন'], ['tour', 'ঘোরা'], ['ghurte', 'ঘুরতে'], ['ghurar', 'ঘোরার'],
  ['krishi', 'কৃষি'], ['chash', 'চাষ'], ['fosol', 'ফসল'],
  ['registration', 'নিবন্ধন'], ['license', 'লাইসেন্স'], ['licence', 'লাইসেন্স'], ['lisence', 'লাইসেন্স'],
  ['koi', 'কোথায়'], ['kothay', 'কোথায়'], ['kothai', 'কোথায়'],
  ['koyta', 'কয়টা'], ['koita', 'কয়টা'], ['kota', 'কত'], ['koto', 'কত'],
  ['ki', 'কি'], ['kon', 'কোন'], ['konta', 'কোনটা'],
  ['gula', 'গুলো'], ['gulo', 'গুলো'], ['guli', 'গুলি'],
  ['ase', 'আছে'], ['ache', 'আছে'], ['nai', 'নেই'], ['chai', 'চাই'],
  ['korbo', 'করবো'], ['korte', 'করতে'], ['shuru', 'শুরু'], ['suru', 'শুরু'],
  ['dite', 'দিতে'], ['lagbe', 'লাগবে'], ['pabo', 'পাবো'], ['pabe', 'পাবে'],
  ['kivabe', 'কিভাবে'], ['kibhabe', 'কিভাবে'],
  ['ami', 'আমি'], ['amar', 'আমার'], ['tmi', 'তুমি'], ['tumi', 'তুমি'],
  ['tmr', 'তোমার'], ['tomar', 'তোমার'], ['kisu', 'কিছু'], ['kichu', 'কিছু'],
  ['ektu', 'একটু'], ['jonno', 'জন্য'], ['diye', 'দিয়ে'], ['ebong', 'এবং'],
  ['ar', 'আর'], ['o', 'ও'], ['te', 'তে'], ['theke', 'থেকে'], ['er', 'এর'], ['r', 'এর'],
  ['e', 'এ'], ['a', 'এ'], ['ekta', 'একটা'], ['akta', 'একটা'], ['ekti', 'একটি'],
]);

const STOP_WORDS = new Set([
  'ফেনী','জেলা','তে','এ','এর','ও','আর','থেকে','জন্য',
  'কি','কোন','কোনটা','কোথায়','কয়টা','কত','আছে','চাই',
  'করতে','করবো','দিতে','লাগবে','আমি','আমার','তুমি','তোমার',
  'একটা','একটি','একটু','কিছু','নাকি',
  'the','in','to','of','for','and','is','are','a','an',
  'ami','amar','tmi','tumi','tmr','te','theke','er','r','e','a',
]);

function escapeRegExp(value) {
  return value.replace(/[-/\\^$*+?.()|[\\]{}]/g, '\\$&');
}

function cleanToken(token) {
  return token
    .toLowerCase()
    .normalize('NFKC')
    .replace(/^[^\\p{L}\\p{N}]+|[^\\p{L}\\p{N}]+$/gu, '');
}

function normalizeAttachedBangla(token) {
  const value = token.normalize('NFKC').trim();
  if (value.length < 4) return value;

  if (value.endsWith('তে') && value.length > 4) {
    return value.slice(0, -2);
  }

  return value;
}

export function normalizeFeniBrainQuery(input) {
  if (typeof input !== 'string') {
    return { original: '', normalized: '', meaningfulTokens: [] };
  }

  let value = input
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[–—_/-]+/g, ' ')
    .replace(/\\s+/g, ' ')
    .slice(0, 120);

  for (const [phrase, replacement] of [...PHRASE_MAP.entries()].sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    value = value.replace(
      new RegExp('(^|\\s)' + escapeRegExp(phrase) + '(?=\\s|$)', 'gi'),
      '$1' + replacement,
    );
  }

  const rawTokens = value
    .split(/\\s+/)
    .map(cleanToken)
    .filter(Boolean);

  const tokens = rawTokens.map((token) => {
    const mapped = TOKEN_MAP.get(token);
    if (mapped) return mapped;

    const attached = normalizeAttachedBangla(token);
    return TOKEN_MAP.get(attached) ?? attached;
  });

  const normalized = tokens.join(' ').slice(0, 120);

  const meaningfulTokens = [...new Set(
    tokens.filter((token) => token.length >= 2 && !STOP_WORDS.has(token)),
  )];

  return { original: input.slice(0, 120), normalized, meaningfulTokens };
}

export function buildKeywordQuery(input) {
  return normalizeFeniBrainQuery(input).meaningfulTokens.join(' ').slice(0, 500);
}
