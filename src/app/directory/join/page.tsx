'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Buildings, CheckCircle, Storefront } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { GuidedFormProgress } from '@/components/forms/GuidedFormProgress'
import { createClient } from '@/utils/supabase/client'

const CATEGORIES = ['Retail','Food & Beverage','Services','Manufacturing','Agriculture','Education','Technology','Healthcare','Transport','Online','Other']

export default function DirectoryJoinPage() {
  const router = useRouter()
  const [name,setName]=useState('')
  const [category,setCategory]=useState('')
  const [description,setDescription]=useState('')
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [step,setStep]=useState(1)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    const safeName=name.trim().slice(0,180)
    const safeDescription=description.trim().slice(0,2000)
    if (safeName.length<2) { setError('Business name is required.'); return }
    setBusy(true)
    const supabase=createClient()
    const {data:auth}=await supabase.auth.getUser()
    if(!auth.user){ setBusy(false); router.push('/login'); return }
    const {data,error:insertError}=await supabase
      .from('businesses')
      .insert({
        owner_id:auth.user.id,
        name:safeName,
        title_en:safeName,
        category:category || null,
        description:safeDescription || null,
      })
      .select('id')
      .single()
    if(insertError || !data){
      setError('Business could not be added right now. Please try again.')
      setBusy(false)
      return
    }
    router.push('/directory/manage?created=1')
  }

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/directory" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]">
          <ArrowLeft size={17}/> Directory
        </Link>
        <div className="mt-6 rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,.06)] dark:border-white/10 dark:bg-white/[.045] sm:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008080]/[.08] text-[#008080]"><Buildings size={24}/></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Business presence</p>
              <h1 className="mt-1 text-3xl font-black sm:text-4xl">Add your business</h1>
              <p className="mt-2 text-sm leading-6 opacity-60">Create the shared business identity used by Directory, Commerce, Start and future FeniX services.</p>
            </div>
          </div>
          <form onSubmit={(e)=>{e.preventDefault(); if(step===3) void submit(e);}} className="mt-8">
            <GuidedFormProgress step={step} total={3}
              title={step===1?'Business identity':step===2?'Business type':'Public description'}
              subtitle={step===1?'First tell us the name.':step===2?'Choose the category that fits best.':'Add a short description, then create your business.'}
              onBack={()=>setStep(s=>Math.max(1,s-1))}
              onNext={()=>{if(step===1&&!name.trim()){setError('Business name is required.');return} setError('');setStep(s=>Math.min(3,s+1))}}
              nextLabel={step===2?'Continue':'Next'}
              nextDisabled={step===1&&!name.trim()}
              submit
            />
            {step===1&&<div className="space-y-3"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] opacity-50">Business name</span><input autoFocus required value={name} onChange={e=>setName(e.target.value)} maxLength={180} className="h-12 w-full rounded-xl border border-black/10 bg-transparent px-3 text-sm outline-none focus:border-[#008080]/40 dark:border-white/10"/></label></div>}
            {step===2&&<div className="space-y-3"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] opacity-50">Category</span><select autoFocus value={category} onChange={e=>setCategory(e.target.value)} className="h-12 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-white/[.05]"><option value="">Select a category</option>{CATEGORIES.map(item=><option key={item}>{item}</option>)}</select></label></div>}
            {step===3&&<div className="space-y-3"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] opacity-50">Short description</span><textarea autoFocus value={description} onChange={e=>setDescription(e.target.value)} maxLength={2000} rows={7} className="w-full rounded-xl border border-black/10 bg-transparent p-3 text-sm leading-6 outline-none focus:border-[#008080]/40 dark:border-white/10"/></label>
            {error && <p className="rounded-xl bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200">{error}</p>}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"><button type="submit" disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#008080] px-5 text-sm font-black text-white disabled:opacity-50">{busy?'Creating...':'Create business'} <Storefront size={18}/></button><span className="inline-flex items-center gap-2 text-xs opacity-50"><CheckCircle size={16}/> Ownership remains protected by Supabase RLS.</span></div></div>}
          </form>
        </div>
      </section>
    </main>
  )
}
