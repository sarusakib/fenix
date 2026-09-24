'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Job={id:string;title:string;description:string;owner_id:string;business_id:string|null;employment_type:string;status:string;verification_status:string;created_at:string}
type Person={id:string;full_name:string|null;username:string|null}
type Business={id:string;name:string|null;title_bn:string|null;title_en:string|null}
type App={id:string;job_id:string;applicant_id:string;status:string;created_at:string}

export default function AdminJobsPage(){
 const [allowed,setAllowed]=useState<boolean|null>(null),[jobs,setJobs]=useState<Job[]>([]),[apps,setApps]=useState<App[]>([]),[people,setPeople]=useState<Record<string,Person>>({}),[businesses,setBusinesses]=useState<Record<string,Business>>({}),[busy,setBusy]=useState(''),[error,setError]=useState('')
 useEffect(()=>{void load()},[])
 async function load(){
  const s=createClient();const {data:admin}=await s.rpc('is_fenix_admin');setAllowed(Boolean(admin));if(!admin)return
  const [{data:j},{data:a}]=await Promise.all([s.from('fenix_jobs').select('*').order('created_at',{ascending:false}).limit(100),s.from('fenix_job_applications').select('id,job_id,applicant_id,status,created_at').order('created_at',{ascending:false}).limit(200)])
  const rows=(j??[]) as Job[];setJobs(rows);setApps((a??[]) as App[])
  const ids=[...new Set(rows.map(x=>x.owner_id).concat((a??[]).map((x:App)=>x.applicant_id)))]
  const bizIds=rows.map(x=>x.business_id).filter(Boolean) as string[]
  const [{data:p},{data:b}]=await Promise.all([
    ids.length?s.from('fenix_public_profiles').select('id,full_name,username').in('id',ids):Promise.resolve({data:[]}),
    bizIds.length?s.from('businesses').select('id,name,title_bn,title_en').in('id',bizIds):Promise.resolve({data:[]}),
  ])
  setPeople(Object.fromEntries(((p??[]) as Person[]).map(x=>[x.id,x])))
  setBusinesses(Object.fromEntries(((b??[]) as Business[]).map(x=>[x.id,x])))
 }
 async function moderate(job:Job,status:string){
  setBusy(job.id);setError('');const s=createClient()
  const {error:e}=await s.from('fenix_jobs').update({status,verification_status:status==='published'?'reviewed':'unverified',published_at:status==='published'?new Date().toISOString():null}).eq('id',job.id)
  if(e)setError('Job moderation failed.');else setJobs(v=>v.map(x=>x.id===job.id?{...x,status,verification_status:status==='published'?'reviewed':'unverified'}:x))
  setBusy('')
 }
 if(allowed===null)return <main className="min-h-dvh"><Navbar/><div className="mx-auto max-w-5xl px-4 py-16 text-sm text-[var(--fx-muted)]">Checking admin access…</div></main>
 if(!allowed)return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 py-16"><Link href="/admin" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-4 text-sm font-bold"><ArrowLeft size={17}/> Admin</Link><h1 className="mt-7 text-3xl font-black">Admin access required</h1></section></main>
 return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8"><Link href="/admin" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-4 text-sm font-bold"><ArrowLeft size={17}/> Admin</Link><div className="mt-7"><p className="text-xs font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Jobs operations</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Job moderation</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--fx-muted)]">Review employer-submitted roles before publication. Application records remain private to the relevant employer and applicant.</p></div>{error&&<div className="mt-5 rounded-xl bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200">{error}</div>}<div className="mt-7 space-y-3">{jobs.length?jobs.map(job=>{const owner=people[job.owner_id],biz=job.business_id?businesses[job.business_id]:undefined,count=apps.filter(a=>a.job_id===job.id).length;return <article key={job.id} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><h2 className="text-lg font-black">{job.title}</h2><p className="mt-1 text-xs text-[var(--fx-muted)]">{biz?.title_bn||biz?.title_en||biz?.name||owner?.full_name||owner?.username||'Employer'} · {new Date(job.created_at).toLocaleDateString('en-GB')} · {count} applications</p><p className="mt-3 max-w-3xl line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-[var(--fx-muted)]">{job.description}</p></div><div className="flex shrink-0 flex-wrap gap-2">{job.status==='pending_review'&&<><button disabled={busy===job.id} onClick={()=>void moderate(job,'published')} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-3 text-xs font-bold text-white"><CheckCircle size={15}/> Approve & publish</button><button disabled={busy===job.id} onClick={()=>void moderate(job,'rejected')} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-500/20 px-3 text-xs font-bold text-red-700 dark:text-red-300"><XCircle size={15}/> Reject</button></>}{job.status==='published'&&<button disabled={busy===job.id} onClick={()=>void moderate(job,'closed')} className="rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold">Close</button>}</div></div></article>}) : <div className="rounded-3xl border border-dashed border-[var(--fx-border)] p-10 text-center text-sm text-[var(--fx-muted)]">No jobs in the moderation queue.</div>}</div></section></main>
}