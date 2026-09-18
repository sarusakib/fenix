'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function UltraIntro() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let start = performance.now()
    let stopped = false
    let width = 1
    let height = 1
    let dpr = 1

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      router.replace('/home')
    }

    const resize = () => {
      width = Math.max(1, window.innerWidth)
      height = Math.max(1, window.innerHeight)
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const render = (now: number) => {
      if (stopped) return
      const elapsed = now - start
      const progress = Math.min(1, elapsed / 3100)
      const ease = 1 - Math.pow(1 - progress, 3)

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#06080c'
      ctx.fillRect(0, 0, width, height)

      const cx = width * 0.5
      const cy = height * 0.5
      const radius = Math.min(width, height) * 0.24

      for (let i = 0; i < 9; i += 1) {
        ctx.beginPath()
        for (let x = -40; x <= width + 40; x += 20) {
          const nx = x / Math.max(1, width)
          const wave =
            Math.sin(nx * 7 + elapsed * 0.00035 + i * 0.7) * (10 + i) +
            Math.sin(nx * 15 - elapsed * 0.00018 + i) * 4
          const y = cy + (i - 4) * 34 + wave
          if (x === -40) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(0,210,255,${0.035 - i * 0.002})`
        ctx.stroke()
      }

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.8)
      glow.addColorStop(0, `rgba(0,210,255,${0.13 * ease})`)
      glow.addColorStop(0.45, `rgba(0,105,155,${0.035 * ease})`)
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      if (progress >= 0.72) {
        const exit = (progress - 0.72) / 0.28
        ctx.fillStyle = `rgba(6,8,12,${Math.min(1, exit * 1.2)})`
        ctx.fillRect(0, 0, width, height)
      }

      if (progress >= 1) {
        finish()
        return
      }

      raf = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timer = window.setTimeout(finish, 450)
      return () => {
        stopped = true
        window.clearTimeout(timer)
        window.removeEventListener('resize', resize)
      }
    }

    raf = requestAnimationFrame(render)

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [router])

  return (
    <main className="fixed inset-0 z-[9999] overflow-hidden bg-[#06080c] text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="absolute inset-0 grid place-items-center px-6 text-center">
        <div className="transition duration-700" style={{ animation: 'fxUltraIntroIn 1.1s cubic-bezier(.25,1,.5,1) both' }}>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[26px] border border-cyan-100/15 bg-white/[0.045] text-xl font-black shadow-[0_0_55px_rgba(0,210,255,0.10)]">
            FX
          </div>
          <div className="mt-6 text-4xl font-semibold tracking-[0.12em] sm:text-6xl">FeniX</div>
          <div className="mt-3 text-[10px] uppercase tracking-[0.32em] text-white/35">Build · Connect · Grow</div>
          <div className="mx-auto mt-8 h-px w-40 overflow-hidden bg-white/10">
            <div className="h-full w-1/2 animate-[fxUltraScan_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fxUltraIntroIn {
          from { opacity: 0; transform: scale(.94) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fxUltraScan {
          0% { transform: translateX(-180%); }
          50% { transform: translateX(80%); }
          100% { transform: translateX(240%); }
        }
      `}</style>
    </main>
  )
}
