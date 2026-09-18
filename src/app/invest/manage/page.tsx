'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, FileArrowUp, FileText, Handshake, Plus, ShieldCheck, UploadSimple } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { formatBDT, opportunityTitle, progressPercent, statusLabel } from '@/lib/investment'
import type { InvestmentDocument, InvestmentInterest, InvestmentOpportunity, InvestmentDeal } from '@/types/database'

const INTEREST_STAGES = ['shortlisted','meeting','due_diligence','terms','agreed','declined'] as const

export default function InvestmentManagerPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [userId,setUserId]=useState('')
  const [opportunities,setOpportunities]=useState<InvestmentOpportunity[]>([])
  const [interests,setInterests]=useState<InvestmentInterest[]>([])
  const [deals,setDeals]=useState<InvestmentDeal[]>([])
  const [documents,setDocuments]=useState<InvestmentDocument[]>([])
  const [selected,setSelected]=useState('')
  const [docBusy,setDocBusy]=useState('')
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const [dealAmount,setDealAmount]=useState('')
  const [dealInvestor,setDealInvestor]=useState('')
  const [dealOpportunity,setDealOpportunity]=useState('')
  const [updateForm,setUpdateForm]=useState({title:'',body:'',period_label:'',revenue_actual:'',customers_actual:'',risk_note:''})
  const [updateOpportunity,setUpdateOpportunity]=useState('')
  const [busy,setBusy]=useState('')

  async function load() {
    const s=createClient()
    const {data:auth}=await s.auth.getUser()
    if(!auth.user){router.replace('/login?next=/invest/manage');return}
    setUserId(auth.user.id)
    const {data:opp}=await s.from('investment_opportunities').select('*').eq('owner_id',auth.user.id).order('created_at',{ascending:false})
    const list=(opp??[]) as InvestmentOpportunity[]
    setOpportunities(list)
    if(!selected && list[0]) setSelected(list[0].id)
    const ids=list.map(x=>x.id)
    if(ids.length){
      const [i,d,docs]=await Promise.all([
        s.from('investment_interests').select('*').in('opportunity_id',ids).order('created_at',{ascending:false}),
        s.from('investment_deals').select('*').in('opportunity_id',ids).order('created_at',{ascending:false}),
        s.from('investment_documents').select('*').in('opportunity_id',ids).order('created_at',{ascending:false}),
      ])
      setInterests((i.data??[]) as InvestmentInterest[])
      setDeals((d.data??[]) as InvestmentDeal[])
      setDocuments((docs.data??[]) as InvestmentDocument[])
    } else {
      setInterests([]);setDeals([]);setDocuments([])
    }
    setMessage(params.get('created')==='1'?'Opportunity submitted for FeniX review.':'')
  }

  useEffect(()=>{void load()},[router,params,selected])

  const current=opportunities.find(x=>x.id===selected) ?? opportunities[0] ?? null
  const currentInterests=interests.filter(x=>x.opportunity_id===current?.id)
  const currentDeals=deals.filter(x=>x.opportunity_id===current?.id)
  const currentDocs=documents.filter(x=>x.opportunity_id===current?.id)

  async function changeInterest(id:string,status:string){
    setBusy(id);setError('')
    const s=createClient()
    const {error:e}=await s.from('investment_interests').update({status}).eq('id',id)
    if(e)setError(e.message);else await load()
    setBusy('')
  }

  async function createDeal(interest:InvestmentInterest){
    const amount=Number(dealAmount||interest.offered_amount)
    if(!Number.isFinite(amount)||amount<=0){setError('Deal amount সঠিক দিন।');return}
    setBusy('deal');setError('')
    const s=createClient()
    const {error:e}=await s.from('investment_deals').insert({
      opportunity_id:interest.opportunity_id,
      investor_id:interest.investor_id,
      agreed_amount:amount,
      ownership_percentage:null,
      structure:'partnership',
      status:'proposed',
      terms_note:'Initial deal proposal. Final legal terms should be documented separately by the parties.',
    })
    if(e)setError(e.message);else{setMessage('Deal proposal created.');setDealAmount('');setDealInvestor('');await load()}
    setBusy('')
  }

  async function progressDeal(deal:InvestmentDeal,status:'agreed'|'funding_pending'|'cancelled'){
    setBusy(deal.id);setError('')
    const s=createClient()
    const {error:e}=await s.rpc('owner_progress_investment_deal',{
      p_deal_id:deal.id,p_status:status,p_agreed_amount:deal.agreed_amount,p_ownership_percentage:deal.ownership_percentage,p_terms_note:deal.terms_note,
    })
    if(e)setError(e.message);else await load()
    setBusy('')
  }

  async function uploadDocument(file:File){
    if(!current||!file)return
    if(file.size>10*1024*1024){setError('Document must be 10MB or smaller.');return}
    if(!['application/pdf','image/jpeg','image/png'].includes(file.type)){setError('Only PDF, JPG and PNG documents are supported.');return}
    setDocBusy(file.name)
    setError('')
    const s=createClient()
    const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'-').slice(0,120)
    const path=`${userId}/${current.id}/${crypto.randomUUID()}-${safe}`
    const upload=await s.storage.from('investment-documents').upload(path,file,{upsert:false,contentType:file.type})
    if(upload.error){setError(upload.error.message);setDocBusy('');return}
    const {error:e}=await s.from('investment_documents').insert({
      opportunity_id:current.id,owner_id:userId,document_type:'other',title:file.name.slice(0,160),storage_bucket:'investment-documents',storage_path:path,visibility:'review_only',status:'pending',
    })
    if(e){await s.storage.from('investment-documents').remove([path]);setError(e.message)}else{setMessage('Document uploaded for review.');await load()}
    setDocBusy('')
  }

  async function addUpdate(){
    if(!updateOpportunity||updateForm.title.trim().length<3||updateForm.body.trim().length<10){setError('Update title ও body দিন।');return}
    setBusy('update');setError('')
    const s=createClient()
    const {error:e}=await s.from('investment_updates').insert({
      opportunity_id:updateOpportunity,author_id:userId,title:updateForm.title.trim(),body:updateForm.body.trim(),
      period_label:updateForm.period_label.trim()||null,
      revenue_actual:updateForm.revenue_actual?Number(updateForm.revenue_actual):null,
      customers_actual:updateForm.customers_actual?Number(updateForm.customers_actual):null,
      risk_note:updateForm.risk_note.trim()||null,
    })
    if(e)setError(e.message);else{setMessage('Business update published.');setUpdateForm({title:'',body:'',period_label:'',revenue_actual:'',customers_actual:'',risk_note:''})}
    setBusy('')
  }

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-4 text-sm dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Investment</Link>
        <div className="mt-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Entrepreneur</p><h1 className="mt-1 text-4xl font-black">Investment Manager</h1><p className="mt-2 text-sm opacity-55">Manage offers, investor interest, documents, deal stages and post-funding updates.</p></div><Link href="/invest/create" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white"><Plus size={18}/> New opportunity</Link></div>

        {message&&<div className="mt-6 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.06] p-4 text-sm">{message}</div>}
        {error&&<div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-sm text-red-600">{error}</div>}

        {!opportunities.length ? (
          <div className="mt-8 rounded-[2rem] border border-dashed border-[#0b1736]/15 p-12 text-center dark:border-white/15"><RocketIcon/><h2 className="mt-4 text-xl font-black">No opportunities yet</h2><p className="mt-2 text-sm opacity-55">Create your first Feni investment opportunity.</p><Link href="/invest/create" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">Create opportunity</Link></div>
        ) : (
          <div className="mt-7 grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-2">
              {opportunities.map(o=><button key={o.id} type="button" onClick={()=>setSelected(o.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selected===o.id?'border-[#008080]/35 bg-[#008080]/[.06]':'border-[#0b1736]/10 bg-white/70 dark:border-white/10 dark:bg-white/[.035]'}`}><p className="line-clamp-2 text-sm font-bold">{opportunityTitle(o)}</p><p className="mt-2 text-xs opacity-45">{statusLabel(o.status)} · {progressPercent(o)}%</p></button>)}
            </aside>

            {current&&<div className="space-y-6">
              <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045] sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#008080]/[.08] px-3 py-1.5 text-xs font-bold text-[#007171] dark:text-[#8ee6e0]">{statusLabel(current.status)}</span><span className="rounded-full bg-[#d4b879]/[.12] px-3 py-1.5 text-xs font-bold text-[#8d6a14] dark:text-[#e8cf82]">{statusLabel(current.verification_status)}</span></div><h2 className="mt-4 text-2xl font-black">{opportunityTitle(current)}</h2></div><div className="text-right"><p className="text-xs opacity-45">Target</p><p className="text-2xl font-black">{formatBDT(current.target_amount)}</p></div></div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric label="Raised" value={formatBDT(current.raised_amount)}/><Metric label="Minimum" value={formatBDT(current.min_investment)}/><Metric label="Interest" value={String(currentInterests.length)}/></div>
              </section>

              <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]"><h2 className="flex items-center gap-2 text-xl font-black"><Handshake size={20}/> Investor interest</h2><p className="mt-1 text-sm opacity-50">Move interested people through your review process. Creating a deal should follow your due diligence and agreed terms.</p><div className="mt-5 space-y-3">{currentInterests.length?currentInterests.map(i=><div key={i.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="font-black">{formatBDT(i.offered_amount)} proposed</p><p className="mt-1 text-xs opacity-45">{statusLabel(i.status)} · {new Date(i.created_at).toLocaleDateString('en-GB')}</p>{i.message&&<p className="mt-3 text-sm leading-6 opacity-65">{i.message}</p>}</div><div className="flex flex-wrap gap-2">{INTEREST_STAGES.map(stage=><button key={stage} disabled={busy===i.id} onClick={()=>void changeInterest(i.id,stage)} className={`rounded-xl px-3 py-2 text-xs font-bold ${i.status===stage?'bg-[#008080] text-white':'bg-black/[.035] dark:bg-white/[.04]'}`}>{statusLabel(stage)}</button>)}{(i.status==='terms'||i.status==='agreed')&&<button disabled={busy==='deal'} onClick={()=>{setDealInvestor(i.investor_id);setDealOpportunity(i.opportunity_id);setDealAmount(String(i.offered_amount))}} className="rounded-xl bg-[#0b1736] px-3 py-2 text-xs font-bold text-white dark:bg-white/[.12]">Prepare deal</button>}</div></div></div>):<Empty text="No investor interest yet."/ >}</div>

                {dealInvestor&&dealOpportunity===current.id&&<div className="mt-4 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.04] p-4"><p className="text-sm font-bold">Create deal proposal</p><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input value={dealAmount} onChange={e=>setDealAmount(e.target.value.replace(/[^0-9.]/g,''))} className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10" placeholder="Agreed amount"/><button disabled={busy==='deal'} onClick={()=>{const match=currentInterests.find(x=>x.investor_id===dealInvestor); if(match) void createDeal(match)}} className="h-11 rounded-xl bg-[#008080] px-4 text-xs font-bold text-white">{busy==='deal'?'Creating...':'Create proposal'}</button></div></div>}
              </section>

              <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]"><h2 className="flex items-center gap-2 text-xl font-black"><Handshake size={20}/> Deal room</h2><div className="mt-5 space-y-3">{currentDeals.length?currentDeals.map(d=><div key={d.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-black">{formatBDT(d.agreed_amount)} · {statusLabel(d.structure)}</p><p className="mt-1 text-xs opacity-45">{statusLabel(d.status)}</p><p className="mt-2 text-xs opacity-55">Investor confirmation: {d.investor_confirmed_at?'Yes':'Pending'} · Owner confirmation: {d.owner_confirmed_at?'Yes':'Pending'}</p></div><div className="flex flex-wrap gap-2">{d.status==='proposed'&&<button disabled={busy===d.id} onClick={()=>void progressDeal(d,'agreed')} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Mark agreed</button>}{d.status==='agreed'&&<button disabled={busy===d.id} onClick={()=>void progressDeal(d,'funding_pending')} className="rounded-xl bg-[#008080] px-3 py-2 text-xs font-bold text-white">Funding pending</button>}{d.status==='funding_pending'&&!d.owner_confirmed_at&&<button disabled={busy===d.id} onClick={async()=>{setBusy(d.id);const s=createClient();const {error:e}=await s.rpc('owner_confirm_investment_deal',{p_deal_id:d.id});if(e)setError(e.message);else await load();setBusy('')}} className="rounded-xl border border-[#008080]/25 px-3 py-2 text-xs font-bold text-[#007171]">Confirm funding</button>}</div></div></div>):<Empty text="No deal proposals yet."/ >}</div></section>

              <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]"><h2 className="flex items-center gap-2 text-xl font-black"><FileArrowUp size={20}/> Due-diligence documents</h2><p className="mt-1 text-sm opacity-50">Private documents are stored in a non-public bucket. Admin review controls their status.</p><label className="mt-5 flex min-h-28 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#0b1736]/15 bg-black/[.02] text-center dark:border-white/15 dark:bg-white/[.02]"><input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>{const file=e.target.files?.[0];if(file)void uploadDocument(file);e.currentTarget.value=''}}/><div><UploadSimple size={25} className="mx-auto opacity-40"/><p className="mt-2 text-sm font-bold">{docBusy?'Uploading...':'Upload PDF/JPG/PNG (max 10MB)'}</p></div></label><div className="mt-4 space-y-2">{currentDocs.length?currentDocs.map(d=><div key={d.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/[.025] p-3 text-sm dark:bg-white/[.03]"><span className="flex min-w-0 items-center gap-2 truncate"><FileText size={16}/>{d.title}</span><span className="text-xs opacity-45">{statusLabel(d.status)}</span></div>):<p className="py-4 text-sm opacity-45">No documents uploaded.</p>}</div></section>

              {current.status!=='draft'&&current.status!=='rejected'&&<section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]"><h2 className="text-xl font-black">Business update</h2><p className="mt-1 text-sm opacity-50">After approval, keep investors informed with factual operating updates.</p><div className="mt-5 grid gap-3 md:grid-cols-2"><Input label="Update title" value={updateForm.title} onChange={v=>setUpdateForm(x=>({...x,title:v}))}/><Input label="Period" value={updateForm.period_label} onChange={v=>setUpdateForm(x=>({...x,period_label:v}))}/><Input label="Revenue actual (BDT, optional)" value={updateForm.revenue_actual} onChange={v=>setUpdateForm(x=>({...x,revenue_actual:v}))}/><Input label="Customers actual (optional)" value={updateForm.customers_actual} onChange={v=>setUpdateForm(x=>({...x,customers_actual:v}))}/><label className="md:col-span-2"><span className="mb-2 block text-xs font-semibold opacity-60">Update body</span><textarea value={updateForm.body} onChange={e=>setUpdateForm(x=>({...x,body:e.target.value}))} rows={5} maxLength={6000} className="w-full rounded-xl border border-[#0b1736]/10 bg-transparent p-3 text-sm leading-6 dark:border-white/10"/></label><label className="md:col-span-2"><span className="mb-2 block text-xs font-semibold opacity-60">Risk note (optional)</span><textarea value={updateForm.risk_note} onChange={e=>setUpdateForm(x=>({...x,risk_note:e.target.value}))} rows={3} maxLength={1500} className="w-full rounded-xl border border-[#0b1736]/10 bg-transparent p-3 text-sm leading-6 dark:border-white/10"/></label></div><div className="mt-4 flex flex-wrap gap-3">{<select value={updateOpportunity} onChange={e=>setUpdateOpportunity(e.target.value)} className="h-11 rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"><option value="">Choose opportunity</option>{opportunities.filter(x=>x.status==='approved'||x.status==='fully_funded').map(x=><option key={x.id} value={x.id}>{opportunityTitle(x)}</option>)}</select>}<button disabled={busy==='update'} onClick={()=>void addUpdate()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white"><Plus size={17}/>{busy==='update'?'Publishing...':'Publish update'}</button></div></section>}
            </div>}
          </div>
        )}
      </section>
    </main>
  )
}
function Metric({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-black/[.025] p-3 dark:bg-white/[.03]"><p className="text-xs opacity-45">{label}</p><p className="mt-1 font-black">{value}</p></div>}
function Empty({text}:{text:string}){return <p className="py-8 text-center text-sm opacity-45">{text}</p>}
function Input({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label><span className="mb-2 block text-xs font-semibold opacity-60">{label}</span><input value={value} onChange={e=>onChange(e.target.value)} className="h-11 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm dark:border-white/10"/></label>}
function RocketIcon(){return <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4b879]/[.1]"><Plus size={24}/></div>}
