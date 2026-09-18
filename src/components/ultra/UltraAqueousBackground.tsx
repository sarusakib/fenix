'use client'

import { useEffect, useRef } from 'react'

export default function UltraAqueousBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let frame = 0
    let raf = 0
    let width = 1
    let height = 1
    let dpr = 1
    let last = performance.now()
    let stopped = false

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const render = (now: number) => {
      if (stopped) return
      const dt = Math.min(40, now - last)
      last = now
      frame += dt * 0.000055

      ctx.clearRect(0, 0, width, height)

      const wash = ctx.createRadialGradient(
        width * 0.5,
        height * 0.18,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85,
      )
      wash.addColorStop(0, 'rgba(0, 150, 175, 0.10)')
      wash.addColorStop(0.45, 'rgba(0, 72, 110, 0.045)')
      wash.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = wash
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      ctx.globalCompositeOperation = 'screen'
      ctx.lineWidth = 1

      for (let layer = 0; layer < 5; layer += 1) {
        ctx.beginPath()
        const yBase = height * (0.28 + layer * 0.16)

        for (let x = -40; x <= width + 40; x += 18) {
          const nx = x / Math.max(1, width)
          const wave =
            Math.sin(nx * 8.0 + frame * (0.75 + layer * 0.08)) *
              (12 + layer * 3) +
            Math.sin(nx * 17.0 - frame * 0.42 + layer) *
              (4 + layer)

          const y = yBase + wave

          if (x === -40) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.strokeStyle = `rgba(0, 190, 220, ${0.026 - layer * 0.003})`
        ctx.stroke()
      }

      ctx.restore()

      const glowX = width * (0.52 + Math.sin(frame * 0.22) * 0.09)
      const glowY = height * (0.42 + Math.cos(frame * 0.17) * 0.08)
      const glow = ctx.createRadialGradient(
        glowX,
        glowY,
        0,
        glowX,
        glowY,
        Math.min(width, height) * 0.5,
      )
      glow.addColorStop(0, 'rgba(0, 210, 255, 0.055)')
      glow.addColorStop(0.55, 'rgba(0, 100, 160, 0.018)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      raf = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce) raf = requestAnimationFrame(render)

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#06080c]"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-90"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(0,210,255,0.07),transparent_42%),linear-gradient(180deg,#06080c_0%,#071018_48%,#06080c_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.42)_100%)]" />
    </div>
  )
}
