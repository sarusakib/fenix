'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Brain, ChartBar, Heartbeat, MagnifyingGlass, ShieldCheck, Storefront, TrendUp } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type PulseTerm = { term: string; searches_7d: number; searches_30d: number; unique_queries_7d: number }
type PulseIntent = { intent_key: string; searches_7d: number; searches_30d: number }

export default function FeniPulsePage() {
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'
  const [loading, setLoading] = useState(true)
  const [terms, setTerms] = useState<PulseTerm[]>([])
  const [intents, setIntents] = useState<PulseIntent[]>([])
  const [stats, setStats] = useState({ businesses: 0, products: 0, opportunities: 0, blood: 0, ambulances: 0, posts: 0 })

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const [termsResult, intentsResult, b, p, o, blood, amb, posts] = await Promise.all([
        s.from('fenix_brain_pulse_terms').select('term,searches_7d,searches_30d,unique_queries_7d').order('searches_7d', { ascending: false }).limit(20),
        s.from('fenix_brain_pulse_intents').select('intent_key,searches_7d,searches_30d').order('searches_7d', { ascending: false }).limit(12),
        s.from('business_directory_profiles').select('business_id',{count:'exact',head:true}).eq('listing_status','published'),
        s.from('products').select('id',{count:'exact',head:true}).eq('status','published').eq('is_active',true),
        s.from('investment_opportunities').select('id',{count:'exact',head:true}).in('status',['approved','fully_funded']).eq('verification_status','verified'),
        s.from('fenix_public_blood_requests').select('id',{count:'exact',head:true}),
        s.from('fenix_ambulance_providers').select('id',{count:'exact',head:true}).eq('status','active'),
        s.from('fenix_public_feed').select('id',{count:'exact',head:true}),
      ])
      if (!active) return
      setTerms((termsResult.data ?? []) as PulseTerm[])
      setIntents((intentsResult.data ?? []) as PulseIntent[])
      setStats({
        businesses:b.count ?? 0, products:p.count ?? 0, opportunities:o.count ?? 0,
        blood:blood.count ?? 0, ambulances:amb.count ?? 0, posts:posts.count ?? 0,
      })
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  const intentRows = useMemo(() => intents.filter((x) => x.searches_7d > 0), [intents])

  return (
    <main className="min-h-dvh bg-[var(--fx-bg)] text-[var(--fx-text)]">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-28 pt-7 sm:px-6">
        <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Home</Link>

        <header className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]"><ChartBar size={17}/> Feni Pulse</div>
          <h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-6xl">{bn ? 'ফেনীতে মানুষ এখন কী খুঁজছে?' : 'What is Feni looking for right now?'}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">
            {bn
              ? 'শুধু aggregate, privacy-safe Brain signal থেকে এই snapshot তৈরি হয়। কোনো raw query, user ID, message বা private address এখানে রাখা হয় না। এটি observed demand signal—future prediction নয়।'
              : 'This snapshot uses privacy-safe aggregate Brain signals only. No raw query, user ID, message or private address is stored here. These are observed signals, not future predictions.'}
          </p>
        </header>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Businesses', value: stats.businesses, Icon: Storefront },
            { label: 'Products', value: stats.products, Icon: Storefront },
            { label: 'Invest offers', value: stats.opportunities, Icon: TrendUp },
            { label: 'Open blood', value: stats.blood, Icon: Heartbeat },
            { label: 'Ambulance providers', value: stats.ambulances, Icon: Heartbeat },
            { label: '7d posts', value: stats.posts, Icon: UsersIcon },
          ].map(({ label, value, Icon }) => (
            <article key={label} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
              <Icon size={18} className="text-[var(--fx-primary-strong)]" />
              <p className="mt-3 text-[10px] font-black uppercase tracking-[.11em] text-[var(--fx-muted)]">{label}</p>
              <p className="mt-2 text-2xl font-black">{loading ? '—' : String(value)}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
            <div className="flex items-center gap-2"><MagnifyingGlass size={20} className="text-[var(--fx-primary-strong)]"/><h2 className="text-xl font-black">{bn?'Top search signals · 7 দিন':'Top search signals · 7 days'}</h2></div>
            {terms.length ? <div className="mt-5 space-y-2">
              {terms.map((item,index)=><div key={item.term} className="flex items-center gap-3 rounded-xl border border-[var(--fx-border)] p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--fx-primary-soft)] text-xs font-black">{index+1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.term}</p><p className="mt-1 text-[10px] text-[var(--fx-muted)]">{item.searches_7d} signals · {item.unique_queries_7d} unique daily queries</p></div><Link href={'/guide?q='+encodeURIComponent(item.term)} className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-[var(--fx-border)] px-2.5 text-[10px] font-bold">Ask <ArrowRight size={12}/></Link></div>)}
            </div> : <Empty text={bn?'এখনো পর্যাপ্ত aggregate signal নেই।':'Not enough aggregate signal yet.'}/>}
          </section>

          <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
            <div className="flex items-center gap-2"><Brain size={20} className="text-[var(--fx-primary-strong)]"/><h2 className="text-xl font-black">{bn?'Intent snapshot':'Intent snapshot'}</h2></div>
            <div className="mt-5 space-y-2">
              {intentRows.length ? intentRows.map(item => <div key={item.intent_key} className="flex items-center justify-between gap-3 rounded-xl bg-black/[.025] p-3 dark:bg-white/[.03]"><span className="text-xs font-bold">{item.intent_key}</span><span className="text-xs font-black text-[var(--fx-primary-strong)]">{item.searches_7d}</span></div>) : <Empty text={bn?'এখনো signal নেই।':'No intent signals yet.'}/>}
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Link href="/radar" className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><TrendUp size={20} className="text-[var(--fx-primary-strong)]"/><h3 className="mt-4 font-black">{bn?'Opportunity Radar':'Opportunity Radar'}</h3><p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{bn?'Observed signals ও verified opportunities দেখুন।':'Review observed signals and verified opportunities.'}</p></Link>
          <Link href="/directory/map" className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><MapIcon size={20} className="text-[var(--fx-primary-strong)]"/><h3 className="mt-4 font-black">{bn?'Feni Map':'Feni Map'}</h3><p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{bn?'Area ও business context দেখুন।':'Explore business context by place.'}</p></Link>
          <Link href="/care" className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><ShieldCheck size={20} className="text-[var(--fx-primary-strong)]"/><h3 className="mt-4 font-black">{bn?'FeniX Care':'FeniX Care'}</h3><p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{bn?'Blood ও ambulance help দেখুন।':'Open blood and ambulance help.'}</p></Link>
        </div>
      </section>
    </main>
  )
}

function Empty({text}:{text:string}){return <div className="mt-5 rounded-2xl border border-dashed border-[var(--fx-border)] p-8 text-center text-sm text-[var(--fx-muted)]">{text}</div>}
function UsersIcon(props:any){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-7.2a4 4 0 0 1 0 7.8M22 21v-1a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function MapIcon(props:any){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9 3v15M15 6v15" stroke="currentColor" strokeWidth="1.7"/></svg>}
