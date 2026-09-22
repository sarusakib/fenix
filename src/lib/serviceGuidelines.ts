export type FeniXServiceGuideline = {
  titleBn: string
  titleEn: string
  introBn: string
  introEn: string
  stepsBn: readonly string[]
  stepsEn: readonly string[]
  noteBn: string
  noteEn: string
}

const common: FeniXServiceGuideline = {
  titleBn: 'সহজে এক ধাপ করে এগোন',
  titleEn: 'Move one step at a time',
  introBn: 'প্রথমে কী হবে বুঝে নিন, তারপর তথ্য দিন। প্রয়োজন ছাড়া কোনো অতিরিক্ত ধাপ দেখানো হবে না।',
  introEn: 'Understand the next step first, then provide only the information needed for that step.',
  stepsBn: ['উদ্দেশ্য ঠিক করুন', 'প্রয়োজনীয় তথ্য দিন', 'পরবর্তী ধাপ দেখুন', 'শেষে যাচাই করে জমা দিন'],
  stepsEn: ['Choose your goal', 'Provide only the needed information', 'Review the next step', 'Check everything before submitting'],
  noteBn: 'FeniX কোনো তথ্য বানিয়ে দেখাবে না; যেখানে যাচাই দরকার সেখানে উৎস/স্ট্যাটাস দেখানো হবে।',
  noteEn: 'FeniX should not invent facts; verification status and sources are shown where they matter.',
}

