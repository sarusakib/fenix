'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Business={id:string;name:string|null;title_bn:string|null;title_en:string|null}

export default function PostJobPage(){
  const [userId,setUserId]=useState('')
  const [businesses,setBusinesses]=useState<Business[]>([])
  const [form,setForm]=useState({title:'',description:'',employment_type:'full_time',workplace_type:'onsite',business_id:'',district:'Feni',upazila:'',location_text:'',salary_min:'',salary_max:'',application_deadline:'',external_apply_url:''})
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [done,setDone]=useState(false)

  useEffect(()=>{void (async()=>{
    const s=createClient(); const {data:auth}=await s.auth.getUser()
    if(!auth.user){window.location.replace('/login?next=/jobs/post');return}
    setUserId(auth.user.id)
    const {data}=await s.from('businesses').select('id,name,title_bn,title_en').eq('owner_id',auth.user.id).order('updated_at',{ascending:false})
    setBusinesses((data??[]) as Business[])
  })()},[])

  async function submit(e:React.FormEvent){
    e.preventDefault(); if(busy)return
    setBusy(true); setError('')
    if(form.title.trim().length<4||form.description.trim().length<20){setError('Add a clear title and at least 20 characters of role details.');setBusy(false);return}
    const s=createClient()
    const {error:e2}=await s.from('fenix_jobs').insert({
      owner_id:userId,business_id:form.business_id||null,title:form.title.trim().slice(0,160),description:form.description.trim().slice(0,12000),
      employment_type:form.employment_type,workplace_type:form.workplace_type,district:form.district.trim().slice(0,80)||'Feni',
      upazila:form.upazila.trim().slice(0,80)||null,location_text:form.location_text.trim().slice(0,160)||null,
      salary_min:form.salary_min?Math.max(0,Number(form.salary_min)||0):null,salary_max:form.salary_max?Math.max(0,Number(form.salary_max)||0):null,
      application_deadline:form.application_deadline||null,external_apply_url:form.external_apply_url.trim().slice(0,500)||null,status:'pending_review',verification_status:'unverified'
    })
    if(e2)setError(e2.message||'Job could not be submitted.');else setDone(true)
    setBusy(false)
  }

  if(done)return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><div className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-8 text-center sm:p-12"><CheckCircle size={44} className="mx-auto text-[var(--fx-primary-strong)]"/><h1 className="mt-5 text-3xl font-black">Job submitted for review</h1><p className="mt-3 text-sm leading-7 text-[var(--fx-muted)]">An admin will review the posting before it appears publicly.</p><div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row"><Link href="/jobs/manage" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white">Open Jobs workspace</Link><Link href="/jobs" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--fx-border)] px-4 text-sm font-bold">Back to Jobs</Link></div></div></section></main>

  return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
    <Link href="/jobs" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 text-sm font-bold"><ArrowLeft size={17}/> Jobs</Link>
    <div className="mt-7"><p className="text-xs font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Employer</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Post a job</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">Every posting starts in review. Keep the role factual, current and clear.</p></div>
    <form onSubmit={submit} className="mt-7 space-y-4 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-8">
      <Field label="Job title"><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} maxLength={160} className="input"/></Field>
      <Field label="Role description"><textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={9} maxLength={12000} placeholder="Responsibilities, required skills, experience and expectations." className="textarea"/></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Employment type" value={form.employment_type} onChange={v=>setForm({...form,employment_type:v})} options={['full_time','part_time','contract','internship','freelance','temporary']}/>
        <Select label="Workplace" value={form.workplace_type} onChange={v=>setForm({...form,workplace_type:v})} options={['onsite','hybrid','remote']}/>
        <Select label="Business (optional)" value={form.business_id} onChange={v=>setForm({...form,business_id:v})} options={[''].concat(businesses.map(b=>b.id))} labels={['Personal / independent employer'].concat(businesses.map(b=>b.title_bn||b.title_en||b.name||'Business'))}/>
        <Field label="Location label"><input value={form.location_text} onChange={e=>setForm({...form,location_text:e.target.value})} maxLength={160} placeholder="e.g. Feni Sadar" className="input"/></Field>
        <Field label="Upazila"><input value={form.upazila} onChange={e=>setForm({...form,upazila:e.target.value})} maxLength={80} className="input"/></Field>
        <Field label="Application deadline"><input type="date" value={form.application_deadline} onChange={e=>setForm({...form,application_deadline:e.target.value})} className="input"/></Field>
        <Field label="Salary minimum (BDT)"><input inputMode="decimal" value={form.salary_min} onChange={e=>setForm({...form,salary_min:e.target.value.replace(/[^0-9.]/g,'')})} className="input"/></Field>
        <Field label="Salary maximum (BDT)"><input inputMode="decimal" value={form.salary_max} onChange={e=>setForm({...form,salary_max:e.target.value.replace(/[^0-9.]/g,'')})} className="input"/></Field>
      </div>
      <Field label="External application URL (optional)"><input type="url" value={form.external_apply_url} onChange={e=>setForm({...form,external_apply_url:e.target.value})} maxLength={500} placeholder="https://example.com/apply" className="input"/></Field>
      {error&&<div className="rounded-xl bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200">{error}</div>}
      <button disabled={busy||!userId} className="min-h-12 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-bold text-white disabled:opacity-45">{busy?'Submitting…':'Submit for review'}</button>
    </form>
    <style jsx global>{`.input,.textarea{margin-top:.5rem;width:100%;border:1px solid var(--fx-border);border-radius:.9rem;background:transparent;padding:.75rem .9rem;outline:none;font-size:.875rem}.input{height:2.9rem}.textarea{line-height:1.55}.input:focus,.textarea:focus{border-color:rgba(0,128,128,.4);box-shadow:0 0 0 4px rgba(0,128,128,.08)}`}</style>
  </section></main>
}

function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block"><span className="text-xs font-bold">{label}</span>{children}</label>}
function Select({label,value,onChange,options,labels}:{label:string;value:string;onChange:(value:string)=>void;options:string[];labels?:string[]}){return <label className="block"><span className="text-xs font-bold">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} className="input mt-2">{options.map((o,i)=><option key={o||'empty'} value={o}>{labels ? labels[i] : o.replaceAll('_',' ')}</option>)}</select></label>}