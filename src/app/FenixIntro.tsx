'use client'

import { useEffect, useState } from 'react'

type Props = {
  onComplete: () => void
}

export default function FenixIntro({ onComplete }: Props) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const duration = reduced ? 500 : 1250

    const exitTimer = window.setTimeout(
      () => setLeaving(true),
      Math.max(0, duration - 340),
    )
    const completeTimer = window.setTimeout(onComplete, duration)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <main
      aria-label="FeniX introduction"
      className={
        'fixed inset-0 z-[999999] grid min-h-[100dvh] w-full place-items-center overflow-hidden bg-[#030506] text-white transition-opacity duration-[340ms] ' +
        (leaving ? 'opacity-0' : 'opacity-100')
      }
    >
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[min(74vw,700px)] w-[min(74vw,700px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-300/[0.09]" />
        <div className="absolute left-1/2 top-1/2 h-[min(44vw,420px)] w-[min(44vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-300/[0.14] shadow-[0_0_70px_rgba(0,128,128,.08)]" />
        <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.08] blur-3xl" />
        <span className="absolute left-1/2 top-[20%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-teal-200 shadow-[0_0_18px_rgba(99,216,212,.9)] animate-[fenixOrbit_2s_linear_infinite]" />
        <span className="absolute left-[22%] top-1/2 h-1 w-1 rounded-full bg-amber-200 shadow-[0_0_14px_rgba(215,188,127,.8)] animate-[fenixFloat_2.6s_ease-in-out_infinite]" />
        <span className="absolute right-[22%] top-[38%] h-1 w-1 rounded-full bg-teal-200 shadow-[0_0_14px_rgba(99,216,212,.8)] animate-[fenixFloatReverse_2.2s_ease-in-out_infinite]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="grid h-24 w-24 place-items-center rounded-[2rem] border border-white/15 bg-white/[0.045] shadow-[0_0_55px_rgba(0,128,128,.12)] backdrop-blur-xl animate-[fenixMark_.7s_cubic-bezier(.22,1,.36,1)_both] sm:h-28 sm:w-28">
          <span className="text-4xl font-black tracking-[-.10em] sm:text-5xl">
            F<span className="text-teal-300">X</span>
          </span>
        </div>

        <div className="mt-6 overflow-hidden">
          <div className="animate-[fenixWord_.72s_cubic-bezier(.22,1,.36,1)_both] text-4xl font-bold tracking-[-.06em] sm:text-6xl">
            Feni<span className="text-teal-300">X</span>
          </div>
        </div>

        <p className="mt-3 animate-[fenixFade_.8s_ease-out_.12s_both] text-[10px] font-semibold uppercase tracking-[.30em] text-white/45 sm:text-xs">
          Build · Connect · Grow
        </p>

        <div className="mt-8 h-px w-36 overflow-hidden bg-white/[0.08] sm:w-48">
          <div className="h-full w-1/2 animate-[fenixProgress_1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-teal-300 to-amber-200" />
        </div>
      </div>
    </main>
  )
}
