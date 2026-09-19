'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ShieldCheck, X } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Row = { id: string; business_id: string; status: string; created_at: string; [key: string]: any }

const tables = {
  claim: 'business_claim_requests',
  review: 'business_reviews',
  report: 'business_reports',
} as const

export default function AdminTrustPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [claims, setClaims] = useState<Row[]>([])
  const [reviews, setReviews] = useState<Row[]>([])
  const [reports, setReports] = useState<Row[]>([])
  const [verifications, setVerifications] = useState<Row[]>([])
  const [names, setNames] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const { data: admin, error: adminError } = await s.rpc('is_fenix_admin')
      if (!active) return
      if (adminError || !admin) { setAllowed(false); return }
      setAllowed(true)
      const [c, r, b, v] = await Promise.all([
        s.from(tables.claim).select('*').order('created_at', { ascending: false }).limit(50),
        s.from(tables.review).select('*').order('created_at', { ascending: false }).limit(50),
        s.from(tables.report).select('*').order('created_at', { ascending: false }).limit(50),
        s.from('business_verification_requests').select('*').order('created_at', { ascending: false }).limit(50),
      ])
      if (!active) return
      if (c.error || r.error || b.error || v.error) { setError('Trust queue could not be loaded completely.'); return }
      setClaims(c.data ?? [])
      setReviews(r.data ?? [])
      setReports(b.data ?? [])
      setVerifications(v.data ?? [])
      const ids = [...new Set([...(c.data ?? []), ...(r.data ?? []), ...(b.data ?? []), ...(v.data ?? [])].map(x => x.business_id).filter(Boolean))]
      if (ids.length) {
        const { data: bs } = await s.from('businesses').select('id,name,title_bn,title_en').in('id', ids)
        if (bs) setNames(Object.fromEntries(bs.map(x => [x.id, x.title_bn || x.title_en || x.name])))
      }
    }
    void load()
    return () => { active = false }
  }, [])

  async function act(kind: 'claim' | 'review' | 'report' | 'verification', id: string, status: string) {
    setBusy(kind + id)
    setError('')
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) { setError('Admin session expired.'); setBusy(''); return }
    const now = new Date().toISOString()
    const patch = kind === 'claim'
      ? { status, reviewed_by: auth.user.id, reviewed_at: now }
      : kind === 'review'
        ? { status, reviewed_by: auth.user.id, reviewed_at: now }
        : kind === 'report'
          ? { status, reviewer_id: auth.user.id, resolved_at: ['resolved', 'dismissed'].includes(status) ? now : null }
          : { status, reviewed_by: auth.user.id, reviewed_at: now }
    const table = kind === 'verification' ? 'business_verification_requests' : tables[kind]
    const { error: e } = await s.from(table).update(patch).eq('id', id)
    if (e) { setError('Update failed.'); setBusy(''); return }
    if (kind === 'claim') setClaims(v => v.map(x => x.id === id ? { ...x, ...patch } : x))
    if (kind === 'review') setReviews(v => v.map(x => x.id === id ? { ...x, ...patch } : x))
    if (kind === 'report') setReports(v => v.map(x => x.id === id ? { ...x, ...patch } : x))
    if (kind === 'verification') setVerifications(v => v.map(x => x.id === id ? { ...x, ...patch } : x))
    setBusy('')
  }

  if (allowed === null) return <main className="min-h-dvh bg-[#f7faf9] dark:bg-[#030506]"><Navbar /><div className="mx-auto max-w-5xl px-4 py-16 text-sm opacity-60">Checking admin access…</div></main>
  if (!allowed) return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar /><div className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-3xl font-black">Admin access required</h1><Link href="/admin" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white"><ArrowLeft size={17} /> Admin center</Link></div></main>

  const renderQueue = (title: string, rows: Row[], kind: 'claim' | 'review' | 'report' | 'verification') => (
    <section className="rounded-[2rem] border border-black/10 bg-white/85 p-5 dark:border-white/10 dark:bg-white/[.045] sm:p-7">
      <div className="flex items-center gap-3"><ShieldCheck size={22} className="text-[#008080]" /><div><h2 className="text-xl font-black">{title}</h2><p className="text-xs opacity-45">{rows.filter(x => x.status === 'pending').length} pending</p></div></div>
      <div className="mt-5 space-y-3">
        {rows.length ? rows.map(row => (
          <article key={row.id} className="rounded-2xl border border-black/10 bg-black/[.018] p-4 dark:border-white/[.08] dark:bg-white/[.02]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-bold">{names[row.business_id] || 'Business ' + row.business_id.slice(0, 8)}</p><p className="mt-1 text-xs opacity-45">{row.status} · {new Date(row.created_at).toLocaleString('en-GB')}</p></div>
              {row.status === 'pending' && <div className="flex gap-2">{kind === 'report' ? <><ActionButton onClick={() => void act(kind, row.id, 'resolved')} disabled={busy === kind + row.id} good>Resolve<Check size={15} /></ActionButton><ActionButton onClick={() => void act(kind, row.id, 'dismissed')} disabled={busy === kind + row.id}>Dismiss<X size={15} /></ActionButton></> : <><ActionButton onClick={() => void act(kind, row.id, kind === 'claim' || kind === 'verification' ? 'approved' : 'published')} disabled={busy === kind + row.id} good> {kind === 'claim' || kind === 'verification' ? 'Approve' : 'Publish'} <Check size={15} /></ActionButton><ActionButton onClick={() => void act(kind, row.id, 'rejected')} disabled={busy === kind + row.id}>Reject<X size={15} /></ActionButton></>}</div>}
            </div>
            {row.note && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 opacity-65">{row.note}</p>}
            {row.title && <p className="mt-3 text-sm font-bold">{row.title}{row.rating ? ' · ' + row.rating + '/5' : ''}</p>}
            {row.body && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 opacity-65">{row.body}</p>}
            {row.reason && <p className="mt-3 text-xs font-bold opacity-50">Reason: {row.reason}</p>}
            {row.details && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 opacity-65">{row.details}</p>}
          </article>
        )) : <p className="py-6 text-sm opacity-45">Queue is empty.</p>}
      </div>
    </section>
  )

  return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar /><section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><Link href="/admin" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17} /> Admin center</Link><div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Trust center</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Business trust queue</h1><p className="mt-3 max-w-3xl text-sm leading-7 opacity-60">Review ownership claims, directory reviews and abuse reports. Approval changes the relevant state; it does not create government certification or guarantee business quality.</p></div>{error && <div className="mt-5 rounded-xl bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200">{error}</div>}<div className="mt-8 grid gap-5">{renderQueue('Ownership claims', claims, 'claim')}{renderQueue('Business verification', verifications, 'verification')}{renderQueue('Business reviews', reviews, 'review')}{renderQueue('Business reports', reports, 'report')}</div></section></main>
}

function ActionButton({ children, onClick, disabled, good = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; good?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className={'inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-xs font-bold disabled:opacity-50 ' + (good ? 'bg-[#008080] text-white' : 'border border-black/10 dark:border-white/10')}>{children}</button>
}
