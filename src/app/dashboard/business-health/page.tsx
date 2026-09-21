'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Buildings, CheckCircle, MapPin, Package, ShieldCheck, WarningCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Business = { id:string; name:string|null; title_bn:string|null; title_en:string|null; description:string|null; category:string|null }
type Directory = { business_id:string; slug:string|null; listing_status:string; owner_claimed:boolean; verification_level:string; phone_verified:boolean; location_verified:boolean; about_bn:string|null; about_en:string|null }
type Location = { business_id:string; area:string|null; address:string|null; latitude:number|null; longitude:number|null; is_public:boolean }
type Row = Business & { directory?:Directory; location?:Location; products:number; opportunities:number; score:number; actions:string[] }

function readiness(b:Business,d?:Directory,l?:Location,products=0,opportunities=0){
  let score=0; const actions:string[]=[]
  if((b.name||b.title_bn||b.title_en)?.trim()) score+=10
  else actions.push('Add a business name')
  if(b.category) score+=10
  else actions.push('Choose a category')
  if((b.description||d?.about_bn||d?.about_en)?.trim()) score+=15
  else actions.push('Add a clear description')
  if(d) score+=10
  else actions.push('Create the directory profile')
  if(d?.listing_status==='published') score+=10
  else actions.push('Publish the directory listing')
  if(d?.owner_claimed) score+=10
  else actions.push('Claim ownership')
  if(d?.phone_verified) score+=10
  else actions.push('Verify the business phone')
  if(d?.location_verified) score+=10
  else actions.push('Verify the location')
  if(l?.is_public && l.latitude!=null && l.longitude!=null) score+=10
  else actions.push('Add a public map location')
  if(products>0) score+=5
  else actions.push('Add at least one published product')
  if(opportunities>0) score+=5
  return {score:Math.min(100,score),actions}
}

export default function BusinessHealthPage(){
  const [rows,setRows]=useState<Row[]>([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    let active=true
    async function load(){
      const s=createClient()
      const {data:auth}=await s.auth.getUser()
      if(!auth.user){window.location.href='/login?next=/dashboard/business-health';return}
      const {data:businesses}=await s.from('businesses').select('id,name,title_bn,title_en,description,category').eq('owner_id',auth.user.id).order('updated_at',{ascending:false})
      const bs=(businesses??[]) as Business[]
      const ids=bs.map(x=>x.id)
      if(!ids.length){if(active){setRows([]);setLoading(false)};return}
      const [d,l,p,o]=await Promise.all([
        s.from('business_directory_profiles').select('business_id,slug,listing_status,owner_claimed,verification_level,phone_verified,location_verified,about_bn,about_en').in('business_id',ids),
        s.from('business_directory_locations').select('business_id,area,address,latitude,longitude,is_public').in('business_id',ids),
        s.from('products').select('business_id').in('business_id',ids).eq('status','published').eq('is_active',true),
        s.from('investment_opportunities').select('business_id').in('business_id',ids).in('status',['approved','fully_funded']).eq('verification_status','verified'),
      ])
      if(!active)return
      const dm=new Map<string,Directory>((d.data??[] as Directory[]).map(x=>[x.business_id,x]))
      const lm=new Map<string,Location>((l.data??[] as Location[]).map(x=>[x.business_id,x]))
      const pc=new Map<string,number>(); for(const x of p.data??[]){pc.set(x.business_id,(pc.get(x.business_id)||0)+1)}
      const oc=new Map<string,number>(); for(const x of o.data??[]){oc.set(x.business_id,(oc.get(x.business_id)||0)+1)}
      setRows(bs.map(b=>{const r=readiness(b,dm.get(b.id),lm.get(b.id),pc.get(b.id)||0,oc.get(b.id)||0);return {...b,directory:dm.get(b.id),location:lm.get(b.id),products:pc.get(b.id)||0,opportunities:oc.get(b.id)||0,score:r.score,actions:r.actions}}))
      setLoading(false)
    }
    void load(); return()=>{active=false}
  },[])
  return <main className="min-h-dvh bg-[var(--fx-bg)]"><Navbar/><section className="mx-auto max-w-6xl px-4 pb-28 pt-7 sm:px-6">
    <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Account</Link>
    <header className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]"><ShieldCheck size={17}/> Business Health</div>
      <h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-6xl">Keep your business profile ready to be discovered.</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">This is a completeness/readiness check based on fields and FeniX workflow state. It is not a business-quality rating or guarantee.</p>
    </header>
    {loading ? <div className="mt-6 h-64 animate-pulse rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)]"/> :
      rows.length ? <div className="mt-6 grid gap-4">{rows.map(b=><article key={b.id} className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Buildings size={24}/></div><div><h2 className="text-xl font-black">{b.title_bn||b.title_en||b.name||'Business'}</h2><p className="mt-1 text-xs text-[var(--fx-muted)]">{b.category||'Category not set'} · {b.directory?.listing_status||'No directory profile'}</p></div></div>
          <div className="text-right"><div className="text-3xl font-black text-[var(--fx-primary-strong)]">{b.score}%</div><div className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--fx-muted)]">Profile readiness</div></div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--fx-border)]"><div className="h-full rounded-full bg-[var(--fx-primary-strong)]" style={{width:b.score+'%'}}/></div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Meta icon={MapPin} label="Location" value={b.location?.is_public?'Public map':'Needs attention'}/>
          <Meta icon={ShieldCheck} label="Verification" value={b.directory?.verification_level||'Not verified'}/>
          <Meta icon={Package} label="Products" value={String(b.products)}/>
          <Meta icon={CheckCircle} label="Claim" value={b.directory?.owner_claimed?'Claimed':'Not claimed'}/>
        </div>
        {b.actions.length>0 && <div className="mt-5 rounded-2xl border border-amber-500/15 bg-amber-500/[.05] p-4"><div className="flex items-center gap-2 text-xs font-black"><WarningCircle size={16}/><span>Suggested next actions</span></div><div className="mt-2 flex flex-wrap gap-2">{b.actions.slice(0,6).map(x=><span key={x} className="rounded-full border border-[var(--fx-border)] px-3 py-1.5 text-[10px] text-[var(--fx-muted)]">{x}</span>)}</div></div>}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={b.directory?.slug?'/directory/'+encodeURIComponent(b.directory.slug):'/directory/manage'} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-3.5 text-xs font-bold text-white">Manage business <ArrowRight size={14}/></Link>
          <Link href="/guide?q=How%20can%20I%20improve%20my%20business%20profile%20in%20FeniX%3F" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold">Ask Feni Brain <ArrowRight size={14}/></Link>
        </div>
      </article>)}</div> :
      <div className="mt-6 rounded-[2rem] border border-dashed border-[var(--fx-border)] p-10 text-center"><Buildings size={32} className="mx-auto opacity-35"/><h2 className="mt-4 text-xl font-black">No owned businesses yet.</h2><p className="mt-2 text-sm text-[var(--fx-muted)]">Create or claim a business to start the readiness workflow.</p><Link href="/directory/join" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white">Add business <ArrowRight size={15}/></Link></div>
    }
  </section></main>
}
function Meta({icon:Icon,label,value}:{icon:any;label:string;value:string}){return <div className="rounded-xl border border-[var(--fx-border)] p-3"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.1em] text-[var(--fx-muted)]"><Icon size={14}/>{label}</div><div className="mt-1 text-sm font-bold">{value}</div></div>}
