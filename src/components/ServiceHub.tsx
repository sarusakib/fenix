'use client'

import Link from 'next/link'
import { useState, type ElementType } from 'react'
import {
  ArrowRight, Brain, Briefcase, CaretDown, CheckCircle, MapPin, Rocket,
  ShieldCheck, ShoppingBag, Storefront, TrendUp, UserCircle, UsersThree, X, Newspaper,
} from '@phosphor-icons/react'
import {
  FENIX_SERVICE_GROUPS, getFeniXServiceGroup, type FeniXServiceGroup,
  type FeniXServiceIcon,
} from '../lib/fenixServices'
import { getServiceGuideline } from '../lib/serviceGuidelines'

const ICONS: Record<FeniXServiceIcon, ElementType> = {
  rocket: Rocket, storefront: Storefront, trend: TrendUp, brain: Brain, shop: ShoppingBag,
  briefcase: Briefcase, shield: ShieldCheck, account: UserCircle, map: MapPin, users: UsersThree, newspaper: Newspaper,
}

const VISIBLE_GROUP_IDS = ['build', 'connect', 'invest', 'shop', 'discover', 'news', 'trust']
const VISIBLE_GROUPS = FENIX_SERVICE_GROUPS.filter((group) => VISIBLE_GROUP_IDS.includes(group.id))
const COMPACT_GROUP_IDS = ['build', 'connect', 'invest', 'shop']

