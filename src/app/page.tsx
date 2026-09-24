'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Brain, CheckCircle, Compass, MagnifyingGlass, Rocket, ShieldCheck,
  ShoppingBag, Storefront, TrendUp, UsersThree,
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import ServiceHub from '../components/ServiceHub'
import FenixBrand from '../components/FenixBrand'

const prompts = [
  'ফেনীতে supplier খুঁজতে চাই',
  'How do I start a business in Feni?',
  'ফেনীতে একটি দোকান/ব্যবসা খুঁজুন',
  'Feni তে investment opportunity আছে?',
]

const paths = [
  { title: 'Start a Business', bn: 'ব্যবসা শুরু', body: 'Idea, validation, planning, location and launch—একটি journey-তে.', href: '/start', icon: Rocket },
  { title: 'Find & Connect', bn: 'খুঁজুন ও কানেক্ট করুন', body: 'Business, supplier, local service and useful contacts—এক জায়গায়.', href: '/directory', icon: Storefront },
  { title: 'Invest in Feni', bn: 'ফেনীতে বিনিয়োগ', body: 'Published opportunities, verification context and due-diligence workflow.', href: '/invest', icon: TrendUp },
  { title: 'Shop Local', bn: 'লোকাল শপ', body: 'Approved sellers-এর published products browse করুন.', href: '/commerce', icon: ShoppingBag },
]

