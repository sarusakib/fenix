import Link from 'next/link'
import { ArrowLeft, CheckCircle, Package, ShieldCheck } from '@phosphor-icons/react/dist/ssr'

import Navbar from '@/components/Navbar'
import CustomerOrderActions from '@/components/commerce/CustomerOrderActions'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

type Item = { id: string; product_id: string | null; product_name: string; product_sku: string | null; quantity: number; unit_price: number; line_total: number }

export default async function CommerceOrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return <main className="min-h-screen bg-[#f7faf9] dark:bg-[#030506]"><Navbar /><div className="p-20 text-center">Please sign in.</div></main>

  const { data: order } = await supabase.from('orders').select('id, order_number, status, payment_status, payment_method, currency, subtotal, delivery_fee, discount_amount, total_amount, shipping_name, shipping_phone, shipping_address, shipping_area, shipping_upazila, shipping_district, created_at').eq('id', id).eq('customer_id', auth.user.id).maybeSingle()
  if (!order) return <main className="min-h-screen bg-[#f7faf9] dark:bg-[#030506]"><Navbar /><section className="p-20 text-center"><h1 className="text-2xl font-black">Order not found</h1><Link href="/commerce/orders" className="mt-5 inline-flex rounded-xl bg-[#008080] px-5 py-3 text-sm font-bold text-white">Back to orders</Link></section></main>

  const { data: items } = await supabase.from('order_items').select('id, product_id, product_name, product_sku, quantity, unit_price, line_total').eq('order_id', order.id)
  const typedItems = (items ?? []) as Item[]
  const { data: returnRequests } = await supabase
    .from('commerce_return_requests')
    .select('id,order_item_id,reason,status,resolution_note,refund_amount,created_at')
    .eq('order_id', order.id)
    .eq('customer_id', auth.user.id)
    .order('created_at', { ascending: false })
  return <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar /><section className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6 lg:px-8"><Link href="/commerce/orders" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]"><ArrowLeft size={17} /> My orders</Link><div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#008080]">Order</p><h1 className="mt-2 text-3xl font-black">{order.order_number}</h1><p className="mt-2 text-xs opacity-45">{new Date(order.created_at).toLocaleString('en-BD')}</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#008080]/10 px-4 py-2 text-xs font-bold capitalize text-[#007373] dark:text-teal-200"><CheckCircle size={15} weight="fill" /> {order.status}</span></div><div className="mt-7 grid gap-4 sm:grid-cols-3"><Info label="Payment" value={order.payment_status} /><Info label="Method" value={order.payment_method.replaceAll('_', ' ')} /><Info label="Total" value={`${order.currency} ${Number(order.total_amount).toLocaleString('en-BD')}`} /></div><section className="mt-7 rounded-[2rem] border border-[#0b1736]/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.045]"><h2 className="font-black">Items</h2><div className="mt-5 space-y-3">{typedItems.map((item) => <div key={item.id} className="flex justify-between gap-4 border-b border-[#0b1736]/10 pb-3 text-sm last:border-0 last:pb-0 dark:border-white/10"><span>{item.product_name} × {item.quantity}</span><strong>{order.currency} {Number(item.line_total).toLocaleString('en-BD')}</strong></div>)}</div><div className="mt-6 border-t border-[#0b1736]/10 pt-5 dark:border-white/10"><div className="flex justify-between text-sm opacity-60"><span>Subtotal</span><span>{order.currency} {Number(order.subtotal).toLocaleString('en-BD')}</span></div><div className="mt-2 flex justify-between font-bold"><span>Total</span><span>{order.currency} {Number(order.total_amount).toLocaleString('en-BD')}</span></div></div></section><section className="mt-4 rounded-[2rem] border border-[#0b1736]/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.045]"><h2 className="flex items-center gap-2 font-black"><Package size={19} /> Delivery</h2><p className="mt-4 text-sm leading-7">{order.shipping_name}<br />{order.shipping_phone}<br />{order.shipping_address}{order.shipping_area ? `, ${order.shipping_area}` : ''}{order.shipping_upazila ? `, ${order.shipping_upazila}` : ''}{order.shipping_district ? `, ${order.shipping_district}` : ''}</p><p className="mt-4 inline-flex items-center gap-2 text-xs opacity-50"><ShieldCheck size={15} /> Your order details are visible only to authorized participants.</p></section>{returnRequests?.length ? <section className="mt-4 rounded-[2rem] border border-[#0b1736]/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.045]"><h2 className="font-black">Return requests</h2><div className="mt-4 space-y-3">{returnRequests.map((r:any)=><div key={r.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold">{typedItems.find(i=>i.id===r.order_item_id)?.product_name||'Order item'}</p><p className="mt-1 text-xs opacity-50">{r.reason}</p></div><span className="rounded-full bg-[#008080]/10 px-3 py-1.5 text-xs font-bold capitalize text-[#007373] dark:text-teal-200">{r.status}</span></div>{r.resolution_note&&<p className="mt-2 text-xs opacity-55">{r.resolution_note}</p>}{r.refund_amount!=null&&<p className="mt-2 text-xs font-bold">Refund: {order.currency} {Number(r.refund_amount).toLocaleString('en-BD')}</p>}</div>)}</div></section>:null}{order.status === 'delivered' && <CustomerOrderActions orderId={order.id} items={typedItems} />}</section></main>
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-[#0b1736]/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.045]"><p className="text-xs opacity-45">{label}</p><p className="mt-2 text-sm font-bold capitalize">{value}</p></div> }
