'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Buildings, PencilSimple, ShieldCheck, Storefront, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Business={id:string;name:string;title_en:string|null;title_bn:string|null;category:string|null}
type DirectoryProfile={business_id:string;slug:string|null;owner_claimed:boolean;verification_level:string;listing_status:string}

const labels:Record<string,string>={unverified:'Basic listing',owner_claimed:'Owner claimed',identity_reviewed:'Identity reviewed',business_reviewed:'Business reviewed',fenix_verified:'FeniX Verified'}

export default function DirectoryManagePage(){
  const [items,setItems]=useState<Array<Business & {profile?:DirectoryProfile}>>([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{
    let active=true
    async function load(){
      const s=createClient()
      const {data:auth}=await s.auth.getUser()
      if(!auth.user){if(active){setLoading(false);setError('Please sign in to manage a business.')}return}
      const {data:businesses,error:be}=await s.from('businesses').select('id,name,title_en,title_bn,category').eq('owner_id',auth.user.id).order('updated_at',{ascending:false})
      if(be){if(active){setLoading(false);setError('Business list could not be loaded.')}return}
      const ids=(businesses??[]).map(b=>b.id)
      let profiles:DirectoryProfile[]=[]
      if(ids.length){
        const {data:pd,error:pe}=await s.from('business_directory_profiles').select('business_id,slug,owner_claimed,verification_level,listing_status').in('business_id',ids)
        if(pe){if(active){setLoading(false);setError('Business trust status could not be loaded.')}return}
        profiles=(pd??[]) as DirectoryProfile[]
      }
      if(active){
        const map=new Map(profiles.map(p=>[p.business_id,p]))
        setItems((businesses??[]).map(b=>({...b,profile:map.get(b.id)})))
        setLoading(false)
      }
    }
    void load()
    return()=>{active=false}
  },[])
  return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><div className="flex flex-wrap items-center justify-between gap-3"><Link href="/directory" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Directory</Link><Link href="/directory/join" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">Add another business <ArrowRight size={17}/></Link></div><div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Owner workspace</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Manage your businesses</h1><p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">The same business identity can later connect to products, investment, business planning, verification and Feni Brain discovery.</p></div>{error&&<div className="mt-6 rounded-2xl bg-red-500/[.06] p-4 text-sm text-red-700 dark:text-red-200">{error}</div>}{loading?<div className="mt-8 grid gap-4 sm:grid-cols-2">{[1,2,3,4].map(i=><div key={i} className="h-48 animate-pulse rounded-3xl border border-black/10 bg-white dark:border-white/10 dark:bg-white/[.04]"/>)}</div>:items.length?<div className="mt-8 grid gap-4 sm:grid-cols-2">{items.map(item=><article key={item.id} className="rounded-3xl border border-black/10 bg-white/85 p-5 dark:border-white/10 dark:bg-white/[.045]"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]"><Storefront size={23}/></div><div><h2 className="font-black">{item.title_bn||item.title_en||item.name}</h2><p className="mt-1 text-xs opacity-45">{item.category||'Category not set'}</p></div></div><ShieldCheck size={19} className={item.profile?.verification_level==='fenix_verified'?'text-[#008080]':'opacity-30'}/></div><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-black/[.04] px-2.5 py-1 text-[11px] font-bold dark:bg-white/[.06]">{labels[item.profile?.verification_level||'unverified']}</span>{item.profile?.listing_status==='published'&&<span className="rounded-full bg-[#008080]/[.08] px-2.5 py-1 text-[11px] font-bold text-[#007171]">Public</span>}</div><div className="mt-5 flex flex-wrap gap-2"><Link href={'/directory/'+encodeURIComponent(item.profile?.slug||item.id)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">Open profile <ArrowRight size={16}/></Link>{!item.profile?.owner_claimed&&<Link href={'/directory/claim?business='+encodeURIComponent(item.id)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-black/10 px-4 text-sm font-bold dark:border-white/10">Claim <UserCircle size={17}/></Link>}<Link href="/start" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-black/10 px-4 text-sm font-bold dark:border-white/10"><PencilSimple size={17}/> Start/Plan</Link></div></article>)}</div>:<section className="mt-8 rounded-3xl border border-dashed border-black/15 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-white/[.03]"><Buildings size={32} className="mx-auto opacity-40"/><h2 className="mt-4 text-xl font-black">No owned business yet</h2><p className="mt-2 text-sm opacity-55">Create your first shared business identity and keep future FeniX features connected.</p><Link href="/directory/join" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">Create business <ArrowRight size={17}/></Link></section>}</section></main>
}
