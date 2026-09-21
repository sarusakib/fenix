'use client'

import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'

export function GuidedFormProgress({ step, total, title, subtitle, onBack, onNext, nextLabel='Next', backLabel='Back', nextDisabled=false, submit=false }: {
 step:number; total:number; title:string; subtitle:string; onBack?:()=>void; onNext?:()=>void; nextLabel?:string; backLabel?:string; nextDisabled?:boolean; submit?:boolean
}) {
 return <div className="mb-6 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)]/60 p-4">
  <div className="flex items-center justify-between gap-4">
   <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Step {step} of {total}</p><p className="mt-1 text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{subtitle}</p></div>
   <div className="flex shrink-0 gap-1.5">{Array.from({length:total},(_,i)=><span key={i} className={'h-1.5 w-6 rounded-full '+(i<step?'bg-[var(--fx-primary-strong)]':'bg-black/10 dark:bg-white/10')}/>)}</div>
  </div>
  {(onBack||onNext)&&<div className="mt-4 flex gap-2"><button type="button" disabled={step<=1} onClick={onBack} className="min-h-11 flex-1 rounded-xl border border-[var(--fx-border)] text-xs font-bold disabled:opacity-35"><ArrowLeft size={15} className="mr-1 inline"/> {backLabel}</button>{step<total ? <button type="button" disabled={nextDisabled} onClick={onNext} className="min-h-11 flex-1 rounded-xl bg-[var(--fx-primary-strong)] text-xs font-bold text-white disabled:opacity-35">{nextLabel} <ArrowRight size={15} className="ml-1 inline"/></button>:<span className="min-h-11 flex-1 rounded-xl bg-black/[.025] px-3 py-3 text-center text-[10px] font-bold text-[var(--fx-muted)] dark:bg-white/[.03]">{submit?'Final step — ready to submit':'Final step'}</span>}</div>}
 </div>
}
