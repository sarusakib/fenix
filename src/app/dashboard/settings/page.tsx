'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Bell, CheckCircle, GearSix, Globe, LockKey, Moon, Palette, ShieldCheck, Sun, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { useHomeTheme, type HomeTheme } from '@/components/theme/HomeThemeProvider'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { createClient } from '@/utils/supabase/client'

const THEMES: Array<{key:HomeTheme;label:string;icon:typeof Sun}>=[
 {key:'light',label:'Light',icon:Sun},{key:'system',label:'System',icon:Palette},{key:'dark',label:'Dark',icon:Moon}
]

export default function DashboardSettingsPage(){
 const {theme,setTheme}=useHomeTheme()
 const {locale,setLocale}=useFenixLocale()
 const [userId,setUserId]=useState('')
 const [visibility,setVisibility]=useState<'public'|'private'>('public')
 const [messagePermissions,setMessagePermissions]=useState<'everyone'|'authenticated'|'nobody'>('everyone')
 const [feedVisibility,setFeedVisibility]=useState<'public'|'authenticated'>('public')
 const [reducedMotion,setReducedMotion]=useState(false)
 const [notice,setNotice]=useState('')

 useEffect(()=>{
  let active=true
  async function load(){
   const s=createClient(); const {data:auth}=await s.auth.getUser()
   if(!auth.user){if(active)window.location.replace('/login?next=/dashboard/settings');return}
   setUserId(auth.user.id)
   const {data}=await s.from('profile_settings').select('theme,reduced_motion,profile_visibility,message_permissions,feed_visibility,locale').eq('user_id',auth.user.id).maybeSingle()
   if(!active||!data)return
   if(['light','dark','system'].includes(data.theme)) setTheme(data.theme as HomeTheme)
   setReducedMotion(Boolean(data.reduced_motion))
   if(data.profile_visibility==='private')setVisibility('private')
   if(data.message_permissions==='everyone'||data.message_permissions==='authenticated'||data.message_permissions==='nobody')setMessagePermissions(data.message_permissions)
   if(data.feed_visibility==='authenticated')setFeedVisibility('authenticated')
   if(data.locale==='bn'||data.locale==='en')setLocale(data.locale)
  }
  void load(); return ()=>{active=false}
 },[setLocale,setTheme])

 const update=async(patch:Record<string,unknown>,success?:string)=>{
  if(!userId)return
  const s=createClient()
  const {error}=await s.from('profile_settings').update({...patch,updated_at:new Date().toISOString()}).eq('user_id',userId)
  if(error)setNotice(locale==='bn'?'Setting save করা যায়নি।':'Setting could not be saved.')
  else if(success)setNotice(success)
 }

 const chooseTheme=(next:HomeTheme)=>{setTheme(next);void update({theme:next})}
 const chooseMotion=(next:boolean)=>{setReducedMotion(next);try{localStorage.setItem('fenix-reduce-motion',String(next));document.documentElement.dataset.reduceMotion=next?'true':'false'}catch{};void update({reduced_motion:next})}

 const bn=locale==='bn'
 return <main className="min-h-dvh">
  <Navbar/>
  <section className="mx-auto max-w-4xl px-4 pb-28 pt-7 sm:px-6">
   <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> {bn?'অ্যাকাউন্ট':'Account'}</Link>
   <div className="mt-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">Settings</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">{bn?'আপনার সেটিংস':'Your settings'}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">{bn?'Account, profile, privacy, language, notification ও safety—সব আলাদা করে সহজে নিয়ন্ত্রণ করুন।':'Account, profile, privacy, language, notifications and safety are separated into simple controls.'}</p></div>

   <div className="mt-7 space-y-4">
    <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
     <SectionHead icon={<UserCircle size={21}/>} title={bn?'আপনার account':'Your account'} text={bn?'Profile ও message-এ যাওয়ার দ্রুত পথ।':'Quick access to your profile and messaging.'}/>
     <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <Action href="/profile" title={bn?'Profile edit':'Edit profile'} body={bn?'নাম, username, bio ও public তথ্য ঠিক করুন।':'Manage name, username, bio and public details.'}/>
      <Action href="/messages" title={bn?'Messages':'Messages'} body={bn?'আপনার নিরাপদ direct messages দেখুন।':'Open your protected direct messages.'}/>
      <Action href="/feed" title={bn?'Feed':'Feed'} body={bn?'শুধু লেখা post দেখা ও প্রকাশ করুন।':'View and publish text-only posts.'}/>
      <Action href="/notifications" title={bn?'Notifications':'Notifications'} body={bn?'Account ও ecosystem activity দেখুন।':'Review account and ecosystem activity.'}/>
     </div>
    </section>

    <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
     <SectionHead icon={<Globe size={21}/>} title={bn?'Language':'Language'} text={bn?'FeniX-এর shared UI preference ঠিক করুন।':'Choose the shared FeniX interface language.'}/>
     <div className="mt-5 grid grid-cols-2 gap-2">
      <button type="button" onClick={()=>{setLocale('bn');void update({locale:'bn'},'ভাষা বাংলা করা হয়েছে।')}} className={'min-h-12 rounded-xl border text-sm font-bold '+(locale==='bn'?'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>বাংলা</button>
      <button type="button" onClick={()=>{setLocale('en');void update({locale:'en'},'Language set to English.')}} className={'min-h-12 rounded-xl border text-sm font-bold '+(locale==='en'?'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}>English</button>
     </div>
    </section>

    <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
     <SectionHead icon={<Palette size={21}/>} title={bn?'Appearance':'Appearance'} text={bn?'Light, dark বা device preference।':'Light, dark or device preference.'}/>
     <div className="mt-5 grid grid-cols-3 gap-2">{THEMES.map(({key,label,icon:Icon})=><button key={key} type="button" onClick={()=>chooseTheme(key)} aria-pressed={theme===key} className={'flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-bold '+(theme===key?'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]':'border-[var(--fx-border)]')}><Icon size={18}/>{label}</button>)}</div>
     <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[var(--fx-border)] p-4"><div><p className="text-sm font-bold">{bn?'Reduced motion':'Reduced motion'}</p><p className="mt-1 text-xs text-[var(--fx-muted)]">{bn?'Animation কমিয়ে দিন।':'Reduce extra motion and transitions.'}</p></div><button type="button" role="switch" aria-checked={reducedMotion} onClick={()=>chooseMotion(!reducedMotion)} className={'relative h-7 w-12 shrink-0 rounded-full '+(reducedMotion?'bg-[var(--fx-primary)]':'bg-black/10 dark:bg-white/10')}><span className={'absolute top-1 h-5 w-5 rounded-full bg-white transition '+(reducedMotion?'left-6':'left-1')}/></button></div>
    </section>

    <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
     <SectionHead icon={<LockKey size={21}/>} title={bn?'Privacy & visibility':'Privacy & visibility'} text={bn?'আপনার public identity ও community visibility নিয়ন্ত্রণ করুন।':'Control public identity and community visibility.'}/>
     <div className="mt-5 grid gap-4 sm:grid-cols-3">
      <Select label={bn?'Profile':'Profile'} value={visibility} onChange={v=>{setVisibility(v as typeof visibility);void update({profile_visibility:v})}} options={[['public','Public'],['private',bn?'Private':'Private']]}/>
      <Select label={bn?'Message':'Messages'} value={messagePermissions} onChange={v=>{setMessagePermissions(v as typeof messagePermissions);void update({message_permissions:v})}} options={[['everyone',bn?'Everyone':'Everyone'],['authenticated',bn?'Logged-in users':'Authenticated users'],['nobody',bn?'Nobody':'Nobody']]}/>
      <Select label={bn?'Feed':'Feed'} value={feedVisibility} onChange={v=>{setFeedVisibility(v as typeof feedVisibility);void update({feed_visibility:v})}} options={[['public','Public'],['authenticated',bn?'Logged-in users':'Authenticated users']]}/>
     </div>
    </section>

    <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
     <SectionHead icon={<ShieldCheck size={21}/>} title={bn?'Safety & control':'Safety & control'} text={bn?'Report, policy, verification ও support এখান থেকে পাওয়া যাবে।':'Access reporting, policy, verification and help.'}/>
     <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <Action href="/help" title={bn?'Help & Safety':'Help & Safety'} body={bn?'ব্যবহার ও নিরাপত্তার সহজ guide।':'Simple usage and safety guidance.'}/>
      <Action href="/policy" title={bn?'Privacy & Policy':'Privacy & Policy'} body={bn?'Privacy, trust ও responsible AI rules।':'Privacy, trust and responsible AI rules.'}/>
      <Action href="/directory/verify" title={bn?'Verification':'Verification'} body={bn?'কোন তথ্য যাচাই হয়েছে বুঝুন।':'Understand what verification labels mean.'}/>
      <Action href="/admin/trust" title={bn?'Admin Trust':'Admin Trust'} body={bn?'শুধু অনুমোদিত admin account-এর জন্য।':'For authorized admin accounts only.'}/>
     </div>
    </section>
   </div>
   {notice&&<p className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-sm"><CheckCircle size={17}/>{notice}</p>}
  </section>
 </main>
}

function SectionHead({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">{icon}</div><div><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-sm leading-6 text-[var(--fx-muted)]">{text}</p></div></div>}
function Action({href,title,body}:{href:string;title:string;body:string}){return <Link href={href} className="rounded-2xl border border-[var(--fx-border)] p-4 transition hover:bg-black/[.02] dark:hover:bg-white/[.03]"><p className="font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{body}</p></Link>}
function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[][]}){return <label className="block"><span className="text-xs font-bold">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>}
