import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, ArrowSquareOut, BookOpen, MapPin } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { FENI_ARTICLE_SOURCES, getFeniArticle } from '@/data/feniArticles'

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params; const article=getFeniArticle(slug)
 if(!article) return {title:'Feni Guide | FeniX',robots:{index:false,follow:false}}
 return {title:`${article.titleEn} | FeniX`,description:article.descriptionEn,keywords:article.tags,alternates:{canonical:`/feni/${article.slug}`}}
}

export default async function FeniArticlePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const article=getFeniArticle(slug); if(!article) return null
 const jsonLd={'@context':'https://schema.org','@type':'Article','headline':article.titleEn,'description':article.descriptionEn,'datePublished':article.updated,'dateModified':article.updated,'author':{'@type':'Organization','name':'FeniX','url':'https://fenix-saru.vercel.app/'},'publisher':{'@type':'Organization','name':'FeniX'},'mainEntityOfPage':`https://fenix-saru.vercel.app/feni/${article.slug}`, 'keywords':article.tags}
 const crumbs={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'FeniX','item':'https://fenix-saru.vercel.app/'},{'@type':'ListItem','position':2,'name':'Feni Knowledge','item':'https://fenix-saru.vercel.app/feni'},{'@type':'ListItem','position':3,'name':article.titleEn,'item':`https://fenix-saru.vercel.app/feni/${article.slug}`}]}
 const related=article.slug==='feni-district-guide'?'/feni/feni-services-directory':'/feni/feni-district-guide'
 return <main className="min-h-dvh">
  <Navbar/>
  <article className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
   <Link href="/feni" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Feni Knowledge</Link>
   <header className="mt-6 rounded-[2.25rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-7 sm:p-10">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.17em] text-[var(--fx-primary-strong)]"><BookOpen size={16}/> FeniX Public Guide</div>
    <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-.04em] sm:text-6xl">{article.titleBn}</h1>
    <p className="mt-3 text-lg font-semibold leading-8 text-[var(--fx-muted)]">{article.titleEn}</p>
    <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">{article.descriptionBn}</p>
    <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] text-[var(--fx-muted)]"><span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5"><MapPin size={13}/> Feni, Bangladesh</span><span>Updated {article.updated}</span></div>
   </header>
   <div className="mt-7 space-y-4">
    {article.sections.map((section)=><section key={section.headingEn} className="rounded-[1.8rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6 sm:p-8">
      <h2 className="text-2xl font-black">{section.headingBn}</h2>
      <p className="mt-1 text-sm font-semibold text-[var(--fx-muted)]">{section.headingEn}</p>
      <p className="mt-5 text-sm leading-8">{section.bodyBn}</p>
      <p className="mt-4 border-t border-[var(--fx-border)] pt-4 text-sm leading-8 text-[var(--fx-muted)]">{section.bodyEn}</p>
    </section>)}
   </div>
   <section className="mt-5 rounded-[1.8rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6">
    <h2 className="text-lg font-black">Source context</h2>
    <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">Public factual claims should be checked against the underlying official source, especially when information can change.</p>
    <div className="mt-4 flex flex-wrap gap-2">
      <a href={FENI_ARTICLE_SOURCES.officialDistrictSource} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold">Feni District official source <ArrowSquareOut size={14}/></a>
      <a href={FENI_ARTICLE_SOURCES.bbsSource} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold">BBS Feni source <ExternalLink size={14}/></a>
    </div>
   </section>
   <div className="mt-5 rounded-[1.8rem] border border-[var(--fx-primary)]/15 bg-[var(--fx-primary-soft)] p-6">
    <p className="text-sm font-bold">Need a direct answer?</p><p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">Ask Feni Brain in Bangla, English or Banglish, or continue into the FeniX service that matches your goal.</p>
    <div className="mt-4 flex flex-wrap gap-2"><Link href="/guide" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white">Ask Brain <ArrowRight size={14}/></Link><Link href={related} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-4 text-xs font-bold">Related guide <ArrowRight size={14}/></Link></div>
   </div>
  </article>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(crumbs)}}/>
 </main>
}
