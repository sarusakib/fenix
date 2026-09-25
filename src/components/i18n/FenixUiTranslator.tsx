'use client'

import { useEffect } from 'react'
import { useFenixLocale } from './FenixLocaleProvider'

const BN: Record<string,string> = {
  'Feni Business Ecosystem':'ফেনীর ব্যবসা ও স্থানীয় ইকোসিস্টেম',
  'Build. Connect. Grow.':'গড়ুন। সংযুক্ত হন। এগিয়ে যান।',
  Home:'হোম', Search:'সার্চ', Messages:'বার্তা', Message:'বার্তা', Network:'নেটওয়ার্ক',
  Brain:'ব্রেইন', Invest:'বিনিয়োগ', Profile:'প্রোফাইল', Logout:'লগআউট', Login:'লগইন',
  Account:'অ্যাকাউন্ট', Notifications:'নোটিফিকেশন', Settings:'সেটিংস', Language:'ভাষা',
  Appearance:'চেহারা ও প্রদর্শন', 'Edit profile':'প্রোফাইল সম্পাদনা', 'My Profile':'আমার প্রোফাইল',
  'View public profile':'সবার জন্য প্রোফাইল দেখুন', 'Copy link':'লিংক কপি করুন',
  'Save profile':'প্রোফাইল সংরক্ষণ করুন', 'Saving…':'সংরক্ষণ হচ্ছে…', Name:'নাম',
  Username:'ইউজারনেম', Location:'এলাকা', Website:'ওয়েবসাইট', Bio:'পরিচিতি',
  'Profile visibility':'প্রোফাইলের দৃশ্যমানতা', Public:'সবার জন্য', Private:'ব্যক্তিগত',
  'Who can message you':'কে আপনাকে বার্তা পাঠাতে পারবে', Everyone:'সবাই',
  'Authenticated users':'লগইন করা ব্যবহারকারী', Nobody:'কেউ না', 'Feed visibility':'ফিডের দৃশ্যমানতা',
  Light:'লাইট', Dark:'ডার্ক', System:'ডিভাইস অনুসরণ', 'Reduced motion':'কম অ্যানিমেশন',
  'Help & Safety':'সহায়তা ও নিরাপত্তা', 'Privacy & Policy':'গোপনীয়তা ও নীতিমালা',
  Verification:'যাচাই', Inbox:'ইনবক্স', 'New message':'নতুন বার্তা', Send:'পাঠান',
  'Sending…':'পাঠানো হচ্ছে…', Reply:'জবাব', Edit:'সম্পাদনা', Report:'অভিযোগ করুন',
  'Delete for me':'শুধু আমার কাছ থেকে মুছুন', 'Unsend for everyone':'সবার কাছ থেকে প্রত্যাহার করুন',
  'Block new messages':'নতুন বার্তা বন্ধ করুন', 'Unblock person':'ব্যক্তিকে আনব্লক করুন',
  'Clear conversation':'আলাপ মুছুন', 'Search conversations':'আলাপ খুঁজুন',
  'Search in this chat':'এই আলাপে খুঁজুন', 'Private • protected':'ব্যক্তিগত • সুরক্ষিত',
  'Active now':'এখন সক্রিয়', 'typing…':'লিখছে…', Attachment:'সংযুক্তি', File:'ফাইল',
  Photo:'ছবি', Video:'ভিডিও', 'Voice message':'ভয়েস বার্তা', 'Shared location':'শেয়ার করা অবস্থান',
  'Enable notifications':'নোটিফিকেশন চালু করুন', Emoji:'ইমোজি', 'FeniX Messages':'ফেনীএক্স বার্তা',
  'FeniX user':'ফেনীএক্স ব্যবহারকারী', 'Write a message…':'বার্তা লিখুন…',
  'Work & opportunity':'কাজ ও সুযোগ', 'Verified jobs & local work':'যাচাইকৃত চাকরি ও স্থানীয় কাজ',
  'Post a job':'চাকরি প্রকাশ করুন', 'Full-time':'পূর্ণকালীন', 'Part-time':'খণ্ডকালীন',
  Internship:'ইন্টার্নশিপ', Freelance:'ফ্রিল্যান্স', Temporary:'অস্থায়ী',
  'Reviewed posting':'পর্যালোচিত পোস্ট', Explore:'অন্বেষণ',
  'Everything FeniX can help you do.':'ফেনীএক্স দিয়ে আপনি যা যা করতে পারেন।',
  'Trust is visible':'বিশ্বাসযোগ্যতার তথ্য দৃশ্যমান', 'Read policy':'নীতিমালা পড়ুন',
  'More tools when you need them.':'প্রয়োজনে আরও টুল ব্যবহার করুন।',
  'Start here':'এখান থেকে শুরু করুন', 'Start a Business':'ব্যবসা শুরু করুন',
  'Start with a business idea':'ব্যবসার ধারণা দিয়ে শুরু করুন', 'Find something local':'স্থানীয় কিছু খুঁজুন',
  'Find & Connect':'খুঁজুন ও সংযুক্ত হন', 'Invest in Feni':'ফেনীতে বিনিয়োগ', 'Shop Local':'স্থানীয় পণ্য কিনুন',
  'Four core jobs. One network.':'চারটি মূল কাজ। একটি নেটওয়ার্ক।',
  'What are you trying to do?':'আপনি কী করতে চান?', 'Source-aware':'উৎসভিত্তিক',
  'Trust layer':'বিশ্বাসের স্তর', 'Next step':'পরবর্তী ধাপ',
  News:'সংবাদ', Latest:'সর্বশেষ', Local:'স্থানীয়', Business:'ব্যবসা', Jobs:'চাকরি',
  Events:'ইভেন্ট', 'Public Notice':'জনসাধারণের বিজ্ঞপ্তি', 'FeniX Update':'ফেনীএক্স আপডেট',
  'Read story':'সংবাদ পড়ুন', All:'সব', Businesses:'ব্যবসা', Products:'পণ্য', Places:'স্থান',
  'Open map':'মানচিত্র খুলুন', 'Verified seller':'যাচাইকৃত বিক্রেতা',
  'Location reviewed':'অবস্থান পর্যালোচিত', 'No content yet.':'এখনও কোনো কনটেন্ট নেই।',
  Following:'অনুসরণ করছি', 'For You':'আপনার জন্য', Questions:'প্রশ্ন', Answers:'উত্তর',
  Share:'শেয়ার', Save:'সংরক্ষণ', Publish:'প্রকাশ করুন', Topic:'বিষয়', Helpful:'উপকারী',
  'Read News':'সংবাদ পড়ুন', 'Ask Question':'প্রশ্ন করুন', 'Your settings':'আপনার সেটিংস',
  'Your account':'আপনার অ্যাকাউন্ট', 'Loading…':'লোড হচ্ছে…',
  'You’re caught up.':'আপনি সব নতুন সংবাদ দেখে ফেলেছেন।',
  'No published stories yet.':'এখনও কোনো প্রকাশিত সংবাদ নেই।'
}


