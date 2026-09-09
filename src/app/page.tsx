'use client'

import { ElementType, useMemo, useState } from 'react'
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
  CheckCircle,
} from '@phosphor-icons/react'

import Navbar from '../components/Navbar'

/* ============================================================
   TYPES
   ============================================================ */

type Accent = 'teal' | 'gold' | 'white'

type ActionCard = {
  title: string
  description: string
  icon: ElementType
  accent: Accent
  href: string
  badge: string
}

type Prompt = {
  label: string
  value: string
}

/* ============================================================
   ACCENT ICON
   ============================================================ */

function AccentIcon({
  icon: Icon,
  accent = 'teal',
}: {
  icon: ElementType
  accent?: Accent
}) {
  const accentClasses: Record<Accent, string> = {
    teal: `
      border-teal-200/20
      bg-teal-300/10
      text-teal-200
    `,
    gold: `
      border-amber-200/20
      bg-amber-200/10
      text-amber-100
    `,
    white: `
      border-white/20
      bg-white/10
      text-white
    `,
  }

  return (
    <div
      className={`
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-2xl
        border
        ${accentClasses[accent]}
      `}
    >
      <Icon size={22} weight="duotone" />
    </div>
  )
}

/* ============================================================
   MASTER GLASS
   ============================================================ */

const glassClass = `
  relative
  overflow-hidden
  rounded-3xl
  border
  border-white/[0.18]
  bg-white/[0.055]
  backdrop-blur-xl
  shadow-[0_8px_40px_rgba(0,0,0,0.12)]
  transition-all
  duration-300
  ease-out
  hover:border-white/[0.28]
  hover:bg-white/[0.085]
  hover:shadow-[0_14px_55px_rgba(0,0,0,0.18)]
`

/* ============================================================
   GLASS SHINE
   ============================================================ */

