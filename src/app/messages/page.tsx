import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, ChatCircleText } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MessagesPage(){
  const s=await createClient()
  const {data:auth}=await s.auth.getUser()
  if(!auth.user) redirect('/login?next=/messages')
  const {data:messages}=await s.from('investment_messages').select('id,opportunity_id,deal_id,sender_id,recipient_id,body,created_at,read_at').or('sender_id.eq.'+auth.user.id+',recipient_id.eq.'+auth.user.id).order('created_at',{ascending:false}).limit(100)
  const ids=[...(messages??[])].map(m=>m.opportunity_id).filter(Boolean)
  let names:Record<string,string>={}
  if(ids.length){const {data:ops}=await s.from('investment_opportunities').select('id,title_bn,title_en').in('id',ids);names=Object.fromEntries((ops??[]).map(o=>[o.id,o.title_bn||o.title_en||'Investment opportunity']))}
  return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"><Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Account</Link><div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Messages</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Investment conversations</h1><p className="mt-3 text-sm leading-7 opacity-60">Messages are limited to the participants protected by the investment workflow and do not expose private conversations publicly.</p></div><div className="mt-7 space-y-3">{messages?.length?messages.map(m=><article key={m.id} className="rounded-3xl border border-black/10 bg-white/85 p-5 dark:border-white/10 dark:bg-white/[.045]"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]"><ChatCircleText size={21}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-black">{names[m.opportunity_id]||'Investment conversation'}</h2><span className="text-[11px] opacity-40">{new Date(m.created_at).toLocaleString('en-GB')}</span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 opacity-65">{m.body}</p><Link href={'/invest/'+m.opportunity_id} className="mt-4 inline-flex items-center gap-1 text-xs font-bold">Open investment <ArrowRight size={14}/></Link></div></div></article>):<div className="rounded-3xl border border-dashed border-black/15 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-white/[.03]"><ChatCircleText size={30} className="mx-auto opacity-35"/><h2 className="mt-4 text-xl font-black">No messages</h2><p className="mt-2 text-sm opacity-50">Investment conversations will appear here when you participate in an eligible opportunity workflow.</p></div>}</div></section></main>
}
