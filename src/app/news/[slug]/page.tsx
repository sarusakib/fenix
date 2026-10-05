import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock, ShieldCheck } from '@phosphor-icons/react/dist/ssr'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'
import MarkNewsSeen from '@/components/news/MarkNewsSeen'

export const dynamic = 'force-dynamic'

const labels: Record<string,string> = { local:'Local', business:'Business', jobs:'Jobs', events:'Events', public_notice:'Public Notice', fenix:'FeniX Update' }

export async function generateMetadata({params}:{params:Promise<{slug:string}>}): Promise<Metadata> {
  const {slug}=await params
  const s=await createClient()
  const {data}=await (s as any).from('news_posts').select('title_en,title_bn,excerpt_en,excerpt_bn,image_url,published_at,automation_status,ads_eligible').eq('slug',slug).eq('status','published').maybeSingle()
  if (!data) return { title:'FeniX News', robots:{index:false,follow:true} }
  const description=data.excerpt_en||data.excerpt_bn||'FeniX News'
  const automated= data.automation_status === 'auto_curated' || data.automation_status === 'auto_official'
  return {
    title:data.title_en+' | FeniX News',
    description,
    alternates:{canonical:'/news/'+encodeURIComponent(slug)},
    robots: automated ? { index:false, follow:true } : undefined,
    openGraph:{type:'article',title:data.title_en+' | FeniX News',description,url:'/news/'+encodeURIComponent(slug),...(data.image_url?{images:[{url:data.image_url}]}:{}),...(data.published_at?{publishedTime:data.published_at}: {})},
  }
}

export default async function NewsArticle({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params
  const s=await createClient()
  const {data,error}=await (s as any).from('news_posts').select('*').eq('slug',slug).eq('status','published').maybeSingle()
  if(error || !data) notFound()
  const nonce = (await headers()).get('x-fenix-nonce') ?? undefined
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://fenix-saru-sakib.vercel.app'
  const articleUrl = `${base}/news/${encodeURIComponent(data.slug)}`
  const structuredData = {
    '@context':'https://schema.org',
    '@type':'NewsArticle',
    headline:data.title_en,
    description:data.excerpt_en||data.excerpt_bn||undefined,
    datePublished:data.published_at||undefined,
    dateModified:data.updated_at||data.published_at||undefined,
    url:articleUrl,
    mainEntityOfPage:{'@type':'WebPage','@id':articleUrl},
    publisher:{'@type':'Organization',name:'FeniX',url:base},
    ...(data.image_url?{image:[data.image_url]}:{})
  }
  return <main className="fenix-shell min-h-dvh"><Navbar/><MarkNewsSeen id={data.id}/><article className="mx-auto max-w-4xl px-4 pb-28 pt-7 sm:px-6">
    <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}}/>
    <Link href="/news" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={15}/> FeniX News</Link>
    <div className="mt-7"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.13em] text-[var(--fx-primary-strong)]">{labels[data.category]}</span>{data.breaking&&<span className="rounded-full bg-red-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.13em] text-white">Breaking</span>}</div>
      <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-.055em] sm:text-6xl">{data.title_en}</h1>
      <p className="mt-4 text-xl leading-8 text-[var(--fx-muted)]">{data.title_bn}</p>
      <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-[var(--fx-muted)]"><span className="inline-flex items-center gap-1.5"><Clock size={14}/>{data.published_at?new Date(data.published_at).toLocaleString('en-BD'):''}</span><span className="inline-flex items-center gap-1.5"><ShieldCheck size={14}/>{data.source_name||'FeniX News Desk'}</span>{data.automation_status==='auto_curated'&&<span className="rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--fx-primary-strong)]">Automated curated brief</span>}{data.automation_status==='auto_official'&&<span className="rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--fx-primary-strong)]">Automated official brief</span>}</div>
    </div>
    {data.image_url&&<img src={data.image_url} alt="" width={1600} height={900} className="mt-8 max-h-[620px] w-full rounded-[2rem] border border-[var(--fx-border)] object-cover"/>}
    <div className="mt-8 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-8">
      <div className="border-b border-[var(--fx-border)] pb-7"><p className="text-base leading-8 text-[var(--fx-muted)]">{data.excerpt_en||data.excerpt_bn||''}</p></div>
      <div className="mt-7 whitespace-pre-wrap text-[15px] leading-8">{data.content_en}</div>
      <div className="mt-8 rounded-2xl bg-[var(--fx-primary-soft)] p-4 text-xs leading-6"><strong>Source & verification:</strong> {data.verification_status.replaceAll('_',' ')}{data.automation_status!=='manual'?' · This page is an automated News brief and is not monetized by FeniX.':''}{data.source_url?' · ':''}{data.source_url&&<a href={data.source_url} target="_blank" rel="noreferrer" className="underline">source</a>}</div>
    </div>
    <div className="mt-6 flex items-center justify-between gap-3"><Link href="/news" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-4 text-xs font-bold"><ArrowLeft size={15}/> More news</Link><Link href="/policy#news" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white">News standards <ArrowRight size={15}/></Link></div>
  </article></main>
}