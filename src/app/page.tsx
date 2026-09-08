'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Buildings,
  CaretRight,
  CheckCircle,
  Compass,
  Lightbulb,
  MagnifyingGlass,
  Rocket,
  ShieldCheck,
  Sparkle,
  Storefront,
  TrendUp,
  Users,
} from '@phosphor-icons/react'

import Navbar from '../components/Navbar'
import SiteBackground from '../components/layout/SiteBackground'

type Accent = 'teal' | 'gold'

type ActionCard = {
  title: string
  description: string
  href: string
  icon: React.ElementType
  accent: Accent
}

const actionCards: ActionCard[] = [
  {
    title: 'Start a Business',
    description:
      'Build your business journey with guidance, discovery and a connected local ecosystem.',
    href: '/start',
    icon: Rocket,
    accent: 'teal',
  },
  {
    title: 'Invest in Feni',
    description:
      'Discover emerging opportunities and connect ideas with local growth.',
    href: '/invest',
    icon: TrendUp,
    accent: 'gold',
  },
  {
    title: 'Find Suppliers',
    description:
      'Explore businesses, suppliers and useful commercial connections across Feni.',
    href: '/directory',
    icon: Storefront,
    accent: 'teal',
  },
  {
    title: 'Business Guide',
    description:
      'Get practical answers and discover the right next step for your business.',
    href: '/guide',
    icon: Lightbulb,
    accent: 'gold',
  },
]

const quickPrompts = [
  'How do I start a business in Feni?',
  'Find suppliers in Feni',
  'Investment opportunities in Feni',
  'Business registration guide',
]

function AccentIcon({
  accent,
  children,
}: {
  accent: Accent
  children: React.ReactNode
}) {
  return (
    <div
      className={[
        'flex h-11 w-11 items-center justify-center rounded-2xl border',
        accent === 'teal'
          ? 'border-[#008080]/25 bg-[#008080]/10 text-[#72ddda]'
          : 'border-[#d4b879]/20 bg-[#d4b879]/[0.06] text-[#d4b879]',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedQuery = useMemo(
    () => searchQuery.trim().slice(0, 120),
    [searchQuery],
  )

  const handleSearch = () => {
    if (!normalizedQuery) {
      router.push('/guide')
      return
    }

    router.push(`/guide?q=${encodeURIComponent(normalizedQuery)}`)
  }

  const handlePrompt = (prompt: string) => {
    router.push(`/guide?q=${encodeURIComponent(prompt)}`)
  }

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#030506] text-white">
      <SiteBackground />

      <div className="relative z-10">
        <Navbar />

        <section className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55 backdrop-blur-md sm:text-xs">
              <Sparkle size={13} className="text-[#72ddda]" weight="fill" />
              FeniX Business Ecosystem
            </div>

            <h1 className="mx-auto mt-6 max-w-5xl text-balance text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Build the future of business in{' '}
              <span className="text-[#72ddda]">Feni.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-sm leading-7 text-white/55 sm:text-base sm:leading-8">
              One connected ecosystem for entrepreneurs, investors, businesses,
              suppliers and local growth.
            </p>

            <div className="mx-auto mt-8 max-w-3xl">
              <div className="rounded-2xl border border-white/10 bg-black/35 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-3xl">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex min-h-[54px] flex-1 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] px-4 sm:min-h-[58px] sm:rounded-2xl">
                    <MagnifyingGlass
                      size={21}
                      className="shrink-0 text-white/35"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.target.value.slice(0, 120))
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleSearch()
                        }
                      }}
                      placeholder="Ask FeniX anything about business in Feni..."
                      aria-label="Search FeniX"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25 sm:text-base"
                      maxLength={120}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSearch}
                    className="flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-[#008080] px-5 text-sm font-bold text-white transition hover:bg-[#079494] active:scale-[0.99] sm:min-h-[58px] sm:rounded-2xl"
                  >
                    Search
                    <ArrowRight size={18} weight="bold" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handlePrompt(prompt)}
                    className="min-h-10 rounded-full border border-white/[0.07] bg-white/[0.025] px-3.5 text-xs text-white/45 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white/75"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:mt-20 sm:grid-cols-2 xl:grid-cols-4">
            {actionCards.map((card) => {
              const Icon = card.icon

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group rounded-3xl border border-white/[0.08] bg-black/30 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:bg-black/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <AccentIcon accent={card.accent}>
                      <Icon size={21} weight="duotone" />
                    </AccentIcon>

                    <CaretRight
                      size={18}
                      className="mt-1 text-white/20 transition group-hover:translate-x-1 group-hover:text-white/60"
                    />
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-white">
                    {card.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {card.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-black/20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#72ddda]">
                <Compass size={16} />
                One ecosystem
              </div>

              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
                Local business growth, connected in one place.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base sm:leading-8">
                FeniX is designed to bring local commerce, business discovery,
                investment and practical guidance into a single experience.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/55">
                  <CheckCircle size={15} className="text-[#72ddda]" />
                  Discover
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/55">
                  <CheckCircle size={15} className="text-[#72ddda]" />
                  Connect
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/55">
                  <CheckCircle size={15} className="text-[#72ddda]" />
                  Grow
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
                <Buildings size={25} className="text-[#72ddda]" />
                <div className="mt-6 text-3xl font-black">01</div>
                <p className="mt-2 text-sm leading-6 text-white/45">
                  Businesses can build presence, discover connections and grow.
                </p>
              </div>

              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
                <Users size={25} className="text-[#d4b879]" />
                <div className="mt-6 text-3xl font-black">02</div>
                <p className="mt-2 text-sm leading-6 text-white/45">
                  People can find useful local services and opportunities faster.
                </p>
              </div>

              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
                <TrendUp size={25} className="text-[#72ddda]" />
                <div className="mt-6 text-3xl font-black">03</div>
                <p className="mt-2 text-sm leading-6 text-white/45">
                  Investors can discover potential ideas and local momentum.
                </p>
              </div>

              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
                <Lightbulb size={25} className="text-[#d4b879]" />
                <div className="mt-6 text-3xl font-black">04</div>
                <p className="mt-2 text-sm leading-6 text-white/45">
                  Practical guidance turns questions into the next action.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/[0.08] bg-black/25 p-6 backdrop-blur-xl">
              <ShieldCheck size={25} className="text-[#72ddda]" />
              <h3 className="mt-5 text-lg font-bold">
                Security-minded foundation
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Authentication, server-side operations and protected business
                actions are kept separate wherever they matter.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-black/25 p-6 backdrop-blur-xl">
              <Rocket size={25} className="text-[#d4b879]" />
              <h3 className="mt-5 text-lg font-bold">
                Built to evolve
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Future premium features can be introduced as optional modules
                without rebuilding the core experience.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-black/25 p-6 backdrop-blur-xl">
              <Sparkle size={25} className="text-[#72ddda]" />
              <h3 className="mt-5 text-lg font-bold">
                Smart discovery
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Feni Brain can turn natural-language questions into useful
                business discovery experiences.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.06] bg-black/30">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <span className="font-bold text-white/75">FeniX</span>{' '}
              — Feni Business Ecosystem
            </div>

            <div className="flex items-center gap-4">
              <Link href="/guide" className="transition hover:text-white/70">
                Guide
              </Link>
              <Link
                href="/directory"
                className="transition hover:text-white/70"
              >
                Directory
              </Link>
              <Link
                href="/login"
                className="transition hover:text-white/70"
              >
                Login
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
                      }
