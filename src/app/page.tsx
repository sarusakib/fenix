'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Rocket,
  TrendUp,
  Storefront,
  Lightbulb,
  MagnifyingGlass,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  Buildings,
  Users,
  Compass,
  CaretRight,
  CheckCircle,
} from '@phosphor-icons/react'

type Accent = 'teal' | 'gold' | 'cyan' | 'purple'

type ActionCard = {
  title: string
  description: string
  icon: typeof Rocket
  href: string
  accent: Accent
}

const actionCards: ActionCard[] = [
  {
    title: 'Start a Business',
    description:
      'Launch your business with practical guidance, local opportunities and useful resources.',
    icon: Rocket,
    href: '/start',
    accent: 'teal',
  },
  {
    title: 'Invest in Feni',
    description:
      'Discover investment opportunities and explore the growing business potential of Feni.',
    icon: TrendUp,
    href: '/invest',
    accent: 'gold',
  },
  {
    title: 'Find Suppliers',
    description:
      'Connect with local suppliers, businesses and useful services across the ecosystem.',
    icon: Storefront,
    href: '/directory',
    accent: 'cyan',
  },
  {
    title: 'Business Guide',
    description:
      'Learn the essential steps, resources and knowledge needed to move your business forward.',
    icon: Lightbulb,
    href: '/guide',
    accent: 'purple',
  },
]

