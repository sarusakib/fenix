'use client'

import Link from 'next/link'
import { ArrowLeft, Compass } from '@phosphor-icons/react'

export default function NotFound() {
  return (
    <main
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
          max-w-lg
          rounded-3xl
          border
          border-black/[0.08]
          bg-white/65
          p-8
          text-center
          shadow-2xl
          shadow-black/10
          backdrop-blur-xl
          dark:border-white/10
          dark:bg-white/[0.03]
          dark:shadow-black/30
          sm:p-10
        "
      >
        <div
          aria-hidden="true"
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            border
            border-[#008080]/20
            bg-[#008080]/10
            text-[#008080]
            dark:text-[#72ddda]
          "
        >
          <Compass
            size={30}
            weight="duotone"
          />
        </div>

        <p
          className="
            mt-6
            text-xs
            font-semibold
            uppercase
            tracking-[0.25em]
            text-[#008080]
            dark:text-[#72ddda]
          "
        >
          FeniX
        </p>

        <h1 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
          404
        </h1>

        <h2 className="mt-3 text-xl font-bold sm:text-2xl">
          Page not found
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55 dark:text-white/50">
          The page you are looking for does not exist
          or may have been moved.
        </p>

        <Link
          href="/"
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
            active:scale-[0.98]
          "
        >
          <ArrowLeft size={17} weight="bold" />
          Back to FeniX
        </Link>
      </section>
    </main>
  )
}
