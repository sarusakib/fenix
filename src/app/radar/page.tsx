'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ChartLineUp, Info, ShieldCheck, TrendUp } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Opportunity = {
  id: string
  title_bn: string
  title_en: string
  category: string
  district: string
  upazila: string
  min_investment: number
  risk_level: string
  target_amount: number
  raised_amount: number
}

export default function OpportunityRadarPage() {
  const [stats, setStats] = useState({ businesses: 0, opportunities: 0, products: 0 })
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const [b, o, p] = await Promise.all([
        s.from('business_directory_profiles').select('business_id', { count: 'exact', head: true }).eq('listing_status', 'published'),
        s.from('investment_opportunities').select('id,title_bn,title_en,category,district,upazila,min_investment,risk_level,target_amount,raised_amount').in('status', ['approved', 'fully_funded']).eq('verification_status', 'verified').order('created_at', { ascending: false }).limit(12),
        s.from('commerce_public_products').select('id', { count: 'exact', head: true }),
      ])
      if (!active) return
      setStats({ businesses: b.count ?? 0, opportunities: o.data?.length ?? 0, products: p.count ?? 0 })
      setOpportunities((o.data ?? []) as Opportunity[])
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17} /> Home</Link>
        <div className="mt-7 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008080]/[.08] text-[#008080]"><ChartLineUp size={25} /></div>
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Opportunity Radar</p><h1 className="mt-1 text-3xl font-black sm:text-5xl">See observable local signals</h1><p className="mt-3 max-w-3xl text-sm leading-7 opacity-60">This surface summarizes currently visible FeniX data. It is a discovery aid—not a prediction, investment recommendation or guarantee.</p></div>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            ['Published businesses', stats.businesses],
            ['Verified investment offers', stats.opportunities],
            ['Published products', stats.products],
          ].map(([label, value]) => (
            <article key={String(label)} className="rounded-2xl border border-black/10 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[.04]">
              <p className="text-xs font-bold uppercase tracking-[.12em] opacity-45">{String(label)}</p>
              <p className="mt-2 text-3xl font-black">{loading ? '—' : String(value)}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-4 text-sm leading-6">
          <Info size={19} className="mt-0.5 shrink-0 text-[#008080]" />
          <p>Observed signal ≠ future outcome. FeniX will only label a future-oriented model as a prediction when its source, timeframe, assumptions and confidence are explicitly shown.</p>
        </div>
        <section className="mt-7 rounded-[2rem] border border-black/10 bg-white/85 p-5 dark:border-white/10 dark:bg-white/[.045] sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-2xl font-black">Verified opportunities</h2><p className="mt-1 text-xs opacity-45">Current verified inventory, not a ranking.</p></div>
            <Link href="/invest" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#008080] px-3 text-xs font-bold text-white">Open Invest <ArrowRight size={16} /></Link>
          </div>
          {opportunities.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {opportunities.map(item => (
                <Link key={item.id} href={'/invest/' + item.id} className="rounded-2xl border border-black/10 p-5 transition hover:border-[#008080]/30 dark:border-white/10">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black">{item.title_bn || item.title_en}</p><p className="mt-1 text-xs opacity-45">{item.category} · {item.upazila || item.district || 'Feni'}</p></div><ShieldCheck size={18} className="shrink-0 text-[#008080]" /></div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs"><span><b className="block text-sm">BDT {Number(item.min_investment || 0).toLocaleString('en-BD')}</b>Minimum</span><span><b className="block text-sm">{item.risk_level}</b>Risk level</span></div>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">View opportunity <ArrowRight size={15} /></span>
                </Link>
              ))}
            </div>
          ) : <p className="mt-6 rounded-2xl bg-black/[.025] p-6 text-sm opacity-55 dark:bg-white/[.03]">No verified investment opportunities are currently visible.</p>}
        </section>
        <Link href="/guide?q=How%20should%20I%20evaluate%20a%20business%20opportunity%20in%20Feni%3F" className="mt-6 flex items-center justify-between rounded-2xl border border-[#d4b879]/20 bg-[#d4b879]/[.07] p-5">
          <span><TrendUp size={19} /><strong className="mt-2 block">Ask Feni Brain before acting</strong><span className="mt-1 block text-xs opacity-55">Turn a signal into a due-diligence checklist.</span></span>
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  )
}
