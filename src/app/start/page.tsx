'use client'

import Link from 'next/link'
import { ArrowLeft, Rocket, CheckCircle } from '@phosphor-icons/react'

import SiteBackground from '../../components/layout/SiteBackground'

const steps = [
  'Choose the business direction that fits you.',
  'Understand the local market and customer need.',
  'Find suppliers, partners and useful connections.',
  'Build a practical execution plan.',
]

export default function StartPage() {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#008080]/25 bg-[#008080]/10 text-[#72ddda]">
            <Rocket size={24} weight="duotone" />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#72ddda]">
            FeniX Start
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Start a Business
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
            FeniX helps you move from an idea to a practical local business
            journey.
          </p>

          <div className="mt-8 grid gap-3">
            {steps.map((step) => (
              <div
                key={step}
                className="flex gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
              >
                <CheckCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-[#72ddda]"
                  weight="fill"
                />
                <span className="text-sm leading-6 text-white/60">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
