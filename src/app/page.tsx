'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Brain, Compass, UsersThree, Lightbulb, MagnifyingGlass,
  Newspaper, Rocket, ShieldCheck, ShoppingBag, Sparkle, Storefront, TrendUp,
} from '@phosphor-icons/react'
import Navbar from '../components/Navbar'
import ServiceHub from '../components/ServiceHub'

const prompts = [
  'Find businesses in Feni',
  'How do I start a business in Feni?',
  'Find products and local sellers',
  'What are the upazilas of Feni?',
]

const paths = [
  { title: 'Start a Business', short: 'Build', body: 'Turn an idea into a practical local business journey.', href: '/start', icon: Rocket },
  { title: 'Find & Connect', short: 'Connect', body: 'Find businesses, suppliers and useful local services.', href: '/directory', icon: Storefront },
  { title: 'Invest in Feni', short: 'Invest', body: 'Review published opportunities with verification context.', href: '/invest', icon: TrendUp },
  { title: 'Shop Local', short: 'Shop', body: 'Discover published products from approved local sellers.', href: '/commerce', icon: ShoppingBag },
  { title: 'Read FeniX News', short: 'News', body: 'Read public FeniX news, notices and local updates.', href: '/news', icon: Newspaper },
  { title: 'Join the Feed', short: 'Community', body: 'Ask questions, learn and follow local conversations.', href: '/feed', icon: UsersThree },
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

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-16">
        <div className="grid items-stretch gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="fenix-surface-strong rounded-[2rem] p-6 sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">
              <Sparkle size={13} weight="fill" /> Feni Business Ecosystem
            </div>
            <h1 className="mt-6 max-w-2xl text-balance text-[3.35rem] font-black leading-[.94] tracking-[-.065em] sm:text-6xl lg:text-[5rem]">
              One account.<br />One connected<br /><span className="text-[var(--fx-primary-strong)]">local experience.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--fx-muted)] sm:text-lg">
              Build, connect, discover, invest and grow in Feni without hunting through separate systems.
            </p>
            <div className="mt-7 grid grid-cols-4 gap-2">
              {['Discover', 'Understand', 'Verify', 'Act'].map((step, index) => (
                <div key={step} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-2 py-3 text-center">
                  <div className="text-[10px] font-black text-[var(--fx-primary-strong)]">0{index + 1}</div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[.08em] text-[var(--fx-muted)]">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="fenix-surface-strong rounded-[2rem] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">Feni Brain</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-3xl">What do you want to do?</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--fx-muted)]">
                  Ask in Bangla, English or Banglish. FeniX sends you to the useful next step.
                </p>
              </div>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
                <Brain size={22} weight="duotone" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-2">
              <MagnifyingGlass size={20} className="ml-2 shrink-0 text-[var(--fx-muted)]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') goBrain() }}
                className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-[var(--fx-muted)]"
                placeholder="What are you trying to do?"
                aria-label="Ask Feni Brain"
                maxLength={120}
              />
              <button type="button" onClick={goBrain} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-strong)] text-white" aria-label="Ask Feni Brain">
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => choosePrompt(prompt)} className="rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2 text-[10px] font-semibold text-[var(--fx-muted)] transition hover:border-[var(--fx-primary)]/30 hover:text-[var(--fx-text)]">
                  {prompt}
                </button>
              ))}
            </div>

            <Link href="/search" className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold text-[var(--fx-text)]">
              <MagnifyingGlass size={15} /> Search businesses, products and places
            </Link>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <TrustMini title="Verified context" body="Trust labels explain what was actually checked." />
              <TrustMini title="Local first" body="Feni places, businesses and workflows stay connected." />
              <TrustMini title="One next step" body="FeniX avoids dumping every option at once." />
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">Start here</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-3xl">Choose one clear path.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fx-muted)]">These are the main things FeniX is built to help you do.</p>
            </div>
            <Compass size={24} className="hidden text-[var(--fx-muted)] opacity-30 sm:block" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {paths.map(({ title, short, body, href, icon: Icon }) => (
              <Link key={href} href={href} className="fenix-interactive group rounded-[1.5rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
                    <Icon size={21} weight="duotone" />
                  </div>
                  <span className="rounded-full border border-[var(--fx-border)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-[var(--fx-muted)]">{short}</span>
                </div>
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[var(--fx-muted)]">{body}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[var(--fx-primary-strong)]">Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="fenix-surface-strong rounded-[2rem] p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">More tools</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-3xl">Everything else, organized.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fx-muted)]">Tap a category. Its tools open underneath—no giant list and no maze of pages.</p>
              </div>
              <Link href="/services" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold">
                Open all services <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-6">
              <ServiceHub compact showHeader={false} />
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-3 pb-6 sm:grid-cols-3">
          <InfoCard icon={<Lightbulb size={18} />} title="Think with Brain" body="Use natural language when you do not know where to start." />
          <InfoCard icon={<ShieldCheck size={18} />} title="Verify before acting" body="Important claims show evidence, source or review status." />
          <InfoCard icon={<Storefront size={18} />} title="Stay connected" body="Directory, commerce, investment, news and feed are part of one ecosystem." />
        </section>
      </section>
    </main>
  )
}

function TrustMini({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3.5">
    <p className="text-xs font-black text-[var(--fx-text)]">{title}</p>
    <p className="mt-1 text-[10px] leading-5 text-[var(--fx-muted)]">{body}</p>
  </div>
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-[1.5rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">{icon}</div>
    <h3 className="mt-4 text-base font-black">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{body}</p>
  </div>
}
