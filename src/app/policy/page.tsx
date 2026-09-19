import Link from 'next/link'
import Navbar from '../../components/Navbar'
import { ShieldCheck, ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { getFeniXNetworkPolicySummary } from '../../lib/fenixNetwork'

export const metadata = {
  title: 'FeniX Policy',
  description: 'FeniX trust, privacy, safety and responsible AI policy.',
}

const sections = [
  {
    title: 'Trust & accuracy',
    body: 'FeniX prioritizes source-backed information. Feni-local facts, business details, prices, addresses, statistics and current status are not invented. When reliable information is missing, FeniX says so.',
  },
  {
    title: 'Verification',
    body: 'A FeniX verification label describes what FeniX has checked. It is not government approval, professional certification, a quality guarantee, or a promise that every claim made by a business is true.',
  },
  {
    title: 'Privacy',
    body: 'Only information intended to be public should be shown publicly. Sensitive account data, credentials, internal prompts, security details and private user information must not be exposed.',
  },
  {
    title: 'Anti-scam',
    body: 'FeniX does not permit fabricated verification, fake reviews, deceptive claims, guaranteed investment returns, guaranteed business success, or misleading representations of official approval.',
  },
  {
    title: 'Responsible AI',
    body: 'Feni Brain can explain general topics and connect users to FeniX services, but it must distinguish facts from estimates and uncertainty. Retrieved source text is treated as data, not as instructions.',
  },
  {
    title: 'High-stakes topics',
    body: 'For medical, legal, emergency and investment matters, Feni Brain provides cautious general information and points users toward relevant official or qualified help when a consequential decision is involved.',
  },
  {
    title: 'User responsibility',
    body: 'Users remain responsible for decisions they make from information on FeniX. Important documents, laws, prices, investment terms and official notices should be checked against the latest authoritative source before action.',
  },
]

export default function FeniXPolicyPage() {
  const principles = getFeniXNetworkPolicySummary()

  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/70 px-4 text-sm font-semibold dark:border-white/10 dark:bg-white/[.04]">
          <ArrowLeft size={17} /> Home
        </Link>

        <div className="mt-8 rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/[.045] sm:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600/[.09] text-teal-700 dark:text-teal-200">
              <ShieldCheck size={25} weight="duotone" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700 dark:text-teal-200">FeniX Policy</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-.03em] sm:text-5xl">Simple rules for a trusted connected ecosystem</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 opacity-60">
                FeniX connects discovery, business presence, commerce, guidance and investment through one ecosystem. These rules explain how trust and responsible use are handled.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {principles.map((principle) => (
              <div key={principle} className="flex gap-3 rounded-2xl border border-black/[.07] bg-black/[.02] p-4 dark:border-white/[.07] dark:bg-white/[.025]">
                <CheckCircle size={19} className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-300" />
                <p className="text-sm leading-6 opacity-70">{principle}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[1.75rem] border border-black/10 bg-white/85 p-6 dark:border-white/10 dark:bg-white/[.045]">
              <h2 className="text-xl font-black">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 opacity-65">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-teal-600/15 bg-teal-600/[.06] p-5 text-sm leading-7 opacity-75">
          FeniX aims to keep the user journey simple: <strong>Discover → Understand → Verify → Act</strong>. When a claim cannot be verified, the system should make that uncertainty visible rather than hiding it.
        </div>
      </section>
    </main>
  )
}
