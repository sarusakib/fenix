'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Briefcase, CalendarBlank, MapPin, Plus, ShieldCheck } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Job = {
  id:string; title:string; description:string; employment_type:string; workplace_type:string;
  district:string; upazila:string|null; location_text:string|null; application_deadline:string|null;
  status:string; verification_status:string; business_id:string|null; created_at:string
}
type Business = { id:string; name:string|null; title_bn:string|null; title_en:string|null }

const TYPES:Record<string,string> = {
  full_time:'Full-time', part_time:'Part-time', contract:'Contract',
  internship:'Internship', freelance:'Freelance', temporary:'Temporary',
}

export default function JobsPage(){
  const [jobs,setJobs]=useState<Job[]>([])
  const [businesses,setBusinesses]=useState<Record<string,Business>>({})
  const [query,setQuery]=useState('')
  const [type,setType]=useState('all')
  const [loading,setLoading]=useState(true)
  const [signedIn,setSignedIn]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{
    void (async()=>{
      const s=createClient()
      const [{data,error:e},{data:auth}] = await Promise.all([
        s.from('fenix_jobs').select('id,title,description,employment_type,workplace_type,district,upazila,location_text,application_deadline,status,verification_status,business_id,created_at').eq('status','published').order('published_at',{ascending:false}).limit(100),
        s.auth.getUser(),
      ])
      setSignedIn(Boolean(auth.user))
      if(e){setError('Jobs could not be loaded.');setLoading(false);return}
      const rows=(data??[]) as Job[]
      setJobs(rows)
      const ids=[...new Set(rows.map(j=>j.business_id).filter(Boolean) as string[])]
      if(ids.length){
        const {data:businessRows}=await s.from('businesses').select('id,name,title_bn,title_en').in('id',ids)
        setBusinesses(Object.fromEntries(((businessRows??[]) as Business[]).map(b=>[b.id,b])))
      }
      setLoading(false)
    })()
  },[])

  const visible=useMemo(()=>{
    const q=query.trim().toLowerCase()
    return jobs.filter(job=>{
      if(type!=='all'&&job.employment_type!==type)return false
      if(!q)return true
      const b=job.business_id?businesses[job.business_id]:undefined
      return [job.title,job.description,job.district,job.upazila||'',job.location_text||'',b?.title_bn||'',b?.title_en||'',b?.name||''].join(' ').toLowerCase().includes(q)
    })
  },[jobs,businesses,query,type])

  return <main className="min-h-dvh"><Navbar/>
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 text-sm font-bold"><ArrowLeft size={17}/> Home</Link>
      <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Work & opportunity</p><h1 className="mt-2 text-3xl font-black tracking-[-.045em] sm:text-5xl">Verified jobs & local work</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">Employer-submitted postings are reviewed before publication. Applications stay inside FeniX and remain visible only to the relevant applicant and employer.</p></div>
        {signedIn&&<Link href="/jobs/post" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white"><Plus size={17}/> Post a job</Link>}
      </div>
      <div className="mt-7 grid gap-3 md:grid-cols-[1fr_220px]"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search role, skill, area or business" className="h-12 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 text-sm outline-none"/><select value={type} onChange={e=>setType(e.target.value)} className="h-12 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 text-sm"><option value="all">All employment types</option>{Object.entries(TYPES).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
      {error&&<div className="mt-5 rounded-2xl bg-red-500/[.06] p-4 text-sm text-red-700 dark:text-red-200">{error}</div>}
      {loading?<div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1,2,3,4,5,6].map(i=><div key={i} className="h-52 animate-pulse rounded-[1.7rem] bg-black/[.03] dark:bg-white/[.04]"/>)}</div>
      :visible.length?<div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(job=>{
        const b=job.business_id?businesses[job.business_id]:undefined
        return <Link key={job.id} href={'/jobs/'+job.id} className="group rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--fx-primary)]/25">
          <div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Briefcase size={21}/></div><span className="rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--fx-primary-strong)]">{TYPES[job.employment_type]||job.employment_type}</span></div>
          <h2 className="mt-5 text-lg font-black leading-6">{job.title}</h2><p className="mt-1 text-xs font-semibold text-[var(--fx-muted)]">{b?.title_bn||b?.title_en||b?.name||'FeniX employer'}</p>
          <div className="mt-4 space-y-2 text-xs text-[var(--fx-muted)]"><p className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0"/>{job.location_text||[job.upazila,job.district].filter(Boolean).join(' · ')||'Feni'} · {job.workplace_type}</p>{job.application_deadline&&<p className="flex items-center gap-2"><CalendarBlank size={15}/>Apply by {new Date(job.application_deadline).toLocaleDateString('en-GB')}</p>}</div>
          <div className="mt-5 flex items-center justify-between gap-3"><span className="inline-flex items-center gap-1 rounded-full bg-[#008080]/[.07] px-2.5 py-1 text-[10px] font-bold text-[#007171] dark:text-[#8ee6e8]"><ShieldCheck size={13}/> Reviewed posting</span><ArrowRight size={16} className="text-[var(--fx-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--fx-primary-strong)]"/></div>
        </Link>
      })}</div>
      :<section className="mt-8 rounded-[2rem] border border-dashed border-[var(--fx-border)] bg-[var(--fx-surface)] p-10 text-center"><Briefcase size={30} className="mx-auto opacity-30"/><h2 className="mt-4 text-xl font-black">No published jobs match this search</h2><p className="mt-2 text-sm text-[var(--fx-muted)]">Try a different role, area or employment type.</p></section>}
    </section>
  </main>
}