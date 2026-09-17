'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ArrowLeft, Truck, CheckCircle, Clock, XCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Row = { order_id: string; order_number: string; status: string; total_amount: number; created_at: string; customer_name: string; item_count: number }

export default function SellerOrdersPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const supabase = createClient()
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) { window.location.replace('/login?next=/commerce/seller/orders'); return }
      const { data: vendor } = await supabase.from('vendor_profiles').select('id,status').eq('user_id', auth.user.id).maybeSingle()
      if (!vendor || vendor.status !== 'approved') { window.location.replace('/commerce/seller'); return }
      const { data, error: orderError } = await supabase
        .from('orders')
        .select('id,order_number,status,total_amount,created_at,shipping_name,order_items!inner(id,vendor_id)')
        .eq('order_items.vendor_id', vendor.id)
        .order('created_at', { ascending: false })
      if (!active) return
      if (orderError) { setError('Orders load করা যায়নি।'); setLoading(false); return }
      const mapped = (data ?? []).map((r: any) => ({ order_id: r.id, order_number: r.order_number, status: r.status, total_amount: Number(r.total_amount), created_at: r.created_at, customer_name: r.shipping_name, item_count: Array.isArray(r.order_items) ? r.order_items.length : 0 }))
      setRows(mapped); setLoading(false)
    }
    void load(); return () => { active = false }
  }, [])

  return <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8"><Link href="/commerce/seller" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]"><ArrowLeft size={17}/> Seller Dashboard</Link><div className="mt-9"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Seller Orders</p><h1 className="mt-2 text-4xl font-black">Orders</h1><p className="mt-2 text-sm opacity-55">শুধু আপনার products-সহ orders এখানে দেখা যাবে।</p></div>{loading ? <div className="py-24 text-center opacity-50">Orders loading...</div> : error ? <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-red-600">{error}</div> : rows.length ? <div className="mt-8 space-y-3">{rows.map(row => <Link key={row.order_id} href={`/commerce/seller/orders/${encodeURIComponent(row.order_id)}`} className="block rounded-2xl border border-[#0b1736]/10 bg-white/80 p-5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[.045]"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-black">{row.order_number}</p><p className="mt-1 text-sm opacity-55">{row.customer_name} · {row.item_count} item(s)</p><p className="mt-1 text-xs opacity-40">{new Date(row.created_at).toLocaleString('en-BD')}</p></div><div className="flex items-center gap-3"><StatusIcon status={row.status}/><span className="rounded-full bg-[#008080]/10 px-3 py-1.5 text-xs font-bold capitalize text-[#007373] dark:text-teal-200">{row.status}</span><strong>BDT {row.total_amount.toLocaleString('en-BD')}</strong></div></div></Link>)}</div> : <div className="mt-8 rounded-[2rem] border border-[#0b1736]/10 bg-white/70 p-12 text-center dark:border-white/10 dark:bg-white/[.04]"><Package size={42} className="mx-auto opacity-30"/><h2 className="mt-4 text-xl font-bold">No orders yet</h2></div>}</section></main>
}
function StatusIcon({status}:{status:string}) { if(status==='delivered') return <CheckCircle size={19}/>; if(status==='cancelled') return <XCircle size={19}/>; if(status==='shipped') return <Truck size={19}/>; return <Clock size={19}/> }
