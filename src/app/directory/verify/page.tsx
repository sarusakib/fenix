'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, ShieldCheck } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

const TYPES = [
  ['identity','Identity reviewed','Explain what identity/business evidence you can provide for ownership review.'],
  ['phone','Phone verified','Describe how the listed business phone number can be confirmed.'],
  ['location','Location verified','Describe the public location evidence you can provide.'],
  ['business','Business reviewed','Describe the business evidence you can provide for a business review.'],
] as const

export default function DirectoryVerifyPage(){
  const [businessId,setBusinessId]=useState('')
  const [business,setBusiness]=useState<{id:string;name:string;title_bn:string|null;title_en:string|null;owner_id:string|null}|null>(null)
  const [type,setType]=useState<typeof TYPES[number][0]>('identity')
  const [note,setNote]=useState('')
  const [history,setHistory]=useState<any[]>([])
  const [busy,setBusy]=useState(false)
  const [loading,setLoading]=useState(true)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')

  useEffect(()=>{setBusinessId((new URLSearchParams(window.location.search).get('business')||'').trim())},[])
  useEffect(()=>{
    if(!businessId){setLoading(false);return}
    let active=true
    async function load(){
      const s=createClient()
      const {data:auth}=await s.auth.getUser()
      if(!auth.user){setLoading(false);setError('Please sign in first.');return}
      const [b,r]=await Promise.all([
        s.from('businesses').select('id,name,title_bn,title_en,owner_id').eq('id',businessId).maybeSingle(),
        s.from('business_verification_requests').select('id,verification_type,status,evidence_note,review_note,created_at,reviewed_at').eq('business_id',businessId).eq('requester_id',auth.user.id).order('created_at',{ascending:false}).limit(20),
      ])
      if(!active)return
      if(b.error||!b.data||b.data.owner_id!==auth.user.id){setError('You can request verification only for a business you own.');setLoading(false);return}
      setBusiness(b.data);setHistory(r.data??[]);setLoading(false)
    }
    void load();return()=>{active=false}
  },[businessId])

  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setMessage('');setError('')
    const s=createClient();const {data:auth}=await s.auth.getUser()
    if(!auth.user||!business){setBusy(false);setError('Please sign in and select your business.');return}
    const {data,error:e}=await s.from('business_verification_requests').insert({
      business_id:business.id,requester_id:auth.user.id,verification_type:type,evidence_note:note.trim().slice(0,3000),status:'pending'
    }).select('id,verification_type,status,evidence_note,created_at').single()
    if(e){setError(e.code==='23505'?'A request of this type is already under review.':'Verification request could not be submitted.')}
    else {setMessage('Verification request submitted for authorized review.');setHistory(v=>[data,...v]);setNote('')}
    setBusy(false)
  }

  return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"><Link href="/directory/manage" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Manage businesses</Link><div className="mt-7 rounded-[2rem] border border-black/10 bg-white/85 p-6 dark:border-white/10 dark:bg-white/[.045] sm:p-9"><div className="flex items-start gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]"><ShieldCheck size={22}/></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Verification</p><h1 className="mt-1 text-3xl font-black">Request business verification</h1><p className="mt-2 text-sm leading-6 opacity-60">Verification describes what FeniX reviewed. It is not government certification, a quality guarantee, or a promise of business success.</p></div></div>{loading?<div className="mt-8 h-24 animate-pulse rounded-2xl bg-black/[.03] dark:bg-white/[.04]"/>:business?<><form onSubmit={submit} className="mt-8 space-y-5"><div className="rounded-2xl bg-[#008080]/[.05] p-4"><p className="text-xs font-bold uppercase tracking-[.12em] opacity-50">Business</p><p className="mt-1 text-lg font-black">{business.title_bn||business.title_en||business.name}</p></div><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] opacity-50">Verification type</span><select value={type} onChange={e=>setType(e.target.value as typeof TYPES[number][0])} className="h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm dark:border-white/10 dark:bg-white/[.05]">{TYPES.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><p className="rounded-xl bg-black/[.025] p-3 text-xs leading-5 opacity-55 dark:bg-white/[.03]">{TYPES.find(x=>x[0]===type)?.[2]}</p><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] opacity-50">Evidence note</span><textarea required value={note} onChange={e=>setNote(e.target.value)} maxLength={3000} rows={6} className="w-full rounded-xl border border-black/10 bg-transparent p-3 text-sm leading-6 dark:border-white/10" placeholder="Do not paste passwords, OTPs, card numbers or unnecessary private information." /></label>{error&&<p className="rounded-xl bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200">{error}</p>}{message&&<p className="flex items-start gap-2 rounded-xl bg-[#008080]/[.06] p-3 text-sm text-[#007171]"><CheckCircle size={18} className="mt-0.5 shrink-0"/>{message}</p>}<button disabled={busy} className="min-h-12 rounded-xl bg-[#008080] px-5 text-sm font-black text-white disabled:opacity-50">{busy?'Submitting...':'Request review'}</button></form><div className="mt-8"><h2 className="text-xl font-black">Your request history</h2><div className="mt-4 space-y-3">{history.length?history.map(row=><article key={row.id} className="rounded-2xl border border-black/10 p-4 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="text-sm font-bold">{row.verification_type}</span><span className="rounded-full bg-black/[.035] px-2 py-1 text-[11px] font-bold dark:bg-white/[.06]">{row.status}</span></div><p className="mt-2 text-xs opacity-50">{new Date(row.created_at).toLocaleString('en-GB')}</p>{row.review_note&&<p className="mt-2 text-sm leading-6 opacity-60">{row.review_note}</p>}</article>):<p className="rounded-2xl bg-black/[.025] p-5 text-sm opacity-50 dark:bg-white/[.03]">No verification requests yet.</p>}</div></div></>:<div className="mt-8 rounded-xl bg-red-500/[.06] p-4 text-sm">{error||'Business not available.'}</div>}</div></section></main>
}
