'use client'

import { useEffect } from 'react'

export default function MarkNewsSeen({ id }: { id: string }) {
  useEffect(() => {
    void fetch('/api/news/seen', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
      keepalive: true,
    }).catch(() => undefined)
  }, [id])

  return null
}
