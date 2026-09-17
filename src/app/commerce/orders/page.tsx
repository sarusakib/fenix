import Link from 'next/link'
import { ArrowLeft, ArrowRight, Package, SignIn } from '@phosphor-icons/react/dist/ssr'

import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CommerceOrdersPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    return <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar /><section className="mx-auto max-w-xl px-4 py-24 text-center"><SignIn size={48} className="mx-auto opacity-30" /><h1 className="mt-5 text-3xl font-black">Sign in to view orders</h1><p className="mt-3 text-sm opacity-55">আপনার account-এর orders নিরাপদভাবে দেখতে login করুন।</p><Link href="/login?next=/commerce/orders" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#008080] px-5 py-3 text-sm font-bold text-white">Sign in <ArrowRight size={17} /></Link></section></main>
  }

  const { data: orders } = await supabase.from('orders').select('id, order_number, status, payment_status, total_amount, currency, created_at').eq('customer_id', auth.user.id).order('created_at', { ascending: false }).limit(50)

  return <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar /><section className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8"><Link href="/commerce" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]"><ArrowLeft size={17} /> Commerce</Link><div className="mt-8"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#008080]">Account</p><h1 className="mt-2 text-4xl font-black">My orders</h1></div>{orders?.length ? <div className="mt-7 space-y-3">{orders.map((order) => <Link key={order.id} href={`/commerce/orders/${encodeURIComponent(order.id)}`} className="flex flex-col gap-4 rounded-2xl border border-[#0b1736]/10 bg-white/75 p-5 transition hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:hover:bg-white/[0.07] sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold tracking-[0.12em] text-[#008080]">{order.order_number}</p><p className="mt-1 text-sm font-bold capitalize">{order.status}</p><p className="mt-1 text-xs opacity-45">{new Date(order.created_at).toLocaleString('en-BD')}</p></div><div className="flex items-center justify-between gap-5 sm:justify-end"><strong>{order.currency} {Number(order.total_amount).toLocaleString('en-BD')}</strong><span className="rounded-full bg-black/[0.04] px-3 py-1 text-xs capitalize dark:bg-white/[0.06]">{order.payment_status}</span><ArrowRight size={18} className="opacity-40" /></div></Link>)}</div> : <div className="mt-7 rounded-[2rem] border border-[#0b1736]/10 bg-white/70 p-12 text-center dark:border-white/10 dark:bg-white/[0.045]"><Package size={48} className="mx-auto opacity-25" /><h2 className="mt-4 text-xl font-bold">No orders yet</h2><Link href="/commerce" className="mt-6 inline-flex rounded-xl bg-[#008080] px-5 py-3 text-sm font-bold text-white">Start shopping</Link></div>}</section></main>
}
