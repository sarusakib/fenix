import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  GearSix,
  LockKey,
  ShieldCheck,
  SlidersHorizontal,
  Storefront,
  TrendUp,
} from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Admin Settings | FeniX',
  description: 'Central operating settings and governance surfaces for FeniX administrators.',
}

const sections = [
  { title: 'Trust & Safety', body: 'Verification, ownership, review and report workflows.', href: '/admin/trust', icon: ShieldCheck },
  { title: 'Commerce Operations', body: 'Seller, catalogue, order, return and review operations.', href: '/commerce/admin', icon: Storefront },
  { title: 'Investment Operations', body: 'Opportunity, investor, document and interest workflows.', href: '/admin/investment', icon: TrendUp },
  { title: 'Brain & Knowledge', body: 'Open the source-aware Brain experience and review public guidance.', href: '/guide', icon: Brain },
  { title: 'Member Preferences', body: 'Appearance and accessibility remain in the member settings surface.', href: '/dashboard/settings', icon: SlidersHorizontal },
  { title: 'FeniX Policy', body: 'Public trust, privacy, anti-scam and responsible-AI rules.', href: '/policy', icon: LockKey },
] as const

export default function AdminSettingsPage() {
  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold">
          <ArrowLeft size={16} /> Admin Center
        </Link>

        <div className="mt-6 fenix-surface-strong rounded-[2.2rem] p-6 sm:p-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.17em] text-[var(--fx-primary-strong)]">
                <GearSix size={13} /> Admin settings
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-[-.055em] sm:text-6xl">
                One operating layer.
                <br />
                <span className="opacity-35">Clear boundaries underneath.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">
                This page is the index for operational surfaces—not a place to expose secrets, service keys or internal credentials.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 py-3 text-xs leading-5 text-[var(--fx-muted)]">
              Authenticated server-side controls only
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {sections.map(({ title, body, href, icon: Icon }) => (
              <Link key={title} href={href} className="fenix-interactive group rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
                    <Icon size={22} weight="duotone" />
                  </span>
                  <ArrowRight size={17} className="mt-2 opacity-25 transition-transform group-hover:translate-x-1 group-hover:opacity-70" />
                </div>
                <h2 className="mt-5 text-base font-black">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