const GUIDES: Record<string, FeniXServiceGuideline> = {
  'start-business': {...common,titleBn:'ব্যবসা শুরু করার পথ',titleEn:'Start your business',stepsBn:['আপনার ব্যবসার ধরন ও লক্ষ্য ঠিক করুন','বাজেট ও অভিজ্ঞতা দিন','চাহিদা, প্রতিযোগিতা ও জায়গা যাচাই করুন','পরিকল্পনা ও করণীয় তালিকা তৈরি করুন','আইনি/লঞ্চ ধাপ একে একে সম্পন্ন করুন'],stepsEn:['Choose your business idea and goal','Add budget and experience','Check demand, competition and location','Generate your practical plan and tasks','Complete legal and launch steps one by one']},
  'business-journey': {...common,titleBn:'আপনার বিজনেস জার্নি',titleEn:'Business Journey',stepsBn:['যেখানে থেমেছিলেন সেখান থেকে শুরু করুন','বর্তমান ধাপ দেখুন','একটি কাজ সম্পন্ন করুন','তারপর পরের কাজটি খুলুন'],stepsEn:['Resume where you stopped','See the current stage','Complete one task','Then open the next task']},
  'business-identity': {...common,titleBn:'বিজনেস প্রোফাইল তৈরি',titleEn:'Business identity',stepsBn:['ব্যবসার নাম দিন','কী সেবা/পণ্য দেন তা লিখুন','লোকেশন ও যোগাযোগের public তথ্য দিন','Preview দেখে প্রকাশ করুন'],stepsEn:['Add the business name','Describe products or services','Add public location/contact details','Preview and publish']},
  'business-guide': {...common,titleBn:'Feni Brain দিয়ে গাইড',titleEn:'Guide with Feni Brain',stepsBn:['আপনার প্রশ্নটি স্বাভাবিক ভাষায় লিখুন','প্রয়োজনে এলাকা/বাজেট/সময় জানান','উত্তরের উৎস ও confidence দেখুন','প্রয়োজন হলে পরবর্তী service-এ যান'],stepsEn:['Ask your question naturally','Add place, budget or time when useful','Check sources and confidence','Continue to the relevant service when needed']},
  directory: {...common,titleBn:'ব্যবসা খুঁজুন',titleEn:'Find a business',stepsBn:['কী খুঁজছেন লিখুন','এলাকা বা category বাছুন','ফলাফল যাচাই করুন','প্রয়োজনে ব্যবসাটির trust/report অপশন ব্যবহার করুন'],stepsEn:['Describe what you need','Choose an area or category','Review the results','Use trust/report controls when needed']},
  suppliers: {...common,titleBn:'সাপ্লায়ার খুঁজুন',titleEn:'Find suppliers',stepsBn:['পণ্যের নাম/ধরন দিন','আপনার প্রয়োজন ও এলাকা দিন','মিল পাওয়া ব্যবসা দেখুন','যোগাযোগের আগে public তথ্য যাচাই করুন'],stepsEn:['Name the product or type','Add your need and area','Review matching businesses','Check public information before contacting']},
  requests: {...common,titleBn:'রিকোয়েস্ট অনুসরণ',titleEn:'Track requests',stepsBn:['আপনার request বাছুন','বর্তমান status দেখুন','FeniX-এর next action পড়ুন','প্রয়োজনে সংশ্লিষ্ট workflow খুলুন'],stepsEn:['Choose your request','See its current status','Read the next action','Open the related workflow when needed']},
  messages: {...common,titleBn:'সুরক্ষিত মেসেজ',titleEn:'Messages',stepsBn:['যাকে লিখবেন তার profile খুলুন','কেন যোগাযোগ করছেন সংক্ষেপে লিখুন','ব্যক্তিগত/গোপন তথ্য অযথা পাঠাবেন না','অস্বস্তিকর হলে report করুন'],stepsEn:['Open the person’s profile','Write why you are contacting them','Do not send unnecessary sensitive information','Report conversations that feel unsafe']},
  investment: {...common,titleBn:'ফেনীতে বিনিয়োগ',titleEn:'Invest in Feni',stepsBn:['অপরচুনিটি পড়ুন','ব্যবসা ও verification তথ্য দেখুন','ঝুঁকি ও evidence পড়ুন','প্রশ্ন করুন ও due diligence করুন','নিজের সিদ্ধান্ত নিজে নিন'],stepsEn:['Read the opportunity','Review business and verification information','Read risks and evidence','Ask questions and do due diligence','Make your own decision']},
  'investor-profile': {...common,titleBn:'ইনভেস্টর প্রোফাইল',titleEn:'Investor profile',stepsBn:['আপনার investment interest দিন','অভিজ্ঞতা/পছন্দ যুক্ত করুন','Verification হলে status দেখুন','পরে profile আপডেট করুন'],stepsEn:['Add investment interests','Add experience/preferences','See verification status when applicable','Update the profile later']},
  'investment-workspace': {...common,titleBn:'ইনভেস্টমেন্ট ওয়ার্কস্পেস',titleEn:'Investment workspace',stepsBn:['আগ্রহের opportunity খুলুন','আপনার status দেখুন','Messages/requests এক জায়গায় রাখুন','প্রতিটি সিদ্ধান্তের আগে evidence দেখুন'],stepsEn:['Open an interested opportunity','See your status','Keep messages and requests together','Review evidence before each decision']},
  'scenario-calculator': {...common,titleBn:'সিনারিও ক্যালকুলেটর',titleEn:'Scenario calculator',stepsBn:['প্রাথমিক টাকা/খরচ দিন','আয়ের অনুমান দিন','বিভিন্ন scenario তুলনা করুন','ফলাফলকে guarantee হিসেবে ধরবেন না'],stepsEn:['Add starting capital/costs','Add revenue assumptions','Compare scenarios','Do not treat outputs as guarantees']},
  'shop-local': {...common,titleBn:'লোকাল শপ',titleEn:'Shop Local',stepsBn:['পণ্য খুঁজুন','দাম/স্টক দেখুন','কার্টে যোগ করুন','Checkout-এর আগে order summary যাচাই করুন'],stepsEn:['Find a product','Review price/stock','Add to cart','Check the order summary before checkout']},
  cart: {...common,titleBn:'কার্ট',titleEn:'Cart',stepsBn:['পণ্য ও quantity যাচাই করুন','প্রয়োজনে item সরান/পরিমাণ বদলান','Checkout-এ যান'],stepsEn:['Review products and quantity','Edit or remove items','Continue to checkout']},
  orders: {...common,titleBn:'অর্ডার ট্র্যাক',titleEn:'Track orders',stepsBn:['অর্ডার বাছুন','Status দেখুন','Delivery তথ্য যাচাই করুন','সমস্যা হলে সংশ্লিষ্ট support/report পথ ব্যবহার করুন'],stepsEn:['Choose an order','Check its status','Verify delivery information','Use the relevant support/report path when needed']},
  sell: {...common,titleBn:'FeniX-এ বিক্রি করুন',titleEn:'Sell on FeniX',stepsBn:['Seller হওয়া সম্পর্কে গাইড পড়ুন','ব্যবসার তথ্য দিন','Approval/verification status দেখুন','Approved হলে shop সেটআপ করুন'],stepsEn:['Read the seller guide','Add business information','Check approval/verification status','Set up the shop after approval']},
  brain: {...common,titleBn:'FeniX Brain',titleEn:'FeniX Brain',stepsBn:['প্রশ্ন করুন','প্রশ্নের intent অনুযায়ী উত্তর নিন','প্রমাণ/উৎস দেখুন','প্রয়োজনে service খুলুন'],stepsEn:['Ask a question','Get an intent-aware answer','Review evidence/sources','Open the relevant service when needed']},
  jobs: {...common,titleBn:'চাকরি ও কাজ',titleEn:'Jobs & work',stepsBn:['কাজের ধরন লিখুন','এলাকা ও প্রয়োজন বাছুন','পোস্ট/সুযোগ যাচাই করুন','প্রয়োজনে profile/message দিয়ে যোগাযোগ করুন'],stepsEn:['Describe the work you need','Choose area and need','Review the opportunity','Contact through profile/message when needed']},
  radar: {...common,titleBn:'অপর্চুনিটি রাডার',titleEn:'Opportunity Radar',stepsBn:['আপনার interest বাছুন','এলাকা বাছুন','signal ও evidence দেখুন','তারপর relevant service-এ যান'],stepsEn:['Choose your interest','Choose an area','Review signals and evidence','Continue to the relevant service']},
  map: {...common,titleBn:'ফেনী ম্যাপ',titleEn:'Feni Map',stepsBn:['এলাকা বা business খুঁজুন','Map result খুলুন','Public তথ্য যাচাই করুন','প্রয়োজনে directory profile খুলুন'],stepsEn:['Search an area or business','Open the map result','Review public information','Open the directory profile when needed']},
  policy: {...common,titleBn:'FeniX Policy',titleEn:'FeniX Policy',stepsBn:['যে policy দরকার সেটি খুলুন','প্রযোজ্য rule পড়ুন','প্রয়োজনে report/support ব্যবহার করুন'],stepsEn:['Open the policy you need','Read the relevant rules','Use report/support when needed']},
  verification: {...common,titleBn:'ভেরিফিকেশন বুঝুন',titleEn:'Verification',stepsBn:['কোন তথ্য যাচাই হয়েছে দেখুন','কোন তথ্য এখনও যাচাই হয়নি বুঝুন','Badge-কে guarantee ভাববেন না'],stepsEn:['See what was verified','See what is not verified','Do not treat a badge as a guarantee']},
  claim: {...common,titleBn:'ব্যবসা ক্লেইম',titleEn:'Claim a business',stepsBn:['ব্যবসা বাছুন','আপনার সম্পর্কের তথ্য দিন','Review-এর জন্য পাঠান','Reviewer-এর status দেখুন'],stepsEn:['Choose the business','Explain your relationship','Submit for review','Track reviewer status']},
  care: {...common,titleBn:'FeniX জরুরি সেবা',titleEn:'FeniX Care',stepsBn:['Blood বা ambulance প্রয়োজন ঠিক করুন','Area/Upazila ও প্রয়োজনীয় তথ্য দিন','Public information ও verification status দেখুন','জরুরি অবস্থায় provider/hospital-এর current availability সরাসরি নিশ্চিত করুন'],stepsEn:['Choose blood or ambulance help','Add area/upazila and only the needed information','Review public information and verification state','For emergencies, directly confirm current provider/hospital availability'],noteBn:'FeniX medical diagnosis বা emergency dispatch replacement নয়।',noteEn:'FeniX is not a medical diagnosis or emergency dispatch replacement.'},
  'blood-help': {...common,titleBn:'রক্ত সহায়তা',titleEn:'Blood Help',stepsBn:['Blood group ও units দিন','Hospital/area ও প্রয়োজনের সময় দিন','Open request দেখুন বা donor profile opt-in করুন','Response পাওয়ার আগে প্রয়োজনীয় তথ্য যাচাই করুন'],stepsEn:['Add blood group and units','Add hospital/area and needed time','Browse open requests or opt in as a donor','Verify important details before responding']},
  ambulance: {...common,titleBn:'অ্যাম্বুল্যান্স',titleEn:'Ambulance',stepsBn:['Pickup area ও destination দিন','Patient condition ও ambulance type দিন','Provider-এর service details দেখুন','Call/availability সরাসরি confirm করুন'],stepsEn:['Add pickup area and destination','Choose patient condition and ambulance type','Review provider service details','Call and confirm current availability directly']},
  pulse: {...common,titleBn:'ফেনী পালস',titleEn:'Feni Pulse',stepsBn:['Observed signal দেখুন','Time window বুঝে পড়ুন','Signal-কে prediction ভাববেন না','প্রয়োজনে Brain বা Directory-তে deep dive করুন'],stepsEn:['Review observed signals','Check the time window','Do not treat a signal as a prediction','Open Brain or Directory for deeper context']},
  'admin-trust': {...common,titleBn:'ট্রাস্ট সেন্টার',titleEn:'Trust Center',stepsBn:['Queue দেখুন','Evidence পড়ুন','Approve/reject/report resolve করুন','User moderation প্রয়োজন হলে আলাদা action নিন'],stepsEn:['Review the queue','Read evidence','Approve/reject/resolve reports','Use user moderation separately when required']},
  workspace: {...common,titleBn:'আমার ওয়ার্কস্পেস',titleEn:'My workspace',stepsBn:['আপনার current tasks দেখুন','যে service দরকার সেটি খুলুন','Progress অনুসরণ করুন'],stepsEn:['See current tasks','Open the service you need','Track progress']},
  business: {...common,titleBn:'আমার ব্যবসা',titleEn:'My business',stepsBn:['আপনার business profile খুলুন','তথ্য আপডেট করুন','Trust/verification status দেখুন'],stepsEn:['Open your business profile','Update information','Review trust/verification status']},
  notifications: {...common,titleBn:'নোটিফিকেশন',titleEn:'Notifications',stepsBn:['নতুন activity পড়ুন','প্রয়োজনীয় item খুলুন','অপ্রয়োজনীয় notification dismiss করুন'],stepsEn:['Read new activity','Open the relevant item','Dismiss what you do not need']},
  settings: {...common,titleBn:'সেটিংস',titleEn:'Settings',stepsBn:['Language ঠিক করুন','Theme ও accessibility সেট করুন','Privacy/message/feed preference ঠিক করুন'],stepsEn:['Set your language','Choose theme and accessibility','Set privacy/message/feed preferences']},
  help: {...common,titleBn:'হেল্প ও সেফটি',titleEn:'Help & Safety',stepsBn:['প্রশ্নটি খুঁজুন','নিরাপত্তা নির্দেশনা পড়ুন','প্রয়োজনে report/support ব্যবহার করুন'],stepsEn:['Find your question','Read the safety guidance','Use report/support when needed']},
}

export function getServiceGuideline(serviceId: string) {
  return GUIDES[serviceId] ?? common
}

export const serviceGuidelines = GUIDES
