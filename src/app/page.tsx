'use client'

import { useMemo, useState } from 'react'
import type { ElementType } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Buildings, CheckCircle, Compass, Lightbulb,
  MagnifyingGlass, Rocket, ShieldCheck, ShoppingBag, Sparkle,
  Storefront, TrendUp, Users,
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'

type Accent = 'teal' | 'gold' | 'neutral'
type ActionCard = {
  title: string
  description: string
  icon: ElementType
  accent: Accent
  href: string
  badge: string
}

const actionCards: ActionCard[] = [
  { title:'Start a Business', description:'Turn an idea into a practical local business journey.', icon:Rocket, accent:'teal', href:'/start', badge:'Build' },
  { title:'Explore Investment', description:'Discover local opportunities and the information behind them.', icon:TrendUp, accent:'gold', href:'/invest', badge:'Invest' },
  { title:'Find Local Businesses', description:'Discover businesses, services and useful local resources.', icon:Storefront, accent:'neutral', href:'/directory', badge:'Discover' },
  { title:'Shop Local', description:'Explore local products and sellers through FeniX Commerce.', icon:ShoppingBag, accent:'teal', href:'/commerce', badge:'Commerce' },
  { title:'Feni Guide', description:'Get practical guidance for navigating business and local life.', icon:Lightbulb, accent:'gold', href:'/guide', badge:'Guide' },
]

const prompts = [
  ['Find a business','Find businesses and services in Feni'],
  ['Shop local','Find products and local sellers in Feni'],
  ['Start a business','How can I start a business in Feni?'],
  ['Ask Feni Brain','What are the upazilas of Feni?'],
]

