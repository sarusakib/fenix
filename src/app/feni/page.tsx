import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, BookOpen, MapPin, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { FENI_ARTICLES } from '@/data/feniArticles'

export const metadata: Metadata = {
  title:'Feni District Guide | FeniX',
  description:'Public FeniX guides about Feni district, local business, markets, upazilas, agriculture, investment and community.',
  alternates:{canonical:'/feni'},
}

export default function FeniKnowledgeHub(){
  const itemList=FENI_ARTICLES.map((article,index)=>({
    '@type':'ListItem',position:index+1,url:`https://fenix-saru.vercel.app/feni/${article.slug}`,name:article.titleEn,
  }))
  return <main className="min-h-dvh">
    <Navbar/>
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <header className="rounded-[2.25rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-7 sm:p-10">
        <div className="flex items-center gap-3 text-[var(--fx-primary-strong)]"><MapPin size={20}/><span className="text-xs font-black uppercase tracking-[.18em]">Feni Knowledge</span></div>
        <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-.045em] sm:text-6xl">ফেনী জেলা সম্পর্কে public knowledge hub</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">FeniX-এর public guides—ফেনী জেলা, উপজেলা, বাজার, ব্যবসা, কৃষি, বিনিয়োগ, local places এবং services নিয়ে।</p>
        <div className="mt-6 flex flex-wrap gap-2"><Link href="/guide" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white"><MagnifyingGlass size={17}/> Ask Feni Brain</Link><Link href="/directory" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-4 text-sm font-bold"><MapPin size={17}/> Explore Directory</Link></div>
      </header>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {FENI_ARTICLES.map(article=><article key={article.slug} className="rounded-[1.8rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6">
          <div className="flex items-center gap-2 text-xs text-[var(--fx-muted)]"><BookOpen size={16} className="text-[var(--fx-primary-strong)]"/> FeniX guide</div>
          <h2 className="mt-4 text-xl font-black leading-7">{article.titleBn}</h2>
          <p className="mt-1 text-sm font-semibold text-[var(--fx-muted)]">{article.titleEn}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--fx-muted)]">{article.descriptionBn}</p>
          <Link href={`/feni/${article.slug}`} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[var(--fx-primary-strong)]">Read guide <ArrowRight size={15}/></Link>
        </article>)}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage','name':'Feni District Guide | FeniX','description':'Public FeniX knowledge hub for Feni district.','url':'https://fenix-saru.vercel.app/feni','mainEntity':{'@type':'ItemList','itemListElement':itemList}})}}/>
    </section>
  </main>
}
