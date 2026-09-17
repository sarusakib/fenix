'use client'

import { useState } from 'react'
import { ChatCircleText, Star, ArrowCounterClockwise } from '@phosphor-icons/react'
import { createClient } from '@/utils/supabase/client'

type OrderItem = {
  id: string
  product_id: string | null
  product_name: string
  quantity: number
}

type ReviewActionProps = {
  orderId: string
  item: OrderItem
}

export default function CustomerOrderActions({ orderId: _orderId, items }: { orderId: string; items: OrderItem[] }) {
  const [active, setActive] = useState<string | null>(null)
  const [rating, setRating] = useState('5')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submitReview(item: OrderItem) {
    if (!item.product_id) return
    setBusy(true)
    setError('')
    setMessage('')
    const supabase = createClient()
    const { error: rpcError } = await supabase.rpc('create_product_review', {
      p_product_id: item.product_id,
      p_rating: Math.min(5, Math.max(1, Number(rating))),
      p_title: title.trim().slice(0, 160) || null,
      p_body: body.trim().slice(0, 4000) || null,
    })
    if (rpcError) {
      setError('Review submit করা যায়নি। সম্ভবত এই product-এর review আগেই করা হয়েছে।')
    } else {
      setMessage('Review submitted. Admin moderation-এর পর এটি public হবে।')
      setActive(null)
    }
    setBusy(false)
  }

  async function submitReturn(item: OrderItem) {
    setBusy(true)
    setError('')
    setMessage('')
    const supabase = createClient()
    const { error: rpcError } = await supabase.rpc('create_commerce_return_request', {
      p_order_item_id: item.id,
      p_reason: reason.trim().slice(0, 200),
      p_details: details.trim().slice(0, 4000) || null,
    })
    if (rpcError) {
      setError('Return request তৈরি করা যায়নি। Reason দিন বা আগের request check করুন।')
    } else {
      setMessage('Return request submitted.')
      setActive(null)
    }
    setBusy(false)
  }

  return (
    <section className="mt-4 rounded-[2rem] border border-[#0b1736]/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.045]">
      <div>
        <h2 className="font-black">After delivery</h2>
        <p className="mt-1 text-xs opacity-50">Delivered items থেকে verified review বা return request করতে পারবেন।</p>
      </div>

      {message && <p className="mt-4 rounded-xl bg-[#008080]/[0.06] p-3 text-xs font-semibold text-[#006b6b] dark:text-teal-200">{message}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-500/[0.06] p-3 text-xs font-semibold text-red-600 dark:text-red-300">{error}</p>}

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{item.product_name}</p>
                <p className="mt-1 text-xs opacity-45">Qty {item.quantity}</p>
              </div>
              {item.product_id && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setActive(`review:${item.id}`)} className="inline-flex items-center gap-2 rounded-xl bg-[#008080] px-3.5 py-2 text-xs font-bold text-white">
                    <Star size={15} /> Review
                  </button>
                  <button type="button" onClick={() => setActive(`return:${item.id}`)} className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 px-3.5 py-2 text-xs font-bold dark:border-white/10">
                    <ArrowCounterClockwise size={15} /> Return
                  </button>
                </div>
              )}
            </div>

            {active === `review:${item.id}` && (
              <div className="mt-4 grid gap-3 rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
                <label className="text-xs font-semibold">Rating<select value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 dark:border-white/10"><option value="5">5 — Excellent</option><option value="4">4 — Good</option><option value="3">3 — Okay</option><option value="2">2 — Poor</option><option value="1">1 — Very poor</option></select></label>
                <label className="text-xs font-semibold">Title<input value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10" /></label>
                <label className="text-xs font-semibold">Review<textarea value={body} maxLength={4000} onChange={(e) => setBody(e.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 py-2 text-sm dark:border-white/10" /></label>
                <div className="flex gap-2"><button disabled={busy} onClick={() => void submitReview(item)} className="inline-flex items-center gap-2 rounded-xl bg-[#008080] px-4 py-2 text-xs font-bold text-white disabled:opacity-40"><ChatCircleText size={15} /> {busy ? 'Submitting…' : 'Submit review'}</button><button type="button" onClick={() => setActive(null)} className="rounded-xl border border-[#0b1736]/10 px-4 py-2 text-xs font-bold dark:border-white/10">Close</button></div>
              </div>
            )}

            {active === `return:${item.id}` && (
              <div className="mt-4 grid gap-3 rounded-2xl bg-black/[0.025] p-4 dark:bg-white/[0.03]">
                <label className="text-xs font-semibold">Reason<input value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} placeholder="Damaged, wrong item, etc." className="mt-1 h-10 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10" /></label>
                <label className="text-xs font-semibold">Details<textarea value={details} maxLength={4000} onChange={(e) => setDetails(e.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 py-2 text-sm dark:border-white/10" /></label>
                <div className="flex gap-2"><button disabled={busy || reason.trim().length < 2} onClick={() => void submitReturn(item)} className="inline-flex items-center gap-2 rounded-xl bg-[#0b1736] px-4 py-2 text-xs font-bold text-white disabled:opacity-40 dark:bg-white/[0.12]"><ArrowCounterClockwise size={15} /> {busy ? 'Submitting…' : 'Request return'}</button><button type="button" onClick={() => setActive(null)} className="rounded-xl border border-[#0b1736]/10 px-4 py-2 text-xs font-bold dark:border-white/10">Close</button></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
