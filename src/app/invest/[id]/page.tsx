'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarBlank, CheckCircle, Eye, FileText, Flag, Handshake, MapPin, ShieldCheck, TrendUp, WarningCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import InvestmentMessageThread from '@/components/investment/InvestmentMessageThread'
import { createClient } from '@/utils/supabase/client'
import { formatBDT, opportunityTitle, progressPercent, riskLabel, statusLabel } from '@/lib/investment'
import type { InvestmentDeal, InvestmentDocument, InvestmentInterest, InvestmentOpportunity, InvestmentUpdate } from '@/types/database'

export default function InvestmentOpportunityPage() {
  const params = useParamsSafe()
  const router = useRouterSafe()
  const id = params
  const [opportunity, setOpportunity] = useState<InvestmentOpportunity | null>(null)
  const [interest, setInterest] = useState<InvestmentInterest | null>(null)
  const [deal, setDeal] = useState<InvestmentDeal | null>(null)
  const [updates, setUpdates] = useState<InvestmentUpdate[]>([])
  const [documents, setDocuments] = useState<InvestmentDocument[]>([])
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [documentBusy, setDocumentBusy] = useState('')
  const [showReport, setShowReport] = useState(false)

  useEffect(() => {
    if (!id) return

    async function load() {
      const s = createClient()
      const { data, error: loadError } = await s.from('investment_opportunities').select('*').eq('id', id).maybeSingle()
      if (loadError || !data) {
        setError('Opportunity পাওয়া যায়নি বা আর public নয়।')
        return
      }

      const nextOpportunity = data as InvestmentOpportunity
      setOpportunity(nextOpportunity)

      const { data: auth } = await s.auth.getUser()
      if (auth.user) {
        setUserId(auth.user.id)
        const { data: existingInterest } = await s
          .from('investment_interests')
          .select('*')
          .eq('opportunity_id', id)
          .eq('investor_id', auth.user.id)
          .maybeSingle()

        setInterest(existingInterest as InvestmentInterest | null)

        if (existingInterest) {
          const { data: existingDeal } = await s
            .from('investment_deals')
            .select('*')
            .eq('opportunity_id', id)
            .eq('investor_id', auth.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          setDeal(existingDeal as InvestmentDeal | null)
        }
      }

      const [updateResult, documentResult] = await Promise.all([
        s.from('investment_updates').select('*').eq('opportunity_id', id).order('created_at', { ascending: false }).limit(20),
        s.from('investment_documents').select('*').eq('opportunity_id', id).order('created_at', { ascending: false }).limit(30),
      ])

      setUpdates((updateResult.data ?? []) as InvestmentUpdate[])
      setDocuments((documentResult.data ?? []) as InvestmentDocument[])
    }

    void load()
  }, [id])

  async function submitInterest(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!userId) {
      router(`/login?next=/invest/${encodeURIComponent(id)}`)
      return
    }
    if (!opportunity) return

    const offered = Number(amount)
    const remaining = Math.max(0, Number(opportunity.target_amount) - Number(opportunity.raised_amount))

    if (!Number.isFinite(offered) || offered < Number(opportunity.min_investment) || offered > remaining) {
      setError(`Amount must be between ${formatBDT(opportunity.min_investment)} and ${formatBDT(remaining)}.`)
      return
    }

    setBusy(true)
    const s = createClient()
    const { data, error: insertError } = await s
      .from('investment_interests')
      .insert({
        opportunity_id: opportunity.id,
        investor_id: userId,
        offered_amount: offered,
        message: message.trim() || null,
      })
      .select('*')
      .single()

    if (insertError) {
      setError(insertError.message || 'Interest submit করা যায়নি।')
    } else {
      setInterest(data as InvestmentInterest)
      setNotice('Interest sent. The opportunity owner can now review your offer and move the conversation forward.')
      setAmount('')
      setMessage('')
    }
    setBusy(false)
  }

  async function reportOpportunity(event: FormEvent) {
    event.preventDefault()
    if (!userId) {
      router(`/login?next=/invest/${encodeURIComponent(id)}`)
      return
    }
    if (reportDetails.trim().length < 10) {
      setError('Report details অন্তত 10 characters দিন।')
      return
    }

    setBusy(true)
    const s = createClient()
    const { error: reportError } = await s.from('investment_reports').insert({
      opportunity_id: id,
      reporter_id: userId,
      reason: 'other',
      details: reportDetails.trim(),
    })

    if (reportError) {
      setError(reportError.message || 'Report submit করা যায়নি।')
    } else {
      setNotice('Report submitted for admin review.')
      setShowReport(false)
      setReportDetails('')
    }
    setBusy(false)
  }

  async function viewDocument(document: InvestmentDocument) {
    setDocumentBusy(document.id)
    setError('')

    const s = createClient()
    const { data, error: signedUrlError } = await s
      .storage
      .from(document.storage_bucket)
      .createSignedUrl(document.storage_path, 300)

    if (signedUrlError || !data?.signedUrl) {
      setError(signedUrlError?.message || 'Document could not be opened.')
    } else {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    }

    setDocumentBusy('')
  }

  if (error && !opportunity) {
    return (
      <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
        <Navbar />
        <section className="mx-auto max-w-4xl px-4 py-16">
          <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 px-4 text-sm dark:border-white/10">
            <ArrowLeft size={17} /> Investment
          </Link>
          <div className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/[.05] p-8 text-center">
            <WarningCircle size={35} className="mx-auto text-red-500" />
            <p className="mt-4">{error}</p>
          </div>
        </section>
      </main>
    )
  }

  if (!opportunity) {
    return (
      <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-24 text-center opacity-50">Loading opportunity...</div>
      </main>
    )
  }

  const progress = progressPercent(opportunity)
  const remaining = Math.max(0, Number(opportunity.target_amount) - Number(opportunity.raised_amount))
  const isOwner = Boolean(userId && userId === opportunity.owner_id)
  const canMessage = Boolean(userId && interest && !['declined', 'withdrawn'].includes(interest.status))
  const canViewSharedDocuments = Boolean(
    userId &&
    interest &&
    ['due_diligence', 'terms', 'agreed'].includes(interest.status),
  )
  const investorDocuments = documents.filter((document) => document.status === 'approved' && document.visibility === 'private_shared')

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-4 text-sm dark:border-white/10 dark:bg-white/[.04]">
          <ArrowLeft size={17} /> All opportunities
        </Link>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045] sm:p-9">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.12em]">
              <span className="rounded-full bg-[#008080]/[.08] px-3 py-1.5 text-[#007171] dark:text-[#8ee6e0]">
                <ShieldCheck size={14} className="mr-1 inline" />
                {opportunity.verification_status === 'verified' ? 'Verified information' : 'Review status'}
              </span>
              <span className="rounded-full bg-[#d4b879]/[.12] px-3 py-1.5 text-[#8d6a14] dark:text-[#e8cf82]">{opportunity.category}</span>
              <span className="rounded-full bg-black/[.035] px-3 py-1.5 dark:bg-white/[.05]">{riskLabel(opportunity.risk_level)} risk</span>
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-[-.04em] sm:text-5xl">{opportunityTitle(opportunity)}</h1>
            <p className="mt-2 text-sm opacity-45">{opportunity.title_en}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Target" value={formatBDT(opportunity.target_amount)} icon={<TrendUp size={18} />} />
              <Stat label="Raised" value={formatBDT(opportunity.raised_amount)} icon={<Handshake size={18} />} />
              <Stat label="Minimum" value={formatBDT(opportunity.min_investment)} icon={<CheckCircle size={18} />} />
              <Stat label="Structure" value={statusLabel(opportunity.offer_type)} icon={<FileText size={18} />} />
            </div>

            <div className="mt-7 rounded-2xl bg-black/[.025] p-4 dark:bg-white/[.03]">
              <div className="flex items-center justify-between text-xs"><span className="opacity-50">Funding progress</span><strong>{progress}%</strong></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/[.08]">
                <div className="h-full rounded-full bg-[#008080]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs opacity-50">
                <span>{formatBDT(remaining)} still needed</span>
                {opportunity.funding_deadline && <span className="flex items-center gap-1"><CalendarBlank size={14} />Deadline {opportunity.funding_deadline}</span>}
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <InfoBlock title="About the opportunity" body={opportunity.description_bn} />
              <InfoBlock title="Business details" body={opportunity.description_en} />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Stat label="Location" value={[opportunity.upazila, opportunity.district].filter(Boolean).join(', ')} icon={<MapPin size={18} />} />
              <Stat label="Expected term" value={opportunity.expected_term_months ? `${opportunity.expected_term_months} months` : 'Not disclosed'} icon={<CalendarBlank size={18} />} />
              <Stat label="Expected return" value={opportunity.expected_return_pct != null ? `${Number(opportunity.expected_return_pct).toLocaleString('en-BD')}%` : 'Not disclosed'} icon={<TrendUp size={18} />} />
              <Stat label="Ownership offered" value={opportunity.ownership_percentage != null ? `${Number(opportunity.ownership_percentage).toLocaleString('en-BD')}%` : 'Not disclosed'} icon={<Handshake size={18} />} />
            </div>

            {opportunity.risk_disclosure && (
              <div className="mt-7 rounded-2xl border border-red-500/15 bg-red-500/[.045] p-5">
                <p className="text-sm font-bold text-red-700 dark:text-red-300">Risk disclosure</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 opacity-70">{opportunity.risk_disclosure}</p>
              </div>
            )}

            <section className="mt-7 rounded-2xl border border-[#0b1736]/10 p-5 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Due-diligence documents</h2>
                  <p className="mt-1 text-xs opacity-50">Approved shared documents can be viewed with a temporary secure link.</p>
                </div>
                <FileText size={22} className="opacity-35" />
              </div>
              <div className="mt-5 space-y-2">
                {documents.length ? documents.map((document) => {
                  const canView = isOwner || (document.status === 'approved' && document.visibility === 'private_shared' && canViewSharedDocuments)
                  return (
                    <div key={document.id} className="flex flex-col gap-3 rounded-xl bg-black/[.025] p-3 dark:bg-white/[.03] sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{document.title}</p>
                        <p className="mt-1 text-xs opacity-45">{document.document_type} · {statusLabel(document.status)} · {document.visibility.replaceAll('_', ' ')}</p>
                      </div>
                      {canView && (
                        <button
                          type="button"
                          disabled={documentBusy === document.id}
                          onClick={() => void viewDocument(document)}
                          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#008080]/20 px-3 text-xs font-bold text-[#007171] disabled:opacity-50 dark:text-[#8ee6e0]"
                        >
                          <Eye size={16} />{documentBusy === document.id ? 'Opening...' : 'View document'}
                        </button>
                      )}
                    </div>
                  )
                }) : (
                  <p className="py-6 text-center text-sm opacity-45">No documents have been submitted for this opportunity yet.</p>
                )}
              </div>
            </section>

            {updates.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-black">Business updates</h2>
                <div className="mt-4 space-y-3">
                  {updates.map((update) => (
                    <article key={update.id} className="rounded-2xl border border-[#0b1736]/10 p-5 dark:border-white/10">
                      <p className="font-bold">{update.title}</p>
                      <p className="mt-1 text-xs opacity-40">{update.period_label || new Date(update.created_at).toLocaleDateString('en-GB')}</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 opacity-65">{update.body}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs opacity-50">
                        {update.revenue_actual != null && <span>Revenue: {formatBDT(update.revenue_actual)}</span>}
                        {update.profit_actual != null && <span>Profit: {formatBDT(update.profit_actual)}</span>}
                        {update.customers_actual != null && <span>Customers: {update.customers_actual.toLocaleString('en-BD')}</span>}
                        {update.return_actual_pct != null && <span>Reported return: {Number(update.return_actual_pct).toLocaleString('en-BD')}%</span>}
                      </div>
                      {update.risk_note && <p className="mt-3 text-xs leading-5 text-red-600 dark:text-red-300">Risk note: {update.risk_note}</p>}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {canMessage && !isOwner && (
              <div className="mt-7">
                <InvestmentMessageThread
                  opportunityId={opportunity.id}
                  userId={userId}
                  recipientId={opportunity.owner_id}
                  dealId={deal?.id}
                  title="Message the opportunity owner"
                />
              </div>
            )}

            <div className="mt-7 rounded-2xl border border-amber-500/15 bg-amber-500/[.05] p-5 text-sm leading-6">
              <strong>Important:</strong> Disclosed return figures are expectations supplied for this opportunity, not guarantees. Verification is an information-review status; it does not guarantee business performance or investment outcome. FeniX does not hold funds.
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#008080]">Your next step</p>
              {isOwner ? (
                <div>
                  <h2 className="mt-2 text-2xl font-black">Manage this opportunity</h2>
                  <p className="mt-2 text-sm leading-6 opacity-55">Review investor interest, create deals, add documents and publish business updates.</p>
                  <Link href="/invest/manage" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0b1736] text-sm font-bold text-white dark:bg-white/[.12]">
                    Open Investment Manager <ArrowRight size={17} />
                  </Link>
                </div>
              ) : interest ? (
                <div>
                  <h2 className="mt-2 text-2xl font-black">Interest submitted</h2>
                  <p className="mt-2 text-sm opacity-55">Your current stage is <strong>{statusLabel(interest.status)}</strong>.</p>
                  <div className="mt-4 rounded-xl bg-[#008080]/[.06] p-4 text-sm">
                    <span className="opacity-50">Your offer</span>
                    <div className="mt-1 text-2xl font-black">{formatBDT(interest.offered_amount)}</div>
                  </div>
                  <Link href="/invest/dashboard" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#0b1736]/10 text-sm font-bold dark:border-white/10">
                    Open investor dashboard
                  </Link>
                </div>
              ) : opportunity.status === 'approved' && remaining >= Number(opportunity.min_investment) ? (
                <form onSubmit={submitInterest}>
                  <h2 className="mt-2 text-2xl font-black">Express interest</h2>
                  <p className="mt-2 text-sm leading-6 opacity-55">This starts a conversation; it is not a completed investment.</p>
                  <label className="mt-5 block">
                    <span className="mb-2 block text-xs font-semibold opacity-60">Proposed amount (BDT)</span>
                    <input required value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))} type="text" inputMode="decimal" className="h-12 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10" placeholder={Number(opportunity.min_investment).toLocaleString('en-BD')} />
                  </label>
                  <label className="mt-4 block">
                    <span className="mb-2 block text-xs font-semibold opacity-60">Message (optional)</span>
                    <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} maxLength={2000} className="w-full rounded-xl border border-[#0b1736]/10 bg-transparent p-3 text-sm leading-6 dark:border-white/10" placeholder="What would you like to know before proceeding?" />
                  </label>
                  {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
                  {notice && <p className="mt-3 text-xs text-[#007171]">{notice}</p>}
                  <button disabled={busy} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#008080] text-sm font-bold text-white disabled:opacity-50">
                    {busy ? 'Sending...' : 'Send investment interest'} <Handshake size={18} />
                  </button>
                </form>
              ) : (
                <div>
                  <h2 className="mt-2 text-2xl font-black">Funding closed</h2>
                  <p className="mt-2 text-sm leading-6 opacity-55">This opportunity is no longer accepting new interest.</p>
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[.035]">
              <div className="flex items-center gap-3">
                <ShieldCheck size={23} className="text-[#008080]" />
                <div>
                  <p className="font-black">Trust & verification</p>
                  <p className="text-xs opacity-45">{statusLabel(opportunity.verification_status)}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <TrustRow label="Opportunity review" ok={opportunity.verification_status === 'verified'} />
                <TrustRow label="Owner identity" ok={false} text="Not disclosed" />
                <TrustRow label="Financials" ok={false} text="Check documents" />
                <TrustRow label="Legal / registration" ok={false} text="Check documents" />
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[.035]">
              <button type="button" onClick={() => setShowReport((value) => !value)} className="inline-flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-300">
                <Flag size={18} />{showReport ? 'Close report form' : 'Report this opportunity'}
              </button>
              {showReport && (
                <form onSubmit={reportOpportunity} className="mt-4">
                  <textarea required value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength={2500} rows={5} className="w-full rounded-xl border border-red-500/15 bg-transparent p-3 text-sm" placeholder="Describe the issue..." />
                  <button disabled={busy} className="mt-3 min-h-11 rounded-xl bg-red-600 px-4 text-sm font-bold text-white">{busy ? 'Submitting...' : 'Submit report'}</button>
                </form>
              )}
            </section>

            <Link href="/invest/calculator" className="block rounded-[2rem] border border-[#d4b879]/25 bg-[#d4b879]/[.07] p-6 transition hover:bg-[#d4b879]/[.1]">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#8d6a14] dark:text-[#e8cf82]">Scenario tool</p>
              <h2 className="mt-2 text-xl font-black">Investment calculator</h2>
              <p className="mt-2 text-sm leading-6 opacity-60">Model illustrative scenarios using your own assumptions. This is not a forecast.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold">Open calculator <ArrowRight size={17} /></span>
            </Link>
          </aside>
        </div>
      </section>
    </main>
  )
}

function useParamsSafe() {
  const [value, setValue] = useState('')
  useEffect(() => {
    const pathname = window.location.pathname.split('/').filter(Boolean)
    setValue(pathname.at(-1) ?? '')
  }, [])
  return value
}

function useRouterSafe() {
  const router = (path: string) => {
    window.location.assign(path)
  }
  return router
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-2xl bg-black/[.025] p-4 dark:bg-white/[.03]"><div className="flex items-center gap-2 text-xs opacity-45">{icon}{label}</div><p className="mt-2 break-words text-sm font-black">{value}</p></div>
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return <div><h2 className="text-sm font-black uppercase tracking-[.12em] opacity-55">{title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 opacity-70">{body}</p></div>
}

function TrustRow({ label, ok, text }: { label: string; ok: boolean; text?: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl bg-black/[.025] p-3 dark:bg-white/[.03]"><span>{label}</span><span className={ok ? 'font-bold text-[#007171]' : 'text-xs opacity-45'}>{ok ? 'Reviewed' : text || 'Pending'}</span></div>
}
