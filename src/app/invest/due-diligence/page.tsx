'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle, FileText, MagnifyingGlass, ShieldCheck, WarningCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Opportunity = { id:string; title_bn:string|null; title_en:string|null; category:string|null; district:string|null; upazila:string|null; risk_level:string|null }

const checks = [
  ['Identity & ownership', 'Confirm the legal owner, business identity and who is authorized to make the offer.'],
  ['Documents & permissions', 'Review licenses, registrations, approvals, contracts and any disclosed restrictions.'],
  ['Financial evidence', 'Check assumptions, historical records, liabilities, cash needs and how the requested amount will be used.'],
  ['Market & operations', 'Validate customers, suppliers, location, operating capacity and material dependencies independently.'],
  ['Terms & risk', 'Read the full terms, risk level, timeline, exit conditions and downside scenarios before acting.'],
  ['FeniX evidence trail', 'Use the opportunity page, verification label, approved documents and messages as an evidence trail—not as a guarantee.'],
] as const

export default function DueDiligencePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const { data } = await s.from('investment_opportunities').select('id,title_bn,title_en,category,district,upazila,risk_level').eq('verification_status','verified').in('status',['approved','fully_funded']).order('created_at',{ascending:false}).limit(12)
      if (active) { setOpportunities((data ?? []) as Opportunity[]); setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [])

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Invest</Link>
        <div className="mt-7 rounded-[2rem] border border-black/10 bg-white/85 p-6 dark:border-white/10 dark:bg-white/[.045] sm:p-9">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#008080]/[.08] text-[#008080]"><ShieldCheck size={24} weight="duotone" /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.17em] text-[#008080]">Due Diligence Center</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-5xl">Check the evidence before you act.</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 opacity-60">A structured review workflow for FeniX opportunities. It helps organize evidence; it does not certify a business, predict returns or replace independent professional advice.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-2">{checks.map(([title,body],index)=><article key={title} className="rounded-2xl border border-black/10 bg-black/[.018] p-5 dark:border-white/10 dark:bg-white/[.03]"><div className="flex items-start gap-3"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#008080]/[.09] text-xs font-black text-[#007171] dark:text-[#8ee6e0]">{index+1}</div><div><h2 className="text-sm font-black">{title}</h2><p className="mt-2 text-sm leading-6 opacity-60">{body}</p></div></div></article>)}</div>
          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/[.055] p-5"><div className="flex items-start gap-3"><WarningCircle size={19} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-200" /><div><p className="text-sm font-bold">Evidence rule</p><p className="mt-1 text-sm leading-6 opacity-65">A verification label describes what FeniX checked. It is not government approval, a quality guarantee or a promise of financial performance.</p></div></div></div>
        </div>
        <section className="mt-6 rounded-[2rem] border border-black/10 bg-white/85 p-6 dark:border-white/10 dark:bg-white/[.045] sm:p-8">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Verified opportunities</p><h2 className="mt-1 text-2xl font-black">Use the checklist against the actual record.</h2></div><MagnifyingGlass size={21} className="opacity-35" /></div>
          {loading ? <div className="mt-6 rounded-2xl bg-black/[.025] p-6 text-sm opacity-55 dark:bg-white/[.03]">Loading verified opportunities…</div> : opportunities.length ? <div className="mt-5 grid gap-3 md:grid-cols-2">{opportunities.map(item=><Link key={item.id} href={'/invest/'+encodeURIComponent(item.id)} className="rounded-2xl border border-black/10 p-5 transition hover:border-[#008080]/30 dark:border-white/10"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-black">{item.title_bn||item.title_en||'Investment opportunity'}</h3><p className="mt-1 text-xs opacity-45">{[item.category,item.upazila,item.district].filter(Boolean).join(' · ')}</p></div><CheckCircle size={18} className="shrink-0 text-[#008080]" /></div><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#008080]/[.07] px-2.5 py-1 font-bold text-[#007171] dark:text-[#8ee6e0]">{item.risk_level||'Risk disclosed on detail page'}</span><span className="rounded-full bg-black/[.035] px-2.5 py-1 dark:bg-white/[.05]">Verified information</span></div><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">Open evidence page <ArrowRight size={14} /></span></Link>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-black/10 p-7 text-sm opacity-55 dark:border-white/10">No verified opportunities are currently visible.</div>}
        </section>
        <div className="mt-6 flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 p-4 text-xs leading-5 opacity-60 dark:border-white/10 dark:bg-white/[.03]"><FileText size={17} className="shrink-0" />On each opportunity, approved shared documents are gated by the existing interest/due-diligence workflow.</div>
      </section>
    </main>
  )
}