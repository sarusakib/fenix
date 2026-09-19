import Link from 'next/link'
import { ArrowLeft, ArrowRight, Brain, ShieldCheck, Sparkle } from '@phosphor-icons/react/dist/ssr'
import Navbar from '../../components/Navbar'

export const metadata = {
  title: 'Help & Safety | FeniX',
  description: 'Guidance for using FeniX safely and understanding the platform.',
}

const faqs = [
  ['How do I find a business?', 'Open Services → Connect → Business Directory, or use Feni Brain with a natural-language question.'],
  ['Can I trust a verification badge?', 'A FeniX verification label means FeniX checked a defined set of information. It is not government approval or a guarantee of business quality.'],
  ['Does FeniX hold investment money?', 'The current investment workflow is an information and negotiation layer. A deal record is not the same as custody or settlement of funds.'],
  ['Can Feni Brain make a decision for me?', 'No. Brain answers should separate evidence, estimates and uncertainty and point to official or qualified sources for consequential decisions.'],
  ['How do I keep my account safe?', 'Never share your password, OTP, recovery code, service-role key or payment credential. Use the strongest available sign-in method on your device.'],
]

export default function HelpPage() {
  return (
    <main className="min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <Link href="/services" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-black/[.03] px-3.5 text-xs font-bold dark:bg-white/[.04]">
          <ArrowLeft size={16} /> Services
        </Link>

        <div className="mt-7 fenix-surface-strong rounded-[2rem] p-7 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-600/[.08] text-teal-700 dark:bg-teal-300/[.08] dark:text-teal-200">
              <ShieldCheck size={25} weight="duotone" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700 dark:text-teal-300">Help & Safety</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-.03em] sm:text-5xl">Use FeniX with confidence.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/48">
                A practical safety layer for the ecosystem. Important facts should always be checked against the current authoritative source before a consequential decision.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group rounded-2xl border border-black/[.06] bg-black/[.02] p-4 dark:border-white/[.07] dark:bg-white/[.02]">
                <summary className="cursor-pointer list-none text-sm font-bold marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    <span>{question}</span>
                    <ArrowRight size={16} className="transition-transform group-open:rotate-90" />
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-white/48">
                  {answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href="/guide?q=How%20do%20I%20use%20FeniX%20safely%3F" className="fenix-interactive group rounded-2xl border border-teal-600/[.12] bg-teal-600/[.05] p-5">
              <Brain size={23} className="text-teal-700 dark:text-teal-200" weight="duotone" />
              <h2 className="mt-4 text-base font-black">Ask Feni Brain</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/45">Ask a practical question and continue from a guided answer.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-200">Open Brain <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
            </Link>
            <Link href="/policy" className="fenix-interactive group rounded-2xl border border-black/[.06] bg-black/[.02] p-5 dark:border-white/[.07] dark:bg-white/[.02]">
              <Sparkle size={23} className="text-teal-700 dark:text-teal-200" weight="duotone" />
              <h2 className="mt-4 text-base font-black">Read FeniX Policy</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/45">See the trust, privacy, anti-scam and responsible-AI rules.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">Open Policy <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
