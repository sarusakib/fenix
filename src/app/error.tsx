'use client'

import { useEffect } from 'react'
import { ArrowClockwise, WarningCircle } from '@phosphor-icons/react'

type ErrorPageProps = {
  error: Error & {
    digest?: string
  }
  reset: () => void
}

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    // Keep production logs minimal.
    // Next.js/Vercel can associate errors using the digest.
    if (process.env.NODE_ENV === 'development') {
      console.error('[FeniX] Application error:', error)
    }
  }, [error])

  return (
    <main
      role="alert"
      className="flex min-h-[100dvh] items-center justify-center px-5 py-12"
    >
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-center shadow-2xl backdrop-blur-xl sm:p-9">
        <div
          aria-hidden="true"
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]"
        >
          <WarningCircle
            size={28}
            weight="duotone"
            className="text-white"
          />
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-white/40">
          FeniX
        </p>

        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/55">
          The page could not be loaded correctly. Please try again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98]"
        >
          <ArrowClockwise size={17} weight="bold" />
          Try again
        </button>
      </section>
    </main>
  )
}
