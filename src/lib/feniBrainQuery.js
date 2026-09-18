const PHRASE_MAP = new Map([
  ['trade license', 'ট্রেড লাইসেন্স'],
  ['trade lisence', 'ট্রেড লাইসেন্স'],
  ['business start', 'ব্যবসা শুরু'],
  ['business shuru', 'ব্যবসা শুরু'],
  ['business suru', 'ব্যবসা শুরু'],
  ['business korte chai', 'ব্যবসা করতে চাই'],
  ['business dite chai', 'ব্যবসা দিতে চাই'],
  ['invest korte chai', 'বিনিয়োগ করতে চাই'],
  ['investment korte chai', 'বিনিয়োগ করতে চাই'],
  ['paikari mal', 'পাইকারি মাল'],
  ['fire service', 'ফায়ার সার্ভিস'],
  ['feni paurashava', 'ফেনী পৌরসভা'],
  ['chhagalnaiya paurashava', 'ছাগলনাইয়া পৌরসভা'],
  ['chagalnaiya paurashava', 'ছাগলনাইয়া পৌরসভা'],
  ['daganbhuiyan paurashava', 'দাগনভূঞা পৌরসভা'],
  ['fulgazi paurashava', 'ফুলগাজী পৌরসভা'],
  ['parshuram paurashava', 'পরশুরাম পৌরসভা'],
  ['sonagazi paurashava', 'সোনাগাজী পৌরসভা'],
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
  ['feni sadar', 'ফেনী সদর'],
  ['amirabad union', 'আমিরাবাদ ইউনিয়ন'],
  ['amzad hat union', 'আমজাদ হাট ইউনিয়ন'],
  ['anandapur union', 'আনন্দপুর ইউনিয়ন'],
  ['baligaon union', 'বালিগাঁও ইউনিয়ন'],
  ['bogadana union', 'বগাদানা ইউনিয়ন'],
  ['boxmahmmud union', 'বক্সমাহমুদ ইউনিয়ন'],
  ['char chandia union', 'চর চান্দিয়া ইউনিয়ন'],
  ['char darbesh union', 'চর দরবেশ ইউনিয়ন'],
  ['char mojlishpur union', 'চর মজলিশপুর ইউনিয়ন'],
  ['chhonuya union', 'ছনুয়া ইউনিয়ন'],
  ['chithlia union', 'চিথলিয়া ইউনিয়ন'],
  ['daganbhuiyan union', 'দাগনভূঞা ইউনিয়ন'],
  ['darbarpur union', 'দরবারপুর ইউনিয়ন'],
  ['dhalia union', 'ধলিয়া ইউনিয়ন'],
  ['dharampur union', 'ধর্মপুর ইউনিয়ন'],
  ['farhadnagar union', 'ফরহাদনগর ইউনিয়ন'],
  ['fazilpur union', 'ফাজিলপুর ইউনিয়ন'],
  ['fulgazi union', 'ফুলগাজী ইউনিয়ন'],
  ['ghopal union', 'ঘোপাল ইউনিয়ন'],
  ['gm hat union', 'জি এম হাট ইউনিয়ন'],
  ['jaylaskar union', 'জায়লষ্কর ইউনিয়ন'],
  ['kalidaha union', 'কালিদহ ইউনিয়ন'],
  ['kazirbag union', 'কাজিরবগ ইউনিয়ন'],
  ['lemua union', 'লেমুয়া ইউনিয়ন'],
  ['mahamaya union', 'মহামায়া ইউনিয়ন'],
  ['matuabhuiyan union', 'মাতুভূঞা ইউনিয়ন'],
  ['mirzanagar union', 'মির্জানগর ইউনিয়ন'],
  ['mongolkandi union', 'মংগলকান্দি ইউনিয়ন'],
  ['motiganj union', 'মতিগঞ্জ ইউনিয়ন'],
  ['motobi union', 'মোটবী ইউনিয়ন'],
  ['munshirhat union', 'মুন্সীরহাট ইউনিয়ন'],
  ['nawabpur union', 'নবাবপুর ইউনিয়ন'],
  ['panchgachia union', 'পাঁচগাচিয়া ইউনিয়ন'],
  ['pathannagar union', 'পাঠাননগর ইউনিয়ন'],
  ['purbachandrapur union', 'পূর্বচন্দ্রপুর ইউনিয়ন'],
  ['radhanagar union', 'রাধানগর ইউনিয়ন'],
  ['rajapur union', 'রাজাপুর ইউনিয়ন'],
  ['ramnagar union', 'রামনগর ইউনিয়ন'],
  ['sarishadi union', 'শর্শদি ইউনিয়ন'],
  ['shuvapur union', 'শুভপুর ইউনিয়ন'],
  ['sindurpur union', 'সিন্দুরপুর ইউনিয়ন'],
  ['sonagazi union', 'সোনাগাজী ইউনিয়ন'],
  ['yakubpur union', 'ইয়াকুবপুর ইউনিয়ন'],
]);

