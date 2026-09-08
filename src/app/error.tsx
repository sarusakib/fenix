'use client'

import { useEffect } from 'react'
import {
  ArrowClockwise,
  WarningCircle,
} from '@phosphor-icons/react'

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
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '[FeniX] Application error:',
        error,
      )
    }
  }, [error])

  return (
    <main
      role="alert"
      className="
        flex
        min-h-[100dvh]
        items-center
        justify-center
        bg-[#eef3f5]
        px-5
        py-12
        text-[#111827]
        dark:bg-[#030506]
        dark:text-white
      "
    >
      <section
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-black/[0.08]
          bg-white/65
          p-7
          text-center
          shadow-2xl
          shadow-black/10
          backdrop-blur-xl
          dark:border-white/10
          dark:bg-white/[0.03]
          dark:shadow-black/30
          sm:p-9
        "
      >
        <div
          aria-hidden="true"
          className="
            mx-auto
            mb-5
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-black/10
            bg-black/[0.035]
            dark:border-white/10
            dark:bg-white/[0.05]
          "
        >
          <WarningCircle
            size={28}
            weight="duotone"
            className="text-[#008080] dark:text-[#72ddda]"
          />
        </div>

        <p
          className="
            mb-2
            text-xs
            font-medium
            uppercase
            tracking-[0.24em]
            text-black/40
            dark:text-white/40
          "
        >
          FeniX
        </p>

        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-black/55 dark:text-white/55">
          The page could not be loaded correctly.
          Please try again.
        </p>

        <button
          type="button"
          onClick={reset}
          className="
            mt-7
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-full
            bg-[#008080]
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#079494]
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#008080]
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#eef3f5]
            active:scale-[0.98]
            dark:focus-visible:ring-offset-[#030506]
          "
        >
          <ArrowClockwise
            size={17}
            weight="bold"
          />
          Try again
        </button>
      </section>
    </main>
  )
}
