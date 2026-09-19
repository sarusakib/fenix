'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, FileArrowUp, FileText, Handshake, Plus, UploadSimple } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import InvestmentMessageThread from '@/components/investment/InvestmentMessageThread'
import { createClient } from '@/utils/supabase/client'
import { formatBDT, opportunityTitle, progressPercent, statusLabel } from '@/lib/investment'
import type { InvestmentDeal, InvestmentDocument, InvestmentInterest, InvestmentOpportunity } from '@/types/database'

const INTEREST_STAGES = ['shortlisted', 'meeting', 'due_diligence', 'terms', 'agreed', 'declined'] as const
const DOCUMENT_TYPES = ['trade_license', 'registration', 'financial', 'ownership', 'identity', 'location', 'legal', 'other'] as const

type FormState = {
  title: string
  body: string
  period_label: string
  revenue_actual: string
  profit_actual: string
  return_actual_pct: string
  customers_actual: string
  risk_note: string
}

export default function InvestmentManagerPage() {
  const [userId, setUserId] = useState('')
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([])
  const [interests, setInterests] = useState<InvestmentInterest[]>([])
  const [deals, setDeals] = useState<InvestmentDeal[]>([])
  const [documents, setDocuments] = useState<InvestmentDocument[]>([])
  const [selected, setSelected] = useState('')
  const [messageInvestor, setMessageInvestor] = useState('')
  const [documentType, setDocumentType] = useState('other')
  const [documentVisibility, setDocumentVisibility] = useState('review_only')
  const [docBusy, setDocBusy] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dealAmount, setDealAmount] = useState('')
  const [dealInvestor, setDealInvestor] = useState('')
  const [dealOpportunity, setDealOpportunity] = useState('')
  const [updateOpportunity, setUpdateOpportunity] = useState('')
  const [updateForm, setUpdateForm] = useState<FormState>({
    title: '',
    body: '',
    period_label: '',
    revenue_actual: '',
    profit_actual: '',
    return_actual_pct: '',
    customers_actual: '',
    risk_note: '',
  })
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    const s = createClient()
    const { data: auth } = await s.auth.getUser()

    if (!auth.user) {
      window.location.assign('/login?next=/invest/manage')
      return
    }

    setUserId(auth.user.id)

    const { data: opp } = await s
      .from('investment_opportunities')
      .select('*')
      .eq('owner_id', auth.user.id)
      .order('created_at', { ascending: false })

    const list = (opp ?? []) as InvestmentOpportunity[]
    setOpportunities(list)

    if (!selected && list[0]) setSelected(list[0].id)

    const ids = list.map((item) => item.id)
    if (!ids.length) {
      setInterests([])
      setDeals([])
      setDocuments([])
      return
    }

    const [interestResult, dealResult, documentResult] = await Promise.all([
      s.from('investment_interests').select('*').in('opportunity_id', ids).order('created_at', { ascending: false }),
      s.from('investment_deals').select('*').in('opportunity_id', ids).order('created_at', { ascending: false }),
      s.from('investment_documents').select('*').in('opportunity_id', ids).order('created_at', { ascending: false }),
    ])

    setInterests((interestResult.data ?? []) as InvestmentInterest[])
    setDeals((dealResult.data ?? []) as InvestmentDeal[])
    setDocuments((documentResult.data ?? []) as InvestmentDocument[])

    const created = new URLSearchParams(window.location.search).get('created')
    if (created === '1') {
      setMessage('Opportunity submitted for FeniX review.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [selected])

  useEffect(() => {
    void load()
  }, [load])

  const current = useMemo(
    () => opportunities.find((item) => item.id === selected) ?? opportunities[0] ?? null,
    [opportunities, selected],
  )
  const currentInterests = interests.filter((item) => item.opportunity_id === current?.id)
  const currentDeals = deals.filter((item) => item.opportunity_id === current?.id)
  const currentDocs = documents.filter((item) => item.opportunity_id === current?.id)
  const messageDeal = currentDeals.find((item) => item.investor_id === messageInvestor) ?? null

  useEffect(() => {
    if (currentInterests.length && !currentInterests.some((item) => item.investor_id === messageInvestor)) {
      setMessageInvestor(currentInterests[0].investor_id)
    }
  }, [current?.id, currentInterests, messageInvestor])

  useEffect(() => {
    if (current?.status === 'approved' || current?.status === 'fully_funded') {
      if (!updateOpportunity) setUpdateOpportunity(current.id)
    }
  }, [current, updateOpportunity])

  async function changeInterest(id: string, status: string) {
    setBusy(id)
    setError('')
    const s = createClient()
    const { error: updateError } = await s.rpc('owner_update_investment_interest', {
      p_interest_id: id,
      p_status: status,
      p_owner_note: null,
    })

    if (updateError) setError(updateError.message)
    else {
      setMessage('Investor interest stage updated.')
      await load()
    }
    setBusy('')
  }

  async function createDeal(interest: InvestmentInterest) {
    const amount = Number(dealAmount || interest.offered_amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Deal amount সঠিক দিন।')
      return
    }

    const opportunity = opportunities.find((item) => item.id === interest.opportunity_id)
    if (!opportunity || amount > Number(opportunity.target_amount) - Number(opportunity.raised_amount)) {
      setError('Deal amount available funding-এর মধ্যে হতে হবে।')
      return
    }

    setBusy('deal')
    setError('')

    const s = createClient()
    const { error: insertError } = await s.from('investment_deals').insert({
      opportunity_id: interest.opportunity_id,
      investor_id: interest.investor_id,
      agreed_amount: amount,
      ownership_percentage: opportunity.ownership_percentage,
      structure: opportunity.offer_type,
      status: 'proposed',
      terms_note: 'Initial deal proposal. Final legal terms should be documented separately by the parties.',
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setMessage('Deal proposal created.')
      setDealAmount('')
      setDealInvestor('')
      setDealOpportunity('')
      await load()
    }

    setBusy('')
  }

  async function progressDeal(deal: InvestmentDeal, status: 'agreed' | 'funding_pending' | 'cancelled') {
    setBusy(deal.id)
    setError('')

    const s = createClient()
    const { error: updateError } = await s.rpc('owner_progress_investment_deal', {
      p_deal_id: deal.id,
      p_status: status,
      p_agreed_amount: deal.agreed_amount,
      p_ownership_percentage: deal.ownership_percentage,
      p_terms_note: deal.terms_note,
    })

    if (updateError) setError(updateError.message)
    else {
      setMessage(`Deal moved to ${statusLabel(status)}.`)
      await load()
    }

    setBusy('')
  }

  async function confirmFunding(deal: InvestmentDeal) {
    setBusy(deal.id)
    setError('')

    const s = createClient()
    const { error: confirmError } = await s.rpc('owner_confirm_investment_deal', { p_deal_id: deal.id })

    if (confirmError) setError(confirmError.message)
    else {
      setMessage('Your funding confirmation was recorded. The deal becomes funded only after both parties confirm.')
      await load()
    }

    setBusy('')
  }

  async function uploadDocument(file: File) {
    if (!current || !file) return

    if (file.size > 10 * 1024 * 1024) {
      setError('Document must be 10MB or smaller.')
      return
    }

    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only PDF, JPG and PNG documents are supported.')
      return
    }

    setDocBusy(file.name)
    setError('')

    const s = createClient()
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 120)
    const path = `${userId}/${current.id}/${crypto.randomUUID()}-${safe}`

    const upload = await s.storage
      .from('investment-documents')
      .upload(path, file, { upsert: false, contentType: file.type })

    if (upload.error) {
      setError(upload.error.message)
      setDocBusy('')
      return
    }

    const { error: insertError } = await s.from('investment_documents').insert({
      opportunity_id: current.id,
      owner_id: userId,
      document_type: documentType,
      title: file.name.slice(0, 160),
      storage_bucket: 'investment-documents',
      storage_path: path,
      visibility: documentVisibility,
      status: 'pending',
    })

    if (insertError) {
      await s.storage.from('investment-documents').remove([path])
      setError(insertError.message)
    } else {
      setMessage('Document uploaded for admin review.')
      await load()
    }

    setDocBusy('')
  }

  async function addUpdate() {
    if (!updateOpportunity || updateForm.title.trim().length < 3 || updateForm.body.trim().length < 10) {
      setError('Update title ও body দিন।')
      return
    }

    const revenue = updateForm.revenue_actual ? Number(updateForm.revenue_actual) : null
    const profit = updateForm.profit_actual ? Number(updateForm.profit_actual) : null
    const reportedReturn = updateForm.return_actual_pct ? Number(updateForm.return_actual_pct) : null
    const customers = updateForm.customers_actual ? Number(updateForm.customers_actual) : null

    if ([revenue, profit, reportedReturn, customers].some((value) => value !== null && !Number.isFinite(value))) {
      setError('Performance numbers সঠিকভাবে দিন।')
      return
    }

    setBusy('update')
    setError('')

    const s = createClient()
    const { error: insertError } = await s.from('investment_updates').insert({
      opportunity_id: updateOpportunity,
      author_id: userId,
      title: updateForm.title.trim(),
      body: updateForm.body.trim(),
      period_label: updateForm.period_label.trim() || null,
      revenue_actual: revenue,
      profit_actual: profit,
      return_actual_pct: reportedReturn,
      customers_actual: customers,
      risk_note: updateForm.risk_note.trim() || null,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setMessage('Business performance update published.')
      setUpdateForm({
        title: '',
        body: '',
        period_label: '',
        revenue_actual: '',
        profit_actual: '',
        return_actual_pct: '',
        customers_actual: '',
        risk_note: '',
      })
    }

    setBusy('')
  }

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-4 text-sm dark:border-white/10 dark:bg-white/[.04]">
          <ArrowLeft size={17} /> Investment
        </Link>

        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Entrepreneur</p>
            <h1 className="mt-1 text-4xl font-black">Investment Manager</h1>
            <p className="mt-2 text-sm opacity-55">Offers, investor interest, private documents, deal stages, secure chat and business reporting.</p>
          </div>
          <Link href="/invest/create" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
            <Plus size={18} /> New opportunity
          </Link>
        </div>

        {message && <div className="mt-6 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.06] p-4 text-sm">{message}</div>}
        {error && <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-sm text-red-600">{error}</div>}

        {!opportunities.length ? (
          <div className="mt-8 rounded-[2rem] border border-dashed border-[#0b1736]/15 p-12 text-center dark:border-white/15">
            <Plus size={28} className="mx-auto opacity-35" />
            <h2 className="mt-4 text-xl font-black">No opportunities yet</h2>
            <p className="mt-2 text-sm opacity-55">Create your first Feni investment opportunity.</p>
            <Link href="/invest/create" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">Create opportunity</Link>
          </div>
        ) : (
          <div className="mt-7 grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-2">
              {opportunities.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${selected === item.id ? 'border-[#008080]/35 bg-[#008080]/[.06]' : 'border-[#0b1736]/10 bg-white/70 dark:border-white/10 dark:bg-white/[.035]'}`}
                >
                  <p className="line-clamp-2 text-sm font-bold">{opportunityTitle(item)}</p>
                  <p className="mt-2 text-xs opacity-45">{statusLabel(item.status)} · {progressPercent(item)}%</p>
                </button>
              ))}
            </aside>

            {current && (
              <div className="space-y-6">
                <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045] sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[#008080]/[.08] px-3 py-1.5 text-xs font-bold text-[#007171] dark:text-[#8ee6e0]">{statusLabel(current.status)}</span>
                        <span className="rounded-full bg-[#d4b879]/[.12] px-3 py-1.5 text-xs font-bold text-[#8d6a14] dark:text-[#e8cf82]">{statusLabel(current.verification_status)}</span>
                      </div>
                      <h2 className="mt-4 text-2xl font-black">{opportunityTitle(current)}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-45">Target</p>
                      <p className="text-2xl font-black">{formatBDT(current.target_amount)}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <Metric label="Raised" value={formatBDT(current.raised_amount)} />
                    <Metric label="Minimum" value={formatBDT(current.min_investment)} />
                    <Metric label="Interest" value={String(currentInterests.length)} />
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]">
                  <h2 className="flex items-center gap-2 text-xl font-black"><Handshake size={20} /> Investor interest</h2>
                  <p className="mt-1 text-sm opacity-50">Move each investor through review, due diligence, terms and agreement.</p>

                  <div className="mt-5 space-y-3">
                    {currentInterests.length ? currentInterests.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="font-black">{formatBDT(item.offered_amount)} proposed</p>
                            <p className="mt-1 text-xs opacity-45">{statusLabel(item.status)} · {new Date(item.created_at).toLocaleDateString('en-GB')}</p>
                            {item.message && <p className="mt-3 text-sm leading-6 opacity-65">{item.message}</p>}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {INTEREST_STAGES.map((stage) => (
                              <button
                                key={stage}
                                disabled={busy === item.id}
                                type="button"
                                onClick={() => void changeInterest(item.id, stage)}
                                className={`rounded-xl px-3 py-2 text-xs font-bold ${item.status === stage ? 'bg-[#008080] text-white' : 'bg-black/[.035] dark:bg-white/[.04]'}`}
                              >
                                {statusLabel(stage)}
                              </button>
                            ))}
                            {(item.status === 'terms' || item.status === 'agreed') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDealInvestor(item.investor_id)
                                  setDealOpportunity(item.opportunity_id)
                                  setDealAmount(String(item.offered_amount))
                                }}
                                className="rounded-xl bg-[#0b1736] px-3 py-2 text-xs font-bold text-white dark:bg-white/[.12]"
                              >
                                Prepare deal
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setMessageInvestor(item.investor_id)}
                              className={`rounded-xl border px-3 py-2 text-xs font-bold ${messageInvestor === item.investor_id ? 'border-[#008080]/30 text-[#007171] dark:text-[#8ee6e0]' : 'border-[#0b1736]/10 dark:border-white/10'}`}
                            >
                              Message
                            </button>
                          </div>
                        </div>
                      </div>
                    )) : <Empty text="No investor interest yet." />}
                  </div>

                  {dealInvestor && dealOpportunity === current.id && (
                    <div className="mt-4 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.04] p-4">
                      <p className="text-sm font-bold">Create deal proposal</p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <input value={dealAmount} onChange={(event) => setDealAmount(event.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10" placeholder="Agreed amount" />
                        <button
                          type="button"
                          disabled={busy === 'deal'}
                          onClick={() => {
                            const match = currentInterests.find((item) => item.investor_id === dealInvestor)
                            if (match) void createDeal(match)
                          }}
                          className="h-11 rounded-xl bg-[#008080] px-4 text-xs font-bold text-white disabled:opacity-50"
                        >
                          {busy === 'deal' ? 'Creating...' : 'Create proposal'}
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                <InvestmentMessageThread
                  opportunityId={current.id}
                  userId={userId}
                  recipientId={messageInvestor}
                  dealId={messageDeal?.id}
                  title={messageInvestor ? 'Investor conversation' : 'Investor conversation'}
                  compact
                />

                <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]">
                  <h2 className="flex items-center gap-2 text-xl font-black"><Handshake size={20} /> Deal room</h2>
                  <div className="mt-5 space-y-3">
                    {currentDeals.length ? currentDeals.map((deal) => (
                      <div key={deal.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="font-black">{formatBDT(deal.agreed_amount)} · {statusLabel(deal.structure)}</p>
                            <p className="mt-1 text-xs opacity-45">{statusLabel(deal.status)}</p>
                            <p className="mt-2 text-xs opacity-55">Investor confirmation: {deal.investor_confirmed_at ? 'Yes' : 'Pending'} · Owner confirmation: {deal.owner_confirmed_at ? 'Yes' : 'Pending'}</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {deal.status === 'proposed' && <button type="button" disabled={busy === deal.id} onClick={() => void progressDeal(deal, 'agreed')} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Mark agreed</button>}
                            {deal.status === 'agreed' && <button type="button" disabled={busy === deal.id} onClick={() => void progressDeal(deal, 'funding_pending')} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Funding pending</button>}
                            {deal.status === 'funding_pending' && !deal.owner_confirmed_at && <button type="button" disabled={busy === deal.id} onClick={() => void confirmFunding(deal)} className="rounded-xl border border-[#008080]/25 px-3 py-2 text-xs font-bold text-[#007171] dark:text-[#8ee6e0]">Confirm funding</button>}
                          </div>
                        </div>
                      </div>
                    )) : <Empty text="No deal proposals yet." />}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]">
                  <h2 className="flex items-center gap-2 text-xl font-black"><FileArrowUp size={20} /> Due-diligence documents</h2>
                  <p className="mt-1 text-sm opacity-50">Private files stay in a non-public bucket. Admin controls verification status.</p>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <Select label="Document type" value={documentType} onChange={setDocumentType} options={[...DOCUMENT_TYPES]} />
                    <Select label="Visibility" value={documentVisibility} onChange={setDocumentVisibility} options={['review_only', 'private_shared']} />
                    <label className="md:col-span-1">
                      <span className="mb-2 block text-xs font-semibold opacity-60">File</span>
                      <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#0b1736]/15 px-3 text-xs font-bold dark:border-white/15">
                        <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" disabled={Boolean(docBusy)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadDocument(file); event.currentTarget.value = '' }} />
                        <UploadSimple size={17} />{docBusy ? 'Uploading...' : 'Choose file'}
                      </label>
                    </label>
                  </div>

                  <div className="mt-5 space-y-2">
                    {currentDocs.length ? currentDocs.map((document) => (
                      <div key={document.id} className="flex flex-col gap-3 rounded-xl bg-black/[.025] p-3 text-sm dark:bg-white/[.03] sm:flex-row sm:items-center sm:justify-between">
                        <span className="flex min-w-0 items-center gap-2 truncate"><FileText size={16} />{document.title}</span>
                        <span className="text-xs opacity-45">{document.document_type} · {statusLabel(document.status)} · {document.visibility.replaceAll('_', ' ')}</span>
                      </div>
                    )) : <p className="py-4 text-sm opacity-45">No documents uploaded.</p>}
                  </div>
                </section>

                {(current.status === 'approved' || current.status === 'fully_funded') && (
                  <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]">
                    <h2 className="text-xl font-black">Business performance update</h2>
                    <p className="mt-1 text-sm opacity-50">Record factual results. Actual figures are reported data, not independent verification.</p>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <Input label="Update title" value={updateForm.title} onChange={(value) => setUpdateForm((state) => ({ ...state, title: value }))} />
                      <Input label="Period" value={updateForm.period_label} onChange={(value) => setUpdateForm((state) => ({ ...state, period_label: value }))} />
                      <Input label="Revenue actual (BDT)" value={updateForm.revenue_actual} onChange={(value) => setUpdateForm((state) => ({ ...state, revenue_actual: value }))} inputMode="decimal" />
                      <Input label="Profit actual (BDT)" value={updateForm.profit_actual} onChange={(value) => setUpdateForm((state) => ({ ...state, profit_actual: value }))} inputMode="decimal" />
                      <Input label="Reported return (%)" value={updateForm.return_actual_pct} onChange={(value) => setUpdateForm((state) => ({ ...state, return_actual_pct: value }))} inputMode="decimal" />
                      <Input label="Customers actual" value={updateForm.customers_actual} onChange={(value) => setUpdateForm((state) => ({ ...state, customers_actual: value }))} inputMode="numeric" />
                      <label className="md:col-span-2"><span className="mb-2 block text-xs font-semibold opacity-60">Update body</span><textarea value={updateForm.body} onChange={(event) => setUpdateForm((state) => ({ ...state, body: event.target.value }))} rows={5} maxLength={6000} className="w-full rounded-xl border border-[#0b1736]/10 bg-transparent p-3 text-sm leading-6 dark:border-white/10" /></label>
                      <label className="md:col-span-2"><span className="mb-2 block text-xs font-semibold opacity-60">Risk note</span><textarea value={updateForm.risk_note} onChange={(event) => setUpdateForm((state) => ({ ...state, risk_note: event.target.value }))} rows={3} maxLength={1500} className="w-full rounded-xl border border-[#0b1736]/10 bg-transparent p-3 text-sm leading-6 dark:border-white/10" /></label>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Select label="" value={updateOpportunity} onChange={setUpdateOpportunity} options={opportunities.filter((item) => item.status === 'approved' || item.status === 'fully_funded').map((item) => item.id)} optionLabels={opportunities.filter((item) => item.status === 'approved' || item.status === 'fully_funded').map(opportunityTitle)} />
                      <button type="button" disabled={busy === 'update'} onClick={() => void addUpdate()} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white"><CheckCircle size={17} />{busy === 'update' ? 'Publishing...' : 'Publish update'}</button>
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-black/[.025] p-3 dark:bg-white/[.03]"><p className="text-xs opacity-45">{label}</p><p className="mt-1 font-black">{value}</p></div>
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm opacity-45">{text}</p>
}

function Input({ label, value, onChange, inputMode }: { label: string; value: string; onChange: (value: string) => void; inputMode?: 'numeric' | 'decimal' }) {
  return <label><span className="mb-2 block text-xs font-semibold opacity-60">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} inputMode={inputMode} className="h-11 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10" /></label>
}

function Select({ label, value, onChange, options, optionLabels }: { label: string; value: string; onChange: (value: string) => void; options: string[]; optionLabels?: string[] }) {
  return <label className="block min-w-[12rem] flex-1"><span className="mb-2 block text-xs font-semibold opacity-60">{label || ' '}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"><option value="">Choose</option>{options.map((option, index) => <option key={option} value={option}>{optionLabels?.[index] ?? option.replaceAll('_', ' ')}</option>)}</select></label>
}
