'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Brain,
  Buildings,
  CheckCircle,
  Compass,
  Lightbulb,
  MagnifyingGlass,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkle,
  Storefront,
  TrendUp,
  Users,
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import ServiceHub from '../components/ServiceHub'

const prompts = [
  'Find businesses in Feni',
  'How do I start a business in Feni?',
  'Find products and local sellers',
  'What are the upazilas of Feni?',
]

const quickMoves = [
  {
    title: 'Start',
    body: 'Turn an idea into a practical local business journey.',
    href: '/start',
    icon: Rocket,
    eyebrow: 'BUILD',
  },
  {
    title: 'Invest',
    body: 'Explore opportunities with context and due-diligence workflow.',
    href: '/invest',
    icon: TrendUp,
    eyebrow: 'INVEST',
  },
  {
    title: 'Connect',
    body: 'Find local businesses, suppliers and useful services.',
    href: '/directory',
    icon: Storefront,
    eyebrow: 'CONNECT',
  },
  {
    title: 'Shop',
    body: 'Discover published products from approved local sellers.',
    href: '/commerce',
    icon: ShoppingBag,
    eyebrow: 'COMMERCE',
  },
]

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const query = useMemo(() => search.trim().slice(0, 120), [search])

  const runSearch = () => {
    router.push(query ? '/guide?q=' + encodeURIComponent(query) : '/guide')
  }

  const runPrompt = (value: string) => {
    setSearch(value)
    router.push('/guide?q=' + encodeURIComponent(value))
  }

  return (
    <main className="fenix-shell min-h-screen overflow-x-clip">
      <div className="fenix-orb left-[3%] top-32 h-72 w-72 bg-teal-400/[.08]" />
      <div className="fenix-orb right-[4%] top-[28%] h-80 w-80 bg-amber-300/[.06]" />

      <Navbar />

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.04fr_.96fr]">
          <div className="animate-[fenix-fade-up_.6s_ease-out]">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-600/[.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.19em] text-teal-800 dark:bg-teal-300/[.07] dark:text-teal-100">
              <Sparkle size={13} weight="fill" />
              Feni Business Ecosystem
            </div>

            <h1 className="mt-6 max-w-3xl text-balance text-[3.35rem] font-semibold leading-[.95] tracking-[-.07em] text-[#0b1736] sm:text-6xl lg:text-[5.35rem] dark:text-white">
              Build.
              <br />
              Connect.
              <br />
              <span className="text-teal-700 dark:text-teal-300">Grow.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 dark:text-white/55">
              One calm place for Feni business discovery, local commerce, investment,
              practical guidance and the people behind them.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {[
                ['01', 'DISCOVER'],
                ['02', 'CONNECT'],
                ['03', 'ACT'],
              ].map(([n, label]) => (
                <span key={n} className="rounded-full bg-black/[.025] px-3 py-2 text-[10px] font-bold tracking-[.15em] text-slate-500 dark:bg-white/[.035] dark:text-white/40">
                  {n} · {label}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-[fenix-fade-up_.75s_ease-out]">
            <div className="fenix-surface-strong fenix-glow rounded-[2.1rem] p-3 sm:p-4">
              <div className="rounded-[1.7rem] bg-[#0b1736] p-5 text-white shadow-2xl sm:p-7 dark:bg-[#071019]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.2em] text-teal-300/80">FeniX Brain Search</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">What do you want to do?</h2>
                    <p className="mt-2 text-xs leading-5 text-white/40">Bangla · English · Banglish · local names</p>
                  </div>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-300/10 text-teal-200">
                    <Brain size={22} weight="duotone" />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white/[.07] p-2 ring-1 ring-white/[.09]">
                  <div className="flex items-center gap-2 rounded-xl bg-white/[.045] px-3">
                    <MagnifyingGlass size={18} className="shrink-0 text-white/40" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value.slice(0, 120))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') runSearch()
                      }}
                      aria-label="Search FeniX"
                      placeholder="Search or ask anything about Feni…"
                      className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-white/28"
                    />
                    <button
                      type="button"
                      onClick={runSearch}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-400 text-[#062324] transition hover:bg-teal-300 active:scale-[.98]"
                      aria-label="Search"
                    >
                      <ArrowRight size={18} weight="bold" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => runPrompt(prompt)}
                      className="rounded-full bg-white/[.055] px-3 py-2 text-left text-[11px] text-white/65 transition hover:bg-white/[.11] hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 px-2 text-xs text-slate-500 dark:text-white/35">
              <ShieldCheck size={16} className="text-teal-700 dark:text-teal-300" />
              Source-aware guidance · clear uncertainty · safer defaults
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700 dark:text-teal-300">Quick moves</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0b1736] sm:text-3xl dark:text-white">Start without a giant menu.</h2>
          </div>
          <button type="button" onClick={() => router.push('/services')} className="hidden min-h-10 items-center gap-2 rounded-xl bg-black/[.035] px-3.5 text-xs font-bold sm:inline-flex dark:bg-white/[.04]">
            All services <ArrowRight size={15} />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickMoves.map(({ title, body, href, icon: Icon, eyebrow }) => (
            <button
              key={title}
              type="button"
              onClick={() => router.push(href)}
              className="fenix-surface fenix-interactive group rounded-[1.55rem] p-5 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600/[.08] text-teal-700 dark:bg-teal-300/[.08] dark:text-teal-200">
                  <Icon size={20} weight="duotone" />
                </span>
                <span className="text-[9px] font-bold tracking-[.16em] text-slate-400 dark:text-white/30">{eyebrow}</span>
              </div>
              <h3 className="mt-6 text-lg font-black text-[#0b1736] dark:text-white">{title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-white/45">{body}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-200">Open <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="fenix-surface rounded-[2rem] p-6 sm:p-8">
          <ServiceHub compact />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Users, 'One account', 'A connected identity across your FeniX activity.'],
            [Buildings, 'One local graph', 'Businesses, people, places and opportunities can connect over time.'],
            [Compass, 'One smart layer', 'Feni Brain turns questions into clearer next steps without hiding uncertainty.'],
          ].map(([Icon, title, body]) => {
            const ItemIcon = Icon as typeof Users
            return (
              <div key={String(title)} className="rounded-[1.7rem] bg-black/[.025] p-6 dark:bg-white/[.025]">
                <ItemIcon size={23} weight="duotone" className="text-teal-700 dark:text-teal-200" />
                <h3 className="mt-4 text-lg font-black text-[#0b1736] dark:text-white">{String(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/45">{String(body)}</p>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 text-center sm:px-6 lg:px-8">
        <div className="border-t border-black/[.07] pt-8 text-xs text-slate-500 dark:border-white/[.07] dark:text-white/35">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <span>FeniX · Build. Connect. Grow.</span>
            <a href="/policy" className="hover:text-teal-700 dark:hover:text-teal-200">Policy</a>
            <a href="/help" className="hover:text-teal-700 dark:hover:text-teal-200">Help</a>
            <a href="/services" className="hover:text-teal-700 dark:hover:text-teal-200">Services</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
