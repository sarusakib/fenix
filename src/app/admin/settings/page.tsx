import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  GearSix,
  ShieldCheck,
  SlidersHorizontal,
} from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Admin Settings | FeniX',
  description: 'FeniX central platform settings and operating principles.',
}

const controls = [
  ['Trust & verification', 'Keep verification labels precise, evidence-based and separate from government certification.', '/admin/trust'],
  ['Commerce operations', 'Seller approval, delivery, returns, payment and review controls remain inside Commerce Operations.', '/commerce/admin'],
  ['Investment operations', 'Opportunity, investor, document, report and interest workflows remain auditable.', '/admin/investment'],
  ['Brain & source policy', 'Feni Brain should not invent local facts and should make uncertainty visible.', '/guide'],
  ['Member preferences', 'Appearance, reduced motion and personal privacy guidance live in the member Settings surface.', '/dashboard/settings'],
  ['Public policy', 'The public trust, privacy, anti-scam and responsible-AI rules are always one tap away.', '/policy'],
] as const

export default function AdminSettingsPage() {
  return (
    <main className="min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-black/[.03] px-3.5 text-xs font-bold dark:bg-white/[.04]">
          <ArrowLeft size={16} /> Admin
        </Link>

        <div className="mt-7 fenix-surface-strong overflow-hidden rounded-[2.2rem] p-6 sm:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-600/[.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-teal-800 dark:bg-teal-300/[.07] dark:text-teal-100">
                <GearSix size={13} /> Platform settings
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em] text-[#0b1736] sm:text-6xl dark:text-white">
                One operating layer.
                <br />
                <span className="opacity-40">Clear rules underneath.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/45">
                Central Admin keeps platform controls discoverable without exposing secrets,
                credentials or implementation-only details to the public surface.
              </p>
            </div>
            <div className="rounded-2xl bg-black/[.025] px-4 py-3 text-xs leading-5 dark:bg-white/[.035]">
              Security-sensitive changes should remain behind authenticated server-side controls.
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {controls.map(([title, body, href], index) => (
              <Link
                key={title}
                href={href}
                className="fenix-interactive group rounded-[1.55rem] border border-black/[.07] bg-white/55 p-5 dark:border-white/[.07] dark:bg-white/[.025]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600/[.08] text-teal-700 dark:bg-teal-300/[.08] dark:text-teal-200">
                    {index === 0 ? <ShieldCheck size={20} weight="duotone" /> : index === 3 ? <SlidersHorizontal size={20} weight="duotone" /> : <GearSix size={20} weight="duotone" />}
                  </span>
                  <ArrowRight size={17} className="mt-1 opacity-25 transition group-hover:translate-x-1 group-hover:opacity-70" />
                </div>
                <h2 className="mt-5 text-base font-black text-[#0b1736] dark:text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/45">{body}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-teal-600/12 bg-teal-600/[.05] p-5 dark:border-teal-300/12 dark:bg-teal-300/[.045]">
            <div className="flex gap-3">
              <CheckCircle size={19} className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-200" />
              <p className="text-sm leading-6 text-slate-600 dark:text-white/55">
                FeniX deliberately separates platform policy from private infrastructure details.
                Admin pages can evolve into feature flags, source health, moderation queues and
                release controls later without putting operational secrets into the public browser.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
