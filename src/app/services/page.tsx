import Link from 'next/link'
import { ArrowLeft, ArrowRight, ShieldCheck } from '@phosphor-icons/react/dist/ssr'
import Navbar from '../../components/Navbar'
import ServiceHub from '../../components/ServiceHub'

export const metadata = {
  title: 'Explore | FeniX',
  description: 'Explore the connected FeniX service map.',
}

export default function ServicesPage() {
  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="fenix-surface-strong rounded-[2.2rem] p-5 sm:p-8 lg:p-10">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold">
            <ArrowLeft size={16} /> Home
          </Link>
          <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_.46fr] lg:items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">Explore</p>
              <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-.055em] sm:text-6xl">Everything FeniX can help you do.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">
                Start with a category. Tap a tool. Its next step opens underneath—so you never have to scan a giant menu.
              </p>
            </div>
            <div className="rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] p-5">
              <div className="flex items-center gap-2 text-[var(--fx-primary-strong)]"><ShieldCheck size={18}/><span className="text-xs font-black uppercase tracking-[.14em]">Trust is visible</span></div>
              <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">Verification, source context and policy stay close to the actions they explain.</p>
              <Link href="/policy" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[var(--fx-primary-strong)]">Read policy <ArrowRight size={14}/></Link>
            </div>
          </div>
          <div className="mt-8"><ServiceHub /></div>
        </div>
      </section>
    </main>
  )
}
