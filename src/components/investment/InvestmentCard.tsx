'use client'

import Link from 'next/link'
import { ArrowRight, MapPin, ShieldCheck, TrendUp, Wallet } from '@phosphor-icons/react'
import type { InvestmentOpportunity } from '@/types/database'
import { formatBDT, opportunityTitle, progressPercent, riskLabel, statusLabel } from '@/lib/investment'

export default function InvestmentCard({ opportunity, compact = false }: { opportunity: InvestmentOpportunity; compact?: boolean }) {
  const progress = progressPercent(opportunity)

  return (
    <article className="group rounded-[1.75rem] border border-[#0b1736]/10 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[.045] dark:hover:bg-white/[.065]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[.12em]">
            <span className="rounded-full bg-[#d4b879]/[.12] px-2.5 py-1 text-[#8d6a14] dark:text-[#e8cf82]">{opportunity.category}</span>
            <span className="rounded-full bg-[#008080]/[.07] px-2.5 py-1 text-[#007171] dark:text-[#8ee6e0]">{statusLabel(opportunity.status)}</span>
          </div>
          <h3 className="mt-4 line-clamp-2 text-xl font-black tracking-tight">{opportunityTitle(opportunity)}</h3>
        </div>
        <TrendUp size={22} className="shrink-0 text-[#d4b879]" weight="duotone" />
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 opacity-60">
        {opportunity.description_en}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Info icon={<Wallet size={16} />} label="Target" value={formatBDT(opportunity.target_amount)} />
        <Info icon={<TrendUp size={16} />} label="Minimum" value={formatBDT(opportunity.min_investment)} />
        <Info icon={<MapPin size={16} />} label="Location" value={[opportunity.upazila, opportunity.district].filter(Boolean).join(', ')} />
        <Info icon={<ShieldCheck size={16} />} label="Risk" value={riskLabel(opportunity.risk_level)} />
      </div>

      {!compact && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="opacity-50">Funding progress</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.08]">
            <div className="h-full rounded-full bg-[#008080]" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="opacity-45">{formatBDT(opportunity.raised_amount)} raised</span>
            {opportunity.expected_return_pct != null && (
              <span className="font-semibold opacity-65">{Number(opportunity.expected_return_pct).toLocaleString('en-BD')}% disclosed expectation</span>
            )}
          </div>
        </div>
      )}

      <Link
        href={`/invest/${encodeURIComponent(opportunity.id)}`}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0b1736]/10 bg-black/[.025] text-sm font-bold transition hover:bg-black/[.05] dark:border-white/10 dark:bg-white/[.04] dark:hover:bg-white/[.075]"
      >
        View opportunity
        <ArrowRight size={17} />
      </Link>
    </article>
  )
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/[.025] p-3 dark:bg-white/[.03]">
      <div className="flex items-center gap-2 text-[11px] opacity-45">{icon}{label}</div>
      <div className="mt-1 truncate text-sm font-bold">{value || 'Feni'}</div>
    </div>
  )
}
