import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Sparkle } from '@phosphor-icons/react/dist/ssr'
import Navbar from '../../components/Navbar'
import ServiceHub from '../../components/ServiceHub'

export const metadata = {
  title: 'FeniX Services | Feni Business Ecosystem',
  description: 'A calm, layered service hub for the FeniX ecosystem.',
}

export default function ServicesPage() {
  return (
    <main className="min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto w-full max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="fenix-surface-strong overflow-hidden rounded-[2.2rem] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_.42fr] lg:items-end">
            <div>
              <Link
                href="/"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-black/[.03] px-3.5 text-xs font-bold dark:bg-white/[.04]"
              >
                <ArrowLeft size={16} /> Home
              </Link>

              <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-teal-600/[.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-teal-800 dark:bg-teal-300/[.07] dark:text-teal-100">
                <Sparkle size={13} weight="fill" />
                FeniX Service Hub
              </div>

              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-.05em] text-[#0b1736] sm:text-6xl dark:text-white">
                Everything important.
                <br />
                <span className="opacity-40">One calm layer at a time.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/48">
                FeniX keeps the surface simple while the ecosystem grows underneath:
                business, investment, commerce, local discovery, trust and Feni Brain.
              </p>
            </div>

            <div className="rounded-3xl bg-[#0b1736] p-5 text-white shadow-2xl dark:bg-[#071019]">
              <div className="flex items-center gap-2 text-teal-200">
                <ShieldCheck size={18} />
                <span className="text-xs font-bold uppercase tracking-[.16em]">Trust by design</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/65">
                Unfinished modules are visible as planned—not as fake live links.
                Verification is explained, not exaggerated.
              </p>
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
