'use client'

import Link from 'next/link'
import { useEffect, useState, type ElementType } from 'react'
import {
  ArrowRight, Brain, Briefcase, CaretDown, CheckCircle, MapPin, Rocket,
  ShieldCheck, ShoppingBag, Storefront, TrendUp, UserCircle, UsersThree, X,
} from '@phosphor-icons/react'
import {
  FENIX_SERVICE_GROUPS, getFeniXServiceGroup, type FeniXServiceGroup,
  type FeniXServiceIcon,
} from '../lib/fenixServices'
import { getServiceGuideline, type FeniXServiceGuideline } from '../lib/serviceGuidelines'

const ICONS: Record<FeniXServiceIcon, ElementType> = {
  rocket: Rocket, storefront: Storefront, trend: TrendUp, brain: Brain, shop: ShoppingBag,
  briefcase: Briefcase, shield: ShieldCheck, account: UserCircle, map: MapPin, users: UsersThree,
}

export default function ServiceHub({
  compact = false, showHeader = true, onNavigate,
}: { compact?: boolean; showHeader?: boolean; onNavigate?: () => void }) {
  const [activeId, setActiveId] = useState('build')
  const [selectedService, setSelectedService] = useState<{id: string; label: string; labelBn: string; href?: string; guide: FeniXServiceGuideline} | null>(null)
  const activeGroup = getFeniXServiceGroup(activeId)
  const liveServices = activeGroup.services.filter((item) => item.status === 'live' && item.href)

  useEffect(() => {
    if (!selectedService) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedService(null)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedService])

  return (
    <section aria-label="FeniX service navigation" className="w-full">
      {showHeader && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--fx-primary-strong)]">FeniX Network</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-4xl">Everything connected. One layer at a time.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--fx-muted)]">প্রথমে একটি network path বাছুন, তারপর প্রয়োজনের পরের layer খুলুন।</p>
          </div>
          <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[.13em] text-[var(--fx-muted)]">One layer at a time</div>
        </div>
      )}

      <div className="overflow-hidden rounded-[1.8rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] shadow-[0_20px_70px_rgba(15,23,42,.06)]">
        <div className="border-b border-[var(--fx-border)] p-2.5 sm:p-3">
          <div role="tablist" aria-label="FeniX service categories" className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FENIX_SERVICE_GROUPS.map((group) => (
              <CategoryTab key={group.id} group={group} active={group.id === activeGroup.id} onClick={() => setActiveId(group.id)} />
            ))}
          </div>
        </div>

        <div role="tabpanel" id={`fenix-service-panel-${activeGroup.id}`} aria-labelledby={`fenix-service-tab-${activeGroup.id}`} className="p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[.34fr_1fr]">
            <div className="rounded-3xl bg-[linear-gradient(145deg,rgba(0,128,128,.10),rgba(184,138,43,.06))] p-5 dark:bg-[linear-gradient(145deg,rgba(99,216,212,.09),rgba(215,188,127,.045))]">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/70 dark:bg-white/[.06]">
                  {(() => { const Icon = ICONS[activeGroup.icon]; return <Icon size={17} weight="duotone" /> })()}
                </span>
                {activeGroup.label}
              </div>
              <h3 className="mt-5 text-2xl font-black tracking-[-.04em] sm:text-3xl">{activeGroup.labelBn}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--fx-muted)]">{activeGroup.description}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[var(--fx-muted)]">
                <CheckCircle size={16} className="text-[var(--fx-primary)]" /> {liveServices.length} live tools
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold">Available in this network</p>
                  <p className="mt-0.5 text-[11px] text-[var(--fx-muted)]">{activeGroup.label} · {activeGroup.labelBn}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[.12em] text-[var(--fx-muted)]">Tap → guide → continue</span>
              </div>

              <div className={compact ? 'grid gap-2' : 'grid gap-2.5 sm:grid-cols-2'}>
                {liveServices.map((service) => {
                  const Icon = ICONS[service.icon]
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setSelectedService((current) => current?.id === service.id ? null : { id: service.id, label: service.label, labelBn: service.labelBn, href: service.href, guide: getServiceGuideline(service.id) })} aria-expanded={selectedService?.id === service.id}
                      className="fenix-interactive group flex min-h-16 items-center gap-3 rounded-2xl border border-[var(--fx-border)] bg-white/[.5] px-3.5 py-3 text-left dark:bg-white/[.025]"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Icon size={19} weight="duotone" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-[var(--fx-text)]">{service.label}</span>
                          {service.tag && <span className="rounded-full bg-black/[.035] px-2 py-0.5 text-[9px] font-black uppercase tracking-[.1em] text-[var(--fx-muted)] dark:bg-white/[.05]">{service.tag}</span>}
                        </span>
                        <span className="mt-1 block text-[11px] leading-5 text-[var(--fx-muted)]">{service.labelBn} · {service.description}</span>
                      </span>
                      <ArrowRight size={17} className="shrink-0 opacity-30 transition-transform group-hover:translate-x-1 group-hover:opacity-75" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-xs leading-5 text-[var(--fx-muted)]">Discover → Understand → Verify → Act</p>
          <Link href="/help" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold">Need help <ArrowRight size={14} /></Link>
        </div>
      )}

      {selectedService && (
        <div className="mt-4 overflow-hidden rounded-3xl border border-[var(--fx-primary)]/15 bg-[var(--fx-primary-soft)] p-4 sm:p-5" aria-live="polite">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Next layer</p>
              <h3 className="mt-1 text-xl font-black">{selectedService.label}</h3>
              <p className="text-xs text-[var(--fx-muted)]">{selectedService.labelBn}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--fx-text)]">{selectedService.guide.introBn}</p>
            </div>
            <button type="button" onClick={() => setSelectedService(null)} className="min-h-10 shrink-0 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-xs font-bold">Close</button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {selectedService.guide.stepsBn.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--fx-primary-soft)] text-xs font-black text-[var(--fx-primary-strong)]">{index + 1}</span>
                <span className="pt-0.5 text-xs font-semibold leading-5">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[var(--fx-muted)]"><strong className="text-[var(--fx-text)]">মনে রাখবেন:</strong> {selectedService.guide.noteBn}</p>
            {selectedService.href && <Link href={selectedService.href} onClick={() => onNavigate?.()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white">শুরু করুন <ArrowRight size={16}/></Link>}
          </div>
        </div>
      )}


    </section>
  )
}

function CategoryTab({ group, active, onClick }: { group: FeniXServiceGroup; active: boolean; onClick: () => void }) {
  const Icon = ICONS[group.icon]
  return (
    <button type="button" role="tab" id={`fenix-service-tab-${group.id}`} aria-selected={active} aria-controls={`fenix-service-panel-${group.id}`} onClick={onClick}
      className={'flex min-h-12 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-left transition ' + (active ? 'border-[var(--fx-primary)]/20 bg-[var(--fx-primary-soft)] text-[var(--fx-text)] shadow-sm' : 'border-transparent text-[var(--fx-muted)] hover:border-[var(--fx-border)] hover:bg-black/[.02] dark:hover:bg-white/[.035]')}>
      <Icon size={18} weight={active ? 'duotone' : 'regular'} />
      <span><span className="block text-xs font-black">{group.label}</span><span className="block text-[9px] opacity-60">{group.labelBn}</span></span>
      <CaretDown size={13} className={active ? 'rotate-180 opacity-50' : 'opacity-20'} />
    </button>
  )
}