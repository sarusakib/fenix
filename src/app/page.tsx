'use client'

import { useMemo, useState, type ElementType, type ReactNode } from 'react'
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

type Accent = 'teal' | 'gold'

type ActionCard = {
  title: string
  description: string
  href: string
  icon: ElementType
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
  children: ReactNode
}) {
  return (
    <div
      className={[
        'flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-sm',
        accent === 'teal'
          ? 'border-[#72ddda]/15 bg-[#008080]/[0.055] text-[#72ddda] dark:border-[#72ddda]/20 dark:bg-[#008080]/[0.08] dark:text-[#72ddda]'
          : 'border-[#d4b879]/18 bg-[#d4b879]/[0.06] text-[#d4b879] dark:border-[#d4b879]/22 dark:bg-[#d4b879]/[0.08] dark:text-[#d4b879]',
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
    <main
      className="
        relative
        min-h-dvh
        overflow-x-clip
        text-white
      "
    >
      <div className="relative z-10">
        <Navbar />

        {/* =====================================================
            HERO
            ===================================================== */}
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-5xl text-center">
            {/* Eyebrow */}
            <div
              className="
                mx-auto
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-white/[0.10]
                bg-black/[0.18]
                px-3
                py-1.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-white/65
                shadow-[0_4px_18px_rgba(0,0,0,0.10)]
                backdrop-blur-sm
                sm:text-xs
              "
            >
              <Sparkle
                size={13}
                className="text-[#72ddda]"
                weight="fill"
              />

              FeniX Business Ecosystem
            </div>

            {/* Heading */}
            <h1
              className="
                mx-auto
                mt-6
                max-w-5xl
                text-balance
                text-4xl
                font-black
                tracking-[-0.04em]
                text-white
                sm:text-6xl
                lg:text-7xl
              "
            >
              Build the future of business in{' '}
              <span className="text-[#72ddda]">
                Feni.
              </span>
            </h1>

            {/* Description */}
            <p
              className="
                mx-auto
                mt-6
                max-w-2xl
                text-pretty
                text-sm
                leading-7
                text-white/60
                sm:text-base
                sm:leading-8
              "
            >
              One connected ecosystem for entrepreneurs,
              investors, businesses, suppliers and local growth.
            </p>

            {/* =================================================
                SEARCH
                ================================================= */}
            <div className="mx-auto mt-8 max-w-3xl">
              <div
                className="
                  rounded-2xl
                  border
                  border-white/[0.10]
                  bg-black/[0.22]
                  p-2
                  shadow-[0_10px_32px_rgba(0,0,0,0.14)]
                  backdrop-blur-lg
                  sm:rounded-3xl
                "
              >
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div
                    className="
                      flex
                      min-h-[54px]
                      flex-1
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-white/[0.08]
                      bg-black/[0.16]
                      px-4
                      backdrop-blur-sm
                      sm:min-h-[58px]
                      sm:rounded-2xl
                    "
                  >
                    <MagnifyingGlass
                      size={21}
                      className="shrink-0 text-white/40"
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
                      maxLength={120}
                      className="
                        w-full
                        bg-transparent
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-white/30
                        sm:text-base
                      "
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSearch}
                    className="
                      flex
                      min-h-[54px]
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#008080]
                      px-5
                      text-sm
                      font-bold
                      text-white
                      transition
                      duration-200
                      hover:bg-[#079494]
                      active:scale-[0.99]
                      sm:min-h-[58px]
                      sm:rounded-2xl
                    "
                  >
                    Search
                    <ArrowRight size={18} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handlePrompt(prompt)}
                    className="
                      min-h-10
                      rounded-full
                      border
                      border-white/[0.09]
                      bg-black/[0.14]
                      px-3.5
                      text-xs
                      text-white/60
                      shadow-[0_3px_12px_rgba(0,0,0,0.08)]
                      backdrop-blur-sm
                      transition
                      duration-200
                      hover:border-white/[0.16]
                      hover:bg-black/[0.22]
                      hover:text-white
                    "
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* =================================================
              ACTION CARDS
              ================================================= */}
          <div className="mx-auto mt-16 grid max-w-6xl gap-4 sm:mt-20 sm:grid-cols-2 xl:grid-cols-4">
            {actionCards.map((card) => {
              const Icon = card.icon

              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="
                    group
                    rounded-3xl
                    border
                    border-white/[0.09]
                    bg-black/[0.20]
                    p-5
                    shadow-[0_8px_26px_rgba(0,0,0,0.12)]
                    backdrop-blur-md
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:border-white/[0.15]
                    hover:bg-black/[0.28]
                    hover:shadow-[0_14px_34px_rgba(0,0,0,0.18)]
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <AccentIcon accent={card.accent}>
                      <Icon size={21} weight="duotone" />
                    </AccentIcon>

                    <CaretRight
                      size={18}
                      className="
                        mt-1
                        text-white/25
                        transition
                        group-hover:translate-x-1
                        group-hover:text-white/70
                      "
                    />
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-white">
                    {card.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {card.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* =====================================================
            ECOSYSTEM
            ===================================================== */}
        <section
          className="
            border-y
            border-white/[0.06]
            bg-black/[0.12]
          "
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#72ddda]">
                <Compass size={16} />
                One ecosystem
              </div>

              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-5xl">
                Local business growth, connected in one place.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base sm:leading-8">
                FeniX is designed to bring local commerce,
                business discovery, investment and practical
                guidance into a single experience.
              </p>

              {/* Pill Highlights */}
              <div className="mt-8 flex flex-wrap gap-3">
                {['Discover', 'Connect', 'Grow'].map((item) => (
                  <div
                    key={item}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-white/[0.08]
                      bg-black/[0.14]
                      px-4
                      py-2
                      text-xs
                      text-white/60
                      backdrop-blur-sm
                    "
                  >
                    <CheckCircle
                      size={15}
                      className="text-[#72ddda]"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Ecosystem Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Buildings,
                  number: '01',
                  text: 'Businesses can build presence, discover connections and grow.',
                  accent: 'text-[#72ddda]',
                },
                {
                  icon: Users,
                  number: '02',
                  text: 'People can find useful local services and opportunities faster.',
                  accent: 'text-[#d4b879]',
                },
                {
                  icon: TrendUp,
                  number: '03',
                  text: 'Investors can discover potential ideas and local momentum.',
                  accent: 'text-[#72ddda]',
                },
                {
                  icon: Lightbulb,
                  number: '04',
                  text: 'Practical guidance turns questions into the next action.',
                  accent: 'text-[#d4b879]',
                },
              ].map(({ icon: Icon, number, text, accent }) => (
                <div
                  key={number}
                  className="
                    rounded-3xl
                    border
                    border-white/[0.08]
                    bg-black/[0.18]
                    p-6
                    shadow-[0_7px_24px_rgba(0,0,0,0.10)]
                    backdrop-blur-md
                  "
                >
                  <Icon size={25} className={accent} />

                  <div className="mt-6 text-3xl font-black text-white">
                    {number}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            FOUNDATION
            ===================================================== */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Security-minded foundation',
                description:
                  'Authentication, server-side operations and protected business actions are kept separate wherever they matter.',
                accent: 'teal',
              },
              {
                icon: Rocket,
                title: 'Built to evolve',
                description:
                  'Future premium features can be introduced as optional modules without rebuilding the core experience.',
                accent: 'gold',
              },
              {
                icon: Sparkle,
                title: 'Smart discovery',
                description:
                  'Feni Brain can turn natural-language questions into useful business discovery experiences.',
                accent: 'teal',
              },
            ].map(
              ({
                icon: Icon,
                title,
                description,
                accent,
              }) => (
                <div
                  key={title}
                  className="
                    rounded-3xl
                    border
                    border-white/[0.08]
                    bg-black/[0.18]
                    p-6
                    shadow-[0_7px_24px_rgba(0,0,0,0.10)]
                    backdrop-blur-md
                  "
                >
                  <Icon
                    size={25}
                    className={
                      accent === 'teal'
                        ? 'text-[#72ddda]'
                        : 'text-[#d4b879]'
                    }
                  />

                  <h3 className="mt-5 text-lg font-bold text-white">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/50">
                    {description}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>

        {/* =====================================================
            FOOTER
            ===================================================== */}
        <footer
          className="
            border-t
            border-white/[0.06]
            bg-black/[0.16]
          "
        >
          <div
            className="
              mx-auto
              flex
              max-w-7xl
              flex-col
              gap-4
              px-4
              py-8
              text-xs
              text-white/40
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-6
              lg:px-8
            "
          >
            <div>
              <span className="font-bold text-white/80">
                FeniX
              </span>{' '}
              — Feni Business Ecosystem
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/guide"
                className="transition hover:text-white/80"
              >
                Guide
              </Link>

              <Link
                href="/directory"
                className="transition hover:text-white/80"
              >
                Directory
              </Link>

              <Link
                href="/login"
                className="transition hover:text-white/80"
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
