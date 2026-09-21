'use client'

import { Check, ShareNetwork } from '@phosphor-icons/react'
import { useState } from 'react'

export default function ShareButton({
  url,
  label = 'Share',
}: {
  url?: string
  label?: string
}) {
  const [done, setDone] = useState(false)

  async function share() {
    const target = url || window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url: target })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(target)
      }
      setDone(true)
      window.setTimeout(() => setDone(false), 1800)
    } catch {
      // User cancellation is a normal browser flow.
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-xs font-bold"
    >
      {done ? <Check size={15} /> : <ShareNetwork size={15} />}
      {done ? 'Copied' : label}
    </button>
  )
}
