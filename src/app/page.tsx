'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Brain,
  Compass,
  LockKey,
  MagnifyingGlass,
  RocketLaunch,
  ShieldCheck,
  Storefront,
  TrendUp,
  UserCircle,
} from '@phosphor-icons/react'
import UltraAqueousBackground from '@/components/ultra/UltraAqueousBackground'

const cards = [
  {
    icon: RocketLaunch,
    title: 'Build',
    text: 'Start a business and build your digital presence.',
    href: '/start',
  },
  {
    icon: TrendUp,
    title: 'Invest',
    text: 'Explore Feni opportunities and investment intelligence.',
    href: '/invest',
  },
  {
    icon: Storefront,
    title: 'Connect',
    text: 'Find trusted local businesses, suppliers and services.',
    href: '/directory',
  },
  {
    icon: Brain,
    title: 'Discover',
    text: 'Ask Feni Brain in Bangla, English or Banglish.',
    href: '/guide',
  },
]

export default function DemoHomePage() {
  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#06080c] text-white">
      <UltraAqueousBackground />

      <div className="relative z-10 mx-auto min-h-dvh w-full max-w-[1600px] px-4 pb-12 sm:px-6 lg:px-10">
        <header className="flex min-h-20 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label="FeniX demo home">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-sm font-black shadow-[0_0_35px_rgba(0,210,255,0.08)]">
              FX
            </span>
            <span>
              <span className="block text-lg font-bold tracking-[0.18em]">FeniX</span>
              <span className="hidden text-[9px] uppercase tracking-[0.22em] text-white/35 sm:block">Feni Business Ecosystem</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.055] px-4 text-sm font-semibold text-white/85 backdrop-blur-xl transition hover:border-cyan-200/30 hover:bg-white/[0.09]"
          >
            <UserCircle size={18} />
            Enter FeniX
          </Link>
        </header>

        <section className="grid min-h-[calc(100dvh-80px)] items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-300/[0.045] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/70">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-200/70 shadow-[0_0_16px_rgba(0,210,255,0.6)]" />
              One Account · One Ecosystem
            </div>

            <h1 className="mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
              Build.
              <span className="text-white/35"> Connect.</span>
              <br />
              <span className="text-cyan-100/85">Grow.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
              FeniX is a connected digital ecosystem for people, businesses,
              products, services and opportunities across Feni.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex min-h-13 items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-[#071018] shadow-[0_12px_45px_rgba(255,255,255,0.10)] transition hover:scale-[1.01]"
              >
                Enter the ecosystem
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/guide"
                className="inline-flex min-h-13 items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.045] px-5 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-xl transition hover:bg-white/[0.08]"
              >
                <MagnifyingGlass size={18} />
                Explore Feni Brain
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/35">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={16} /> Trust-first foundation</span>
              <span className="inline-flex items-center gap-2"><LockKey size={16} /> Secure authentication</span>
              <span className="inline-flex items-center gap-2"><Compass size={16} /> Feni-first discovery</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map((card, index) => {
              const Icon = card.icon
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:border-cyan-100/20 hover:bg-white/[0.075] sm:min-h-[230px]"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-cyan-100/80">
                      <Icon size={22} weight="duotone" />
                    </span>
                    <span className="text-[10px] text-white/20">0{index + 1}</span>
                  </div>
                  <h2 className="mt-10 text-2xl font-semibold">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/45">{card.text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-white/60 transition group-hover:text-cyan-100">
                    Explore <ArrowRight size={15} />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
