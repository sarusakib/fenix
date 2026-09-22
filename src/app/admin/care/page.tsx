'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Heartbeat, ShieldCheck, Van, XCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Blood={id:string;blood_group:string;units:number;hospital_name:string;hospital_area:string|null;area_text:string|null;urgency:string;status:string;created_at:string;requester_id:string}
type Ambulance={id:string;pickup_area:string;destination_hospital:string|null;condition_category:string;ambulance_type:string;oxygen_needed:boolean;status:string;created_at:string;requester_id:string;provider_id:string|null}
type Provider={id:string;display_name:string;phone:string|null;base_area:string|null;service_area:string|null;ambulance_type:string;is_verified:boolean;status:string}

export default function AdminCarePage(){
  const [blood,setBlood]=useState<Blood[]>([])
  const [ambulances,setAmbulances]=useState<Ambulance[]>([])
  const [providers,setProviders]=useState<Provider[]>([])
  const [status,setStatus]=useState('')
  const [loading,setLoading]=useState(true)
  async function load(){
    const s=createClient()
    const {data:auth}=await s.auth.getUser()
    if(!auth.user){window.location.href='/login?next=/admin/care';return}
    const {data:profile}=await s.from('profiles').select('role').eq('id',auth.user.id).maybeSingle()
    if(profile?.role!=='admin'){window.location.href='/';return}
    const [b,a,p]=await Promise.all([
      s.from('fenix_blood_requests').select('id,blood_group,units,hospital_name,hospital_area,area_text,urgency,status,created_at,requester_id').in('status',['open','matched']).order('created_at',{ascending:false}).limit(100),
      s.from('fenix_ambulance_requests').select('id,pickup_area,destination_hospital,condition_category,ambulance_type,oxygen_needed,status,created_at,requester_id,provider_id').in('status',['open','accepted','in_transit']).order('created_at',{ascending:false}).limit(100),
      s.from('fenix_ambulance_providers').select('id,display_name,phone,base_area,service_area,ambulance_type,is_verified,status').order('is_verified',{ascending:false}).order('created_at',{ascending:false}).limit(100),
    ])
    setBlood((b.data??[]) as Blood[]);setAmbulances((a.data??[]) as Ambulance[]);setProviders((p.data??[]) as Provider[]);setLoading(false)
  }
  useEffect(()=>{void load()},[])
  async function updateBlood(id:string,next:string){const s=createClient();const {error}=await s.from('fenix_blood_requests').update({status:next,updated_at:new Date().toISOString()}).eq('id',id);setStatus(error?'Could not update blood request.':'Blood request updated.');if(!error)void load()}
  async function updateAmbulance(id:string,next:string){const s=createClient();const {error}=await s.from('fenix_ambulance_requests').update({status:next,updated_at:new Date().toISOString()}).eq('id',id);setStatus(error?'Could not update ambulance request.':'Ambulance request updated.');if(!error)void load()}
  async function updateProvider(p:Provider){const s=createClient();const {error}=await s.from('fenix_ambulance_providers').update({is_verified:!p.is_verified,updated_at:new Date().toISOString()}).eq('id',p.id);setStatus(error?'Could not update provider.':(!p.is_verified?'Provider marked verified.':'Provider verification removed.'));if(!error)void load()}

  return <main className="min-h-dvh bg-[var(--fx-bg)]"><Navbar/><section className="mx-auto max-w-7xl px-4 pb-28 pt-7 sm:px-6">
    <Link href="/admin" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Admin</Link>
    <header className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6 sm:p-8"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]"><ShieldCheck size={17}/> Care Operations</div><h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-6xl">Review emergency requests and provider trust state.</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">Admin controls change workflow status and verification flags only. They do not turn FeniX into an emergency dispatcher or medical provider.</p></header>
    {status&&<p className="mt-4 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-sm">{status}</p>}
    {loading?<div className="mt-6 h-80 animate-pulse rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)]"/>:<div className="mt-6 grid gap-5 lg:grid-cols-3">
      <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="flex items-center gap-2"><Heartbeat size={19}/><h2 className="text-lg font-black">Blood requests</h2><span className="ml-auto text-xs font-bold">{blood.length}</span></div><div className="mt-4 space-y-3">{blood.length?blood.map(x=><article key={x.id} className="rounded-2xl border border-[var(--fx-border)] p-3"><div className="flex items-start justify-between gap-2"><div><div className="font-black">{x.blood_group} · {x.units} unit(s)</div><div className="mt-1 text-xs font-bold">{x.hospital_name}</div><div className="mt-1 text-[10px] text-[var(--fx-muted)]">{[x.hospital_area,x.area_text].filter(Boolean).join(' · ')}</div></div><span className="rounded-full bg-rose-500/10 px-2 py-1 text-[9px] font-black uppercase">{x.urgency}</span></div><div className="mt-3 flex flex-wrap gap-1.5"><button onClick={()=>void updateBlood(x.id,'matched')} className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-[var(--fx-border)] px-2.5 text-[10px] font-bold"><CheckCircle size={13}/>Matched</button><button onClick={()=>void updateBlood(x.id,'fulfilled')} className="inline-flex min-h-8 items-center gap-1 rounded-lg bg-[var(--fx-primary-strong)] px-2.5 text-[10px] font-bold text-white">Fulfilled</button><button onClick={()=>void updateBlood(x.id,'cancelled')} className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-rose-500/20 px-2.5 text-[10px] font-bold text-rose-700"><XCircle size={13}/>Cancel</button></div></article>):<p className="text-sm text-[var(--fx-muted)]">No active blood request.</p>}</div></section>
      <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="flex items-center gap-2"><Van size={19}/><h2 className="text-lg font-black">Ambulance requests</h2><span className="ml-auto text-xs font-bold">{ambulances.length}</span></div><div className="mt-4 space-y-3">{ambulances.length?ambulances.map(x=><article key={x.id} className="rounded-2xl border border-[var(--fx-border)] p-3"><div className="font-black">{x.pickup_area}</div><div className="mt-1 text-xs text-[var(--fx-muted)]">{[x.destination_hospital,x.condition_category,x.ambulance_type,x.oxygen_needed?'Oxygen':'' ].filter(Boolean).join(' · ')}</div><div className="mt-3 flex flex-wrap gap-1.5">{['accepted','in_transit','completed','cancelled'].map(next=><button key={next} onClick={()=>void updateAmbulance(x.id,next)} className="min-h-8 rounded-lg border border-[var(--fx-border)] px-2.5 text-[10px] font-bold">{next}</button>)}</div></article>):<p className="text-sm text-[var(--fx-muted)]">No active ambulance request.</p>}</div></section>
      <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="flex items-center gap-2"><ShieldCheck size={19}/><h2 className="text-lg font-black">Providers</h2><span className="ml-auto text-xs font-bold">{providers.length}</span></div><div className="mt-4 space-y-3">{providers.length?providers.map(p=><article key={p.id} className="rounded-2xl border border-[var(--fx-border)] p-3"><div className="flex items-start justify-between gap-3"><div><div className="font-black">{p.display_name}</div><div className="mt-1 text-xs text-[var(--fx-muted)]">{[p.base_area,p.service_area,p.ambulance_type].filter(Boolean).join(' · ')}</div></div>{p.is_verified?<span className="rounded-full bg-[var(--fx-primary-soft)] px-2 py-1 text-[9px] font-black text-[var(--fx-primary-strong)]">Verified</span>:<span className="rounded-full border border-amber-400/25 px-2 py-1 text-[9px] font-black">Review</span>}</div><div className="mt-3 flex gap-2"><button onClick={()=>void updateProvider(p)} className="min-h-8 rounded-lg border border-[var(--fx-border)] px-2.5 text-[10px] font-bold">{p.is_verified?'Remove verified':'Mark verified'}</button>{p.phone&&<a href={'tel:'+p.phone} className="min-h-8 rounded-lg border border-[var(--fx-border)] px-2.5 text-[10px] font-bold">Call</a>}</div></article>):<p className="text-sm text-[var(--fx-muted)]">No providers yet.</p>}</div></section>
    </div>}
  </section></main>
}
