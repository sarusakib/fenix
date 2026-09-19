'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Receipt, ShieldCheck, Star, Storefront, Truck, ArrowCounterClockwise } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/database'

type Vendor={id:string;display_name:string;status:string;is_verified:boolean;created_at:string}
type Rule={id:string;district:string|null;upazila:string|null;fee:number;free_shipping_minimum:number|null;is_active:boolean;sort_order:number}
type Review={id:string;rating:number;title:string|null;body:string|null;status:string;product_id:string;created_at:string}
type ReturnReq={id:string;order_id:string;order_item_id:string;customer_id:string;reason:string;details:string|null;status:string;resolution_note:string|null;refund_amount:number|null;created_at:string}
type Order={id:string;order_number:string;status:string;payment_status:string;payment_method:string;total_amount:number;created_at:string}

export default function CommerceAdminPage(){
 const [vendors,setVendors]=useState<Vendor[]>([]),[rules,setRules]=useState<Rule[]>([]),[reviews,setReviews]=useState<Review[]>([]),[returns,setReturns]=useState<ReturnReq[]>([]),[orders,setOrders]=useState<Order[]>([])
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState('')
 const [district,setDistrict]=useState(''),[upazila,setUpazila]=useState(''),[fee,setFee]=useState('0'),[freeMinimum,setFreeMinimum]=useState('')

 async function load(){
  const s=createClient(); const {data:auth}=await s.auth.getUser()
  if(!auth.user){window.location.replace('/login?next=/commerce/admin');return}
  const {data:profile}=await s.from('profiles').select('role').eq('id',auth.user.id).maybeSingle()
  if(profile?.role!=='admin'){setError('Admin access required.');setLoading(false);return}
  const [v,r,rv,rr,o]=await Promise.all([
   s.from('vendor_profiles').select('id,display_name,status,is_verified,created_at').order('created_at',{ascending:false}),
   s.from('commerce_delivery_rules').select('id,district,upazila,fee,free_shipping_minimum,is_active,sort_order').order('sort_order'),
   s.from('product_reviews').select('id,rating,title,body,status,product_id,created_at').order('created_at',{ascending:false}).limit(50),
   s.from('commerce_return_requests').select('id,order_id,order_item_id,customer_id,reason,details,status,resolution_note,refund_amount,created_at').order('created_at',{ascending:false}).limit(50),
   s.from('orders').select('id,order_number,status,payment_status,payment_method,total_amount,created_at').order('created_at',{ascending:false}).limit(50),
  ])
  if(v.error||r.error||rv.error||rr.error||o.error)setError('Some admin data could not be loaded.')
  setVendors((v.data??[]) as Vendor[])
  setRules((r.data??[]).map((x:any)=>({...x,fee:Number(x.fee),free_shipping_minimum:x.free_shipping_minimum==null?null:Number(x.free_shipping_minimum)})))
  setReviews((rv.data??[]) as Review[]); setReturns((rr.data??[]) as ReturnReq[])
  setOrders((o.data??[]).map((x:any)=>({...x,total_amount:Number(x.total_amount)})))
  setLoading(false)
 }
 useEffect(()=>{void load()},[])

 async function call(fn: keyof Database['public']['Functions'],args:Record<string,unknown>,key:string){
  setBusy(key);setError('');const s=createClient();const {error:e}=await s.rpc(fn,args)
  if(e)setError(e.message||'Operation failed.');else await load();setBusy('')
 }
 return <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
  <Link href="/commerce" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[.045]"><ArrowLeft size={17}/> Commerce</Link>
  <div className="mt-8 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008080]/10 text-[#008080]"><ShieldCheck size={25}/></div><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Commerce Admin</p><h1 className="mt-1 text-4xl font-black">Control center</h1></div></div>
  {error&&<div className="mt-6 rounded-xl bg-red-500/[.06] p-4 text-sm text-red-600">{error}</div>}
  {loading?<div className="py-24 text-center opacity-50">Loading admin panel...</div>:<div className="mt-8 grid gap-6 lg:grid-cols-2">
   <Panel title="Seller approval" icon={<Storefront size={20}/>}>{vendors.length?vendors.map(v=><div key={v.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{v.display_name}</p><p className="mt-1 text-xs opacity-45 capitalize">{v.status}{v.is_verified?' · verified':''}</p></div><div className="flex flex-wrap gap-2">{v.status!=='approved'&&<button disabled={busy===v.id} onClick={()=>void call('admin_set_vendor_status',{p_vendor_id:v.id,p_status:'approved',p_is_verified:true},v.id)} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Approve</button>}{v.status==='approved'&&<button disabled={busy===v.id} onClick={()=>void call('admin_set_vendor_status',{p_vendor_id:v.id,p_status:'suspended',p_is_verified:false},v.id)} className="rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-600">Suspend</button>}{v.status==='pending'&&<button disabled={busy===v.id} onClick={()=>void call('admin_set_vendor_status',{p_vendor_id:v.id,p_status:'rejected',p_is_verified:false},v.id)} className="rounded-xl border border-[#0b1736]/10 px-3 py-2 text-xs font-bold dark:border-white/10">Reject</button>}</div></div></div>):<Empty text="No sellers."/>}</Panel>

   <Panel title="Delivery rules" icon={<Truck size={20}/>}><div className="grid gap-3 sm:grid-cols-2"><input value={district} onChange={e=>setDistrict(e.target.value)} placeholder="District" className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"/><input value={upazila} onChange={e=>setUpazila(e.target.value)} placeholder="Upazila (optional)" className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"/><input value={fee} onChange={e=>setFee(e.target.value)} type="number" min="0" placeholder="Delivery fee" className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"/><input value={freeMinimum} onChange={e=>setFreeMinimum(e.target.value)} type="number" min="0" placeholder="Free shipping minimum" className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"/></div><button disabled={busy==='rule'} onClick={()=>void call('admin_upsert_delivery_rule',{p_district:district.trim()||null,p_upazila:upazila.trim()||null,p_fee:Math.max(0,Number(fee)||0),p_free_shipping_minimum:freeMinimum.trim()?Math.max(0,Number(freeMinimum)||0):null,p_is_active:true,p_sort_order:rules.length},'rule')} className="mt-3 rounded-xl bg-[#008080] px-4 py-2.5 text-xs font-bold text-white">Save rule</button><div className="mt-5 space-y-2">{rules.map(r=><div key={r.id} className="flex items-center justify-between rounded-xl bg-black/[.025] p-3 text-xs dark:bg-white/[.03]"><span>{r.district||'Default'}{r.upazila?' / '+r.upazila:''}</span><strong>BDT {r.fee.toLocaleString('en-BD')}{r.free_shipping_minimum!=null?' · free ≥ '+r.free_shipping_minimum.toLocaleString('en-BD'):''}</strong></div>)}</div></Panel>

   <Panel title="Return requests" icon={<ArrowCounterClockwise size={20}/>} wide>{returns.length?returns.map(r=><div key={r.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><p className="font-bold">{r.reason}</p><p className="mt-1 text-xs opacity-50">Order {r.order_id.slice(0,8)} · {r.status}</p>{r.details&&<p className="mt-2 text-sm opacity-60">{r.details}</p>}{r.refund_amount!=null&&<p className="mt-2 text-xs font-bold">Refund: BDT {Number(r.refund_amount).toLocaleString('en-BD')}</p>}</div><div className="flex flex-wrap gap-2">{r.status==='requested'&&<><button disabled={busy===r.id} onClick={()=>void call('set_commerce_return_status',{p_request_id:r.id,p_status:'approved'},r.id)} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Approve</button><button disabled={busy===r.id} onClick={()=>void call('set_commerce_return_status',{p_request_id:r.id,p_status:'rejected'},r.id)} className="rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-600">Reject</button></>}{r.status==='approved'&&<button disabled={busy===r.id} onClick={()=>void call('set_commerce_return_status',{p_request_id:r.id,p_status:'received'},r.id)} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Mark received</button>}{r.status==='received'&&<button disabled={busy===r.id} onClick={()=>void call('set_commerce_return_status',{p_request_id:r.id,p_status:'refunded',p_refund_amount:0},r.id)} className="rounded-xl bg-[#0b1736] px-3 py-2 text-xs font-bold text-white dark:bg-white/[.12]">Mark refunded</button>}</div></div></div>):<Empty text="No return requests."/ >}</Panel>

   <Panel title="Orders & payment" icon={<Receipt size={20}/>} wide>{orders.length?orders.map(o=><div key={o.id} className="flex flex-col gap-3 rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{o.order_number}</p><p className="mt-1 text-xs opacity-50 capitalize">{o.status} · {o.payment_method.replaceAll('_',' ')} · {o.payment_status}</p></div><div className="flex items-center gap-3"><strong>BDT {o.total_amount.toLocaleString('en-BD')}</strong>{o.payment_status!=='paid'&&o.payment_status!=='refunded'&&<button disabled={busy===o.id} onClick={()=>void call('admin_set_order_payment_status',{p_order_id:o.id,p_payment_status:'paid'},o.id)} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Mark paid</button>}</div></div>):<Empty text="No orders."/ >}</Panel>

   <Panel title="Review moderation" icon={<Star size={20}/>} wide>{reviews.length?reviews.map(r=><div key={r.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex items-center justify-between gap-3"><span className="text-sm font-black">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span><span className="text-xs capitalize opacity-50">{r.status}</span></div><p className="mt-2 font-bold">{r.title||'Review'}</p>{r.body&&<p className="mt-1 text-sm opacity-60">{r.body}</p>}<div className="mt-4 flex gap-2">{r.status!=='published'&&<button disabled={busy===r.id} onClick={()=>void call('admin_set_review_status',{p_review_id:r.id,p_status:'published'},r.id)} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Publish</button>}{r.status!=='rejected'&&<button disabled={busy===r.id} onClick={()=>void call('admin_set_review_status',{p_review_id:r.id,p_status:'rejected'},r.id)} className="rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-600">Reject</button>}</div></div>):<Empty text="No reviews."/ >}</Panel>
  </div>}
 </section></main>
}
function Panel({title,icon,children,wide=false}:{title:string;icon:ReactNode;children:ReactNode;wide?:boolean}){return <section className={'rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045] '+(wide?'lg:col-span-2':'')}><h2 className="flex items-center gap-2 text-xl font-black">{icon}{title}</h2><div className="mt-5 space-y-3">{children}</div></section>}
function Empty({text}:{text:string}){return <p className="py-8 text-center text-sm opacity-50">{text}</p>}