const quickPrompts = [
  'How do I start a business in Feni?',
  'Find suppliers in Feni',
  'Investment opportunities in Feni',
  'Business registration guide',
]

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    const query = searchQuery.trim()

    if (!query) {
      router.push('/guide')
      return
    }

    router.push(`/guide?q=${encodeURIComponent(query)}`)
  }

  const handlePrompt = (prompt: string) => {
    setSearchQuery(prompt)
    router.push(`/guide?q=${encodeURIComponent(prompt)}`)
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030506] text-white selection:bg-[#008080]/30">

      {/* =========================================================
          LOGIN-STYLE CINEMATIC BACKGROUND
          
          Mobile:
          /public/images/IMG_20260907_032431.png

          Desktop:
          /public/images/fenix-login-desktop.png
      ========================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* Mobile background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
          style={{
            backgroundImage:
              "url('/images/IMG_20260907_032431.png')",
          }}
        />

        {/* Desktop background */}
        <div
          className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
          style={{
            backgroundImage:
              "url('/images/fenix-login-desktop.png')",
          }}
        />

        {/* Login-style darkness */}
        <div className="absolute inset-0 bg-[#030506]/75" />

        {/* Cinematic top depth */}
        <div className="absolute inset-x-0 top-0 h-[32%] bg-gradient-to-b from-black/65 via-black/20 to-transparent" />

        {/* Cinematic bottom depth */}
        <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#030506] via-[#030506]/80 to-transparent" />

        {/* Teal atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(0,128,128,0.14),transparent_43%)]" />

        {/* Subtle gold atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_58%,rgba(212,184,121,0.035),transparent_35%)]" />

        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.40)_100%)]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      {/* =========================================================
          CONTENT LAYER
      ========================================================= */}
      <div className="relative z-10">

        {/* =======================================================
            NAVBAR
        ======================================================= */}
        <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#030506]/80 backdrop-blur-2xl">
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

            {/* Logo */}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="group flex items-center gap-3"
              aria-label="FeniX Home"
            >
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#008080]/30 bg-black/40 shadow-[0_0_30px_rgba(0,128,128,0.12)]">

                <span className="absolute inset-0 bg-[#008080]/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                <span className="relative text-lg font-black tracking-[-0.08em] text-white">
                  FX
                </span>

              </div>

              <div className="hidden sm:block">

                <div className="text-[17px] font-bold tracking-tight">
                  Feni<span className="text-[#56d1ce]">X</span>
                </div>

                <div className="text-[9px] uppercase tracking-[0.25em] text-white/35">
                  Business Ecosystem
                </div>

              </div>
            </button>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-1 md:flex">

              <button
                type="button"
                onClick={() => router.push('/')}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.05]"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => router.push('/start')}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >
                Start
              </button>

              <button
                type="button"
                onClick={() => router.push('/invest')}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >
                Invest
              </button>

              <button
                type="button"
                onClick={() => router.push('/directory')}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >
                Directory
              </button>

              <button
                type="button"
                onClick={() => router.push('/guide')}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >
                Guide
              </button>

            </nav>

            {/* Explore */}
            <button
              type="button"
              onClick={() => router.push('/guide')}
              className="hidden rounded-xl border border-[#008080]/25 bg-[#008080]/[0.07] px-4 py-2.5 text-sm font-semibold text-[#72ddda] transition duration-300 hover:border-[#008080]/45 hover:bg-[#008080]/[0.12] sm:block"
            >
              Explore FeniX
            </button>

          </div>
        </header>

        {/* =======================================================
            HERO
        ======================================================= */}
        <section className="relative">

          <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-28">

            <div className="mx-auto max-w-4xl text-center">

              {/* Badge */}
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#008080]/25 bg-black/40 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#72ddda] shadow-[0_0_35px_rgba(0,128,128,0.07)] backdrop-blur-xl">

                <Sparkle
                  size={14}
                  weight="fill"
                />

                <span>
                  Feni&apos;s Business Ecosystem
                </span>

              </div>

              {/* Heading */}
              <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl lg:text-7xl">

                Build the future of

                <span className="block bg-gradient-to-r from-white via-[#8be4e1] to-[#008080] bg-clip-text text-transparent">
                  business in Feni.
                </span>

              </h1>

              {/* Description */}
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/50 sm:text-base sm:leading-8">
                FeniX connects entrepreneurs, investors, suppliers and
                knowledge in one intelligent ecosystem built for Feni.
              </p>

              {/* =================================================
                  SEARCH
              ================================================= */}
              <div className="mx-auto mt-9 max-w-2xl">

                <div className="group relative">

                  <div className="absolute -inset-1 rounded-2xl bg-[#008080]/10 opacity-0 blur-xl transition duration-500 group-focus-within:opacity-100" />

                  <div className="relative flex min-h-[60px] items-center rounded-2xl border border-white/[0.09] bg-black/50 p-1.5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl transition duration-300 focus-within:border-[#008080]/40">

                    <MagnifyingGlass
                      size={21}
                      className="ml-4 shrink-0 text-white/40"
                    />

                    <input
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleSearch()
                        }
                      }}
                      placeholder="What do you want to discover?"
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/30 sm:text-[15px]"
                      aria-label="Search FeniX"
                    />

                    <button
                      type="button"
                      onClick={handleSearch}
                      className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white shadow-[0_8px_30px_rgba(0,128,128,0.18)] transition duration-300 hover:bg-[#079494] active:scale-[0.98] sm:px-5"
                    >

                      <span className="hidden sm:inline">
                        Search
                      </span>

                      <ArrowRight
                        size={17}
                        weight="bold"
                      />

                    </button>

                  </div>
                </div>

                {/* Quick prompts */}
                <div className="mt-4 flex flex-wrap justify-center gap-2">

                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePrompt(prompt)}
                      className="rounded-full border border-white/[0.07] bg-black/35 px-3 py-1.5 text-[11px] text-white/40 backdrop-blur-md transition duration-300 hover:border-[#008080]/25 hover:bg-[#008080]/[0.05] hover:text-[#72ddda]"
                    >
                      {prompt}
                    </button>
                  ))}

                </div>

              </div>

            </div>
          </div>

          {/* Hero divider */}
          <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[#008080]/30 to-transparent" />

        </section>

        {/* =======================================================
            ACTION CARDS
        ======================================================= */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#56d1ce]">
                Explore the ecosystem
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Everything you need to move forward.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                Start, discover, connect and grow through one connected
                business platform.
              </p>

            </div>

            <button
              type="button"
              onClick={() => router.push('/guide')}
              className="flex items-center gap-2 self-start text-sm font-semibold text-white/45 transition hover:text-[#72ddda] sm:self-auto"
            >
              View guide
              <CaretRight size={16} />
            </button>

          </div>

          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {actionCards.map((card) => {

              const Icon = card.icon

              const accentStyles =
                card.accent === 'teal'
                  ? {
                      icon:
                        'border-[#008080]/25 bg-[#008080]/10 text-[#56d1ce]',
                      hover:
                        'hover:border-[#008080]/45',
                      title:
                        'group-hover:text-[#56d1ce]',
                    }
                  : card.accent === 'gold'
                    ? {
                        icon:
                          'border-[#d4b879]/25 bg-[#d4b879]/10 text-[#d4b879]',
                        hover:
                          'hover:border-[#d4b879]/40',
                        title:
                          'group-hover:text-[#d4b879]',
                      }
                    : card.accent === 'cyan'
                      ? {
                          icon:
                            'border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300',
                          hover:
                            'hover:border-cyan-400/35',
                          title:
                            'group-hover:text-cyan-300',
                        }
                      : {
                          icon:
                            'border-purple-400/20 bg-purple-400/[0.07] text-purple-300',
                          hover:
                            'hover:border-purple-400/35',
                          title:
                            'group-hover:text-purple-300',
                        }

              return (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => router.push(card.href)}
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/35 p-5 text-left shadow-[0_15px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:bg-white/[0.055] ${accentStyles.hover}`}
                >

                  <div className="absolute right-[-50px] top-[-50px] h-32 w-32 rounded-full bg-white/[0.025] blur-2xl transition duration-500 group-hover:bg-white/[0.045]" />

                  <div
                    className={`relative mb-5 flex h-11 w-11 items-center justify-center rounded-xl border ${accentStyles.icon}`}
                  >
                    <Icon
                      size={22}
                      weight="duotone"
                    />
                  </div>

                  <h3
                    className={`relative text-base font-bold text-white transition duration-300 ${accentStyles.title}`}
                  >
                    {card.title}
                  </h3>

                  <p className="relative mt-2 min-h-[72px] text-[13px] leading-6 text-white/38">
                    {card.description}
                  </p>

                  <div className="relative mt-5 flex items-center gap-1 text-xs font-semibold text-white/30 transition duration-300 group-hover:text-white/65">

                    Explore

                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />

                  </div>

                </button>
              )
            })}

          </div>
        </section>

        {/* =======================================================
            ECOSYSTEM / VISION
        ======================================================= */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black/35 backdrop-blur-xl">

            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#008080]/10 blur-[100px]" />

            <div className="relative grid gap-10 p-6 sm:p-9 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">

              <div>

                <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#56d1ce]">

                  <Compass
                    size={15}
                    weight="duotone"
                  />

                  One connected ecosystem

                </div>

                <h2 className="max-w-2xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">

                  Local knowledge.

                  <span className="block text-white/45">
                    Local connections.
                  </span>

                  <span className="block text-[#72ddda]">
                    Bigger possibilities.
                  </span>

                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/40">
                  FeniX is designed to make it easier to discover business
                  opportunities, connect with people and access practical
                  information without jumping between disconnected platforms.
                </p>

                <button
                  type="button"
                  onClick={() => router.push('/guide')}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl border border-[#008080]/25 bg-[#008080]/[0.07] px-4 py-3 text-sm font-semibold text-[#72ddda] transition duration-300 hover:border-[#008080]/45 hover:bg-[#008080]/[0.12]"
                >

                  Discover how it works

                  <ArrowRight
                    size={16}
                    weight="bold"
                  />

                </button>

              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-2xl border border-white/[0.07] bg-black/35 p-5 backdrop-blur-xl">

                  <Buildings
                    size={24}
                    className="text-[#56d1ce]"
                    weight="duotone"
                  />

                  <div className="mt-5 text-sm font-bold text-white">
                    Local Business
                  </div>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Discover and connect with businesses.
                  </p>

                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-black/35 p-5 backdrop-blur-xl">

                  <Users
                    size={24}
                    className="text-[#d4b879]"
                    weight="duotone"
                  />

                  <div className="mt-5 text-sm font-bold text-white">
                    Connections
                  </div>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Bring people and opportunities together.
                  </p>

                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-black/35 p-5 backdrop-blur-xl">

                  <TrendUp
                    size={24}
                    className="text-cyan-300"
                    weight="duotone"
                  />

                  <div className="mt-5 text-sm font-bold text-white">
                    Opportunities
                  </div>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Find paths to grow and invest.
                  </p>

                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-black/35 p-5 backdrop-blur-xl">

                  <Lightbulb
                    size={24}
                    className="text-purple-300"
                    weight="duotone"
                  />

                  <div className="mt-5 text-sm font-bold text-white">
                    Knowledge
                  </div>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Practical guidance when you need it.
                  </p>

                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =======================================================
            TRUST SECTION
        ======================================================= */}
        <section className="border-y border-white/[0.06] bg-black/30 backdrop-blur-xl">

          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

            <div className="grid gap-8 md:grid-cols-3">

              {/* Trust */}
              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#008080]/20 bg-[#008080]/[0.07] text-[#56d1ce]">

                  <ShieldCheck
                    size={23}
                    weight="duotone"
                  />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-white">
                    Built with trust
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    A focused ecosystem designed around useful and reliable
                    business experiences.
                  </p>

                </div>

              </div>

              {/* Practical */}
              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d4b879]/20 bg-[#d4b879]/[0.06] text-[#d4b879]">

                  <CheckCircle
                    size={23}
                    weight="duotone"
                  />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-white">
                    Practical first
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Information and tools are organized to help you take the
                    next step.
                  </p>

                </div>

              </div>

              {/* Feni */}
              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">

                  <Sparkle
                    size={23}
                    weight="duotone"
                  />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-white">
                    Built for Feni
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    A platform focused on connecting Feni&apos;s business
                    community and opportunities.
                  </p>

                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =======================================================
            FOOTER
        ======================================================= */}
        <footer className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-8 border-b border-white/[0.06] pb-8 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="text-lg font-black tracking-tight">
                Feni<span className="text-[#56d1ce]">X</span>
              </div>

              <p className="mt-2 max-w-sm text-xs leading-5 text-white/30">
                Feni Business Ecosystem — connecting ideas, businesses,
                people and opportunities.
              </p>

            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/35">

              <button
                type="button"
                onClick={() => router.push('/')}
                className="transition hover:text-white"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => router.push('/start')}
                className="transition hover:text-white"
              >
                Start Business
              </button>

              <button
                type="button"
                onClick={() => router.push('/invest')}
                className="transition hover:text-white"
              >
                Invest
              </button>

              <button
                type="button"
                onClick={() => router.push('/directory')}
                className="transition hover:text-white"
              >
                Directory
              </button>

              <button
                type="button"
                onClick={() => router.push('/guide')}
                className="transition hover:text-white"
              >
                Guide
              </button>

            </div>

          </div>

          <div className="flex flex-col gap-2 pt-6 text-[10px] uppercase tracking-[0.15em] text-white/20 sm:flex-row sm:items-center sm:justify-between">

            <span>
              © {new Date().getFullYear()} FeniX
            </span>

            <span>
              Fearless Energy Navigates Infinite X-factors.
            </span>

          </div>

        </footer>

      </div>
    </main>
  )
}
