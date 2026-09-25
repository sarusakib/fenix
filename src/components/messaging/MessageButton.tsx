'use client'

import { ChatCircleText } from '@phosphor-icons/react'
import Link from 'next/link'
import type { MouseEvent } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

type MessageButtonProps = {
  userId: string
  name?: string
  label?: string
  className?: string
}

export default function MessageButton({
  userId,
  name = 'FeniX user',
  label = 'Message',
  className = 'inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white',
}: MessageButtonProps) {
  const [busy, setBusy] = useState(false)
  const href = '/messages?to=' + encodeURIComponent(userId) + '&name=' + encodeURIComponent(name)

  async function openChat(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    if (!userId || busy) return
    setBusy(true)

    const supabase = createClient()
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      window.location.assign('/login?next=' + encodeURIComponent(href))
      return
    }

    if (data.user.id === userId) {
      setBusy(false)
      return
    }

    window.location.assign(href)
  }

  return (
    <Link
      href={href}
      onClick={openChat}
      aria-label={'Message ' + name}
      aria-busy={busy}
      className={[className, busy ? 'pointer-events-none opacity-60' : ''].join(' ')}
    >
      <ChatCircleText size={16} weight="duotone" />
      {busy ? 'Opening…' : label}
    </Link>
  )
}