function IconBox({ icon: Icon, accent }: { icon: ElementType; accent: Accent }) {
  const cls = accent === 'gold'
    ? 'border-amber-500/15 bg-amber-500/[0.08] text-amber-700 dark:border-amber-300/15 dark:bg-amber-300/[0.08] dark:text-amber-200'
    : accent === 'neutral'
      ? 'border-slate-500/15 bg-slate-500/[0.06] text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80'
      : 'border-teal-600/15 bg-teal-600/[0.08] text-teal-700 dark:border-teal-300/15 dark:bg-teal-300/[0.08] dark:text-teal-200'
  return <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${cls}`}><Icon size={23} weight="duotone" /></div>
}

export default function HomePage() {
  const router = useRouter()
  const [search,setSearch] = useState('')
  const query = useMemo(()=>search.trim().slice(0,120),[search])
  const goSearch=()=>router.push(query ? `/guide?q=${encodeURIComponent(query)}` : '/guide')
  return (
    <main className="fenix-shell min-h-screen overflow-x-clip">
      <div className="fenix-orb left-[8%] top-32 h-56 w-56 bg-teal-500/10 dark:bg-teal-400/10" />
      <div className="fenix-orb right-[6%] top-[28%] h-64 w-64 bg-amber-400/10 dark:bg-amber-300/[0.06]" />
      <Navbar />

      <section className="relative mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-7xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-600/15 bg-teal-600/[0.06] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700 dark:border-teal-300/15 dark:bg-teal-300/[0.06] dark:text-teal-200">
          <Sparkle size={14} weight="fill" /> Feni Business Ecosystem
        </div>

        <h1 className="mt-7 max-w-4xl text-center text-4xl font-semibold tracking-[-0.055em] text-[#0b1736] sm:text-6xl lg:text-7xl dark:text-white">
          Build. Connect. <span className="text-teal-700 dark:text-teal-300">Grow.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-center text-sm leading-7 text-slate-600 sm:text-base dark:text-white/60">
          One place to discover people, businesses, products, guidance and opportunities across Feni.
        </p>

        <div className="mt-9 w-full max-w-3xl">
          <div className="fenix-surface relative rounded-[1.65rem] p-2 shadow-[0_18px_70px_rgba(0,128,128,.08)]">
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600/[0.08] text-teal-700 dark:bg-teal-300/[0.08] dark:text-teal-200">
                <MagnifyingGlass size={22} />
              </div>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter') goSearch()}}
                aria-label="Search FeniX"
                placeholder="What are you looking for in Feni?"
                className="min-w-0 flex-1 bg-transparent px-1 text-sm text-[#0b1736] outline-none placeholder:text-slate-400 sm:text-base dark:text-white dark:placeholder:text-white/35"
              />
              <button onClick={goSearch} className="flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-[#008080] px-4 text-sm font-semibold text-white transition hover:bg-[#007474] active:scale-[.98] sm:px-5">
                <span className="hidden sm:inline">Search</span><ArrowRight size={18}/>
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {prompts.map(([label,value])=><button key={label} onClick={()=>{setSearch(value);router.push(`/guide?q=${encodeURIComponent(value)}`)}} className="rounded-full border border-black/[0.08] bg-white/55 px-3.5 py-2 text-xs text-slate-600 transition hover:border-teal-600/20 hover:bg-teal-600/[0.06] hover:text-teal-800 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/55 dark:hover:bg-white/[0.06] dark:hover:text-white">{label}</button>)}
          </div>
        </div>

        <div className="mt-10 grid w-full max-w-3xl grid-cols-3 gap-3 text-center">
          {[['01','Discover'],['02','Connect'],['03','Grow']].map(([n,t])=><div key={n} className="text-xs text-slate-500 dark:text-white/40"><span className="font-semibold text-teal-700 dark:text-teal-300">{n}</span><span className="mx-2 opacity-30">—</span>{t}</div>)}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">Explore</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1736] sm:text-4xl dark:text-white">Everything in one ecosystem.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/55">Simple paths for the things people actually come to FeniX to do.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {actionCards.map(card=>{
            const Icon=card.icon
            return <button key={card.title} onClick={()=>router.push(card.href)} className="fenix-surface fenix-interactive group min-h-[235px] rounded-3xl p-6 text-left">
              <div className="flex items-start justify-between gap-3">
                <IconBox icon={Icon} accent={card.accent}/>
                <span className="rounded-full border border-black/[0.07] bg-black/[0.025] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/40">{card.badge}</span>
              </div>
              <div className="mt-12">
                <h3 className="text-lg font-semibold text-[#0b1736] dark:text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/55">{card.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300">Explore <ArrowRight size={16} className="transition-transform group-hover:translate-x-1"/></span>
              </div>
            </button>
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="fenix-surface rounded-[2rem] p-7 sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <div className="flex items-center gap-3"><IconBox icon={Buildings} accent="teal"/><span className="text-xs font-bold uppercase tracking-[.17em] text-slate-500 dark:text-white/45">The FeniX idea</span></div>
              <h2 className="mt-7 max-w-2xl text-3xl font-semibold tracking-tight text-[#0b1736] sm:text-4xl dark:text-white">One account. One connected local experience.</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-white/55">FeniX is designed to bring discovery, business, commerce, guidance and local opportunities into a single, calm interface.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {['Local discovery','Business presence','Commerce','Guidance & knowledge','Future opportunities'].map(item=><div key={item} className="flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-black/[0.02] px-4 py-3 dark:border-white/[0.07] dark:bg-white/[0.025]"><CheckCircle size={18} weight="fill" className="shrink-0 text-teal-600 dark:text-teal-300"/><span className="text-sm text-slate-700 dark:text-white/65">{item}</span></div>)}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {[
                [Users,'People','A simple identity layer for members.'],
                [Storefront,'Businesses','Discover local businesses and services.'],
                [ShoppingBag,'Commerce','Connect local products with customers.'],
                [Compass,'Opportunities','Create room for future ecosystem tools.'],
              ].map(([I,title,text])=>{const Icon=I as ElementType;return <div key={String(title)} className="rounded-2xl border border-black/[0.07] bg-black/[0.02] p-5 dark:border-white/[0.07] dark:bg-white/[0.025]"><Icon size={22} className="text-teal-700 dark:text-teal-300" weight="duotone"/><h3 className="mt-4 text-base font-semibold text-[#0b1736] dark:text-white">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/50">{String(text)}</p></div>})}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [ShieldCheck,'Trust by design','Clear information, responsible verification and safer defaults.'],
            [Sparkle,'Designed to evolve','A visual foundation ready for future FeniX services.'],
            [Compass,'Made for Feni','Local-first navigation without unnecessary complexity.'],
          ].map(([I,title,text])=>{const Icon=I as ElementType;return <div key={String(title)} className="fenix-surface rounded-3xl p-7"><Icon size={24} className="text-teal-700 dark:text-teal-300" weight="duotone"/><h3 className="mt-5 text-lg font-semibold text-[#0b1736] dark:text-white">{String(title)}</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/50">{String(text)}</p></div>})}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 text-center sm:px-6 lg:px-8">
        <div className="border-t border-black/[0.07] pt-8 text-xs text-slate-500 dark:border-white/[0.07] dark:text-white/35">FeniX · Build. Connect. Grow.</div>
      </footer>
    </main>
  )
}
