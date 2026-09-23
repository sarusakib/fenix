'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChartLineUp, Funnel, MagnifyingGlass, ShieldCheck, UserCircle, Rocket, Handshake } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import InvestmentCard from '@/components/investment/InvestmentCard'
import { createClient } from '@/utils/supabase/client'
import { INVESTMENT_CATEGORIES, RISK_LEVELS, statusLabel } from '@/lib/investment'
import type { InvestmentOpportunity } from '@/types/database'

export default function InvestPage() {
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([])
  const [matches, setMatches] = useState<InvestmentOpportunity[]>([])
  const [matchMeta, setMatchMeta] = useState<Record<string, { score: number; reasons: string[] }>>({})
  const [mode, setMode] = useState<'all' | 'matches'>('all')
  const [category, setCategory] = useState('all')
  const [risk, setRisk] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const supabase = createClient()
      const { data, error: listError } = await supabase
        .from('investment_opportunities')
        .select('*')
        .in('status', ['approved', 'fully_funded'])
        .eq('verification_status', 'verified')
        .order('created_at', { ascending: false })

      if (!active) return
      const opportunityRows = (data ?? []) as InvestmentOpportunity[]
      if (listError) {
        setError('Investment opportunities load করা যায়নি।')
      } else {
        setOpportunities(opportunityRows)
      }

      const { data: auth } = await supabase.auth.getUser()
      if (auth.user) {
        const { data: profile } = await supabase.from('investment_profiles').select('user_id').eq('user_id', auth.user.id).maybeSingle()
        if (profile) {
          setHasProfile(true)
          const { data: matched } = await supabase.rpc('match_investment_opportunities', { p_limit: 12 })
          const matchedRows = (matched ?? []) as Array<{ opportunity_id: string; match_score?: number; match_reasons?: string[] }>
          if (matchedRows.length) {
            const mapped = matchedRows
              .map((item) => opportunityRows.find((opportunity) => opportunity.id === item.opportunity_id))
              .filter((item): item is InvestmentOpportunity => Boolean(item))
            setMatches(mapped)
            setMatchMeta(Object.fromEntries(matchedRows.map((item) => [
              item.opportunity_id,
              { score: Number(item.match_score ?? 0), reasons: Array.isArray(item.match_reasons) ? item.match_reasons : [] },
            ])))
          } else {
            setMatches([])
            setMatchMeta({})
          }
        }
      }
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  const visible = useMemo(() => {
    const source = mode === 'matches' && hasProfile ? matches : opportunities
    const q = search.trim().toLowerCase()
    return source.filter((opportunity) => {
      const categoryOk = category === 'all' || opportunity.category === category
      const riskOk = risk === 'all' || opportunity.risk_level === risk
      const haystack = [opportunity.title_bn, opportunity.title_en, opportunity.description_en, opportunity.upazila, opportunity.district, opportunity.category].join(' ').toLowerCase()
      return categoryOk && riskOk && (!q || haystack.includes(q))
    })
  }, [category, hasProfile, matches, mode, opportunities, risk, search])

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.25rem] border border-[#d4b879]/20 bg-[radial-gradient(circle_at_90%_10%,rgba(212,184,121,.16),transparent_35%),linear-gradient(135deg,rgba(0,128,128,.1),rgba(255,255,255,.75))] p-6 shadow-[0_24px_90px_rgba(15,23,42,.08)] dark:bg-[radial-gradient(circle_at_90%_10%,rgba(212,184,121,.12),transparent_35%),linear-gradient(135deg,rgba(0,128,128,.08),rgba(255,255,255,.035))] sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#d4b879]/[.13] px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#856617] dark:text-[#e8cf82]"><ChartLineUp size={15} />FeniX Investment</span>
              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-.04em] sm:text-6xl">Invest in Feni</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 opacity-60 sm:text-lg">Discover verified local opportunities, compare disclosed terms, ask questions, and move from interest to a structured deal conversation.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/invest/profile" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white hover:bg-[#007474]"><UserCircle size={18} />Investor profile</Link>
                <Link href="/invest/create" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.05]"><Rocket size={18} />Post an opportunity</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat value={opportunities.length} label="Live opportunities" icon={<Handshake size={19} />} />
              <MiniStat value={opportunities.filter((item) => item.verification_status === 'verified').length} label="Verified offers" icon={<ShieldCheck size={19} />} />
              <MiniStat value={hasProfile ? 'ON' : '—'} label="Smart matching" icon={<ChartLineUp size={19} />} />
              <MiniStat value="No custody" label="FeniX handles" icon={<ShieldCheck size={19} />} />
            </div>
          </div>
        </div>

        <div className="mt-7 rounded-[1.75rem] border border-[#0b1736]/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[.04] sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <MagnifyingGlass size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-35" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search opportunity, sector, area..." className="h-11 w-full rounded-xl border border-[#0b1736]/10 bg-transparent pl-10 pr-3 text-sm outline-none focus:border-[#008080]/40 dark:border-white/10" maxLength={120} />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"><option value="all">All sectors</option>{INVESTMENT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>
              <select value={risk} onChange={(e) => setRisk(e.target.value)} className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"><option value="all">All risk levels</option>{RISK_LEVELS.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}</select>
              <button type="button" onClick={() => { setCategory('all'); setRisk('all'); setSearch('') }} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 px-3 text-sm font-semibold opacity-70 dark:border-white/10"><Funnel size={17} />Reset</button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <TabButton active={mode === 'all'} onClick={() => setMode('all')}>All opportunities</TabButton>
            <TabButton active={mode === 'matches'} disabled={!hasProfile} onClick={() => setMode('matches')}>{hasProfile ? 'Matched for me' : 'Create investor profile for matches'}</TabButton>
          </div>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="py-24 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#008080]/20 border-t-[#008080]" /><p className="mt-4 text-sm opacity-50">Investment marketplace loading...</p></div>
        ) : visible.length ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map((opportunity) => <InvestmentCard key={opportunity.id} opportunity={opportunity} matchScore={mode === 'matches' ? matchMeta[opportunity.id]?.score : null} matchReasons={mode === 'matches' ? matchMeta[opportunity.id]?.reasons : undefined} />)}</div>
        ) : (
          <div className="mt-7 rounded-[2rem] border border-dashed border-[#0b1736]/15 p-12 text-center dark:border-white/15">
            <ChartLineUp size={38} className="mx-auto opacity-25" />
            <h2 className="mt-4 text-xl font-black">No matching opportunities yet</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 opacity-55">Try another sector, area or search phrase. Entrepreneurs can also submit a new opportunity for review.</p>
            <Link href="/invest/create" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">Create opportunity<ArrowRight size={17} /></Link>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/[.06] p-5 text-sm leading-6 opacity-80"><strong>Important:</strong> A verification badge means information was reviewed by FeniX according to its review process; it is not a promise of profit, government approval, or investment success. FeniX does not hold investor funds or settle investments.</div>
      </section>
    </main>
  )
}

function MiniStat({ value, label, icon }: { value: string | number; label: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-[#0b1736]/10 bg-white/65 p-4 dark:border-white/10 dark:bg-white/[.04]"><div className="flex items-center justify-between gap-3"><span className="text-xs opacity-50">{label}</span><span className="text-[#008080]">{icon}</span></div><div className="mt-3 text-2xl font-black">{typeof value === 'number' ? value.toLocaleString('en-BD') : value}</div></div>
}

function TabButton({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button disabled={disabled} type="button" onClick={onClick} className={`min-h-10 rounded-xl px-3 text-xs font-bold transition ${active ? 'bg-[#0b1736] text-white dark:bg-white/[.12]' : 'bg-black/[.035] opacity-70 hover:opacity-100 dark:bg-white/[.03]'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}>{children}</button>
}
