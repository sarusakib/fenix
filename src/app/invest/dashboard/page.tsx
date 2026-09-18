'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChartLineUp, CheckCircle, Handshake, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { formatBDT, opportunityTitle, statusLabel } from '@/lib/investment'
import type { InvestmentDeal, InvestmentInterest, InvestmentOpportunity, InvestmentUpdate } from '@/types/database'

export default function InvestmentDashboardPage() {
  const [loading,setLoading]=useState(true)
  const [userId,setUserId]=useState('')
  const [profile,setProfile]=useState<{max_budget:number;verification_status:string}|null>(null)
  const [interests,setInterests]=useState<InvestmentInterest[]>([])
  const [deals,setDeals]=useState<InvestmentDeal[]>([])
  const [opportunities,setOpportunities]=useState<InvestmentOpportunity[]>([])
  const [updates,setUpdates]=useState<InvestmentUpdate[]>([])
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState('')

  async function load(){
    const s=createClient()
    const {data:auth}=await s.auth.getUser()
    if(!auth.user){window.location.replace('/login?next=/invest/dashboard');return}
    setUserId(auth.user.id)
    const p=await s.from('investment_profiles').select('max_budget,verification_status').eq('user_id',auth.user.id).maybeSingle()
    if(p.data)setProfile(p.data as {max_budget:number;verification_status:string})
    const [i,d]=await Promise.all([
      s.from('investment_interests').select('*').eq('investor_id',auth.user.id).order('created_at',{ascending:false}),
      s.from('investment_deals').select('*').eq('investor_id',auth.user.id).order('created_at',{ascending:false}),
    ])
    setInterests((i.data??[]) as InvestmentInterest[])
    setDeals((d.data??[]) as InvestmentDeal[])
    const ids=Array.from(new Set([...(i.data??[]).map(x=>x.opportunity_id),...(d.data??[]).map(x=>x.opportunity_id)]))
    if(ids.length){
      const [o,u]=await Promise.all([
        s.from('investment_opportunities').select('*').in('id',ids),
        s.from('investment_updates').select('*').in('opportunity_id',ids).order('created_at',{ascending:false}).limit(10),
      ])
      setOpportunities((o.data??[]) as InvestmentOpportunity[])
      setUpdates((u.data??[]) as InvestmentUpdate[])
    }
    setLoading(false)
  }
  useEffect(()=>{void load()},[])

  async function confirmFunding(dealId:string){
    setBusy(dealId);setError('')
    const s=createClient()
    const {error:e}=await s.rpc('investor_confirm_investment_deal',{p_deal_id:dealId})
    if(e)setError(e.message);else{setMessage('Your funding confirmation was recorded. The deal becomes funded only when the owner also confirms.');await load()}
    setBusy('')
  }

  const opp=(id:string)=>opportunities.find(x=>x.id===id)
  if(loading)return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><div className="mx-auto max-w-5xl px-4 py-24 text-center opacity-50">Loading investor dashboard...</div></main>

  return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
    <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-4 text-sm dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Investment</Link>
    <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Investor</p><h1 className="mt-1 text-4xl font-black">My investment dashboard</h1><p className="mt-2 text-sm opacity-55">Track interest, deal stages, confirmations and business updates.</p></div><Link href="/invest/profile" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0b1736]/10 px-4 text-sm font-bold dark:border-white/10"><UserCircle size={18}/> Edit profile</Link></div>

    {error&&<div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-sm text-red-600">{error}</div>}
    {message&&<div className="mt-4 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-4 text-sm">{message}</div>}

    <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4"><Kpi label="Interests" value={interests.length}/><Kpi label="Deals" value={deals.length}/><Kpi label="Active / funded" value={deals.filter(x=>['funded','active'].includes(x.status)).length}/><Kpi label="Profile" value={profile?.verification_status||'unverified'}/></div>

    <div className="mt-7 grid gap-6 lg:grid-cols-2">
      <Panel title="My interests" icon={<Handshake size={20}/>}>{interests.length?interests.map(i=>{const o=opp(i.opportunity_id);return <div key={i.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex items-center justify-between gap-3"><p className="font-black">{o?opportunityTitle(o):'Opportunity'}</p><span className="rounded-full bg-[#008080]/[.07] px-2.5 py-1 text-xs font-bold text-[#007171] dark:text-[#8ee6e0]">{statusLabel(i.status)}</span></div><p className="mt-2 text-sm opacity-55">Proposed: {formatBDT(i.offered_amount)}</p>{i.message&&<p className="mt-2 text-sm leading-6 opacity-65">{i.message}</p>}<Link href={`/invest/${i.opportunity_id}`} className="mt-3 inline-flex text-xs font-bold text-[#007171]">View opportunity →</Link></div>}) : <Empty text="No investment interests yet."/>}</Panel>

      <Panel title="My deals" icon={<ChartLineUp size={20}/>}>{deals.length?deals.map(d=>{const o=opp(d.opportunity_id);return <div key={d.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><div className="flex items-start justify-between gap-3"><div><p className="font-black">{o?opportunityTitle(o):'Deal'}</p><p className="mt-1 text-sm opacity-55">{formatBDT(d.agreed_amount)} · {statusLabel(d.structure)}</p></div><span className="rounded-full bg-[#d4b879]/[.12] px-2.5 py-1 text-xs font-bold dark:text-[#e8cf82]">{statusLabel(d.status)}</span></div><div className="mt-3 text-xs opacity-55">Owner confirmation: {d.owner_confirmed_at?'Yes':'Pending'} · Your confirmation: {d.investor_confirmed_at?'Yes':'Pending'}</div>{d.status==='funding_pending'&&!d.investor_confirmed_at&&<button disabled={busy===d.id} onClick={()=>void confirmFunding(d.id)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#008080] px-3 text-xs font-bold text-white"><CheckCircle size={16}/>{busy===d.id?'Confirming...':'Confirm funding'}</button>}</div>}) : <Empty text="No deal has been proposed yet."/>}</Panel>
    </div>

    <Panel title="Latest business updates" icon={<ChartLineUp size={20}/>}>{updates.length?updates.map(u=><article key={u.id} className="rounded-2xl border border-[#0b1736]/10 p-4 dark:border-white/10"><p className="font-bold">{u.title}</p><p className="mt-1 text-xs opacity-40">{u.period_label||new Date(u.created_at).toLocaleDateString('en-GB')}</p><p className="mt-3 text-sm leading-6 opacity-65">{u.body}</p><div className="mt-3 flex flex-wrap gap-4 text-xs opacity-50">{u.revenue_actual!=null&&<span>Revenue: {formatBDT(u.revenue_actual)}</span>}{u.customers_actual!=null&&<span>Customers: {u.customers_actual.toLocaleString('en-BD')}</span>}</div></article>):<Empty text="Business updates will appear after an approved opportunity publishes them."/>}</Panel>

    <div className="mt-7 rounded-2xl border border-amber-500/20 bg-amber-500/[.06] p-5 text-sm leading-6"><strong>Funding note:</strong> FeniX records a two-party confirmation stage; it does not receive, hold, transfer or settle investor funds. Legal agreements and payment arrangements remain between the relevant parties and should follow applicable law.</div>
  </section></main>
}

function Kpi({label,value}:{label:string;value:string|number}){return <div className="rounded-[1.5rem] border border-[#0b1736]/10 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[.04]"><p className="text-xs font-semibold opacity-50">{label}</p><p className="mt-3 text-2xl font-black">{typeof value==='number'?value.toLocaleString('en-BD'):statusLabel(value)}</p></div>}
function Panel({title,icon,children}:{title:string;icon:React.ReactNode;children:React.ReactNode}){return <section className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045]"><h2 className="flex items-center gap-2 text-xl font-black">{icon}{title}</h2><div className="mt-5 space-y-3">{children}</div></section>}
function Empty({text}:{text:string}){return <p className="py-8 text-center text-sm opacity-45">{text}</p>}
