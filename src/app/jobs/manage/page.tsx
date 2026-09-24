'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, UsersThree } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Job={id:string;title:string;status:string;verification_status:string;created_at:string;published_at:string|null;application_deadline:string|null}
type Application={id:string;job_id:string;applicant_id:string;cover_note:string|null;status:string;created_at:string}
type Person={id:string;full_name:string|null;username:string|null}

export default function JobManagePage(){
 const [jobs,setJobs]=useState<Job[]>([])
 const [apps,setApps]=useState<Application[]>([])
 const [people,setPeople]=useState<Record<string,Person>>({})
 const [selectedJob,setSelectedJob]=useState('')
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [busy,setBusy]=useState('')
 useEffect(()=>{void load()},[])
 async function load(){
  const s=createClient()
  const {data:auth}=await s.auth.getUser()
  if(!auth.user){window.location.replace('/login?next=/jobs/manage');return}
  const {data:jobsData,error:e}=await s.from('fenix_jobs').select('id,title,status,verification_status,created_at,published_at,application_deadline').eq('owner_id',auth.user.id).order('created_at',{ascending:false})
  if(e){setError('Jobs could not be loaded.');setLoading(false);return}
  const rows=(jobsData??[]) as Job[];setJobs(rows);if(rows.length)setSelectedJob(rows[0].id)
  if(rows.length){
   const {data:a}=await s.from('fenix_job_applications').select('id,job_id,applicant_id,cover_note,status,created_at').in('job_id',rows.map(r=>r.id)).order('created_at',{ascending:false})
   const applications=(a??[]) as Application[];setApps(applications)
   const ids=[...new Set(applications.map(a=>a.applicant_id))]
   if(ids.length){const {data:p}=await s.from('fenix_public_profiles').select('id,full_name,username').in('id',ids);setPeople(Object.fromEntries(((p??[]) as Person[]).map(x=>[x.id,x])))}
  }
  setLoading(false)
 }
 async function updateApplication(id:string,status:string){
  setBusy(id);const s=createClient();const {error:e}=await s.from('fenix_job_applications').update({status}).eq('id',id)
  if(e)setError('Application status could not be updated.');else setApps(v=>v.map(a=>a.id===id?{...a,status}:a));setBusy('')
 }
 const selectedApps=useMemo(()=>apps.filter(a=>a.job_id===selectedJob),[apps,selectedJob])
 return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
  <Link href="/jobs" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-4 text-sm font-bold"><ArrowLeft size={17}/> Jobs</Link>
  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Employer workspace</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Jobs & applicants</h1><p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">Review your postings and manage FeniX applications.</p></div><Link href="/jobs/post" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white">Post another job</Link></div>
  {error&&<div className="mt-5 rounded-xl bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200">{error}</div>}
  {loading?<div className="mt-8 text-sm text-[var(--fx-muted)]">Loading workspace…</div>:<div className="mt-8 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
   <section className="space-y-3">{jobs.length?jobs.map(job=><button key={job.id} type="button" onClick={()=>setSelectedJob(job.id)} className={"w-full rounded-2xl border p-4 text-left "+(selectedJob===job.id?"border-[var(--fx-primary)]/30 bg-[var(--fx-primary-soft)]":"border-[var(--fx-border)] bg-[var(--fx-surface)]")}><div className="flex items-start justify-between gap-3"><h2 className="font-black">{job.title}</h2><span className="text-[10px] font-bold text-[var(--fx-muted)]">{job.status}</span></div><p className="mt-2 text-xs text-[var(--fx-muted)]">Applications: {apps.filter(a=>a.job_id===job.id).length}</p></button>):<div className="rounded-2xl border border-dashed border-[var(--fx-border)] p-7 text-center text-sm text-[var(--fx-muted)]">No jobs yet.</div>}</section>
   <section className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-6"><div className="flex items-center gap-2"><UsersThree size={19}/><h2 className="text-lg font-black">Applications</h2></div><div className="mt-5 space-y-3">{selectedApps.length?selectedApps.map(app=>{const p=people[app.applicant_id];return <article key={app.id} className="rounded-2xl border border-[var(--fx-border)] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-bold">{p?.full_name||p?.username||'FeniX member'}</p><p className="mt-1 text-[10px] text-[var(--fx-muted)]">{new Date(app.created_at).toLocaleString('en-GB')}</p>{app.cover_note&&<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--fx-muted)]">{app.cover_note}</p>}</div><select value={app.status} disabled={busy===app.id} onChange={e=>void updateApplication(app.id,e.target.value)} className="h-10 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-xs font-bold"><option value="submitted">Submitted</option><option value="reviewing">Reviewing</option><option value="shortlisted">Shortlisted</option><option value="rejected">Rejected</option><option value="hired">Hired</option><option value="withdrawn">Withdrawn</option></select></div><Link href={"/profile/"+(p?.username||app.applicant_id)} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[var(--fx-primary-strong)]">View profile <FileText size={14}/></Link></article>}) : <div className="rounded-2xl border border-dashed border-[var(--fx-border)] p-7 text-center text-sm text-[var(--fx-muted)]">No applications yet.</div>}</div></section>
  </div>}
 </section></main>
}