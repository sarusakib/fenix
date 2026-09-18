'use client'

import { useMemo, useState, type ElementType } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
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

type Accent = 'teal' | 'gold' | 'neutral'

type ActionCard = {
  title: string
  description: string
  icon: ElementType
  accent: Accent
  href: string
  eyebrow: string
}

const actions: ActionCard[] = [
  {
    title: 'Start a Business',
    description: 'Move from idea to a practical local business journey.',
    icon: Rocket,
    accent: 'teal',
    href: '/start',
    eyebrow: 'BUILD',
  },
  {
    title: 'Explore Investment',
    description: 'Discover local opportunities with context and clarity.',
    icon: TrendUp,
    accent: 'gold',
    href: '/invest',
    eyebrow: 'INVEST',
  },
  {
    title: 'Find Local Businesses',
    description: 'Explore services, suppliers and useful places in Feni.',
    icon: Storefront,
    accent: 'neutral',
    href: '/directory',
    eyebrow: 'CONNECT',
  },
  {
    title: 'Shop Local',
    description: 'Browse local products and sellers through FeniX Commerce.',
    icon: ShoppingBag,
    accent: 'teal',
    href: '/commerce',
    eyebrow: 'COMMERCE',
  },
  {
    title: 'Ask Feni Brain',
    description: 'Ask natural questions about Feni and get guided answers.',
    icon: Lightbulb,
    accent: 'gold',
    href: '/guide',
    eyebrow: 'GUIDE',
  },
]

const prompts = [
  'Find businesses in Feni',
  'How do I start a business in Feni?',
  'Find products and local sellers',
  'What are the upazilas of Feni?',
]

