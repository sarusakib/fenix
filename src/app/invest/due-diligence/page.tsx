'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, FileText, MagnifyingGlass, ShieldCheck, WarningCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { formatBDT, opportunityTitle, riskLabel, statusLabel } from '@/lib/investment'

const CHECKS = [
  ['identity', 'Owner / identity', 'Who owns or controls the business? Review identity evidence and ownership records where available.'],
  ['registration', 'Business registration', 'Review registration, trade licence or other relevant legal records.'],
  ['location', 'Location', 'Confirm the operating location and whether the public location information matches the opportunity.'],
  ['financials', 'Financial information', 'Review supplied financial statements, revenue/profit history and assumptions.'],
  ['documents', 'Supporting documents', 'Review all approved documents and check dates, scope and consistency.'],
  ['terms', 'Investment terms', 'Review structure, minimum amount, ownership/profit-share/loan terms and timeline.'],
  ['risks', 'Risk disclosure', 'Read risks, downside scenarios and what could cause loss or delay.'],
  ['questions', 'Open questions', 'Write unresolved questions and get them answered before making a decision.'],
] as const

type Opportunity = {
  id:string
  title_bn:string
  title_en:string
  description_bn:string|null
  category:string
  district:string
  upazila:string
  target_amount:number
  min_investment:number
  raised_amount:number
  risk_level:string
  verification_status:string
  status:string
}

type Check = { id:string; check_key:string; status:string; note:string|null; updated_at:string }

