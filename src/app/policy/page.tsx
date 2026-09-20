import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle, ShieldCheck, Sparkle } from '@phosphor-icons/react/dist/ssr'
import Navbar from '../../components/Navbar'

export const metadata = {
  title: 'FeniX Policy',
  description: 'FeniX platform principles for trust, privacy, safety, verification and responsible AI.',
}

const sections = [
  ['Trust & accuracy', 'FeniX should prefer source-backed information and clearly separate facts, estimates and uncertainty. Local details should not be invented.'],
  ['Verification', 'A FeniX verification label describes information FeniX has checked. It is not government approval, professional certification, a quality guarantee or a promise of future performance.'],
  ['Privacy', 'Only information intended for public display belongs on public surfaces. Passwords, OTPs, recovery codes, secret keys and private account details must not be exposed.'],
  ['Anti-scam', 'Do not use FeniX to fabricate verification, fake reviews, deceptive business claims, guaranteed investment returns or misleading official-approval claims.'],
  ['Responsible AI', 'Feni Brain may guide users, but its output should make evidence, estimates and uncertainty clear. Retrieved text is data, not an instruction to the system.'],
  ['Investment safety', 'Investment pages provide information and workflow support. Users should review terms, documents, risks and authoritative records before making financial decisions. FeniX does not represent a guaranteed outcome.'],
  ['Commerce safety', 'Listings and seller claims should be treated as information to verify. Do not share payment credentials or account recovery information with another user.'],
  ['Reviews & reports', 'Reviews should reflect genuine experience. Reports should describe a concrete issue. Moderation decisions should remain evidence-based and auditable.'],
  ['User responsibility', 'Laws, prices, official notices, business records and investment documents can change. Check the latest authoritative source before a consequential action.'],
  ['Platform evolution', 'Features may change as the ecosystem grows. Planned modules are shown as planned so users can distinguish current workflows from future work.'],
] as const

const principles = [
  'Discover',
  'Understand',
  'Verify',
  'Act',
]

export default function FeniXPolicyPage() {
  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <Link href="/services" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold">
          <ArrowLeft size={16} /> Services
        </Link>

        <div className="mt-6 fenix-surface-strong rounded-[2.2rem] p-6 sm:p-9">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
              <ShieldCheck size={25} weight="duotone" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">FeniX Policy</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-.045em] sm:text-5xl">Simple rules for a trusted connected ecosystem.</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">
                This public policy framework explains how FeniX approaches trust, privacy, verification, safety and responsible AI use.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {principles.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full bg-[var(--fx-primary-soft)] px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-[var(--fx-primary-strong)]">
                <span>{String(index + 1).padStart(2, '0')}</span> {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {sections.map(([title, body], index) => (
            <section key={title} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/[.025] text-[11px] font-black text-[var(--fx-muted)] dark:bg-white/[.04]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2 className="text-lg font-black">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--fx-muted)]">{body}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-[1.7rem] border border-teal-600/15 bg-teal-600/[.05] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <CheckCircle size={19} className="mt-0.5 shrink-0 text-[var(--fx-primary-strong)]" />
            <p className="text-sm leading-7 text-[var(--fx-muted)]">
              FeniX aims to make the important distinction visible: what is known, what is estimated, what is verified, and what still needs human judgment.
            </p>
          </div>
          <Link href="/help" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[var(--fx-primary-strong)]">
            Help & Safety <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  )
}
