'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Briefcase, CalendarBlank, MapPin, PaperPlaneRight, ShieldCheck } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Job={id:string;title:string;description:string;employment_type:string;workplace_type:string;district:string;upazila:string|null;location_text:string|null;salary_min:number|null;salary_max:number|null;currency:string;application_deadline:string|null;status:string;verification_status:string;verification_note:string|null;business_id:string|null;owner_id:string;external_apply_url:string|null;created_at:string}
type Business={id:string;name:string|null;title_bn:string|null;title_en:string|null}
type Profile={id:string;full_name:string|null;username:string|null}
type Application={id:string;status:string;cover_note:string|null;created_at:string}

const TYPES:Record<string,string>={full_time:'Full-time',part_time:'Part-time',contract:'Contract',internship:'Internship',freelance:'Freelance',temporary:'Temporary'}

export default function JobDetailPage({params}:{params:Promise<{id:string}>}){
  const routeParams=use(params)
  const [job,setJob]=useState<Job|null>(null)
  const [business,setBusiness]=useState<Business|null>(null)
  const [owner,setOwner]=useState<Profile|null>(null)
  const [application,setApplication]=useState<Application|null>(null)
  const [userId,setUserId]=useState('')
  const [cover,setCover]=useState('')
  const [loading,setLoading]=useState(true)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{void (async()=>{
    const s=createClient()
    const [{data:auth},{data,error:e}]=await Promise.all([s.auth.getUser(),s.from('fenix_jobs').select('*').eq('id',routeParams.id).maybeSingle()])
    if(e||!data){setError('This job is not available.');setLoading(false);return}
    const row=data as Job
    setJob(row);setUserId(auth.user?.id||'')
    if(row.business_id){const {data:b}=await s.from('businesses').select('id,name,title_bn,title_en').eq('id',row.business_id).maybeSingle();setBusiness(b as Business|null)}
    const {data:p}=await s.from('fenix_public_profiles').select('id,full_name,username').eq('id',row.owner_id).maybeSingle();setOwner(p as Profile|null)
    if(auth.user){const {data:a}=await s.from('fenix_job_applications').select('id,status,cover_note,created_at').eq('job_id',row.id).eq('applicant_id',auth.user.id).maybeSingle();setApplication(a as Application|null)}
    setLoading(false)
  })()},[routeParams.id])

  async function apply(){
    if(!job||!userId||busy)return
    setBusy(true);setError('')
    const s=createClient()
    const {data,error:e}=await s.from('fenix_job_applications').insert({job_id:job.id,applicant_id:userId,cover_note:cover.trim()||null}).select('id,status,cover_note,created_at').single()
    if(e)setError(e.code==='23505'?'You already applied for this job.':'Application could not be submitted.')
    else {setApplication(data as Application);setCover('')}
    setBusy(false)
  }

  async function withdraw(){
    if(!application||busy)return
    setBusy(true)
    const s=createClient()
    const {error:e}=await s.from('fenix_job_applications').update({status:'withdrawn'}).eq('id',application.id)
    if(e)setError('Application could not be withdrawn.');else setApplication({...application,status:'withdrawn'})
    setBusy(false)
  }

  if(loading)return <main className="min-h-dvh"><Navbar/><div className="mx-auto max-w-4xl px-4 py-20 text-sm text-[var(--fx-muted)]">Loading job…</div></main>
  if(!job)return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 py-12"><Link href="/jobs" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-4 text-sm font-bold"><ArrowLeft size={17}/> Jobs</Link><div className="mt-8 rounded-3xl border border-[var(--fx-border)] p-8"><h1 className="text-2xl font-black">Job not found</h1><p className="mt-2 text-sm text-[var(--fx-muted)]">{error}</p></div></section></main>

  const employer=business?.title_bn||business?.title_en||business?.name||owner?.full_name||owner?.username||'FeniX employer'
  const salary=job.salary_min!=null||job.salary_max!=null?[job.salary_min!=null?job.currency+' '+Number(job.salary_min).toLocaleString('en-BD'):'',job.salary_max!=null?'– '+job.currency+' '+Number(job.salary_max).toLocaleString('en-BD'):''].join(' ').trim():'Salary disclosed by employer'
  const deadlinePassed=Boolean(job.application_deadline&&new Date(job.application_deadline+'T23:59:59')<new Date())

  return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
    <Link href="/jobs" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 text-sm font-bold"><ArrowLeft size={17}/> Jobs</Link>
    <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px]">
      <article className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6 sm:p-8">
        <div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Briefcase size={24}/></div><div><p className="text-xs font-black uppercase tracking-[.15em] text-[var(--fx-primary-strong)]">Reviewed job posting</p><h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{job.title}</h1><p className="mt-2 text-sm font-semibold text-[var(--fx-muted)]">{employer}</p></div></div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 font-bold">{TYPES[job.employment_type]||job.employment_type}</span><span className="rounded-full border border-[var(--fx-border)] px-3 py-1.5">{job.workplace_type}</span><span className="inline-flex items-center gap-1 rounded-full border border-[var(--fx-border)] px-3 py-1.5"><MapPin size={14}/>{job.location_text||[job.upazila,job.district].filter(Boolean).join(' · ')}</span></div>
        <section className="mt-7"><h2 className="text-lg font-black">Role & responsibilities</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--fx-muted)]">{job.description}</p></section>
        <div className="mt-7 grid gap-3 sm:grid-cols-2"><Info label="Salary" value={salary}/><Info label="Deadline" value={job.application_deadline?new Date(job.application_deadline).toLocaleDateString('en-GB'):'Open until filled'}/><Info label="Posted" value={new Date(job.created_at).toLocaleDateString('en-GB')}/><Info label="Verification" value={job.verification_status==='verified'?'Verified employer information':'Reviewed for publication'}/></div>
        <div className="mt-7 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-4 text-xs leading-5"><ShieldCheck size={16} className="mr-1 inline text-[#008080]"/> FeniX review confirms the posting met its publication checks. It does not guarantee employment, salary or employer performance.</div>
      </article>
      <aside className="h-fit rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-black"><PaperPlaneRight size={18}/>{application?'Your application':'Apply through FeniX'}</div>
        {!userId?<Link href={'/login?next='+encodeURIComponent('/jobs/'+job.id)} className="mt-5 flex min-h-11 items-center justify-center rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white">Sign in to apply</Link>
        :application?<div className="mt-5 space-y-3"><p className="rounded-xl border border-[var(--fx-border)] p-3 text-sm">Status: <b className="capitalize">{application.status.replaceAll('_',' ')}</b></p>{!['withdrawn','rejected','hired'].includes(application.status)&&<button disabled={busy} onClick={()=>void withdraw()} className="min-h-11 w-full rounded-xl border border-red-500/20 px-4 text-xs font-bold text-red-700 dark:text-red-300">Withdraw application</button>}</div>
        :deadlinePassed?<p className="mt-5 rounded-xl bg-black/[.03] p-4 text-sm text-[var(--fx-muted)] dark:bg-white/[.03]">The application deadline has passed.</p>
        :<div className="mt-5"><label className="text-xs font-bold">Short note to employer <span className="text-[var(--fx-muted)]">(optional)</span></label><textarea value={cover} onChange={e=>setCover(e.target.value.slice(0,4000))} rows={7} placeholder="Tell the employer briefly why this role fits you." className="mt-2 w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-6 outline-none"/><button disabled={busy} onClick={()=>void apply()} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white disabled:opacity-45">Apply now <ArrowRight size={15}/></button><p className="mt-3 text-[10px] leading-5 text-[var(--fx-muted)]">Only your application note and FeniX public profile are shared with the employer.</p></div>}
        {userId===job.owner_id&&<Link href="/jobs/manage" className="mt-5 flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--fx-border)] text-xs font-bold">Manage this job <ArrowRight size={14}/></Link>}
        {job.external_apply_url&&<a href={job.external_apply_url} target="_blank" rel="noreferrer noopener" className="mt-3 flex min-h-10 items-center justify-center rounded-xl border border-[var(--fx-border)] text-xs font-bold">External application link</a>}
      </aside>
    </div>
  </section></main>
}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-[var(--fx-border)] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--fx-muted)]">{label}</p><p className="mt-2 text-sm font-bold">{value}</p></div>}