function GlassShine() {
  return (
    <>
      {/* Clean top reflection */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-10
          h-px
          bg-white/70
        "
      />

      {/* Soft diagonal reflection */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-10
          bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_28%,transparent_70%,rgba(255,255,255,0.035))]
        "
      />

      {/* Very soft upper shine */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -top-20
          left-1/2
          z-10
          h-40
          w-72
          -translate-x-1/2
          rounded-full
          bg-white/[0.035]
          blur-3xl
        "
      />
    </>
  )
}

/* ============================================================
   ACTION CARDS
   ============================================================ */

const actionCards: ActionCard[] = [
  {
    title: 'Launch Your Business',
    description:
      'Build your digital presence and take your business to the next level.',
    icon: Rocket,
    accent: 'teal',
    href: '/business',
    badge: 'Business',
  },
  {
    title: 'Grow & Discover',
    description:
      'Explore opportunities and discover businesses across the ecosystem.',
    icon: TrendUp,
    accent: 'gold',
    href: '/discover',
    badge: 'Discover',
  },
  {
    title: 'Find Local Services',
    description:
      'Search for products, services, businesses and useful local resources.',
    icon: Storefront,
    accent: 'white',
    href: '/directory',
    badge: 'Directory',
  },
  {
    title: 'Ideas & Innovation',
    description:
      'Turn ideas into practical projects with smart tools and guidance.',
    icon: Lightbulb,
    accent: 'gold',
    href: '/ideas',
    badge: 'Ideas',
  },
]

/* ============================================================
   QUICK PROMPTS
   ============================================================ */

const prompts: Prompt[] = [
  {
    label: 'Find a business',
    value: 'Find businesses and services near me',
  },
  {
    label: 'Start a business',
    value: 'How can I start a business?',
  },
  {
    label: 'Grow my business',
    value: 'How can I grow my business?',
  },
  {
    label: 'Explore Feni',
    value: 'Explore businesses and opportunities in Feni',
  },
]

/* ============================================================
   HOME
   ============================================================ */

export default function HomePage() {
  const router = useRouter()

  const [search, setSearch] = useState('')

  const normalizedSearch = useMemo(
    () => search.trim(),
    [search],
  )

  /* ==========================================================
     SEARCH
     ========================================================== */

  const handleSearch = () => {
    if (!normalizedSearch) {
      router.push('/guide')
      return
    }

    router.push(
      `/guide?q=${encodeURIComponent(normalizedSearch)}`,
    )
  }

  const handlePrompt = (value: string) => {
    setSearch(value)

    router.push(
      `/guide?q=${encodeURIComponent(value)}`,
    )
  }

  return (
    <main className="relative z-10 min-h-screen w-full overflow-x-clip text-white">
      {/* ======================================================
          NAVBAR
          ====================================================== */}

      <Navbar />

      {/* ======================================================
          HERO
          ====================================================== */}

      <section
        className="
          mx-auto
          flex
          min-h-[calc(100svh-64px)]
          w-full
          max-w-7xl
          flex-col
          items-center
          justify-center
          px-4
          pb-16
          pt-10
          sm:px-6
          lg:px-8
        "
      >
        {/* Eyebrow */}

        <div
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white/[0.18]
            bg-white/[0.045]
            px-4
            py-2
            text-xs
            font-medium
            tracking-[0.16em]
            text-white/80
            backdrop-blur-xl
            shadow-[0_8px_30px_rgba(0,0,0,0.10)]
          "
        >
          <Sparkle
            size={14}
            weight="fill"
            className="text-teal-300"
          />

          <span>FENIX BUSINESS ECOSYSTEM</span>
        </div>

        {/* Heading */}

        <h1
          className="
            max-w-5xl
            text-center
            text-4xl
            font-semibold
            leading-[1.05]
            tracking-[-0.045em]
            text-white
            sm:text-5xl
            md:text-6xl
            lg:text-7xl
          "
        >
          One Account.
          <br />

          <span className="text-white/90">
            One Ecosystem.
          </span>
        </h1>

        {/* Description */}

        <p
          className="
            mt-6
            max-w-2xl
            text-center
            text-sm
            leading-7
            text-white/75
            sm:text-base
            sm:leading-8
          "
        >
          FeniX connects people, businesses, ideas and
          opportunities into one intelligent digital ecosystem.
        </p>

        {/* ======================================================
            SEARCH
            ====================================================== */}

        <div className="mt-9 w-full max-w-3xl">
          <div
            className="
              relative
              overflow-hidden
              rounded-[1.75rem]
              border
              border-white/[0.22]
              bg-white/[0.065]
              backdrop-blur-2xl
              shadow-[0_15px_60px_rgba(0,0,0,0.18)]
            "
          >
            <GlassShine />

            <div className="relative z-20 flex items-center gap-3 p-2">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-white/[0.10]
                  bg-white/[0.07]
                  text-white/80
                "
              >
                <MagnifyingGlass
                  size={22}
                  weight="regular"
                />
              </div>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch()
                  }
                }}
                placeholder="Search businesses, services, ideas..."
                aria-label="Search FeniX"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-1
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-white/50
                  sm:text-base
                "
              />

              <button
                type="button"
                onClick={handleSearch}
                className="
                  inline-flex
                  h-12
                  shrink-0
                  items-center
                  gap-2
                  rounded-2xl
                  border
                  border-white/[0.16]
                  bg-white/[0.10]
                  px-4
                  text-sm
                  font-medium
                  text-white
                  transition-all
                  duration-300
                  hover:border-white/[0.28]
                  hover:bg-white/[0.17]
                  active:scale-[0.98]
                  sm:px-5
                "
              >
                <span className="hidden sm:inline">
                  Search
                </span>

                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================
            QUICK PROMPTS
            ====================================================== */}

        <div className="mt-5 flex w-full max-w-3xl flex-wrap justify-center gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => handlePrompt(prompt.value)}
              className="
                rounded-full
                border
                border-white/[0.13]
                bg-white/[0.035]
                px-3.5
                py-2
                text-xs
                text-white/70
                backdrop-blur-lg
                transition-all
                duration-300
                hover:border-white/[0.24]
                hover:bg-white/[0.075]
                hover:text-white
                active:scale-[0.98]
              "
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </section>

      {/* ======================================================
          ACTION CARDS
          ====================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          py-16
          sm:px-6
          lg:px-8
        "
      >
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200/80">
            Explore
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything starts here.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Choose where you want to go and let FeniX take you
            there.
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {actionCards.map((card) => {
            const Icon = card.icon

            return (
              <button
                key={card.title}
                type="button"
                onClick={() => router.push(card.href)}
                className={`
                  ${glassClass}
                  min-h-[250px]
                  w-full
                  text-left
                  active:scale-[0.99]
                `}
              >
                <GlassShine />

                <div className="relative z-20 flex h-full flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <AccentIcon
                      icon={Icon}
                      accent={card.accent}
                    />

                    <span
                      className="
                        rounded-full
                        border
                        border-white/[0.12]
                        bg-white/[0.04]
                        px-2.5
                        py-1
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-[0.12em]
                        text-white/55
                      "
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div className="mt-auto pt-10">
                    <h3 className="text-xl font-semibold text-white">
                      {card.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-white/65">
                      {card.description}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/85">
                      Explore
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ======================================================
          ECOSYSTEM
          ====================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          py-16
          sm:px-6
          lg:px-8
        "
      >
        <div className={glassClass}>
          <GlassShine />

          <div
            className="
              relative
              z-20
              grid
              gap-10
              p-7
              sm:p-10
              lg:grid-cols-[1.15fr_0.85fr]
              lg:p-14
            "
          >
            <div>
              <div className="flex items-center gap-3">
                <AccentIcon
                  icon={Buildings}
                  accent="teal"
                />

                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                  The Ecosystem
                </span>
              </div>

              <h2 className="mt-7 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                A smarter digital foundation for Feni.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                FeniX is designed to bring businesses,
                customers, creators and opportunities closer
                together through one connected platform.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  'Business discovery',
                  'Digital presence',
                  'Local opportunities',
                  'Smart ecosystem tools',
                ].map((item) => (
                  <div
                    key={item}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-white/[0.10]
                      bg-white/[0.035]
                      px-4
                      py-3
                    "
                  >
                    <CheckCircle
                      size={18}
                      weight="fill"
                      className="shrink-0 text-teal-300"
                    />

                    <span className="text-sm text-white/75">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  icon: Users,
                  title: 'People',
                  text: 'Connect with the local ecosystem.',
                },
                {
                  icon: Storefront,
                  title: 'Businesses',
                  text: 'Discover and grow local businesses.',
                },
                {
                  icon: Compass,
                  title: 'Opportunities',
                  text: 'Find ideas, services and possibilities.',
                },
              ].map((item) => {
                const Icon = item.icon

                return (
                  <div
                    key={item.title}
                    className="
                      rounded-2xl
                      border
                      border-white/[0.11]
                      bg-white/[0.035]
                      p-5
                      transition-all
                      duration-300
                      hover:bg-white/[0.06]
                    "
                  >
                    <Icon
                      size={22}
                      weight="duotone"
                      className="text-white/80"
                    />

                    <h3 className="mt-4 text-base font-semibold text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {item.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOUNDATION
          ====================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          py-16
          sm:px-6
          lg:px-8
        "
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: 'Built with Trust',
              text: 'Security and responsible architecture are part of the foundation.',
            },
            {
              icon: Sparkle,
              title: 'Built for Growth',
              text: 'The ecosystem is designed to evolve as new capabilities are added.',
            },
            {
              icon: Compass,
              title: 'Built for Feni',
              text: 'Focused on connecting local people, businesses and opportunities.',
            },
          ].map((item) => {
            const Icon = item.icon

            return (
              <div
                key={item.title}
                className={glassClass}
              >
                <GlassShine />

                <div className="relative z-20 p-7">
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-white/[0.14]
                      bg-white/[0.055]
                      text-white/80
                    "
                  >
                    <Icon size={21} weight="duotone" />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/60">
                    {item.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ======================================================
          FINAL CTA
          ====================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-5xl
          px-4
          py-20
          text-center
          sm:px-6
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-white/[0.18]
            bg-white/[0.055]
            px-6
            py-12
            backdrop-blur-2xl
            shadow-[0_20px_80px_rgba(0,0,0,0.16)]
            sm:px-10
            sm:py-16
          "
        >
          <GlassShine />

          <div className="relative z-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200/80">
              Start with FeniX
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Your next opportunity
              <br />
              could start here.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              Explore the ecosystem, discover local businesses
              and turn your next idea into something real.
            </p>

            <button
              type="button"
              onClick={() => router.push('/guide')}
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                rounded-2xl
                border
                border-white/[0.20]
                bg-white/[0.10]
                px-6
                py-3.5
                text-sm
                font-semibold
                text-white
                shadow-[0_8px_30px_rgba(0,0,0,0.14)]
                transition-all
                duration-300
                hover:border-white/[0.32]
                hover:bg-white/[0.17]
                active:scale-[0.98]
              "
            >
              Explore FeniX
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer
        className="
          border-t
          border-white/[0.08]
          px-4
          py-10
          sm:px-6
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-7xl
            flex-col
            gap-4
            text-center
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:text-left
          "
        >
          <div>
            <div className="text-sm font-semibold tracking-wide text-white">
              FeniX
            </div>

            <div className="mt-1 text-xs text-white/45">
              One Account. One Ecosystem.
            </div>
          </div>

          <div className="text-xs text-white/40">
            Built for the future of Feni.
          </div>
        </div>
      </footer>
    </main>
  )
}
