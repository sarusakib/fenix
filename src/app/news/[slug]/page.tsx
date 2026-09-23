import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock, Newspaper, ShieldCheck } from '@phosphor-icons/react/dist/ssr'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

const labels: Record<string,string> = { local:'Local', business:'Business', jobs:'Jobs', events:'Events', public_notice:'Public Notice', fenix:'FeniX Update' }

export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params
  const s=await createClient()
  const {data}=await (s as any).from('news_posts').select('title_en,title_bn,excerpt_en,excerpt_bn').eq('slug',slug).eq('status','published').maybeSingle()
  return data ? {title:data.title_en+' | FeniX News',description:data.excerpt_en||data.excerpt_bn||'FeniX News'} : {title:'FeniX News'}
}

export default async function NewsArticle({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params
  const s=await createClient()
  const {data,error}=await (s as any).from('news_posts').select('*').eq('slug',slug).eq('status','published').maybeSingle()
  if(error || !data) notFound()
  return <main className="fenix-shell min-h-dvh"><Navbar/><article className="mx-auto max-w-4xl px-4 pb-28 pt-7 sm:px-6">
    <Link href="/news" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={15}/> FeniX News</Link>
    <div className="mt-7"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.13em] text-[var(--fx-primary-strong)]">{labels[data.category]}</span>{data.breaking&&<span className="rounded-full bg-red-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.13em] text-white">Breaking</span>}</div>
      <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-.055em] sm:text-6xl">{data.title_en}</h1>
      <p className="mt-4 text-xl leading-8 text-[var(--fx-muted)]">{data.title_bn}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-[var(--fx-muted)]"><span className="inline-flex items-center gap-1.5"><Clock size={14}/>{data.published_at?new Date(data.published_at).toLocaleString('en-BD'):''}</span><span className="inline-flex items-center gap-1.5"><ShieldCheck size={14}/>{data.source_name||'FeniX News Desk'}</span></div>
    </div>
    <div className="mt-8 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-8">
      <div className="border-b border-[var(--fx-border)] pb-7"><p className="text-base leading-8 text-[var(--fx-muted)]">{data.excerpt_en||data.excerpt_bn||''}</p></div>
      <div className="mt-7 whitespace-pre-wrap text-[15px] leading-8">{data.content_en}</div>
      <div className="mt-8 rounded-2xl bg-[var(--fx-primary-soft)] p-4 text-xs leading-6"><strong>Source & verification:</strong> {data.verification_status.replaceAll('_',' ')}{data.source_url?' · ':''}{data.source_url&&<a href={data.source_url} target="_blank" rel="noreferrer" className="underline">source</a>}</div>
    </div>
    <div className="mt-6 flex items-center justify-between gap-3"><Link href="/news" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-4 text-xs font-bold"><ArrowLeft size={15}/> More news</Link><Link href="/policy#news" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white">News standards <ArrowRight size={15}/></Link></div>
  </article></main>
}