'use client'

import { useEffect, useState } from 'react'

type Props = { onComplete: () => void }

export default function FenixIntro({ onComplete }: Props) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = reduced ? 650 : 1550

    const exitTimer = window.setTimeout(() => setLeaving(true), Math.max(0, duration - 420))
    const completeTimer = window.setTimeout(onComplete, duration)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <main
      aria-label="FeniX introduction"
      className={`fixed inset-0 z-[999999] grid h-[100dvh] w-full place-items-center overflow-hidden bg-[#030506] text-white transition-opacity duration-500 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[min(72vw,720px)] w-[min(72vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-300/[0.10] shadow-[0_0_120px_rgba(0,128,128,.10)]" />
        <div className="absolute left-1/2 top-1/2 h-[min(42vw,420px)] w-[min(42vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-300/[0.16] shadow-[inset_0_0_70px_rgba(0,128,128,.07),0_0_70px_rgba(0,128,128,.08)]" />
        <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/[0.08] blur-3xl" />
        <span className="absolute left-1/2 top-[20%] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-teal-200 shadow-[0_0_18px_rgba(86,209,206,.9)] animate-[fenixOrbit_2.2s_linear_infinite]" />
        <span className="absolute left-[22%] top-1/2 h-1 w-1 rounded-full bg-amber-200 shadow-[0_0_14px_rgba(212,184,121,.8)] animate-[fenixFloat_2.8s_ease-in-out_infinite]" />
        <span className="absolute right-[22%] top-[38%] h-1 w-1 rounded-full bg-teal-200 shadow-[0_0_14px_rgba(86,209,206,.8)] animate-[fenixFloat_2.4s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="grid h-24 w-24 place-items-center rounded-[2rem] border border-white/15 bg-white/[0.045] shadow-[0_0_55px_rgba(0,128,128,.12)] backdrop-blur-xl animate-[fenixMark_.75s_cubic-bezier(.22,1,.36,1)_both] sm:h-28 sm:w-28">
          <span className="text-4xl font-black tracking-[-.10em] text-white sm:text-5xl">F<span className="text-teal-300">X</span></span>
        </div>

        <div className="mt-7 overflow-hidden">
          <div className="animate-[fenixWord_.8s_cubic-bezier(.22,1,.36,1)_both] text-4xl font-bold tracking-[-.06em] sm:text-6xl">
            Feni<span className="text-teal-300">X</span>
          </div>
        </div>

        <p className="mt-4 animate-[fenixFade_.9s ease-out_.18s_both] text-[10px] font-semibold uppercase tracking-[.30em] text-white/45 sm:text-xs">
          Build · Connect · Grow
        </p>

        <div className="mt-9 h-px w-36 overflow-hidden bg-white/[0.08] sm:w-48">
          <div className="h-full w-1/2 animate-[fenixProgress_1.25s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-teal-300 to-amber-200" />
        </div>
      </div>

      <style jsx>{`
        @keyframes fenixMark {
          from { opacity: 0; transform: scale(.72) rotate(-7deg); filter: blur(8px); }
          to { opacity: 1; transform: scale(1) rotate(0); filter: blur(0); }
        }
        @keyframes fenixWord {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fenixFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fenixProgress {
          0% { transform: translateX(-150%); }
          50% { transform: translateX(120%); }
          100% { transform: translateX(300%); }
        }
        @keyframes fenixFloat {
          0%,100% { transform: translateY(-8px); opacity: .45; }
          50% { transform: translateY(10px); opacity: 1; }
        }
        @keyframes fenixOrbit {
          from { transform: translateX(-50%) rotate(0deg) translateY(-2px); }
          to { transform: translateX(-50%) rotate(360deg) translateY(-2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </main>
  )
}
