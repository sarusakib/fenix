'use client'

import Link from 'next/link'
import { useState, type ElementType } from 'react'
import {
  ArrowRight,
  Brain,
  Briefcase,
  CaretDown,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Storefront,
  TrendUp,
  UserCircle,
} from '@phosphor-icons/react'
import {
  FENIX_SERVICE_GROUPS,
  type FeniXServiceGroup,
  type FeniXServiceIcon,
} from '../lib/fenixServices'

const ICONS: Record<FeniXServiceIcon, ElementType> = {
  rocket: Rocket,
  storefront: Storefront,
  trend: TrendUp,
  brain: Brain,
  shop: ShoppingBag,
  briefcase: Briefcase,
  shield: ShieldCheck,
  account: UserCircle,
}

export default function ServiceHub({
  compact = false,
  showHeader = true,
  onNavigate,
}: {
  compact?: boolean
  showHeader?: boolean
  onNavigate?: () => void
}) {
  const [activeId, setActiveId] = useState<string>(FENIX_SERVICE_GROUPS[0]?.id || 'build')
  const activeGroup =
    FENIX_SERVICE_GROUPS.find((group) => group.id === activeId) ||
    FENIX_SERVICE_GROUPS[0]

  if (!activeGroup) return null

  if (compact) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {FENIX_SERVICE_GROUPS.map((group) => (
            <CategoryButton
              key={group.id}
              group={group}
              active={group.id === activeGroup.id}
              onClick={() => setActiveId(group.id)}
            />
          ))}
        </div>

        <div className="fenix-surface mt-3 rounded-3xl p-3">
          <ServiceList
            group={activeGroup}
            compact
            onNavigate={onNavigate}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {showHeader && (
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-700 dark:text-teal-300">
              FeniX Services
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-.03em] text-[#0b1736] sm:text-5xl dark:text-white">
              Choose your next move.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/48">
              Tap a path first. The relevant tools appear next—no giant menu, no hunting through pages.
            </p>
          </div>
          <div className="rounded-2xl bg-black/[.025] px-4 py-3 text-xs leading-5 text-slate-500 dark:bg-white/[.035] dark:text-white/40">
            One account · one search · one ecosystem
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {FENIX_SERVICE_GROUPS.map((group) => (
            <CategoryButton
              key={group.id}
              group={group}
              active={group.id === activeGroup.id}
              onClick={() => setActiveId(group.id)}
            />
          ))}
        </div>

        <div className="fenix-surface min-h-[320px] rounded-[2rem] p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-black/[.06] pb-4 dark:border-white/[.07]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-teal-700 dark:text-teal-300">
                {activeGroup.label}
              </p>
              <h2 className="mt-1 text-xl font-black text-[#0b1736] sm:text-2xl dark:text-white">
                {activeGroup.labelBn}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-white/45">
                {activeGroup.description}
              </p>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-600/[.08] text-teal-700 dark:bg-teal-300/[.08] dark:text-teal-200">
              {(() => {
                const Icon = ICONS[activeGroup.icon]
                return <Icon size={22} weight="duotone" />
              })()}
            </div>
          </div>

          <ServiceList
            group={activeGroup}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  )
}

function CategoryButton({
  group,
  active,
  onClick,
}: {
  group: FeniXServiceGroup
  active: boolean
  onClick: () => void
}) {
  const Icon = ICONS[group.icon]
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'group flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left transition ' +
        (active
          ? 'border-teal-600/[.18] bg-teal-600/[.075] text-[#0b1736] shadow-sm dark:border-teal-300/[.18] dark:bg-teal-300/[.07] dark:text-white'
          : 'border-black/[.06] bg-white/35 text-slate-600 hover:bg-white/70 dark:border-white/[.07] dark:bg-white/[.02] dark:text-white/55 dark:hover:bg-white/[.05]')
      }
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/[.025] text-teal-700 dark:bg-white/[.04] dark:text-teal-200">
        <Icon size={20} weight="duotone" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{group.label}</span>
        <span className="mt-0.5 block truncate text-[11px] opacity-50">{group.labelBn}</span>
      </span>
      <CaretDown
        size={16}
        className={
          'shrink-0 transition-transform ' +
          (active ? 'rotate-180 opacity-70' : 'opacity-25')
        }
      />
    </button>
  )
}

function ServiceList({
  group,
  compact = false,
  onNavigate,
}: {
  group: FeniXServiceGroup
  compact?: boolean
  onNavigate?: () => void
}) {
  return (
    <div className={compact ? 'grid gap-2 p-1' : 'mt-5 grid gap-3 sm:grid-cols-2'}>
      {group.services.map((service) => {
        const Icon = ICONS[service.icon]
        const inner = (
          <>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-black/[.025] text-teal-700 dark:bg-white/[.04] dark:text-teal-200">
              <Icon size={19} weight="duotone" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[#0b1736] dark:text-white">{service.label}</span>
                {service.tag && (
                  <span className="rounded-full bg-black/[.035] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.12em] text-slate-400 dark:bg-white/[.05] dark:text-white/35">
                    {service.tag}
                  </span>
                )}
              </span>
              <span className="mt-1 block text-[11px] leading-5 text-slate-500 dark:text-white/40">
                {service.labelBn} · {service.description}
              </span>
            </span>
            {service.status === 'live' ? (
              <ArrowRight size={17} className="shrink-0 opacity-25 transition group-hover:translate-x-1 group-hover:opacity-70" />
            ) : (
              <span className="shrink-0 rounded-full bg-amber-500/[.08] px-2 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-amber-700 dark:text-amber-200">
                Soon
              </span>
            )}
          </>
        )

        if (service.status === 'live' && service.href) {
          return (
            <Link
              key={service.id}
              href={service.href}
              onClick={onNavigate}
              className="fenix-interactive group flex min-h-14 items-center gap-3 rounded-2xl border border-black/[.06] bg-white/45 px-3.5 py-3 dark:border-white/[.07] dark:bg-white/[.02]"
            >
              {inner}
            </Link>
          )
        }

        return (
          <button
            key={service.id}
            type="button"
            disabled
            aria-disabled="true"
            className="flex min-h-14 cursor-not-allowed items-center gap-3 rounded-2xl border border-black/[.05] bg-black/[.018] px-3.5 py-3 opacity-65 dark:border-white/[.06] dark:bg-white/[.02]"
          >
            {inner}
          </button>
        )
      })}
    </div>
  )
}
