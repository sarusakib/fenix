'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, ShieldCheck, Storefront, Truck, Star, Receipt } from '@phosphor-icons/react'
import { createClient } from '@/utils/supabase/client'

type Vendor = { id: string; display_name: string; status: string; is_verified: boolean; created_at: string }
type Rule = { id: string; district: string | null; upazila: string | null; fee: number; free_shipping_minimum: number | null; is_active: boolean; sort_order: number }
type Review = { id: string; rating: number; title: string | null; body: string | null; status: string; product_id: string; created_at: string }

export default function CommerceAdminPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [district, setDistrict] = useState('')
  const [upazila, setUpazila] = useState('')
  const [fee, setFee] = useState('0')
  const [freeMinimum, setFreeMinimum] = useState('')

  async function load() {
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) { window.location.replace('/login?next=/commerce/admin'); return }
    const { data: profile } = await s.from('profiles').select('role').eq('id', auth.user.id).maybeSingle()
    if (profile?.role !== 'admin') { setError('Admin access required.'); setLoading(false); return }
    const [v, r, rv] = await Promise.all([
      s.from('vendor_profiles').select('id,display_name,status,is_verified,created_at').order('created_at', { ascending: false }),
      s.from('commerce_delivery_rules').select('id,district,upazila,fee,free_shipping_minimum,is_active,sort_order').order('sort_order'),
      s.from('product_reviews').select('id,rating,title,body,status,product_id,created_at').order('created_at', { ascending: false }).limit(50),
    ])
    if (v.error || r.error || rv.error) setError('Admin data load করা যায়নি।')
    setVendors((v.data ?? []) as Vendor[])
    setRules((r.data ?? []).map((x: any) => ({ ...x, fee: Number(x.fee), free_shipping_minimum: x.free_shipping_minimum == null ? null : Number(x.free_shipping_minimum) })))
    setReviews((rv.data ?? []) as Review[])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  async function vendorStatus(vendor: Vendor, status: string) {
    setBusy(vendor.id); setError('')
    const s = createClient()
    const { error: e } = await s.rpc('admin_set_vendor_status', { p_vendor_id: vendor.id, p_status: status, p_is_verified: status === 'approved' })
    if (e) setError('Seller status update করা যায়নি.')
    else await load()
    setBusy('')
  }

  async function addRule() {
    setBusy('rule'); setError('')
    const s = createClient()
    const { error: e } = await s.rpc('admin_upsert_delivery_rule', {
      p_district: district.trim() || null,
      p_upazila: upazila.trim() || null,
      p_fee: Math.max(0, Number(fee) || 0),
      p_free_shipping_minimum: freeMinimum.trim() ? Math.max(0, Number(freeMinimum) || 0) : null,
      p_is_active: true,
      p_sort_order: rules.length,
    })
    if (e) setError('Delivery rule save করা যায়নি.')
    else { setDistrict(''); setUpazila(''); setFee('0'); setFreeMinimum(''); await load() }
    setBusy('')
  }

  async function reviewStatus(id: string, status: string) {
    setBusy(id); setError('')
    const s = createClient()
    const { error: e } = await s.rpc('admin_set_review_status', { p_review_id: id, p_status: status })
    if (e) setError('Review status update করা যায়নি.')
    else await load()
    setBusy('')
  }

  return <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
    <Link href="/commerce" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[.045]"><ArrowLeft size={17}/> Commerce</Link>
    <div className="mt-8 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008080]/10 text-[#008080]"><ShieldCheck size={25}/></div><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Commerce Admin</p><h1 className="mt-1 text-4xl font-black">Control center</h1></div></div>
    {error && <div className="mt-6 rounded-xl bg-red-500/[.06] p-4 text-sm text-red-600">{error}</div>}
    {loading ? <div className="py-24 text-center opacity-50">Loading admin panel...</div> : <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]"><h2 className="flex items-center gap-2 text-xl font-black"><Storefront size={20}/> Seller approval</h2><div className="mt-5 space-y-3">{vendors.length ? vendors.map(v => <div key={v.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{v.display_name}</p><p className="mt-1 text-xs opacity-45 capitalize">{v.status}{v.is_verified ? ' · verified' : ''}</p></div><div className="flex flex-wrap gap-2">{v.status !== 'approved' && <button disabled={busy === v.id} onClick={() => void vendorStatus(v, 'approved')} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Approve</button>}{v.status === 'approved' && <button disabled={busy === v.id} onClick={() => void vendorStatus(v, 'suspended')} className="rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-600">Suspend</button>}{v.status === 'pending' && <button disabled={busy === v.id} onClick={() => void vendorStatus(v, 'rejected')} className="rounded-xl border border-[#0b1736]/10 px-3 py-2 text-xs font-bold dark:border-white/10">Reject</button>}</div></div></div>) : <p className="py-8 text-center text-sm opacity-50">No sellers.</p>}</div></section>
      <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]"><h2 className="flex items-center gap-2 text-xl font-black"><Truck size={20}/> Delivery rules</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><input value={district} onChange={e => setDistrict(e.target.value)} placeholder="District" className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"/><input value={upazila} onChange={e => setUpazila(e.target.value)} placeholder="Upazila (optional)" className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"/><input value={fee} onChange={e => setFee(e.target.value)} type="number" min="0" placeholder="Delivery fee" className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"/><input value={freeMinimum} onChange={e => setFreeMinimum(e.target.value)} type="number" min="0" placeholder="Free shipping minimum" className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"/></div><button disabled={busy === 'rule'} onClick={() => void addRule()} className="mt-3 rounded-xl bg-[#008080] px-4 py-2.5 text-xs font-bold text-white">{busy === 'rule' ? 'Saving…' : 'Add rule'}</button><div className="mt-5 space-y-2">{rules.map(r => <div key={r.id} className="flex items-center justify-between rounded-xl bg-black/[.025] p-3 text-xs dark:bg-white/[.03]"><span>{r.district || 'Default'}{r.upazila ? ` / ${r.upazila}` : ''}</span><strong>BDT {r.fee.toLocaleString('en-BD')}{r.free_shipping_minimum != null ? ` · free ≥ ${r.free_shipping_minimum.toLocaleString('en-BD')}` : ''}</strong></div>)}</div></section>
      <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045] lg:col-span-2"><h2 className="flex items-center gap-2 text-xl font-black"><Star size={20}/> Review moderation</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{reviews.length ? reviews.map(r => <div key={r.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="text-sm font-black">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span><span className="text-xs capitalize opacity-50">{r.status}</span></div><p className="mt-2 font-bold">{r.title || 'Review'}</p>{r.body && <p className="mt-1 text-sm opacity-60">{r.body}</p>}<div className="mt-4 flex gap-2">{r.status !== 'published' && <button disabled={busy === r.id} onClick={() => void reviewStatus(r.id, 'published')} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Publish</button>}{r.status !== 'rejected' && <button disabled={busy === r.id} onClick={() => void reviewStatus(r.id, 'rejected')} className="rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-600">Reject</button>}</div></div>) : <p className="py-8 text-center text-sm opacity-50 md:col-span-2">No reviews.</p>}</div></section>
      <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045] lg:col-span-2"><h2 className="flex items-center gap-2 text-xl font-black"><Receipt size={20}/> Operations</h2><p className="mt-2 text-sm opacity-55">COD/manual payment operations remain free-first. Gateway integration can be added later without changing the seller/customer flow.</p><div className="mt-4 flex flex-wrap gap-3"><Link href="/commerce/seller/orders" className="rounded-xl border border-[#0b1736]/10 px-4 py-2.5 text-sm font-bold dark:border-white/10">Seller orders</Link><Link href="/commerce/seller/inventory" className="rounded-xl border border-[#0b1736]/10 px-4 py-2.5 text-sm font-bold dark:border-white/10">Inventory</Link></div></section>
    </div>}
  </section></main>
}