export default function DueDiligencePage(){
  const [opportunityId,setOpportunityId]=useState('')
  const [opportunity,setOpportunity]=useState<Opportunity|null>(null)
  const [checks,setChecks]=useState<Check[]>([])
  const [selectedStatus,setSelectedStatus]=useState<Record<string,string>>({})
  const [notes,setNotes]=useState<Record<string,string>>({})
  const [loading,setLoading]=useState(true)
  const [saving,setSaving]=useState<string>('')
  const [query,setQuery]=useState('')
  const [notice,setNotice]=useState('')

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search)
    setOpportunityId(params.get('opportunity')||'')
  },[])

  useEffect(()=>{
    if(!opportunityId){setLoading(false);return}
    let active=true
    async function load(){
      const s=createClient()
      const {data:auth}=await s.auth.getUser()
      if(!auth.user){window.location.href='/login?next='+encodeURIComponent('/invest/due-diligence?opportunity='+opportunityId);return}
      const [op,rows]=await Promise.all([
        s.from('investment_opportunities').select('id,title_bn,title_en,description_bn,category,district,upazila,target_amount,min_investment,raised_amount,risk_level,verification_status,status').eq('id',opportunityId).maybeSingle(),
        s.from('investment_due_diligence_checks').select('id,check_key,status,note,updated_at').eq('opportunity_id',opportunityId).eq('investor_id',auth.user.id),
      ])
      if(!active)return
      setOpportunity((op.data??null) as Opportunity|null)
      const list=(rows.data??[]) as Check[]
      setChecks(list)
      setSelectedStatus(Object.fromEntries(list.map(x=>[x.check_key,x.status])))
      setNotes(Object.fromEntries(list.map(x=>[x.check_key,x.note||''])))
      setLoading(false)
    }
    void load()
    return()=>{active=false}
  },[opportunityId])

  async function save(key:string){
    if(!opportunityId)return
    setSaving(key);setNotice('')
    const s=createClient()
    const {data:auth}=await s.auth.getUser()
    if(!auth.user){setSaving('');return}
    const payload={opportunity_id:opportunityId,investor_id:auth.user.id,check_key:key,status:selectedStatus[key]||'not_started',note:notes[key]?.trim().slice(0,1200)||null,updated_at:new Date().toISOString()}
    const {error}=await s.from('investment_due_diligence_checks').upsert(payload,{onConflict:'opportunity_id,investor_id,check_key'}).select('id,check_key,status,note,updated_at').single()
    if(error){setNotice(error.message||'Check save হয়নি.')}else{
      setChecks((items)=>[...items.filter(x=>x.check_key!==key),data as Check])
      setNotice('Due-diligence check saved.')
    }
    setSaving('')
  }

  const completed=CHECKS.filter(([key])=>['satisfied','not_applicable'].includes(selectedStatus[key])).length
  const q=query.trim().toLowerCase()
  const visibleChecks=CHECKS.filter(([,label,desc])=>!q||(label+' '+desc).toLowerCase().includes(q))

  if(loading)return <main className="min-h-dvh bg-[var(--fx-bg)]"><Navbar/><div className="mx-auto max-w-4xl px-4 py-24 text-center text-sm text-[var(--fx-muted)]">Loading due diligence...</div></main>

  if(!opportunity)return <main className="min-h-dvh bg-[var(--fx-bg)]"><Navbar/><section className="mx-auto max-w-3xl px-4 py-16"><Link href="/invest" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Investment</Link><div className="mt-7 rounded-[2rem] border border-dashed border-[var(--fx-border)] p-10 text-center"><WarningCircle size={32} className="mx-auto opacity-35"/><h1 className="mt-4 text-2xl font-black">Opportunity not found.</h1><p className="mt-2 text-sm text-[var(--fx-muted)]">Open Due Diligence from a specific investment opportunity.</p></div></section></main>

  return <main className="min-h-dvh bg-[var(--fx-bg)]"><Navbar/><section className="mx-auto max-w-6xl px-4 pb-28 pt-7 sm:px-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href={'/invest/'+encodeURIComponent(opportunity.id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Opportunity</Link>
      <Link href="/invest/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold">Investor workspace <ArrowRight size={15}/></Link>
    </div>

    <header className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-[var(--fx-primary-strong)]"><ShieldCheck size={17}/> Due Diligence Center</div>
      <h1 className="mt-3 text-3xl font-black tracking-[-.05em] sm:text-5xl">{opportunityTitle(opportunity)}</h1>
      <p className="mt-2 text-sm text-[var(--fx-muted)]">{opportunity.category} · {[opportunity.upazila,opportunity.district].filter(Boolean).join(' · ')}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 font-bold">{statusLabel(opportunity.verification_status)}</span><span className="rounded-full border border-[var(--fx-border)] px-3 py-1.5">{riskLabel(opportunity.risk_level)} risk</span><span className="rounded-full border border-[var(--fx-border)] px-3 py-1.5">{formatBDT(opportunity.min_investment)} minimum</span></div>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">{opportunity.description_bn || 'Review evidence and unresolved questions before making any investment decision.'}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--fx-border)] p-4"><p className="text-xs text-[var(--fx-muted)]">Checklist</p><p className="mt-2 text-2xl font-black">{completed}/{CHECKS.length}</p></div>
        <div className="rounded-2xl border border-[var(--fx-border)] p-4"><p className="text-xs text-[var(--fx-muted)]">Target</p><p className="mt-2 font-black">{formatBDT(opportunity.target_amount)}</p></div>
        <div className="rounded-2xl border border-[var(--fx-border)] p-4"><p className="text-xs text-[var(--fx-muted)]">Raised</p><p className="mt-2 font-black">{formatBDT(opportunity.raised_amount)}</p></div>
      </div>
      <div className="mt-5 rounded-2xl border border-amber-500/15 bg-amber-500/[.05] p-4 text-sm leading-6"><b>Important:</b> Completing this checklist does not verify the business for you and does not guarantee an investment outcome. Use documents, questions and authoritative records where appropriate.</div>
    </header>

    <div className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3">
      <MagnifyingGlass size={17} className="text-[var(--fx-muted)]"/><input value={query} onChange={e=>setQuery(e.target.value)} className="h-11 flex-1 bg-transparent text-sm outline-none" placeholder="Search due-diligence checks..."/>
    </div>

    <section className="mt-5 space-y-3">
      {visibleChecks.map(([key,label,desc])=>{
        const value=selectedStatus[key]||'not_started'
        return <article key={key} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><FileText size={19}/></div>
            <div className="min-w-0 flex-1"><h2 className="font-black">{label}</h2><p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{desc}</p></div>
            {['satisfied','needs_attention','not_applicable'].includes(value)&&<CheckCircle size={19} className="shrink-0 text-[var(--fx-primary-strong)]"/>}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[12rem_1fr_auto]">
            <select value={value} onChange={e=>setSelectedStatus(s=>({...s,[key]:e.target.value}))} className="h-11 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">
              <option value="not_started">Not started</option><option value="reviewing">Reviewing</option><option value="satisfied">Satisfied</option><option value="needs_attention">Needs attention</option><option value="not_applicable">Not applicable</option>
            </select>
            <textarea value={notes[key]||''} onChange={e=>setNotes(s=>({...s,[key]:e.target.value}))} rows={2} maxLength={1200} placeholder="Your private notes..." className="rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-6"/>
            <button type="button" onClick={()=>void save(key)} disabled={saving===key} className="min-h-11 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white disabled:opacity-40">{saving===key?'Saving...':'Save'}</button>
          </div>
        </article>
      })}
    </section>

    {notice&&<p className="mt-4 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-sm">{notice}</p>}
    <Link href={'/invest/'+encodeURIComponent(opportunity.id)} className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><span><b>Back to opportunity</b><span className="mt-1 block text-xs text-[var(--fx-muted)]">Review documents, updates and investment terms again.</span></span><ArrowRight size={17}/></Link>
  </section></main>
}
