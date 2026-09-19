'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, ShieldCheck } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

export default function DirectoryClaimPage(){
  const [businessId,setBusinessId]=useState('')
  const [business,setBusiness]=useState<{id:string;name:string;title_bn:string|null;title_en:string|null}|null>(null)
  const [note,setNote]=useState('')
  const [loading,setLoading]=useState(true)
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search)
    setBusinessId((params.get('business')||'').trim())
  },[])
  useEffect(()=>{
    if(!businessId){setLoading(false);return}
    let active=true
    async function load(){
      const s=createClient()
      const {data,error}=await s.from('businesses').select('id,name,title_bn,title_en').eq('id',businessId).maybeSingle()
      if(!active)return
      if(error||!data)setError('Business could not be found.')
      else setBusiness(data)
      setLoading(false)
    }
    void load()
    return()=>{active=false}
  },[businessId])

  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setError('');setMessage('')
    const s=createClient();const {data:auth}=await s.auth.getUser()
    if(!auth.user){setBusy(false);setError('Please sign in first.');return}
    if(!businessId){setBusy(false);setError('Choose a business first.');return}
    const {error:e}=await s.from('business_claim_requests').insert({business_id:businessId,claimant_id:auth.user.id,note:note.trim().slice(0,2000),status:'pending'})
    if(e){setError(e.code==='23505'?'A pending claim already exists for this business.':'Claim request could not be submitted right now.')}
    else {setMessage('Claim submitted. An authorized FeniX reviewer must approve it before ownership is shown as reviewed.');setNote('')}
    setBusy(false)
  }

  return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"><Link href="/directory/manage" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Manage businesses</Link><div className="mt-7 rounded-[2rem] border border-black/10 bg-white/85 p-6 dark:border-white/10 dark:bg-white/[.045] sm:p-9"><div className="flex items-start gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]"><ShieldCheck size={22}/></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Trust workflow</p><h1 className="mt-1 text-3xl font-black">Claim a business</h1><p className="mt-2 text-sm leading-6 opacity-60">A claim is a request for ownership review. It does not create a verification guarantee.</p></div></div>{loading?<div className="mt-8 h-24 animate-pulse rounded-2xl bg-black/[.03] dark:bg-white/[.04]"/>:business?<form onSubmit={submit} className="mt-8 space-y-5"><div className="rounded-2xl bg-[#008080]/[.05] p-4"><p className="text-xs font-bold uppercase tracking-[.12em] opacity-50">Business</p><p className="mt-1 text-lg font-black">{business.title_bn||business.title_en||business.name}</p></div><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] opacity-50">Why should this be linked to you?</span><textarea value={note} onChange={e=>setNote(e.target.value)} maxLength={2000} rows={6} className="w-full rounded-xl border border-black/10 bg-transparent p-3 text-sm leading-6 outline-none focus:border-[#008080]/40 dark:border-white/10" placeholder="Describe your relationship to this business or what evidence you can provide." /></label>{error&&<p className="rounded-xl bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200">{error}</p>}{message&&<p className="flex items-start gap-2 rounded-xl bg-[#008080]/[.06] p-3 text-sm text-[#007171]"><CheckCircle size={18} className="mt-0.5 shrink-0"/>{message}</p>}<button disabled={busy} className="min-h-12 rounded-xl bg-[#008080] px-5 text-sm font-black text-white disabled:opacity-50">{busy?'Submitting...':'Submit claim request'}</button></form>:<div className="mt-8 rounded-2xl bg-red-500/[.06] p-4 text-sm">{error||'Business not found.'}</div>}</div></section></main>
}
