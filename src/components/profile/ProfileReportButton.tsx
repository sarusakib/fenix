'use client'

import { useState } from 'react'
import { Flag } from '@phosphor-icons/react'
import { createClient } from '@/utils/supabase/client'

export default function ProfileReportButton({ profileId, locale='bn' }: { profileId:string; locale?:'bn'|'en' }) {
 const [open,setOpen]=useState(false)
 const [reason,setReason]=useState('')
 const [status,setStatus]=useState('')
 const [busy,setBusy]=useState(false)
 async function submit(){
  const clean=reason.trim(); if(!clean)return
  setBusy(true);setStatus('')
  const s=createClient();const {data:auth}=await s.auth.getUser()
  if(!auth.user){setStatus(locale==='bn'?'Report করতে login করুন।':'Please sign in to report.');setBusy(false);return}
  const {error}=await s.from('fenix_content_reports').insert({reporter_id:auth.user.id,content_type:'user',content_id:profileId,reason:clean.slice(0,120),details:clean.slice(0,2000)})
  if(error)setStatus(locale==='bn'?'Report পাঠানো যায়নি।':'Could not submit the report.')
  else {setReason('');setStatus(locale==='bn'?'Report admin review queue-তে গেছে।':'Report sent to the admin review queue.');setOpen(false)}
  setBusy(false)
 }
 return <div className="mt-3">
  <button type="button" onClick={()=>setOpen(v=>!v)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-500/15 px-3 text-xs font-bold text-red-700 dark:text-red-300"><Flag size={15}/>{locale==='bn'?'Report profile':'Report profile'}</button>
  {open&&<div className="mt-3 rounded-2xl border border-red-500/15 bg-red-500/[.035] p-4">
   <textarea value={reason} onChange={e=>setReason(e.target.value)} maxLength={2000} rows={3} placeholder={locale==='bn'?'কী সমস্যা হয়েছে লিখুন':'Describe the problem'} className="w-full rounded-xl border border-red-500/15 bg-transparent p-3 text-xs leading-6"/>
   <div className="mt-2 flex gap-2"><button type="button" disabled={busy||!reason.trim()} onClick={()=>void submit()} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">{busy?'Sending…':locale==='bn'?'Report পাঠান':'Send report'}</button><button type="button" onClick={()=>setOpen(false)} className="rounded-lg border border-[var(--fx-border)] px-3 py-2 text-xs font-bold">{locale==='bn'?'Cancel':'Cancel'}</button></div>
  </div>}
  {status&&<p className="mt-2 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-xs leading-5">{status}</p>}
 </div>
}