const TOKEN_MAP = new Map([
  ['feni', 'ফেনী'],
  ['zila', 'জেলা'],
  ['district', 'জেলা'],
  ['sadar', 'সদর'],
  ['paurashava', 'পৌরসভা'],
  ['upazila', 'উপজেলা'],
  ['union', 'ইউনিয়ন'],
  ['ward', 'ওয়ার্ড'],
  ['elaka', 'এলাকা'],
  ['area', 'এলাকা'],
  ['bazar', 'বাজার'],
  ['bazaar', 'বাজার'],
  ['market', 'বাজার'],
  ['business', 'ব্যবসা'],
  ['businesses', 'ব্যবসা'],
  ['shop', 'দোকান'],
  ['shopping', 'শপিং'],
  ['supplier', 'সরবরাহকারী'],
  ['suppliers', 'সরবরাহকারী'],
  ['wholesale', 'পাইকারি'],
  ['wholesaler', 'পাইকার'],
  ['invest', 'বিনিয়োগ'],
  ['investment', 'বিনিয়োগ'],
  ['investor', 'বিনিয়োগকারী'],
  ['investors', 'বিনিয়োগকারী'],
  ['biniyog', 'বিনিয়োগ'],
  ['binioyog', 'বিনিয়োগ'],
  ['byabsha', 'ব্যবসা'],
  ['bebsha', 'ব্যবসা'],
  ['bebshaay', 'ব্যবসায়'],
  ['dokan', 'দোকান'],
  ['dokaan', 'দোকান'],
  ['paikar', 'পাইকার'],
  ['paikari', 'পাইকারি'],
  ['paiker', 'পাইকার'],
  ['hospital', 'হাসপাতাল'],
  ['haspatal', 'হাসপাতাল'],
  ['clinic', 'ক্লিনিক'],
  ['doctor', 'ডাক্তার'],
  ['daktar', 'ডাক্তার'],
  ['school', 'স্কুল'],
  ['college', 'কলেজ'],
  ['madrasa', 'মাদ্রাসা'],
  ['madrasah', 'মাদ্রাসা'],
  ['emergency', 'জরুরি'],
  ['joruri', 'জরুরি'],
  ['ambulance', 'অ্যাম্বুলেন্স'],
  ['police', 'পুলিশ'],
  ['fire', 'আগুন'],
  ['tourist', 'পর্যটন'],
  ['tourism', 'পর্যটন'],
  ['tour', 'ঘোরা'],
  ['ghurte', 'ঘুরতে'],
  ['ghurar', 'ঘোরার'],
  ['krishi', 'কৃষি'],
  ['chash', 'চাষ'],
  ['fosol', 'ফসল'],
  ['registration', 'নিবন্ধন'],
  ['license', 'লাইসেন্স'],
  ['lisence', 'লাইসেন্স'],
  ['koi', 'কোথায়'],
  ['kothay', 'কোথায়'],
  ['kothai', 'কোথায়'],
  ['koyta', 'কয়টা'],
  ['koita', 'কয়টা'],
  ['kota', 'কয়টা'],
  ['koto', 'কত'],
  ['ki', 'কি'],
  ['kon', 'কোন'],
  ['konta', 'কোনটা'],
  ['konkon', 'কোন কোন'],
  ['gula', 'গুলো'],
  ['gulo', 'গুলো'],
  ['guli', 'গুলি'],
  ['ase', 'আছে'],
  ['ache', 'আছে'],
  ['nai', 'নেই'],
  ['chai', 'চাই'],
  ['chay', 'চাই'],
  ['korbo', 'করবো'],
  ['korboo', 'করবো'],
  ['korte', 'করতে'],
  ['shuru', 'শুরু'],
  ['suru', 'শুরু'],
  ['dite', 'দিতে'],
  ['lagbe', 'লাগবে'],
  ['pabo', 'পাবো'],
  ['pabe', 'পাবে'],
  ['kivabe', 'কিভাবে'],
  ['kibhabe', 'কিভাবে'],
  ['te', 'তে'],
  ['theke', 'থেকে'],
  ['er', 'এর'],
  ['r', 'এর'],
  ['e', 'এ'],
  ['a', 'এ'],
  ['ke', 'কে'],
  ['jonno', 'জন্য'],
  ['diye', 'দিয়ে'],
  ['ebong', 'এবং'],
  ['ar', 'আর'],
  ['o', 'ও'],
]);

const STOP_WORDS = new Set([
  'ফেনী', 'জেলা', 'তে', 'এ', 'এর', 'ও', 'আর', 'থেকে', 'জন্য',
  'কি', 'কোন', 'কোনটা', 'কোথায়', 'কয়টা', 'কত', 'আছে', 'চাই',
  'করতে', 'করবো', 'দিতে', 'লাগবে', 'আমি', 'আমার', 'একটা', 'একটি',
  'the', 'in', 'to', 'of', 'for', 'and', 'is', 'are', 'a', 'an',
]);

function escapeRegExp(value) {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function cleanToken(token) {
  return token
    .toLowerCase()
    .normalize('NFKC')
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

export function normalizeFeniBrainQuery(input) {
  if (typeof input !== 'string') {
    return {
      original: '',
      normalized: '',
      meaningfulTokens: [],
    };
  }

  let value = input
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[–—_/-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 120);

  for (const [phrase, replacement] of [...PHRASE_MAP.entries()].sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    const pattern = new RegExp(
      '(^|\\s)' + escapeRegExp(phrase) + '(?=\\s|$)',
      'gi',
    );
    value = value.replace(pattern, '$1' + replacement);
  }

  const tokens = value
    .split(/\s+/)
    .map(cleanToken)
    .filter(Boolean)
    .map((token) => TOKEN_MAP.get(token) ?? token);

  const normalized = tokens.join(' ').slice(0, 120);
  const meaningfulTokens = [...new Set(
    tokens.filter((token) => token.length >= 2 && !STOP_WORDS.has(token)),
  )];

  return {
    original: input.slice(0, 120),
    normalized,
    meaningfulTokens,
  };
}

export function buildKeywordQuery(input) {
  return normalizeFeniBrainQuery(input).meaningfulTokens.join(' ').slice(0, 500);
}
