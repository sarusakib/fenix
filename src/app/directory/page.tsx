'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Buildings,
  MagnifyingGlass,
  Storefront,
} from '@phosphor-icons/react'

import SiteBackground from '../../components/layout/SiteBackground'

export default function DirectoryPage() {
  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#030506] text-white">
      <SiteBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/65 transition hover:bg-white/[0.07] hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <div className="mt-10 rounded-3xl border border-white/[0.08] bg-black/35 p-6 backdrop-blur-xl sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#008080]/25 bg-[#008080]/10 text-[#72ddda]">
            <Storefront size={24} weight="duotone" />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#72ddda]">
            FeniX Directory
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Business Directory
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
            Find businesses, suppliers and future commercial connections in
            one searchable space.
          </p>

          <Link
            href="/guide"
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#008080] px-5 text-sm font-bold text-white transition hover:bg-[#079494]"
          >
            <MagnifyingGlass size={18} />
            Search Businesses
          </Link>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <Buildings size={22} className="text-[#72ddda]" />
              <h2 className="mt-4 font-bold">Local Businesses</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Discover businesses across different sectors.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <Storefront size={22} className="text-[#d4b879]" />
              <h2 className="mt-4 font-bold">Suppliers</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Search for useful supplier and commercial connections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
