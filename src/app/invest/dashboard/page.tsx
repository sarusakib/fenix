'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChartLineUp, CheckCircle, Handshake, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { formatBDT, opportunityTitle, statusLabel } from '@/lib/investment'
import type { InvestmentDeal, InvestmentInterest, InvestmentOpportunity, InvestmentUpdate } from '@/types/database'

export default function InvestmentDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ max_budget: number; verification_status: string } | null>(null)
  const [interests, setInterests] = useState<InvestmentInterest[]>([])
  const [deals, setDeals] = useState<InvestmentDeal[]>([])
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([])
  const [updates, setUpdates] = useState<InvestmentUpdate[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  async function load() {
    const s = createClient()
    const { data: auth } = await s.auth.getUser()

    if (!auth.user) {
      window.location.replace('/login?next=/invest/dashboard')
      return
    }

    const profileResult = await s
      .from('investment_profiles')
      .select('max_budget,verification_status')
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (profileResult.error) setError(profileResult.error.message)
    if (profileResult.data) {
      setProfile(profileResult.data as { max_budget: number; verification_status: string })
    }

    const [interestResult, dealResult] = await Promise.all([
      s.from('investment_interests').select('*').eq('investor_id', auth.user.id).order('created_at', { ascending: false }),
      s.from('investment_deals').select('*').eq('investor_id', auth.user.id).order('created_at', { ascending: false }),
    ])

    if (interestResult.error) setError(interestResult.error.message)
    if (dealResult.error) setError(dealResult.error.message)

    const investorInterests = (interestResult.data ?? []) as InvestmentInterest[]
    const investorDeals = (dealResult.data ?? []) as InvestmentDeal[]

    setInterests(investorInterests)
    setDeals(investorDeals)

    const ids = Array.from(new Set([
      ...investorInterests.map((item) => item.opportunity_id),
      ...investorDeals.map((item) => item.opportunity_id),
    ]))

    if (ids.length) {
      const [opportunityResult, updateResult] = await Promise.all([
        s.from('investment_opportunities').select('*').in('id', ids),
        s.from('investment_updates').select('*').in('opportunity_id', ids).order('created_at', { ascending: false }).limit(10),
      ])

      setOpportunities((opportunityResult.data ?? []) as InvestmentOpportunity[])
      setUpdates((updateResult.data ?? []) as InvestmentUpdate[])
    } else {
      setOpportunities([])
      setUpdates([])
    }

    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  async function confirmFunding(dealId: string) {
    setBusy(dealId)
    setError('')
    setMessage('')

    const s = createClient()
    const { error: confirmError } = await s.rpc('investor_confirm_investment_deal', { p_deal_id: dealId })

    if (confirmError) {
      setError(confirmError.message)
    } else {
      setMessage('Your funding confirmation was recorded. The deal becomes funded only when the owner also confirms.')
      await load()
    }

    setBusy('')
  }

  const opportunityById = useMemo(
    () => new Map(opportunities.map((item) => [item.id, item])),
    [opportunities],
  )

  const activeDeals = deals.filter((deal) => ['funded', 'active'].includes(deal.status))
  const pendingConfirmations = deals.filter(
    (deal) => deal.status === 'funding_pending' && !deal.investor_confirmed_at,
  )

  if (loading) {
    return (
      <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
        <Navbar />
        <div className="mx-auto max-w-5xl px-4 py-24 text-center opacity-50">Loading investor dashboard...</div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-4 text-sm dark:border-white/10 dark:bg-white/[.04]">
          <ArrowLeft size={17} /> Investment
        </Link>

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Investor</p>
            <h1 className="mt-1 text-4xl font-black">My investment dashboard</h1>
            <p className="mt-2 text-sm opacity-55">Track interests, deal stages, funding confirmations and business updates.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/invest/profile" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0b1736]/10 px-4 text-sm font-bold dark:border-white/10">
              <UserCircle size={18} /> Edit profile
            </Link>
            <Link href="/invest/calculator" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
              Scenario calculator
            </Link>
          </div>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-sm text-red-600">{error}</div>}
        {message && <div className="mt-4 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-4 text-sm">{message}</div>}

        <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="Interests" value={interests.length} />
          <Kpi label="Deals" value={deals.length} />
          <Kpi label="Active / funded" value={activeDeals.length} />
          <Kpi label="Profile" value={profile?.verification_status || 'unverified'} />
        </div>

        {pendingConfirmations.length > 0 && (
          <section className="mt-7 rounded-[2rem] border border-[#d4b879]/25 bg-[#d4b879]/[.07] p-6">
            <h2 className="text-xl font-black">Funding confirmation needed</h2>
            <p className="mt-1 text-sm opacity-55">Review the agreed deal details before confirming the funding stage.</p>
            <div className="mt-5 space-y-3">
              {pendingConfirmations.map((deal) => {
                const opportunity = opportunityById.get(deal.opportunity_id)
                return (
                  <div key={deal.id} className="flex flex-col gap-3 rounded-2xl border border-[#d4b879]/20 bg-white/60 p-4 dark:bg-white/[.035] sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-black">{opportunity ? opportunityTitle(opportunity) : 'Investment deal'}</p>
                      <p className="mt-1 text-sm opacity-55">{formatBDT(deal.agreed_amount)} · {statusLabel(deal.structure)}</p>
                    </div>
                    {profile?.verification_status === 'verified' ? (
                      <button type="button" disabled={busy === deal.id} onClick={() => void confirmFunding(deal.id)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#008080] px-4 text-xs font-bold text-white disabled:opacity-50">
                        <CheckCircle size={16} />{busy === deal.id ? 'Confirming...' : 'Confirm funding'}
                      </button>
                    ) : (
                      <Link href="/invest/profile" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#d4b879]/30 bg-[#d4b879]/[.08] px-4 text-xs font-bold text-[#826516] dark:text-[#e8cf82]">
                        Complete verification first
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <Panel title="My interests" icon={<Handshake size={20} />}>
            {interests.length ? interests.map((interest) => {
              const opportunity = opportunityById.get(interest.opportunity_id)
              return (
                <div key={interest.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black">{opportunity ? opportunityTitle(opportunity) : 'Opportunity'}</p>
                    <span className="rounded-full bg-[#008080]/[.07] px-2.5 py-1 text-xs font-bold text-[#007171] dark:text-[#8ee6e0]">{statusLabel(interest.status)}</span>
                  </div>
                  <p className="mt-2 text-sm opacity-55">Proposed: {formatBDT(interest.offered_amount)}</p>
                  {interest.message && <p className="mt-2 text-sm leading-6 opacity-65">{interest.message}</p>}
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link href={`/invest/${interest.opportunity_id}`} className="text-xs font-bold text-[#007171] dark:text-[#8ee6e0]">View opportunity →</Link>
                    {!['declined', 'withdrawn'].includes(interest.status) && <Link href={`/invest/${interest.opportunity_id}`} className="text-xs font-bold text-[#007171] dark:text-[#8ee6e0]">Open conversation →</Link>}
                  </div>
                </div>
              )
            }) : <Empty text="No investment interests yet." />}
          </Panel>

          <Panel title="My deals" icon={<ChartLineUp size={20} />}>
            {deals.length ? deals.map((deal) => {
              const opportunity = opportunityById.get(deal.opportunity_id)
              return (
                <div key={deal.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{opportunity ? opportunityTitle(opportunity) : 'Deal'}</p>
                      <p className="mt-1 text-sm opacity-55">{formatBDT(deal.agreed_amount)} · {statusLabel(deal.structure)}</p>
                    </div>
                    <span className="rounded-full bg-[#d4b879]/[.12] px-2.5 py-1 text-xs font-bold dark:text-[#e8cf82]">{statusLabel(deal.status)}</span>
                  </div>
                  <div className="mt-3 text-xs opacity-55">Owner confirmation: {deal.owner_confirmed_at ? 'Yes' : 'Pending'} · Your confirmation: {deal.investor_confirmed_at ? 'Yes' : 'Pending'}</div>
                  {opportunity && <Link href={`/invest/${opportunity.id}`} className="mt-3 inline-flex text-xs font-bold text-[#007171] dark:text-[#8ee6e0]">Open deal conversation →</Link>}
                </div>
              )
            }) : <Empty text="No deal has been proposed yet." />}
          </Panel>
        </div>

        <Panel title="Latest business updates" icon={<ChartLineUp size={20} />}>
          {updates.length ? updates.map((update) => (
            <article key={update.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10">
              <p className="font-bold">{update.title}</p>
              <p className="mt-1 text-xs opacity-40">{update.period_label || new Date(update.created_at).toLocaleDateString('en-GB')}</p>
              <p className="mt-3 text-sm leading-6 opacity-65">{update.body}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs opacity-50">
                {update.revenue_actual != null && <span>Revenue: {formatBDT(update.revenue_actual)}</span>}
                {update.profit_actual != null && <span>Profit: {formatBDT(update.profit_actual)}</span>}
                {update.customers_actual != null && <span>Customers: {update.customers_actual.toLocaleString('en-BD')}</span>}
                {update.return_actual_pct != null && <span>Reported return: {Number(update.return_actual_pct).toLocaleString('en-BD')}%</span>}
              </div>
              {update.risk_note && <p className="mt-3 text-xs leading-5 text-red-600 dark:text-red-300">Risk note: {update.risk_note}</p>}
            </article>
          )) : <Empty text="Business updates will appear after an approved opportunity publishes them." />}
        </Panel>

        <div className="mt-7 rounded-2xl border border-amber-500/20 bg-amber-500/[.06] p-5 text-sm leading-6">
          <strong>Funding note:</strong> FeniX records party confirmations but does not receive, hold, transfer or settle investor funds. Legal agreements and payment arrangements remain between the relevant parties and should follow applicable law.
        </div>
      </section>
    </main>
  )
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-[1.5rem] border border-[#0b1736]/10 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[.04]"><p className="text-xs font-semibold opacity-50">{label}</p><p className="mt-3 text-2xl font-black">{typeof value === 'number' ? value.toLocaleString('en-BD') : statusLabel(value)}</p></div>
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="mt-7 rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]"><h2 className="flex items-center gap-2 text-xl font-black">{icon}{title}</h2><div className="mt-5 space-y-3">{children}</div></section>
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm opacity-45">{text}</p>
}