const steps = [
  { no: '01', title: 'Discover', bn: 'কী আছে দেখুন', body: 'Business, place, product, opportunity বা local knowledge খুঁজুন.' },
  { no: '02', title: 'Understand', bn: 'আগে বুঝুন', body: 'Feni Brain, guides, records আর context দিয়ে next step বুঝুন.' },
  { no: '03', title: 'Verify', bn: 'তারপর যাচাই করুন', body: 'Verification, evidence, status ও source দেখে সিদ্ধান্তের ভিত্তি তৈরি করুন.' },
  { no: '04', title: 'Act', bn: 'কাজ শুরু করুন', body: 'একটি পরিষ্কার action দিয়ে workflow-এ ঢুকুন—অপ্রয়োজনীয় form নয়.' },
]

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const goBrain = () => {
    const query = search.trim().slice(0, 120)
    router.push(query ? '/guide?q=' + encodeURIComponent(query) : '/guide')
  }
  const choosePrompt = (value: string) => {
    setSearch(value)
    router.push('/guide?q=' + encodeURIComponent(value))
  }

  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-16">
        <div className="grid items-stretch gap-5 xl:grid-cols-[1.06fr_.94fr]">
          <div className="fenix-surface-strong overflow-hidden rounded-[2rem] p-6 sm:p-9 lg:p-11">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src="/fenix-logo.svg" alt="" className="h-12 w-12 rounded-2xl" />
                <div>
                  <p className="fenix-kicker">Feni Business Ecosystem</p>
                  <p className="mt-1 text-[11px] font-semibold text-[var(--fx-muted)]">Build. Connect. Grow.</p>
                </div>
              </div>
              <span className="rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.14em] text-[var(--fx-muted)]">Feni first · expandable</span>
            </div>

            <h1 className="fenix-page-title mt-8 max-w-3xl text-[3.1rem] font-black sm:text-6xl lg:text-[5.15rem]">
              One account.<br/>One connected<br/><span className="text-[var(--fx-primary-strong)]">local experience.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--fx-muted)] sm:text-lg">
              FeniX connects local discovery, business building, commerce, investment and trusted community tools without making you learn five different systems.
            </p>

            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              <Link href="/start" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-bold text-white">Start with a business idea <ArrowRight size={17}/></Link>
              <Link href="/directory" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-5 text-sm font-bold">Find something local <MagnifyingGlass size={17}/></Link>
            </div>

            <div className="mt-8 grid grid-cols-4 gap-2">
              {steps.map(step => (
                <div key={step.no} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3.5">
                  <span className="text-[10px] font-black text-[var(--fx-primary-strong)]">{step.no}</span>
                  <p className="mt-2 text-xs font-black">{step.title}</p>
                  <p className="mt-1 text-[9px] leading-4 text-[var(--fx-muted)]">{step.bn}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="fenix-surface-strong flex flex-col rounded-[2rem] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="fenix-kicker">Feni Brain</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-.045em] sm:text-3xl">What are you trying to do?</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--fx-muted)]">Bangla, English বা Banglish-এ লিখুন. FeniX query-কে action-এ নামিয়ে আনে.</p>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Brain size={23} weight="duotone"/></div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-2">
              <MagnifyingGlass size={20} className="ml-2 shrink-0 text-[var(--fx-muted)]"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')goBrain()}} className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-[var(--fx-muted)]" placeholder="যেমন: Feni-তে good supplier কোথায়?" maxLength={120} aria-label="Ask Feni Brain"/>
              <button type="button" onClick={goBrain} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-strong)] text-white" aria-label="Ask Feni Brain"><ArrowRight size={18}/></button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {prompts.map(prompt => <button key={prompt} type="button" onClick={()=>choosePrompt(prompt)} className="rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2 text-[10px] font-semibold text-[var(--fx-muted)] transition hover:border-[var(--fx-primary)]/30 hover:text-[var(--fx-text)]">{prompt}</button>)}
            </div>

            <div className="mt-auto pt-7">
              <div className="grid gap-2 sm:grid-cols-3">
                <MiniPoint icon={<CheckCircle size={17}/>} title="Source-aware" body="Important answers explain what was checked."/>
                <MiniPoint icon={<ShieldCheck size={17}/>} title="Trust layer" body="Verification and evidence stay close to the action."/>
                <MiniPoint icon={<Compass size={17}/>} title="Next step" body="The interface keeps the useful action visible."/>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="fenix-kicker">Start here</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-.045em] sm:text-4xl">Four core jobs. One network.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fx-muted)]">সবচেয়ে বেশি ব্যবহৃত কাজগুলো সামনে. বাকি tools প্রয়োজন হলে Network থেকে খুলবেন.</p>
            </div>
            <FenixBrand compact/>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {paths.map(({title,bn,body,href,icon:Icon}) => (
              <Link key={href} href={href} className="fenix-card fenix-interactive group p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Icon size={21} weight="duotone"/></div>
                  <ArrowRight size={16} className="text-[var(--fx-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--fx-primary-strong)]"/>
                </div>
                <h3 className="mt-6 text-lg font-black">{title}</h3>
                <p className="mt-1 text-xs font-bold text-[var(--fx-primary-strong)]">{bn}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--fx-muted)]">{body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="fenix-surface-strong rounded-[2rem] p-6 sm:p-8">
            <p className="fenix-kicker">Why FeniX is different</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-3xl">The product is the connection.</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--fx-muted)]">A directory alone is not enough. A chatbot alone is not enough. FeniX is designed so discovery can move into guidance, verification, workflow and action.</p>
            <div className="mt-6 grid gap-2">
              {[
                ['Local knowledge','Feni places, markets, upazilas, business context and local naming.'],
                ['Identity layer','One account can connect profile, business, seller and investment workflows.'],
                ['Trust layer','Verification labels, reports and evidence are part of the system—not an afterthought.'],
                ['Action layer','The user is routed to the next real workflow instead of being left with a paragraph.'],
              ].map(([title,body]) => <div key={title} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><p className="text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{body}</p></div>)}
            </div>
          </div>

          <div className="fenix-surface-strong rounded-[2rem] p-6 sm:p-8">
            <p className="fenix-kicker">Feni-first by design</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-3xl">Built around how local people actually search.</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ContextCard title="Bangla + English" body="Search and guidance can move between local Bangla, English and Banglish."/>
              <ContextCard title="Local names" body="Spelling variants and familiar area names should lead to the same useful places."/>
              <ContextCard title="One connected profile" body="Your identity can travel with you across business, feed, messages and other eligible workflows."/>
              <ContextCard title="Simple first, deep later" body="The interface starts small; advanced evidence, settings and tools appear only when useful."/>
            </div>
            <Link href="/guide" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-4 text-xs font-bold text-[var(--fx-primary-strong)]">See how Feni Brain works <ArrowRight size={15}/></Link>
          </div>
        </section>

        <section className="mt-12">
          <div className="fenix-surface-strong rounded-[2rem] p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="fenix-kicker">Network</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-3xl">More tools when you need them.</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">Core paths stay visible. Secondary services remain one tap away inside the network.</p>
              </div>
              <Link href="/services" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold">See every service <ArrowRight size={14}/></Link>
            </div>
            <div className="mt-6"><ServiceHub compact showHeader={false}/></div>
          </div>
        </section>

        <section className="mt-12 grid gap-3 pb-8 sm:grid-cols-3">
          <BottomCard icon={<UsersThree size={19}/>} title="People" body="Profile, feed and protected conversations form the human layer."/>
          <BottomCard icon={<Storefront size={19}/>} title="Local economy" body="Directory, suppliers, commerce and business journeys connect local activity."/>
          <BottomCard icon={<ShieldCheck size={19}/>} title="Trust" body="Evidence, verification, reporting and policy stay close to the important actions."/>
        </section>
      </section>
    </main>
  )
}

function MiniPoint({icon,title,body}:{icon:React.ReactNode;title:string;body:string}) {
  return <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3.5"><div className="text-[var(--fx-primary-strong)]">{icon}</div><p className="mt-2 text-xs font-black">{title}</p><p className="mt-1 text-[10px] leading-5 text-[var(--fx-muted)]">{body}</p></div>
}
function ContextCard({title,body}:{title:string;body:string}) {
  return <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><p className="text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{body}</p></div>
}
function BottomCard({icon,title,body}:{icon:React.ReactNode;title:string;body:string}) {
  return <div className="fenix-card p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">{icon}</div><h3 className="mt-4 text-sm font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{body}</p></div>
}
