'use client'

import Link from 'next/link'
import { ArrowLeft, TrendUp, CheckCircle } from '@phosphor-icons/react'

import SiteBackground from '../../components/layout/SiteBackground'

const items = [
  'Explore sectors with local demand.',
  'Understand the opportunity before committing capital.',
  'Connect ideas with local businesses and operators.',
  'Build an evidence-based investment view.',
]

export default function InvestPage() {
  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#030506] text-white">
      <SiteBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/65 transition hover:bg-white/[0.07] hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <div className="mt-10 rounded-3xl border border-white/[0.08] bg-black/35 p-6 backdrop-blur-xl sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4b879]/20 bg-[#d4b879]/[0.06] text-[#d4b879]">
            <TrendUp size={24} weight="duotone" />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#d4b879]">
            FeniX Investment
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Invest in Feni
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
            A future investment layer for discovering local ideas, businesses
            and growth opportunities.
          </p>

          <div className="mt-8 grid gap-3">
            {items.map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
              >
                <CheckCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-[#d4b879]"
                  weight="fill"
                />
                <span className="text-sm leading-6 text-white/60">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
