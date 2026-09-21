export type FeniArticle = {
  slug: string
  titleBn: string
  titleEn: string
  descriptionBn: string
  descriptionEn: string
  updated: string
  tags: string[]
  sections: { headingBn: string; headingEn: string; bodyBn: string; bodyEn: string }[]
}

const officialDistrictSource = 'https://feni.gov.bd/pages/static-pages/6990ef0035ce18e1c072ab44'
const bbsSource = 'https://bbs.feni.gov.bd/pages/static-pages/6990f85735ce18e1c0731872'

export const FENI_ARTICLES: readonly FeniArticle[] = [
  {
    slug:'feni-district-guide',
    titleBn:'ফেনী জেলা: ব্যবসা, মানুষ, এলাকা ও সুযোগের সহজ গাইড',
    titleEn:'Feni District Guide: Business, People, Places and Opportunities',
    descriptionBn:'ফেনী জেলার পরিচিতি, স্থানীয় তথ্য, ব্যবসা ও সুযোগ খোঁজার একটি public FeniX guide।',
    descriptionEn:'A public FeniX guide to Feni district, local information, business discovery and opportunity research.',
    updated:'2026-05-09',
    tags:['Feni','ফেনী','Feni district','Feni business','Feni Bangladesh'],
    sections:[
      {headingBn:'ফেনীকে এক নজরে',headingEn:'Feni at a glance',bodyBn:'FeniX-এর local knowledge layer-এ জেলা-ভিত্তিক পরিসংখ্যান, উপজেলা, ইউনিয়ন, বাজার এবং অন্যান্য স্থানগত তথ্য আলাদা করে রাখা হয়। এই তথ্যের সঙ্গে source ও verification context দেখানো হয় যাতে ব্যবহারকারী তথ্যের প্রেক্ষাপট বুঝতে পারেন।',bodyEn:'FeniX organizes district-level statistics, upazilas, unions, markets and other local information into separate knowledge records. Source and verification context are shown so readers can understand the evidence behind a claim.'},
      {headingBn:'ব্যবসার তথ্য খুঁজবেন যেভাবে',headingEn:'How to find business information',bodyBn:'কোনো ব্যবসা, supplier, বাজার বা area খুঁজতে FeniX Directory ব্যবহার করা যায়। কোনো listing-এর trust/verification context এবং report option দেখে তারপর যোগাযোগ করা ভালো।',bodyEn:'Use the FeniX Directory to find a business, supplier, market or area. Review trust and verification context and use the report option when a listing needs review.'},
    ],
  },
  {
    slug:'feni-upazila-union-guide',
    titleBn:'ফেনীর উপজেলা ও ইউনিয়ন: কাঠামো এবং স্থানীয়ভাবে খোঁজার গাইড',
    titleEn:'Feni Upazilas and Unions: A Local Discovery Guide',
    descriptionBn:'ফেনীর উপজেলা, ইউনিয়ন ও স্থানীয় কাঠামো বুঝে সঠিক জায়গার তথ্য খুঁজে নিন।',
    descriptionEn:'Understand Feni’s local administrative structure and use FeniX to search by place.',
    updated:'2026-05-09',
    tags:['Feni upazila','ফেনী উপজেলা','Feni union','ফেনী ইউনিয়ন'],
    sections:[
      {headingBn:'স্থানভিত্তিক প্রশ্ন করুন',headingEn:'Ask place-based questions',bodyBn:'“ফেনীতে কয়টি উপজেলা?”, “কোন কোন উপজেলা?”, “এই উপজেলার ইউনিয়নগুলো কী?”—এ ধরনের প্রশ্নের উত্তর location hierarchy ও verified fact layer থেকে আলাদা করে দেওয়া হয়।',bodyEn:'Questions such as “How many upazilas are in Feni?” or “Which upazilas are there?” are routed to the location hierarchy and verified fact layer rather than generic document snippets.'},
      {headingBn:'কেন location matters',headingEn:'Why location matters',bodyBn:'একই service-এর তথ্য এলাকা অনুযায়ী আলাদা হতে পারে। তাই FeniX search-এ district → upazila → union → area/market context ধাপে ধাপে ব্যবহার করা হয়।',bodyEn:'The same service can differ by area, so FeniX uses district → upazila → union → area/market context step by step.'},
    ],
  },
  {
    slug:'feni-markets-business',
    titleBn:'ফেনীর বাজার, supplier ও local business খোঁজার গাইড',
    titleEn:'Feni Markets, Suppliers and Local Business Guide',
    descriptionBn:'ফেনীতে supplier, wholesale, দোকান, বাজার ও স্থানীয় ব্যবসা খোঁজার ব্যবহারিক পদ্ধতি।',
    descriptionEn:'A practical guide to finding suppliers, wholesale sources, shops, markets and local businesses in Feni.',
    updated:'2026-05-09',
    tags:['Feni market','Feni supplier','ফেনী বাজার','ফেনী supplier'],
    sections:[
      {headingBn:'প্রথমে কী লিখবেন',headingEn:'What to search first',bodyBn:'পণ্যের নাম বা service + এলাকা লিখলে result আরও নির্দিষ্ট হয়। যেমন: “ফেনী সদর কাপড়ের supplier”, “Fulgazi কৃষি input”, “Sonagazi মাছের পাইকারি বাজার”।',bodyEn:'Search with product or service + place for more specific results, for example: “Feni Sadar clothing supplier” or “Sonagazi wholesale fish market”.'},
      {headingBn:'যোগাযোগের আগে যাচাই',headingEn:'Verify before contacting',bodyBn:'Public contact information, listing status, owner claim, phone verification ও location verification আলাদা বিষয়। একটিকে অন্যটির guarantee হিসেবে ধরা যাবে না।',bodyEn:'Public contact information, listing status, owner claim, phone verification and location verification are separate signals and should not be treated as a guarantee of business quality.'},
    ],
  },
  {
    slug:'feni-business-start-guide',
    titleBn:'ফেনীতে ব্যবসা শুরু করার সম্পূর্ণ সহজ গাইড',
    titleEn:'How to Start a Business in Feni: A Simple Step-by-Step Guide',
    descriptionBn:'আইডিয়া থেকে validation, plan, location ও launch পর্যন্ত FeniX Business Journey কীভাবে ব্যবহার করবেন।',
    descriptionEn:'Use FeniX Business Journey from idea validation through planning, location and launch.',
    updated:'2026-09-21',
    tags:['start business Feni','ফেনীতে ব্যবসা শুরু','business guide Feni'],
    sections:[
      {headingBn:'একবারে এক ধাপ',headingEn:'One step at a time',bodyBn:'FeniX-এ আগে business type ও লক্ষ্য ঠিক করুন, তারপর budget/experience, demand, competition, location এবং planning-এর প্রয়োজনীয় অংশগুলো একে একে পূরণ করুন। অপ্রয়োজনীয় field সামনে না রেখে ধাপে ধাপে flow দেখানোর জন্য service guide ব্যবহার করা হয়।',bodyEn:'Choose the business type and goal first, then complete only the needed budget, experience, demand, competition, location and planning steps. FeniX uses guided service steps instead of exposing every field at once.'},
      {headingBn:'আইনি তথ্য আলাদা করে যাচাই করুন',headingEn:'Verify legal information separately',bodyBn:'লাইসেন্স, registration, tax বা অন্য সরকারি requirement পরিবর্তিত হতে পারে। FeniX guidance-এর সঙ্গে সংশ্লিষ্ট official source যাচাই করে এগোনো উচিত।',bodyEn:'Licensing, registration, tax and other government requirements can change. Use FeniX guidance together with the relevant official source.'},
    ],
  },
  {
    slug:'feni-industry-agriculture',
    titleBn:'ফেনীর কৃষি ও শিল্প: ডেটা দিয়ে সুযোগ বোঝা',
    titleEn:'Feni Agriculture and Industry: Understanding Opportunity Through Data',
    descriptionBn:'ফেনীর কৃষি, শিল্প ও বাজার-সংক্রান্ত verified data থেকে কীভাবে local opportunity বোঝা যায়।',
    descriptionEn:'How verified agriculture, industry and market data can help interpret local opportunity in Feni.',
    updated:'2026-05-09',
    tags:['Feni agriculture','Feni industry','ফেনী কৃষি','ফেনী শিল্প'],
    sections:[
      {headingBn:'ডেটা মানে কী',headingEn:'What data means',bodyBn:'Population, land, markets and industry counts স্থানীয় অর্থনীতির একটি picture দেয়; এগুলো একা কোনো business idea সফল হবে এমন প্রমাণ নয়।',bodyEn:'Population, land, market and industry counts provide context about the local economy; they are not proof that a business idea will succeed.'},
      {headingBn:'Feni Brain-এর ভূমিকা',headingEn:'The role of Feni Brain',bodyBn:'Feni Brain প্রশ্নের intent অনুযায়ী relevant fact, place এবং source আলাদা করে সাজিয়ে দেয় যাতে ব্যবহারকারী দ্রুত সংশ্লিষ্ট evidence দেখতে পারেন।',bodyEn:'Feni Brain routes questions by intent and separates relevant facts, places and sources so users can reach the evidence more quickly.'},
    ],
  },
  {
    slug:'feni-map-places',
    titleBn:'ফেনী Map ও local places: কোন জায়গার তথ্য কীভাবে খুঁজবেন',
    titleEn:'Feni Map and Local Places: How to Search by Location',
    descriptionBn:'উপজেলা, ইউনিয়ন, বাজার, area ও business location ধরে FeniX-এ খোঁজার সহজ guide।',
    descriptionEn:'A simple FeniX guide for searching by upazila, union, market, area and business location.',
    updated:'2026-09-21',
    tags:['Feni map','Feni places','ফেনী ম্যাপ','Feni location'],
    sections:[
      {headingBn:'Map-first discovery',headingEn:'Map-first discovery',bodyBn:'একটি জায়গা খুঁজে তার সঙ্গে থাকা public business/context দেখুন। Address বা location source থাকলে সেটিও মিলিয়ে দেখুন।',bodyEn:'Find a place first, then review the public business and context attached to it. Cross-check the address or location source when provided.'},
      {headingBn:'ভুল location এড়ান',headingEn:'Avoid location mistakes',bodyBn:'একই বা কাছাকাছি নামের area থাকলে district ও upazila context মিলিয়ে নিন।',bodyEn:'When area names are duplicated or similar, confirm the district and upazila context.'},
    ],
  },
  {
    slug:'feni-investment-research',
    titleBn:'ফেনীতে বিনিয়োগের আগে কী কী তথ্য যাচাই করবেন',
    titleEn:'What to Check Before Considering an Investment in Feni',
    descriptionBn:'Opportunity, verification, evidence, risk ও due diligence নিয়ে responsible investment research guide।',
    descriptionEn:'A responsible research guide for opportunities, verification, evidence, risk and due diligence.',
    updated:'2026-09-21',
    tags:['Feni investment','ফেনীতে বিনিয়োগ','investment guide Feni'],
    sections:[
      {headingBn:'Verification কী বোঝায়',headingEn:'What verification means',bodyBn:'FeniX verification একটি নির্দিষ্ট তথ্য বা workflow review করা হয়েছে কি না বোঝায়; এটি profit, safety, government approval বা success guarantee নয়।',bodyEn:'FeniX verification indicates that a defined piece of information or workflow was reviewed; it is not a guarantee of profit, safety, government approval or success.'},
      {headingBn:'নিজে due diligence করুন',headingEn:'Do your own due diligence',bodyBn:'Business records, terms, ownership, cash flow assumptions, risks ও relevant official documents আলাদা করে যাচাই করুন।',bodyEn:'Check business records, terms, ownership, cash-flow assumptions, risks and relevant official documents separately.'},
    ],
  },
  {
    slug:'feni-services-directory',
    titleBn:'ফেনীর local services: ব্যবসা, supplier, guide ও community এক জায়গায়',
    titleEn:'Feni Local Services: Business, Suppliers, Guidance and Community',
    descriptionBn:'FeniX-এ business discovery, guidance, commerce, investment, profile ও community features কীভাবে একসাথে কাজ করে।',
    descriptionEn:'How FeniX connects business discovery, guidance, commerce, investment, profiles and community.',
    updated:'2026-09-21',
    tags:['FeniX','Feni services','Feni directory','Feni community'],
    sections:[
      {headingBn:'এক account, বহু প্রয়োজন',headingEn:'One account, many needs',bodyBn:'একটি account দিয়ে profile, feed, messages, business journey, directory, commerce ও investment workflow আলাদা service হিসেবে ব্যবহার করা যায়।',bodyEn:'One account connects profile, feed, messages, business journey, directory, commerce and investment workflows while keeping each service separate.'},
      {headingBn:'Community safety',headingEn:'Community safety',bodyBn:'Text-only feed, report system, moderation queue এবং user ban/suspend control রাখা হয়েছে যাতে public discussion আরও দায়িত্বশীল থাকে।',bodyEn:'The text-only feed, reporting system, moderation queue and user suspension/ban controls provide a structured foundation for responsible public discussion.'},
    ],
  },
]

  {
    slug:'feni-sadar-city-guide',
    titleBn:'ফেনী সদর শহর: বাজার, সেবা ও ব্যবসা খোঁজার local guide',
    titleEn:'Feni Sadar City: A Local Guide to Markets, Services and Business',
    descriptionBn:'ফেনী সদর শহরের বাজার, local services, business discovery ও গুরুত্বপূর্ণ context বোঝার public FeniX guide।',
    descriptionEn:'A public FeniX guide to markets, local services, business discovery and useful context around Feni Sadar.',
    updated:'2026-09-21',
    tags:['Feni Sadar','ফেনী সদর','Feni city','ফেনী শহর','Feni town'],
    sections:[
      {headingBn:'শহরভিত্তিকভাবে খুঁজুন',headingEn:'Search by city context',bodyBn:'“ফেনী শহরে কাপড়ের supplier”, “ফেনী সদরে restaurant”, “ফেনী শহরে business service”—এভাবে area + service লিখলে search ও directory result আরও নির্দিষ্ট করা যায়।',bodyEn:'Queries such as “clothing supplier in Feni city” or “business service in Feni Sadar” add city context and can make discovery more specific.'},
      {headingBn:'সেবা ও ব্যবসা আলাদা করে দেখুন',headingEn:'Keep services and businesses separate',bodyBn:'FeniX-এ Directory business discovery-এর জন্য, Feni Brain প্রশ্নের উত্তর ও guidance-এর জন্য, আর Feed community conversation-এর জন্য। একটার তথ্যকে আরেকটার official confirmation হিসেবে ধরা উচিত নয়।',bodyEn:'FeniX uses Directory for business discovery, Feni Brain for answers and guidance, and Feed for community conversation. One surface should not be treated as official confirmation of another.'},
      {headingBn:'Public তথ্যের দায়িত্বশীল ব্যবহার',headingEn:'Use public information responsibly',bodyBn:'কোনো ব্যক্তি বা ব্যবসার public profile থাকলেও ব্যক্তিগত বা সংবেদনশীল তথ্য অপ্রয়োজনে সংগ্রহ/শেয়ার করবেন না। সন্দেহজনক তথ্য Report করুন।',bodyEn:'A public profile does not make private or sensitive information appropriate to collect or share. Report suspicious information through FeniX controls.'},
    ],
  },

export const FENI_ARTICLE_SOURCES = { officialDistrictSource, bbsSource }
export function getFeniArticle(slug:string){ return FENI_ARTICLES.find(article=>article.slug===slug) ?? null }
