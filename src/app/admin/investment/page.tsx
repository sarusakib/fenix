'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, FileText, Flag, ShieldCheck, UserCircle, XCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { formatBDT, opportunityTitle, statusLabel } from '@/lib/investment'
import type { InvestmentDocument, InvestmentInterest, InvestmentOpportunity, InvestmentProfile, InvestmentReport } from '@/types/database'

export default function InvestmentAdminPage() {
  const [userId,setUserId]=useState('')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [opportunities,setOpportunities]=useState<InvestmentOpportunity[]>([])
  const [interests,setInterests]=useState<InvestmentInterest[]>([])
  const [docs,setDocs]=useState<InvestmentDocument[]>([])
  const [reports,setReports]=useState<InvestmentReport[]>([])
  const [profiles,setProfiles]=useState<InvestmentProfile[]>([])
  const [busy,setBusy]=useState('')

  async function load(){
    const s=createClient()
    const {data:auth}=await s.auth.getUser()
    if(!auth.user){window.location.replace('/login?next=/admin/investment');return}
    setUserId(auth.user.id)
    const {data:profile}=await s.from('profiles').select('role').eq('id',auth.user.id).maybeSingle()
    if(profile?.role!=='admin'){window.location.replace('/');return}
    const [o,i,d,r,p]=await Promise.all([
      s.from('investment_opportunities').select('*').order('created_at',{ascending:false}),
      s.from('investment_interests').select('*').order('created_at',{ascending:false}).limit(100),
      s.from('investment_documents').select('*').order('created_at',{ascending:false}).limit(100),
      s.from('investment_reports').select('*').order('created_at',{ascending:false}).limit(100),
      s.from('investment_profiles').select('*').order('created_at',{ascending:false}).limit(100),
    ])
    if(o.error||i.error||d.error||r.error||p.error)setError('Some investment admin data could not be loaded.')
    setOpportunities((o.data??[]) as InvestmentOpportunity[])
    setInterests((i.data??[]) as InvestmentInterest[])
    setDocs((d.data??[]) as InvestmentDocument[])
    setReports((r.data??[]) as InvestmentReport[])
    setProfiles((p.data??[]) as InvestmentProfile[])
    setLoading(false)
  }
  useEffect(()=>{void load()},[])

  async function updateOpportunity(id:string, mode:'approve'|'reject'|'close'){
    setBusy(id);setError('');setMessage('')
    const s=createClient()
    const patch = mode==='approve'
      ? {status:'approved',verification_status:'verified',verified_by:userId,verified_at:new Date().toISOString(),verification_note:'Reviewed by FeniX admin.'}
      : mode==='reject'
        ? {status:'rejected',verification_status:'needs_changes',verified_by:userId,verified_at:null,verification_note:'Changes required before publication.'}
        : {status:'closed'}
    const {error:e}=await s.from('investment_opportunities').update(patch).eq('id',id)
    if(e)setError(e.message);else{setMessage('Opportunity status updated.');await load()}
    setBusy('')
  }

  async function updateDoc(id:string,status:'approved'|'rejected'){
    setBusy(id);setError('');setMessage('')
    const s=createClient()
    const {error:e}=await s.from('investment_documents').update({status,reviewed_by:userId,reviewed_at:new Date().toISOString(),review_note:status==='approved'?'Document reviewed by FeniX admin.':'Document needs review again.'}).eq('id',id)
    if(e)setError(e.message);else{setMessage('Document review updated.');await load()}
    setBusy('')
  }

  async function updateReport(id:string,status:'reviewing'|'resolved'|'dismissed'){
    setBusy(id);setError('');setMessage('')
    const s=createClient()
    const {error:e}=await s.from('investment_reports').update({status,resolved_by:status==='resolved'||status==='dismissed'?userId:null,resolved_at:status==='resolved'||status==='dismissed'?new Date().toISOString():null,resolution_note:status==='resolved'?'Reviewed by FeniX admin.':status==='dismissed'?'No action taken after review.':null}).eq('id',id)
    if(e)setError(e.message);else{setMessage('Report status updated.');await load()}
    setBusy('')
  }

  async function updateInvestorVerification(id:string,status:'verified'|'needs_review'|'rejected'){
    setBusy(id);setError('')
    const s=createClient()
    const {error:e}=await s.from('investment_profiles').update({verification_status:status,verified_by:status==='verified'?userId:null,verified_at:status==='verified'?new Date().toISOString():null,verification_note:status==='verified'?'Profile reviewed by FeniX admin.':'Profile requires additional review.'}).eq('user_id',id)
    if(e)setError(e.message);else await load()
    setBusy('')
  }

  const oppById=(id:string)=>opportunities.find(x=>x.id===id)
  return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
    <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-4 text-sm dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Admin</Link>
    <div className="mt-7 flex flex-col gap-3"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">FeniX Investment Admin</p><h1 className="text-4xl font-black">Investment control center</h1><p className="max-w-3xl text-sm leading-6 opacity-55">Review opportunities and documents, manage investor verification, handle reports, and keep an auditable approval trail.</p></div>
    {error&&<div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-sm text-red-600">{error}</div>}
    {message&&<div className="mt-4 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-4 text-sm">{message}</div>}
    {loading?<div className="py-24 text-center opacity-50">Loading investment admin...</div>:<div className="mt-7 grid gap-6 lg:grid-cols-2">
      <Panel title={`Opportunities (${opportunities.length})`} icon={<ShieldCheck size={20}/>}>{opportunities.length?opportunities.map(o=><div key={o.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><Link href={`/invest/${o.id}`} className="font-black hover:underline">{opportunityTitle(o)}</Link><p className="mt-1 text-xs opacity-45">{statusLabel(o.status)} · {statusLabel(o.verification_status)} · {formatBDT(o.target_amount)}</p></div><div className="flex flex-wrap gap-2">{o.status==='pending_review'&&<><button disabled={busy===o.id} onClick={()=>void updateOpportunity(o.id,'approve')} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white"><CheckCircle size={15} className="mr-1 inline"/>Approve</button><button disabled={busy===o.id} onClick={()=>void updateOpportunity(o.id,'reject')} className="rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-600"><XCircle size={15} className="mr-1 inline"/>Needs changes</button></>}{o.status==='approved'&&<button disabled={busy===o.id} onClick={()=>void updateOpportunity(o.id,'close')} className="rounded-xl border border-[#0b1736]/10 px-3 py-2 text-xs font-bold dark:border-white/10">Close</button>}</div></div></div>):<Empty text="No opportunities."/ >}</Panel>

      <Panel title={`Investor profiles (${profiles.length})`} icon={<UserCircle size={20}/>}>{profiles.length?profiles.map(p=><div key={p.user_id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold capitalize">{p.investor_type} investor</p><p className="mt-1 text-xs opacity-45">Budget: {formatBDT(p.min_budget)} – {formatBDT(p.max_budget)} · {statusLabel(p.verification_status)}</p></div><div className="flex flex-wrap gap-2">{p.verification_status!=='verified'&&<button disabled={busy===p.user_id} onClick={()=>void updateInvestorVerification(p.user_id,'verified')} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Mark verified</button>}{p.verification_status==='verified'&&<button disabled={busy===p.user_id} onClick={()=>void updateInvestorVerification(p.user_id,'needs_review')} className="rounded-xl border border-[#0b1736]/10 px-3 py-2 text-xs font-bold dark:border-white/10">Needs review</button>}</div></div></div>):<Empty text="No investor profiles."/ >}</Panel>

      <Panel title={`Document review (${docs.length})`} icon={<FileText size={20}/>} wide>{docs.length?docs.map(d=><div key={d.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{d.title}</p><p className="mt-1 text-xs opacity-45">{d.document_type} · {statusLabel(d.status)} · {oppById(d.opportunity_id)?opportunityTitle(oppById(d.opportunity_id)!):d.opportunity_id.slice(0,8)}</p></div><div className="flex gap-2">{d.status!=='approved'&&<button disabled={busy===d.id} onClick={()=>void updateDoc(d.id,'approved')} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Approve</button>}{d.status!=='rejected'&&<button disabled={busy===d.id} onClick={()=>void updateDoc(d.id,'rejected')} className="rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-600">Reject</button>}</div></div></div>):<Empty text="No documents."/ >}</Panel>

      <Panel title={`Investor interest (${interests.length})`} icon={<CheckCircle size={20}/>} wide>{interests.length?interests.map(i=><div key={i.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{oppById(i.opportunity_id)?opportunityTitle(oppById(i.opportunity_id)!):'Opportunity'}</p><p className="mt-1 text-xs opacity-45">{formatBDT(i.offered_amount)} · {statusLabel(i.status)}</p></div><span className="text-xs opacity-45">Investor: {i.investor_id.slice(0,8)}…</span></div></div>):<Empty text="No interests."/ >}</Panel>

      <Panel title={`Reports (${reports.filter(r=>r.status!=='dismissed').length})`} icon={<Flag size={20}/>} wide>{reports.length?reports.map(r=><div key={r.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><p className="font-bold capitalize">{r.reason.replaceAll('_',' ')}</p><p className="mt-1 text-xs opacity-45">{statusLabel(r.status)}</p><p className="mt-2 text-sm leading-6 opacity-65">{r.details}</p></div><div className="flex flex-wrap gap-2"><button disabled={busy===r.id} onClick={()=>void updateReport(r.id,'reviewing')} className="rounded-xl border border-[#0b1736]/10 px-3 py-2 text-xs font-bold dark:border-white/10">Reviewing</button><button disabled={busy===r.id} onClick={()=>void updateReport(r.id,'resolved')} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Resolve</button><button disabled={busy===r.id} onClick={()=>void updateReport(r.id,'dismissed')} className="rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-600">Dismiss</button></div></div></div>):<Empty text="No reports."/ >}</Panel>
    </div>}
    <div className="mt-7 rounded-2xl border border-amber-500/20 bg-amber-500/[.06] p-5 text-sm leading-6"><strong>Admin rule:</strong> Verification is an information-review decision, not government certification or a guarantee of business performance. Keep material review actions inside FeniX and never request passwords or payment credentials.</div>
  </section></main>
}

function Panel({title,icon,children,wide=false}:{title:string;icon:React.ReactNode;children:React.ReactNode;wide?:boolean}){return <section className={`rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045] ${wide?'lg:col-span-2':''}`}><h2 className="flex items-center gap-2 text-xl font-black">{icon}{title}</h2><div className="mt-5 space-y-3">{children}</div></section>}
function Empty({text}:{text:string}){return <p className="py-8 text-center text-sm opacity-45">{text}</p>}