function AccentIcon({
  icon: Icon,
  accent,
}: {
  icon: ElementType
  accent: Accent
}) {
  const tone =
    accent === 'gold'
      ? 'bg-amber-500/[0.08] text-amber-800 dark:bg-amber-300/[0.08] dark:text-amber-200'
      : accent === 'neutral'
        ? 'bg-slate-500/[0.07] text-slate-700 dark:bg-white/[0.05] dark:text-white/80'
        : 'bg-teal-600/[0.08] text-teal-800 dark:bg-teal-300/[0.08] dark:text-teal-100'

  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl">
      <span className={'grid h-12 w-12 place-items-center rounded-2xl ' + tone}>
        <Icon size={23} weight="duotone" />
      </span>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const query = useMemo(() => search.trim().slice(0, 120), [search])

  const runSearch = () => {
    router.push(
      query ? '/guide?q=' + encodeURIComponent(query) : '/guide',
    )
  }

  const usePrompt = (value: string) => {
    setSearch(value)
    router.push('/guide?q=' + encodeURIComponent(value))
  }

  return (
    <main className="fenix-shell min-h-screen overflow-x-clip">
      <div className="fenix-orb left-[3%] top-32 h-64 w-64 bg-teal-400/[0.09]" />
      <div className="fenix-orb right-[4%] top-[26%] h-72 w-72 bg-amber-300/[0.06]" />

      <Navbar />

      <section className="relative mx-auto flex min-h-[calc(100svh-72px)] w-full max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.18fr_.82fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-600/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-teal-800 dark:bg-teal-300/[0.07] dark:text-teal-100">
              <Sparkle size={13} weight="fill" />
              Feni Business Ecosystem
            </div>

            <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold tracking-[-.065em] text-[#0b1736] sm:text-6xl lg:text-[5.25rem] dark:text-white">
              Build.
              <br />
              Connect.
              <br />
              <span className="text-teal-700 dark:text-teal-300">Grow.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 dark:text-white/58">
              One calm place to discover people, businesses, products,
              guidance and opportunities across Feni.
            </p>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-left">
              {[
                ['01', 'DISCOVER'],
                ['02', 'CONNECT'],
                ['03', 'GROW'],
              ].map(([number, label]) => (
                <div key={number} className="rounded-2xl bg-black/[0.025] px-4 py-3 dark:bg-white/[0.03]">
                  <div className="text-[10px] font-bold tracking-[.16em] text-teal-700 dark:text-teal-300">{number}</div>
                  <div className="mt-1 text-[10px] font-semibold tracking-[.12em] text-slate-500 dark:text-white/40">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="fenix-surface-strong fenix-glow rounded-[2rem] p-3 sm:p-4">
              <div className="rounded-[1.5rem] bg-[#0b1736] p-5 text-white shadow-2xl sm:p-6 dark:bg-[#071019]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[.2em] text-teal-300/80">FeniX Search</div>
                    <div className="mt-2 text-xl font-semibold tracking-tight">What do you want to do?</div>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-300/10 text-teal-200">
                    <MagnifyingGlass size={20} />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-white/[0.07] p-2 ring-1 ring-white/[0.09]">
                  <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-3">
                    <MagnifyingGlass size={18} className="shrink-0 text-white/45" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') runSearch()
                      }}
                      aria-label="Search FeniX"
                      placeholder="Search FeniX…"
                      className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-white/30"
                    />
                    <button
                      type="button"
                      onClick={runSearch}
                      className="grid h-11 w-11 place-items-center rounded-xl bg-teal-400 text-[#062324] transition hover:bg-teal-300"
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
                      onClick={() => usePrompt(prompt)}
                      className="rounded-full bg-white/[0.06] px-3 py-2 text-left text-xs text-white/65 transition hover:bg-white/[0.11] hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl bg-white/80 px-4 py-3 shadow-xl ring-1 ring-black/[0.06] backdrop-blur-xl sm:block dark:bg-white/[0.06] dark:ring-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-700 dark:text-teal-300" weight="duotone" />
                <span className="text-xs font-semibold text-slate-700 dark:text-white/70">
                  Built for trusted local discovery
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="explore" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.2em] text-teal-700 dark:text-teal-300">Explore FeniX</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1736] sm:text-4xl dark:text-white">Your next move starts here.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-500 dark:text-white/45">
            Five clear entry points today, with room for the ecosystem to grow without changing how FeniX feels.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {actions.map((action) => {
            const Icon = action.icon

            return (
              <button
                key={action.title}
                type="button"
                onClick={() => router.push(action.href)}
                className="fenix-surface fenix-interactive group min-h-[248px] rounded-[1.7rem] p-6 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <AccentIcon icon={Icon} accent={action.accent} />
                  <span className="rounded-full bg-black/[0.025] px-2.5 py-1 text-[9px] font-bold tracking-[.16em] text-slate-400 dark:bg-white/[0.04] dark:text-white/35">
                    {action.eyebrow}
                  </span>
                </div>

                <div className="mt-11">
                  <h3 className="text-lg font-semibold tracking-tight text-[#0b1736] dark:text-white">{action.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/48">{action.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300">
                    Open
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="fenix-surface rounded-[2rem] p-7 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-600/[0.08] text-teal-700 dark:bg-teal-300/[0.08] dark:text-teal-200">
                  <Buildings size={22} weight="duotone" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[.18em] text-slate-500 dark:text-white/40">The FeniX idea</span>
              </div>

              <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-[#0b1736] sm:text-4xl dark:text-white">
                One account. One connected local experience.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-white/50">
                FeniX brings discovery, business presence, commerce and guidance into one visual system—so future services can plug into the same ecosystem.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  'Local discovery',
                  'Business presence',
                  'Commerce',
                  'Guidance & knowledge',
                  'Future opportunities',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-black/[0.025] px-4 py-3 dark:bg-white/[0.025]">
                    <CheckCircle size={18} weight="fill" className="shrink-0 text-teal-700 dark:text-teal-300" />
                    <span className="text-sm text-slate-700 dark:text-white/65">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {[
                [Users, 'People', 'A simple identity layer for members.'],
                [Storefront, 'Businesses', 'Find local businesses and services.'],
                [ShoppingBag, 'Commerce', 'Connect local products with customers.'],
                [Compass, 'Opportunities', 'Make room for future ecosystem tools.'],
              ].map(([Icon, title, description]) => {
                const ItemIcon = Icon as ElementType

                return (
                  <div key={String(title)} className="rounded-[1.45rem] bg-black/[0.025] p-5 dark:bg-white/[0.025]">
                    <ItemIcon size={22} className="text-teal-700 dark:text-teal-300" weight="duotone" />
                    <h3 className="mt-4 text-base font-semibold text-[#0b1736] dark:text-white">{String(title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/45">{String(description)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [ShieldCheck, 'Trust by design', 'Clear information, responsible verification and safer defaults.'],
            [Sparkle, 'Designed to evolve', 'A visual foundation ready for future FeniX services.'],
            [Compass, 'Made for Feni', 'Local-first navigation without unnecessary complexity.'],
          ].map(([Icon, title, description]) => {
            const ItemIcon = Icon as ElementType

            return (
              <div key={String(title)} className="fenix-surface rounded-[1.7rem] p-7">
                <ItemIcon size={24} className="text-teal-700 dark:text-teal-300" weight="duotone" />
                <h3 className="mt-5 text-lg font-semibold text-[#0b1736] dark:text-white">{String(title)}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/45">{String(description)}</p>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 text-center sm:px-6 lg:px-8">
        <div className="border-t border-black/[0.07] pt-8 text-xs text-slate-500 dark:border-white/[0.07] dark:text-white/35">
          FeniX · Build. Connect. Grow.
        </div>
      </footer>
    </main>
  )
}
