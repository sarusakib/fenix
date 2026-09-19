'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { Flag, QrCode, Star, UserCircle } from '@phosphor-icons/react'
import { createClient } from '@/utils/supabase/client'

type Review = {
  id: string
  rating: number
  title: string | null
  body: string
  status: string
  created_at: string
}

export default function BusinessTrustPanel({ businessId, businessPath }: { businessId: string; businessPath: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [report, setReport] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const s = createClient()
    const { data } = await s
      .from('business_reviews')
      .select('id,rating,title,body,status,created_at')
      .eq('business_id', businessId)
      .in('status', ['published'])
      .order('created_at', { ascending: false })
      .limit(20)
    setReviews((data ?? []) as Review[])
  }

  useEffect(() => { void load() }, [businessId])

  async function submitReview(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice('')
    setError('')
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) {
      setError('Please sign in to write a review.')
      setBusy(false)
      return
    }
    const { error: e } = await s.from('business_reviews').insert({
      business_id: businessId,
      author_id: auth.user.id,
      rating,
      title: title.trim().slice(0, 160) || null,
      body: body.trim().slice(0, 2500),
      status: 'pending',
    })
    if (e) setError('Review could not be submitted. You may already have a review for this business.')
    else {
      setNotice('Review submitted for moderation.')
      setTitle('')
      setBody('')
      setRating(5)
      setShowReview(false)
      await load()
    }
    setBusy(false)
  }

  async function submitReport(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNotice('')
    setError('')
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) {
      setError('Please sign in to report this business.')
      setBusy(false)
      return
    }
    const { error: e } = await s.from('business_reports').insert({
      business_id: businessId,
      reporter_id: auth.user.id,
      reason: 'business_listing',
      details: report.trim().slice(0, 3000),
      status: 'pending',
    })
    if (e) setError('Report could not be submitted right now.')
    else {
      setNotice('Report submitted to the FeniX trust queue.')
      setReport('')
      setShowReport(false)
    }
    setBusy(false)
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,.05)] dark:border-white/[0.08] dark:bg-white/[0.045] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-teal-700 dark:text-teal-200">Trust & community</p>
          <h2 className="mt-2 text-2xl font-black">Reviews and transparency</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-white/45">Reviews are moderated. A trust label describes what FeniX checked; it is not a quality guarantee or government approval.</p>
        </div>
        <div className="flex gap-2">
          <Link href={businessPath + '/qr'} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold dark:border-white/10"><QrCode size={16}/> QR identity</Link>
          <button type="button" onClick={() => setShowReport(v => !v)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-500/15 px-3 text-xs font-bold text-red-700 dark:text-red-300"><Flag size={16}/> Report</button>
        </div>
      </div>

      {reviews.length ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {reviews.map(review => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[.07] dark:bg-white/[.025]">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} weight={i < review.rating ? 'fill' : 'regular'} />)}
              </div>
              {review.title && <h3 className="mt-3 text-sm font-black">{review.title}</h3>}
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/55">{review.body}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] opacity-40"><UserCircle size={13}/> {new Date(review.created_at).toLocaleDateString('en-BD')}</p>
            </article>
          ))}
        </div>
      ) : <p className="mt-6 rounded-2xl bg-black/[.025] p-5 text-sm opacity-50 dark:bg-white/[.03]">No published reviews yet.</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={() => setShowReview(v => !v)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white"><Star size={17}/> Write a review</button>
      </div>

      {showReview && (
        <form onSubmit={submitReview} className="mt-5 rounded-2xl border border-teal-500/15 bg-teal-500/[.04] p-5">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={'Rate ' + (i + 1)} className="rounded-lg p-1 text-amber-500"><Star size={22} weight={i < rating ? 'fill' : 'regular'} /></button>)}
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} maxLength={160} placeholder="Review title (optional)" className="mt-4 h-11 w-full rounded-xl border border-black/10 bg-transparent px-3 text-sm dark:border-white/10" />
          <textarea required value={body} onChange={e => setBody(e.target.value)} maxLength={2500} rows={5} placeholder="Share what you actually experienced." className="mt-3 w-full rounded-xl border border-black/10 bg-transparent p-3 text-sm leading-6 dark:border-white/10" />
          <button disabled={busy} className="mt-3 min-h-11 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Submitting...' : 'Submit for review'}</button>
        </form>
      )}

      {showReport && (
        <form onSubmit={submitReport} className="mt-5 rounded-2xl border border-red-500/15 bg-red-500/[.04] p-5">
          <label className="block text-xs font-bold uppercase tracking-[.12em] opacity-50">What should FeniX review?</label>
          <textarea required value={report} onChange={e => setReport(e.target.value)} maxLength={3000} rows={5} placeholder="Describe misleading information, impersonation, unsafe behavior or another listing issue." className="mt-3 w-full rounded-xl border border-red-500/15 bg-transparent p-3 text-sm leading-6" />
          <button disabled={busy} className="mt-3 min-h-11 rounded-xl bg-red-600 px-4 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Submitting...' : 'Submit report'}</button>
        </form>
      )}

      {error && <p className="mt-4 rounded-xl bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200">{error}</p>}
      {notice && <p className="mt-4 rounded-xl bg-[#008080]/[.06] p-3 text-sm text-[#007171]">{notice}</p>}
    </section>
  )
}
