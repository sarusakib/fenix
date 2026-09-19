import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, ChartLineUp, ShieldCheck } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

type Deal={id:string;opportunity_id:string;agreed_amount:number;ownership_percentage:number;structure:string;status:string;created_at:string}

export default async function DealsPage(){
  const s=await createClient()
  const {data:auth}=await s.auth.getUser()
  if(!auth.user) redirect('/login?next=/deals')
  const {data:deals}=await s.from('investment_deals').select('id,opportunity_id,agreed_amount,ownership_percentage,structure,status,created_at').eq('investor_id',auth.user.id).order('created_at',{ascending:false}).limit(50)
  const ids=[...(deals??[])].map(d=>d.opportunity_id)
  let names:Record<string,string>={}
  if(ids.length){
    const {data:ops}=await s.from('investment_opportunities').select('id,title_bn,title_en').in('id',ids)
    names=Object.fromEntries((ops??[]).map(o=>[o.id,o.title_bn||o.title_en||'Investment opportunity']))
  }
  return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Account</Link><div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Investment deals</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Your deal records</h1><p className="mt-3 text-sm leading-7 opacity-60">These are workflow records between parties. A FeniX deal record is not the same as payment settlement or custody of funds.</p></div><div className="mt-7 space-y-3">{deals?.length?(deals as Deal[]).map(d=><article key={d.id} className="rounded-3xl border border-black/10 bg-white/85 p-5 dark:border-white/10 dark:bg-white/[.045]"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]"><ChartLineUp size={22}/></div><div><h2 className="font-black">{names[d.opportunity_id]}</h2><p className="mt-1 text-xs opacity-45">{d.status} · {d.structure||'Structure not specified'}</p></div></div><ShieldCheck size={20} className="text-[#008080]"/></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><div><p className="text-xs opacity-45">Agreed amount</p><p className="mt-1 font-black">BDT {Number(d.agreed_amount||0).toLocaleString('en-BD')}</p></div><div><p className="text-xs opacity-45">Ownership</p><p className="mt-1 font-black">{Number(d.ownership_percentage||0)}%</p></div><div><p className="text-xs opacity-45">Created</p><p className="mt-1 font-semibold">{new Date(d.created_at).toLocaleDateString('en-BD')}</p></div></div><Link href={'/invest/'+d.opportunity_id} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border border-black/10 px-3 text-xs font-bold dark:border-white/10">Open opportunity <ArrowRight size={15}/></Link></article>):<div className="rounded-3xl border border-dashed border-black/15 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-white/[.03]"><ChartLineUp size={30} className="mx-auto opacity-35"/><h2 className="mt-4 text-xl font-black">No deal records</h2><p className="mt-2 text-sm opacity-50">Verified investment offers and your interest workflow appear in Invest.</p><Link href="/invest" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">Open Invest <ArrowRight size={16}/></Link></div>}</div></section></main>
}
