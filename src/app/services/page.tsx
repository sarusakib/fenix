import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShieldCheck, Sparkle } from '@phosphor-icons/react/dist/ssr'
import Navbar from '../../components/Navbar'
import ServiceHub from '../../components/ServiceHub'

export const metadata = {
  title: 'Services | FeniX',
  description: 'The FeniX layered service hub for business, investment, commerce, discovery and trust.',
}

export default function ServicesPage() {
  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="fenix-surface-strong overflow-hidden rounded-[2.2rem] p-5 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_.36fr] lg:items-end">
            <div>
              <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold text-[var(--fx-text)]">
                <ArrowLeft size={16} /> Home
              </Link>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.17em] text-[var(--fx-primary-strong)]">
                <Sparkle size={13} weight="fill" /> FeniX Network
              </div>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-.055em] sm:text-6xl">
                One calm surface.
                <br />
                <span className="opacity-35">Many connected paths.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">
                Start with a direction. FeniX reveals the next layer only when you need it.
              </p>
            </div>
            <div className="rounded-3xl bg-[#0b1736] p-5 text-white dark:bg-[#071019]">
              <div className="flex items-center gap-2 text-teal-200">
                <ShieldCheck size={18} />
                <span className="text-xs font-black uppercase tracking-[.16em]">Trust by design</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Live paths open normally. Future tools stay marked as planned instead of pretending to be ready.
              </p>
              <Link href="/policy" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white/85">
                Read Policy <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="mt-9">
            <ServiceHub />
          </div>
        </div>
      </section>
    </main>
  )
}
