'use client'

import { useEffect, useRef } from 'react'

export default function UltraAqueousBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let raf = 0
    let stopped = false
    let width = 1
    let height = 1
    let dpr = 1
    let phase = 0
    let previous = performance.now()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now: number) => {
      if (stopped) return

      const delta = Math.min(48, now - previous)
      previous = now
      phase += delta * 0.000035

      ctx.clearRect(0, 0, width, height)

      const wash = ctx.createRadialGradient(
        width * 0.48, height * 0.2, 0,
        width * 0.48, height * 0.62, Math.max(width, height) * 0.9,
      )
      wash.addColorStop(0, 'rgba(0, 146, 170, 0.10)')
      wash.addColorStop(0.42, 'rgba(0, 76, 112, 0.045)')
      wash.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = wash
      ctx.fillRect(0, 0, width, height)

      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      for (let layer = 0; layer < 7; layer += 1) {
        ctx.beginPath()

        const yBase = height * (0.22 + layer * 0.115)
        const amplitude = 8 + layer * 2.2
        const opacity = Math.max(0.009, 0.032 - layer * 0.0028)

        for (let x = -48; x <= width + 48; x += 18) {
          const nx = x / Math.max(1, width)
          const y =
            yBase +
            Math.sin(nx * 8 + phase * (0.65 + layer * 0.06)) * amplitude +
            Math.sin(nx * 19 - phase * 0.34 + layer) * (3 + layer * 0.5)

          if (x === -48) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.strokeStyle = `rgba(0, 210, 255, ${opacity})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      ctx.restore()

      const glowX = width * (0.52 + Math.sin(phase * 0.22) * 0.08)
      const glowY = height * (0.42 + Math.cos(phase * 0.18) * 0.07)
      const glow = ctx.createRadialGradient(
        glowX, glowY, 0,
        glowX, glowY, Math.min(width, height) * 0.58,
      )
      glow.addColorStop(0, 'rgba(0, 210, 255, 0.055)')
      glow.addColorStop(0.52, 'rgba(0, 102, 158, 0.018)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!reducedMotion) {
      raf = requestAnimationFrame(draw)
    }

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="fenix-ultra-aqueous" aria-hidden="true">
      <canvas ref={canvasRef} className="fenix-ultra-aqueous-canvas" />
      <div className="fenix-ultra-aqueous-vignette" />
    </div>
  )
}
