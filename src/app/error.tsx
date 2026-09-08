'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('FeniX application error:', error)
  }, [error])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#030506] px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 text-center backdrop-blur-xl">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#72ddda]">
          FeniX
        </div>

        <h1 className="mt-4 text-2xl font-black">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/45">
          Something unexpected happened. Please try again.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-7 min-h-11 rounded-xl bg-[#008080] px-5 text-sm font-bold text-white transition hover:bg-[#079494]"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