const entries=Object.entries(BN).sort((a,b)=>b[0].length-a[0].length)
const tr=(value:string)=>entries.reduce((s,[a,b])=>s.includes(a)?s.split(a).join(b):s,value)
const textOriginals=new WeakMap<Text,string>()
const attrOriginals=new WeakMap<Element,Record<string,string>>()

export default function FenixUiTranslator(){
  const {locale}=useFenixLocale()
  useEffect(()=>{
    const skip=(node:Node)=>Boolean(node.parentElement?.closest('script,style,input,textarea,select,option,pre,code,[data-fx-raw]'))
    const run=()=>{
      const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT)
      const nodes:Text[]=[]
      while(w.nextNode()) nodes.push(w.currentNode as Text)
      nodes.forEach(node=>{
        if(skip(node)) return
        const current=node.nodeValue||''
        const saved=textOriginals.get(node)
        if(locale==='bn'){
          const original=saved===undefined || current!==tr(saved) ? current : saved
          textOriginals.set(node,original)
          const next=tr(original)
          if(next!==current) node.nodeValue=next
        }else if(saved!==undefined && current!==saved){
          node.nodeValue=saved
        }
      })
      document.querySelectorAll('input[placeholder],textarea[placeholder],[aria-label],[title]').forEach(el=>{
        if((el as Element).matches('[data-fx-raw]')) return
        const saved=attrOriginals.get(el)||{}
        const nextSaved={...saved}
        for(const attr of ['placeholder','aria-label','title']){
          const value=el.getAttribute(attr)
          if(value===null) continue
          if(nextSaved[attr]===undefined || value!==tr(nextSaved[attr])) nextSaved[attr]=value
          const original=nextSaved[attr]
          const next=locale==='bn'?tr(original):original
          if(value!==next) el.setAttribute(attr,next)
        }
        attrOriginals.set(el,nextSaved)
      })
    }
    let raf=0
    const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(run)}
    run()
    const mo=new MutationObserver(schedule)
    mo.observe(document.body,{subtree:true,childList:true})
    return()=>{mo.disconnect();cancelAnimationFrame(raf)}
  },[locale])
  return null
}
