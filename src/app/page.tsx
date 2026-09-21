'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Brain,
  CheckCircle,
  Compass,
  Lightbulb,
  MagnifyingGlass,
  MapPin,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkle,
  Storefront,
  TrendUp,
  UsersThree,
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
  { title: 'Start', body: 'Turn an idea into a practical local business journey.', href: '/start', icon: Rocket, eyebrow: 'BUILD' },
  { title: 'Invest', body: 'Explore opportunities with context and due-diligence workflow.', href: '/invest', icon: TrendUp, eyebrow: 'INVEST' },
  { title: 'Connect', body: 'Find local businesses, suppliers and useful services.', href: '/directory', icon: Storefront, eyebrow: 'CONNECT' },
  { title: 'Shop', body: 'Discover published products from local sellers.', href: '/commerce', icon: ShoppingBag, eyebrow: 'SHOP' },
]

export default function HomePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  const goBrain = () => { setSuggestions([]); const query = search.trim().slice(0, 120); router.push(query ? '/guide?q=' + encodeURIComponent(query) : '/guide') }

  const choosePrompt = (value: string) => {
    setSearch(value)
    setSuggestions([])
    router.push('/guide?q=' + encodeURIComponent(value))
  }

  useEffect(() => {
    const value = search.trim().slice(0, 80)
    if (value.length < 2) {
      setSuggestions([])
      return
    }

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/brain/suggestions?q=' + encodeURIComponent(value), {
          cache: 'no-store',
        })
        if (!response.ok) return
        const data = await response.json()
        if (Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions.slice(0, 5))
        }
      } catch {
        // Search remains available when suggestion fetch fails.
      }
    }, 180)

    return () => window.clearTimeout(timer)
  }, [search])

  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip">
      <div className="fenix-orb left-[3%] top-32 h-64 w-64 bg-teal-400/[.07]" />
      <div className="fenix-orb right-[4%] top-[28%] h-72 w-72 bg-amber-300/[.055]" />
      <Navbar />

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div className="fenix-reveal">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--fx-primary-soft)] px-3.5 py-2 text-[10px] font-black uppercase tracking-[.19em] text-[var(--fx-primary-strong)]">
              <Sparkle size={13} weight="fill" /> Feni Business Ecosystem
            </div>

            <h1 className="mt-6 max-w-3xl text-balance text-[3.2rem] font-black leading-[.94] tracking-[-.075em] sm:text-6xl lg:text-[5.35rem]">
              Build.<br />Connect.<br /><span className="text-[var(--fx-primary-strong)]">Grow.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--fx-muted)] sm:text-lg">
              One calm place for Feni business discovery, local commerce, investment and practical guidance.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {['DISCOVER', 'UNDERSTAND', 'VERIFY', 'ACT'].map((step, index) => (
                <span key={step} className="rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2 text-[9px] font-black uppercase tracking-[.14em] text-[var(--fx-muted)]">
                  {String(index + 1).padStart(2, '0')} · {step}
                </span>
              ))}
            </div>
          </div>

          <div className="fenix-reveal lg:pl-3" style={{ animationDelay: '100ms' }}>
            <div className="fenix-surface-strong rounded-[2.1rem] p-3 sm:p-4">
              <div className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-bg)] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">Feni Brain</p>
                    <h2 className="mt-2 text-2xl font-black tracking-[-.04em]">What do you want to do?</h2>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Brain size={21} weight="duotone" /></span>
                </div>

                <div className="relative mt-5 flex items-center gap-2 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-2">
                  <MagnifyingGlass size={20} className="ml-2 shrink-0 text-[var(--fx-muted)]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') goBrain() }}
                    className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-[var(--fx-muted)]"
                    placeholder="Ask in Bangla, English or Banglish…"
                    aria-label="Search Feni Brain"
                    maxLength={120}
                  />
                  <button type="button" onClick={goBrain} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-strong)] text-white" aria-label="Search Feni Brain">
                    <ArrowRight size={18} />
                  </button>

                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-2 shadow-2xl">
                      <div className="px-2 pb-1 pt-1 text-[10px] font-black uppercase tracking-[.16em] text-[var(--fx-muted)]">
                        Suggested
                      </div>
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => choosePrompt(suggestion)}
                          className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--fx-muted)] transition hover:bg-[var(--fx-primary-soft)] hover:text-[var(--fx-text)]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {prompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => choosePrompt(prompt)} className="rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2 text-[10px] font-semibold text-[var(--fx-muted)] transition hover:border-[var(--fx-primary)]/25 hover:text-[var(--fx-text)]">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 p-1 pt-3 sm:grid-cols-3 sm:p-2">
                <TrustMini icon={<CheckCircle size={18} />} title="Clear trust" body="Verification has a defined meaning." />
                <TrustMini icon={<MapPin size={18} />} title="Local context" body="Place matters in Feni." />
                <TrustMini icon={<UsersThree size={18} />} title="Connected" body="One account, many paths." />
              </div>
            </div>
          </div>
        </div>

        <section className="mt-12 sm:mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">Quick moves</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-3xl">Start where you are.</h2>
            </div>
            <Compass size={26} className="text-[var(--fx-muted)] opacity-35" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickMoves.map(({ title, body, href, icon: Icon, eyebrow }) => (
              <Link key={href} href={href} className="fenix-interactive group rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Icon size={22} weight="duotone" /></div>
                  <span className="text-[9px] font-black uppercase tracking-[.14em] text-[var(--fx-muted)]">{eyebrow}</span>
                </div>
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{body}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[var(--fx-primary-strong)]">Open <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 sm:mt-16">
          <div className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">Service layer</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-3xl">Tap one path. The next layer appears.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fx-muted)]">Build, Connect, Invest, Shop, Discover, Trust and Account stay in one consistent interaction model.</p>
              </div>
              <Link href="/services" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-3.5 text-xs font-bold text-[var(--fx-primary-strong)]">Open Services <ArrowRight size={14} /></Link>
            </div>
            <div className="mt-6"><ServiceHub compact showHeader={false} /></div>
          </div>
        </section>

        <section className="mt-12 grid gap-3 pb-8 sm:mt-16 sm:grid-cols-3">
          <InfoCard icon={<Lightbulb size={19} />} title="Think with Brain" body="Use natural language to find the next practical step." />
          <InfoCard icon={<ShieldCheck size={19} />} title="Verify before acting" body="Important claims should have visible evidence and context." />
          <InfoCard icon={<Storefront size={19} />} title="Stay local" body="Find Feni businesses, products, suppliers and opportunities in one ecosystem." />
        </section>
      </section>
    </main>
  )
}

function TrustMini({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3.5"><div className="flex items-center gap-2 text-[var(--fx-primary-strong)]">{icon}<span className="text-xs font-black">{title}</span></div><p className="mt-1 text-[10px] leading-5 text-[var(--fx-muted)]">{body}</p></div>
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-[1.6rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">{icon}</div><h3 className="mt-4 text-base font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{body}</p></div>
}
