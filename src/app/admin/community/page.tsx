'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Check, ShieldCheck, UserCircle, X } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Report={id:string;reporter_id:string;content_type:string;content_id:string;reason:string;details:string|null;status:string;created_at:string}
type Profile={id:string;full_name:string|null;username:string|null;role:string}
type Moderation={user_id:string;status:string;reason:string|null;banned_until:string|null;changed_at:string}

export default function CommunityAdminPage(){
 const [allowed,setAllowed]=useState<boolean|null>(null)
 const [reports,setReports]=useState<Report[]>([])
 const [profiles,setProfiles]=useState<Profile[]>([])
 const [moderation,setModeration]=useState<Record<string,Moderation>>({})
 const [tab,setTab]=useState<'reports'|'users'>('reports')
 const [busy,setBusy]=useState('')
 const [notice,setNotice]=useState('')
 const map=Object.fromEntries(profiles.map(p=>[p.id,p]))
 useEffect(()=>{void load()},[])
 async function load(){
  const s=createClient();const {data:admin}=await s.rpc('is_fenix_admin')
  setAllowed(Boolean(admin));if(!admin)return
  const [{data:r},{data:p},{data:m}]=await Promise.all([
   s.from('fenix_content_reports').select('*').order('created_at',{ascending:false}).limit(100),
   s.from('profiles').select('id,full_name,username,role').order('created_at',{ascending:false}).limit(500),
   s.from('fenix_user_moderation').select('*').order('changed_at',{ascending:false}).limit(500),
  ])
  setReports((r??[]) as Report[]);setProfiles((p??[]) as Profile[])
  setModeration(Object.fromEntries(((m??[]) as Moderation[]).map(x=>[x.user_id,x])))
 }
 async function reportAction(id:string,status:string){
  setBusy('r'+id);setNotice('');const s=createClient();const {data:a}=await s.auth.getUser()
  if(!a.user){setNotice('Admin session expired.');setBusy('');return}
  const {error}=await s.from('fenix_content_reports').update({status,reviewed_by:a.user.id,reviewed_at:new Date().toISOString()}).eq('id',id)
  if(error)setNotice('Could not update report.');else{setReports(v=>v.map(x=>x.id===id?{...x,status}:x));setNotice('Report updated.')}
  setBusy('')
 }
 async function moderate(userId:string,status:'active'|'suspended'|'banned',days:number|null){
  setBusy('u'+userId);setNotice('');const s=createClient();const {data:a}=await s.auth.getUser()
  if(!a.user){setNotice('Admin session expired.');setBusy('');return}
  const until=status==='suspended'&&days?new Date(Date.now()+days*86400000).toISOString():null
  const {error}=await s.from('fenix_user_moderation').upsert({user_id:userId,status,banned_until:until,changed_by:a.user.id,reason:status==='active'?null:(status==='banned'?'Admin ban':'Admin suspension'),changed_at:new Date().toISOString()},{onConflict:'user_id'})
  if(error)setNotice('Could not change user status.');else{setModeration(v=>({...v,[userId]:{user_id:userId,status,reason:status==='active'?null:(status==='banned'?'Admin ban':'Admin suspension'),banned_until:until,changed_at:new Date().toISOString()}}));setNotice(status==='active'?'User activated.':status==='banned'?'User banned.':'User suspended for 7 days.')}
  setBusy('')
 }
 if(allowed===null)return <main className="min-h-dvh"><Navbar/><div className="mx-auto max-w-5xl px-4 py-16 text-sm opacity-60">Checking admin access…</div></main>
 if(!allowed)return <main className="min-h-dvh"><Navbar/><div className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-3xl font-black">Admin access required</h1><Link href="/admin" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white"><ArrowLeft size={17}/> Admin center</Link></div></main>
 const activeReports=reports.filter(r=>['pending','reviewing'].includes(r.status))
 return <main className="min-h-dvh">
  <Navbar/><section className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
   <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/admin" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Admin</Link><span className="inline-flex items-center gap-2 rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 text-[11px] font-bold"><ShieldCheck size={15}/> Community control</span></div>
   <div className="mt-6"><h1 className="text-3xl font-black sm:text-5xl">Community moderation</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">Review reports and control user access. Ban/suspend actions stop posting and messaging through the moderation guard.</p></div>
   <div className="mt-6 grid grid-cols-2 gap-2 max-w-md"><button onClick={()=>setTab('reports')} className={'min-h-11 rounded-xl text-xs font-bold '+(tab==='reports'?'bg-[var(--fx-primary-soft)]':'border border-[var(--fx-border)]')}>Reports ({activeReports.length})</button><button onClick={()=>setTab('users')} className={'min-h-11 rounded-xl text-xs font-bold '+(tab==='users'?'bg-[var(--fx-primary-soft)]':'border border-[var(--fx-border)]')}>Users ({profiles.length})</button></div>
   {notice&&<p className="mt-4 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-sm">{notice}</p>}
   {tab==='reports'?<section className="mt-6 space-y-3">{reports.length?reports.map(report=>{const p=map[report.content_type==='user'?report.content_id:report.reporter_id];return <article key={report.id} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-black">{report.content_type} report</p><p className="mt-1 text-xs text-[var(--fx-muted)]">{p?.full_name||p?.username||'Unknown user'} · {report.status} · {new Date(report.created_at).toLocaleString('en-BD')}</p></div>{['pending','reviewing'].includes(report.status)&&<div className="flex gap-2"><button disabled={busy==='r'+report.id} onClick={()=>void reportAction(report.id,'resolved')} className="inline-flex min-h-9 items-center gap-1 rounded-lg bg-[var(--fx-primary-strong)] px-3 text-xs font-bold text-white"><Check size={14}/> Resolve</button><button disabled={busy==='r'+report.id} onClick={()=>void reportAction(report.id,'dismissed')} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[var(--fx-border)] px-3 text-xs font-bold"><X size={14}/> Dismiss</button></div>}</div><p className="mt-3 text-sm font-semibold">{report.reason}</p>{report.details&&<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--fx-muted)]">{report.details}</p>}<p className="mt-3 text-[11px] text-[var(--fx-muted)]">Target: {report.content_id}</p></article>}) : <div className="rounded-[1.7rem] border border-dashed border-[var(--fx-border)] p-12 text-center text-sm text-[var(--fx-muted)]">No reports yet.</div>}</section>
   :<section className="mt-6 space-y-3">{profiles.map(p=>{const m=moderation[p.id];const status=m?.status||'active';return <article key={p.id} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><UserCircle size={36} className="opacity-35"/><div><p className="font-black">{p.full_name||p.username||'FeniX user'}</p><p className="text-xs text-[var(--fx-muted)]">@{p.username||'user'} · {p.role} · {status}</p></div></div><div className="flex flex-wrap gap-2"><button disabled={busy==='u'+p.id} onClick={()=>void moderate(p.id,'active',null)} className="min-h-9 rounded-lg border border-[var(--fx-border)] px-3 text-xs font-bold">Activate</button><button disabled={busy==='u'+p.id||status==='suspended'} onClick={()=>void moderate(p.id,'suspended',7)} className="min-h-9 rounded-lg border border-amber-500/20 px-3 text-xs font-bold">Suspend 7d</button><button disabled={busy==='u'+p.id||status==='banned'||p.role==='admin'} onClick={()=>void moderate(p.id,'banned',null)} className="min-h-9 rounded-lg bg-red-600 px-3 text-xs font-bold text-white">Ban</button></div></div>{m?.reason&&<p className="mt-3 rounded-xl bg-black/[.025] p-3 text-xs text-[var(--fx-muted)] dark:bg-white/[.03]">{m.reason}{m.banned_until?' · until '+new Date(m.banned_until).toLocaleString('en-BD'):''}</p>}</article>})}</section>}
  </section>
 </main>
}