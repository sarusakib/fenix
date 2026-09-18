'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calculator, Info, TrendUp } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { formatBDT, moneyInput } from '@/lib/investment'

export default function InvestmentCalculatorPage() {
  const [amount, setAmount] = useState('1000000')
  const [annualReturn, setAnnualReturn] = useState('12')
  const [years, setYears] = useState('3')

  const scenarios = useMemo(() => {
    const principal = Math.min(10_000_000_000, Math.max(0, Number(amount) || 0))
    const rate = Math.min(2, Math.max(-1, Number(annualReturn) || 0) / 100)
    const term = Math.min(50, Math.max(1, Number(years) || 1))

    return [
      { label: 'Conservative example', rate: rate * 0.5 },
      { label: 'Base example', rate },
      { label: 'Higher example', rate: Math.min(2, Math.max(-1, rate * 1.5)) },
    ].map((scenario) => {
      const ending = principal * Math.pow(1 + scenario.rate, term)
      return {
        ...scenario,
        ending: Math.max(0, ending),
        change: ending - principal,
      }
    })
  }, [amount, annualReturn, years])

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-4 text-sm dark:border-white/10 dark:bg-white/[.04]">
          <ArrowLeft size={17} /> Investment
        </Link>

        <div className="mt-7 rounded-[2rem] border border-[#d4b879]/25 bg-white/80 p-6 dark:border-[#d4b879]/20 dark:bg-white/[.045] sm:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4b879]/[.13] text-[#9d7716] dark:text-[#e8cf82]"><Calculator size={25} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Scenario tool</p>
              <h1 className="mt-1 text-3xl font-black sm:text-4xl">Investment calculator</h1>
              <p className="mt-2 text-sm leading-6 opacity-55">Use your own assumptions to see illustrative compounding scenarios. These calculations are not investment advice, forecasts, or guarantees.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Field label="Starting amount (BDT)" value={amount} onChange={(v) => setAmount(moneyInput(v))} />
            <Field label="Assumed annual return (%)" value={annualReturn} onChange={(v) => setAnnualReturn(moneyInput(v))} />
            <Field label="Term (years)" value={years} onChange={(v) => setYears(moneyInput(v))} />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {scenarios.map((scenario) => (
              <article key={scenario.label} className="rounded-2xl border border-[#0b1736]/10 bg-black/[.02] p-5 dark:border-white/10 dark:bg-white/[.025]">
                <p className="text-xs font-bold uppercase tracking-[.12em] opacity-50">{scenario.label}</p>
                <p className="mt-4 text-2xl font-black">{formatBDT(scenario.ending)}</p>
                <p className={`mt-2 text-sm font-semibold ${scenario.change >= 0 ? 'text-[#007171] dark:text-[#8ee6e0]' : 'text-red-600'}`}>
                  {scenario.change >= 0 ? '+' : ''}{formatBDT(scenario.change)} example change
                </p>
              </article>
            ))}
          </div>

          <div className="mt-7 flex gap-3 rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-5 text-sm leading-6">
            <Info size={20} className="mt-0.5 shrink-0 text-[#008080]" />
            <p>This tool uses mathematical assumptions only. Real investments can lose principal, returns can differ materially, and timing/cash-flow structures can change the result.</p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/invest/profile" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">Create investor profile <ArrowRightIcon /></Link>
            <Link href="/invest" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#0b1736]/10 px-4 text-sm font-bold dark:border-white/10"><TrendUp size={17} /> Browse opportunities</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold opacity-60">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} inputMode="decimal" className="h-12 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-3 text-sm outline-none focus:border-[#008080]/40 dark:border-white/10" /></label>
}

function ArrowRightIcon() {
  return <span aria-hidden="true">→</span>
}
