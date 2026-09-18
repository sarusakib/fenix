'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowCounterClockwise, CheckCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type ReturnReq={id:string;order_id:string;order_item_id:string;reason:string;details:string|null;status:string;resolution_note:string|null;refund_amount:number|null;created_at:string}

export default function SellerReturnsPage(){
 const [rows,setRows]=useState<ReturnReq[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[busy,setBusy]=useState('')
 async function load(){
  const s=createClient();const {data:a}=await s.auth.getUser()
  if(!a.user){window.location.replace('/login?next=/commerce/seller/returns');return}
  const {data:v}=await s.from('vendor_profiles').select('id,status').eq('user_id',a.user.id).maybeSingle()
  if(!v||v.status!=='approved'){window.location.replace('/commerce/seller');return}
  const {data,error}=await s.from('commerce_return_requests').select('id,order_id,order_item_id,reason,details,status,resolution_note,refund_amount,created_at,order_items!inner(vendor_id,product_name)').eq('order_items.vendor_id',v.id).order('created_at',{ascending:false})
  if(error){setError('Return requests load করা যায়নি.');setLoading(false);return}
  setRows((data??[]) as unknown as ReturnReq[]);setLoading(false)
 }
 useEffect(()=>{void load()},[])
 async function update(id:string,status:string){
  setBusy(id);setError('');const s=createClient()
  const {error:e}=await s.rpc('set_commerce_return_status',{p_request_id:id,p_status:status})
  if(e)setError(e.message||'Return update করা যায়নি.');else await load()
  setBusy('')
 }
 return <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
  <Link href="/commerce/seller" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[.045]"><ArrowLeft size={17}/> Seller Dashboard</Link>
  <div className="mt-9"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Seller operations</p><h1 className="mt-2 text-4xl font-black">Return requests</h1><p className="mt-2 text-sm opacity-55">Customer return requests review করুন এবং database-controlled status workflow অনুসরণ করুন।</p></div>
  {error&&<div className="mt-6 rounded-xl bg-red-500/[.06] p-4 text-sm text-red-600">{error}</div>}
  {loading?<div className="py-24 text-center opacity-50">Loading returns...</div>:rows.length?<div className="mt-8 space-y-4">{rows.map((r:any)=><div key={r.id} className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#008080]">Order {r.order_id.slice(0,8)}</p><h2 className="mt-2 text-lg font-black">{r.order_items?.product_name||'Product'}</h2><p className="mt-2 text-sm font-semibold">Reason: {r.reason}</p>{r.details&&<p className="mt-2 text-sm opacity-60">{r.details}</p>}<p className="mt-3 text-xs opacity-45">{new Date(r.created_at).toLocaleString('en-BD')}</p></div><span className="inline-flex h-fit items-center gap-2 rounded-full bg-[#008080]/10 px-3 py-1.5 text-xs font-bold capitalize text-[#007373] dark:text-teal-200"><CheckCircle size={14}/>{r.status}</span></div><div className="mt-5 flex flex-wrap gap-2">{r.status==='requested'&&<><button disabled={busy===r.id} onClick={()=>void update(r.id,'approved')} className="rounded-xl bg-[#008080] px-4 py-2.5 text-xs font-bold text-white">Approve</button><button disabled={busy===r.id} onClick={()=>void update(r.id,'rejected')} className="rounded-xl border border-red-500/20 px-4 py-2.5 text-xs font-bold text-red-600">Reject</button></>}{r.status==='approved'&&<button disabled={busy===r.id} onClick={()=>void update(r.id,'received')} className="rounded-xl bg-[#008080] px-4 py-2.5 text-xs font-bold text-white">Mark received</button>}{r.status==='received'&&<button disabled={busy===r.id} onClick={()=>void update(r.id,'refunded')} className="rounded-xl bg-[#0b1736] px-4 py-2.5 text-xs font-bold text-white dark:bg-white/[.12]">Mark refunded</button>}</div></div>)}</div>:<div className="mt-8 rounded-[2rem] border border-[#0b1736]/10 bg-white/70 p-12 text-center dark:border-white/10 dark:bg-white/[.045]"><ArrowCounterClockwise size={42} className="mx-auto opacity-25"/><p className="mt-4 text-sm opacity-50">No return requests yet.</p></div>}
 </section></main>
}