export default function ServiceHub({
  compact = false, showHeader = true, onNavigate,
}: { compact?: boolean; showHeader?: boolean; onNavigate?: () => void }) {
  const [activeId, setActiveId] = useState('build')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const activeGroup = getFeniXServiceGroup(activeId)
  const visibleGroups = compact && !moreOpen
    ? VISIBLE_GROUPS.filter((group) => COMPACT_GROUP_IDS.includes(group.id))
    : VISIBLE_GROUPS
  const hiddenGroupCount = Math.max(0, VISIBLE_GROUPS.length - COMPACT_GROUP_IDS.length)
  const liveServices = activeGroup.services.filter((item) => item.status === 'live' && item.href && item.id !== 'admin-trust')
  const selectedService = liveServices.find((item) => item.id === selectedId)
  const guide = selectedService ? getServiceGuideline(selectedService.id) : null

  return (
    <section aria-label="FeniX service navigation" className="w-full">
      {showHeader && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--fx-primary-strong)]">FeniX Network</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-4xl">Choose a path. Then choose an action.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fx-muted)]">একটি category tap করুন। তারপর tool tap করলে তার next step এখানেই খুলবে।</p>
          </div>
          <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[.13em] text-[var(--fx-muted)]">One layer at a time</div>
        </div>
      )}

      <div className="overflow-hidden rounded-[1.8rem] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
        <div className="border-b border-[var(--fx-border)] p-2.5 sm:p-3">
          <div role="tablist" aria-label="FeniX service categories" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {visibleGroups.map((group) => (
              <CategoryTab key={group.id} group={group} active={group.id === activeGroup.id} onClick={() => { setActiveId(group.id); setSelectedId(null) }} />
            ))}
            {compact && !moreOpen && hiddenGroupCount > 0 && (
              <button type="button" onClick={() => setMoreOpen(true)} aria-expanded="false" className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--fx-border)] bg-[var(--fx-bg)]/35 px-2.5 text-center text-[var(--fx-muted)] transition hover:bg-[var(--fx-bg)]">
                <CaretDown size={16} />
                <span className="min-w-0"><span className="block text-[11px] font-black">More</span><span className="block text-[9px] opacity-60">আরও {hiddenGroupCount}টি</span></span>
              </button>
            )}
          </div>
          {compact && moreOpen && (
            <button type="button" onClick={() => { setMoreOpen(false); if (!COMPACT_GROUP_IDS.includes(activeId)) { setActiveId('build'); setSelectedId(null) } }} className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-lg px-2.5 text-[10px] font-bold text-[var(--fx-muted)] hover:bg-[var(--fx-bg)]">
              <X size={14} /> Less
            </button>
          )}
        </div>

        <div role="tabpanel" aria-labelledby={'fenix-service-tab-' + activeGroup.id} className="p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[.34fr_1fr]">
            <div className="rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] p-5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--fx-bg)]">{(() => { const Icon = ICONS[activeGroup.icon]; return <Icon size={17} weight="duotone" /> })()}</span>
                {activeGroup.label}
              </div>
              <h3 className="mt-4 text-2xl font-black tracking-[-.04em] sm:text-3xl">{activeGroup.labelBn}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{activeGroup.description}</p>
              <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[var(--fx-muted)]"><CheckCircle size={16} className="text-[var(--fx-primary)]" /> {liveServices.length} available</div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div><p className="text-xs font-bold">Available now</p><p className="mt-0.5 text-[11px] text-[var(--fx-muted)]">{activeGroup.label} · {activeGroup.labelBn}</p></div>
                <span className="text-[9px] font-bold uppercase tracking-[.12em] text-[var(--fx-muted)]">Tap a tool to expand</span>
              </div>

              <div className={compact ? 'grid gap-2' : 'grid gap-2.5 sm:grid-cols-2'}>
                {liveServices.map((service) => {
                  const Icon = ICONS[service.icon]
                  const active = service.id === selectedId
                  return (
                    <button key={service.id} type="button" aria-expanded={active} onClick={() => setSelectedId(active ? null : service.id)} className={'fenix-interactive group flex min-h-16 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left ' + (active ? 'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)] bg-[var(--fx-bg)]/45')}>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Icon size={19} weight="duotone" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-[var(--fx-text)]">{service.label}</span>{service.tag && <span className="rounded-full bg-black/[.035] px-2 py-0.5 text-[9px] font-black uppercase tracking-[.1em] text-[var(--fx-muted)] dark:bg-white/[.05]">{service.tag}</span>}</span>
                        <span className="mt-1 block text-[11px] leading-5 text-[var(--fx-muted)]">{service.labelBn} · {service.description}</span>
                      </span>
                      <CaretDown size={16} className={'shrink-0 opacity-35 transition-transform ' + (active ? 'rotate-180' : '')} />
                    </button>
                  )
                })}
              </div>

              {selectedService && guide && (
                <div className="mt-3 rounded-3xl border border-[var(--fx-primary)]/20 bg-[var(--fx-primary-soft)] p-5 sm:p-6" role="region" aria-label={selectedService.label + ' guide'}>
                  <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Next step</p><h3 className="mt-1 text-xl font-black">{selectedService.label}</h3><p className="text-xs text-[var(--fx-muted)]">{selectedService.labelBn}</p></div><button type="button" onClick={() => setSelectedId(null)} aria-label="Close guide" className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)]"><X size={17}/></button></div>
                  <p className="mt-4 text-sm leading-6 text-[var(--fx-muted)]">{guide.introBn}</p>
                  <ol className="mt-4 grid gap-2 sm:grid-cols-2">{guide.stepsBn.slice(0, 4).map((step, index) => <li key={step} className="flex gap-2 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/65 p-3 text-xs font-semibold"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--fx-primary-soft)] text-[10px] font-black text-[var(--fx-primary-strong)]">{index + 1}</span><span className="pt-0.5">{step}</span></li>)}</ol>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row"><div className="flex-1 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/65 p-3 text-xs leading-5 text-[var(--fx-muted)]"><strong className="text-[var(--fx-text)]">মনে রাখবেন:</strong> {guide.noteBn}</div><Link href={selectedService.href!} onClick={() => onNavigate?.()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-bold text-white">শুরু করুন <ArrowRight size={16}/></Link></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!compact && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1"><p className="text-xs leading-5 text-[var(--fx-muted)]">Discover → Understand → Verify → Act</p><Link href="/help" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold">Need help <ArrowRight size={14} /></Link></div>}
    </section>
  )
}

function CategoryTab({ group, active, onClick }: { group: FeniXServiceGroup; active: boolean; onClick: () => void }) {
  const Icon = ICONS[group.icon]
  return <button type="button" role="tab" id={'fenix-service-tab-' + group.id} aria-selected={active} onClick={onClick} className={'flex min-h-12 items-center justify-center gap-2 rounded-xl border px-2.5 text-center transition ' + (active ? 'border-[var(--fx-primary)]/20 bg-[var(--fx-primary-soft)] text-[var(--fx-text)] shadow-sm' : 'border-[var(--fx-border)] bg-[var(--fx-bg)]/40 text-[var(--fx-muted)] hover:bg-[var(--fx-bg)]')}><Icon size={17} weight={active ? 'duotone' : 'regular'} /><span className="min-w-0"><span className="block truncate text-[11px] font-black">{group.label}</span><span className="block truncate text-[9px] opacity-60">{group.labelBn}</span></span></button>
}
