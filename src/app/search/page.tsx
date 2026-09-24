'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Buildings,
  MapPin,
  MagnifyingGlass,
  ShoppingBag,
  ShieldCheck,
  Storefront,
} from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import {
  getBusinessDisplayName,
  getBusinessPath,
  searchDirectoryBusinesses,
  type DirectoryBusiness,
} from '@/lib/directory'
import { createClient } from '@/utils/supabase/client'

type ProductResult = {
  id: string
  slug: string | null
  name_bn: string | null
  name_en: string | null
  price: number | null
  currency: string | null
  vendor_display_name: string | null
  vendor_is_verified: boolean | null
  shop_slug: string | null
}

type PlaceResult = {
  id: string
  level: string
  match_type: string
  name_bn: string
  name_en: string
  slug: string
}

function cleanQuery(value: string) {
  return value.trim().slice(0, 120)
}

export default function FenixSearchPage() {
  const params = useSearchParams()
  const initialQuery = cleanQuery(params.get('q') ?? '')

  const [query, setQuery] = useState(initialQuery)
  const [businesses, setBusinesses] = useState<DirectoryBusiness[]>([])
  const [products, setProducts] = useState<ProductResult[]>([])
  const [places, setPlaces] = useState<PlaceResult[]>([])
  const [loading, setLoading] = useState(Boolean(initialQuery))
  const [searched, setSearched] = useState(Boolean(initialQuery))
  const [error, setError] = useState('')

  async function runSearch(nextValue = query) {
    const value = cleanQuery(nextValue)
    if (value.length < 2) {
      setError('কমপক্ষে ২টি অক্ষর লিখুন।')
      setBusinesses([])
      setProducts([])
      setPlaces([])
      setSearched(false)
      return
    }

    setError('')
    setLoading(true)
    setSearched(true)

    const supabase = createClient()

    const [businessResult, productResult, placeResult] = await Promise.all([
      searchDirectoryBusinesses({ query: value, limit: 12 }),
      supabase
        .from('commerce_public_products')
        .select('id,slug,name_bn,name_en,price,currency,vendor_display_name,vendor_is_verified,shop_slug')
        .or(
          [
            'name_bn.ilike.%' + value.replace(/[%_\\]/g, (character) => '\\' + character) + '%',
            'name_en.ilike.%' + value.replace(/[%_\\]/g, (character) => '\\' + character) + '%',
            'vendor_display_name.ilike.%' + value.replace(/[%_\\]/g, (character) => '\\' + character) + '%',
          ].join(','),
        )
        .order('created_at', { ascending: false })
        .limit(12),
      supabase.rpc('search_feni_brain_locations', {
        query_text: value,
        match_count: 8,
      }),
    ])

    setBusinesses(businessResult.data ?? [])
    setProducts((productResult.data ?? []) as ProductResult[])
    setPlaces((placeResult.data ?? []) as PlaceResult[])

    if (businessResult.error && productResult.error && placeResult.error) {
      setError('Search is temporarily unavailable. Please try again.')
    }

    setLoading(false)
  }

  useEffect(() => {
    if (initialQuery) {
      void runSearch(initialQuery)
    }
    // Intentionally run only for the initial URL query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = cleanQuery(query)
    const target = value ? '/search?q=' + encodeURIComponent(value) : '/search'
    window.history.replaceState({}, '', target)
    void runSearch(value)
  }

  const total = businesses.length + products.length + places.length

  return (
    <main className="min-h-dvh bg-[var(--fx-bg)] text-[var(--fx-text)]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 text-sm font-bold"
        >
          <ArrowLeft size={17} /> Home
        </Link>

        <div className="mt-7 max-w-4xl">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">
            FeniX Search
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.04em] sm:text-6xl">
            Find what you need.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fx-muted)] sm:text-base">
            Business, product and local place discovery in one search. Bangla, English, Banglish and common local names can be used.
          </p>
        </div>

        <form onSubmit={submit} className="mt-7">
          <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-2 shadow-[0_18px_60px_rgba(15,23,42,.06)] focus-within:border-[var(--fx-primary)]/35">
            <MagnifyingGlass size={21} className="ml-2 shrink-0 text-[var(--fx-muted)]" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value.slice(0, 120))}
              placeholder="Business, product, place…"
              maxLength={120}
              className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-[var(--fx-muted)]"
              aria-label="Search FeniX"
            />
            <button
              type="submit"
              disabled={loading}
              className="min-h-11 rounded-xl bg-[var(--fx-primary-strong)] px-5 text-sm font-black text-white disabled:opacity-50"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200">
            {error}
          </p>
        )}

        {searched && !loading && (
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[var(--fx-muted)]">
            <span>{total ? total + ' matching result' + (total === 1 ? '' : 's') : 'No direct matches yet.'}</span>
            {query && (
              <Link
                href={'/guide?q=' + encodeURIComponent(query)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[var(--fx-primary-soft)] px-3 font-bold text-[var(--fx-primary-strong)]"
              >
                <Brain size={15} /> Ask Brain about “{query}”
              </Link>
            )}
            <Link
              href={query ? '/directory/map?q=' + encodeURIComponent(query) : '/directory/map'}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--fx-border)] px-3 font-bold"
            >
              <MapPin size={15} /> Open map
            </Link>
          </div>
        )}

        {loading ? (
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)]" />
            ))}
          </div>
        ) : searched ? (
          <div className="mt-7 grid gap-7 lg:grid-cols-3">
            <ResultSection
              icon={<Storefront size={20} />}
              title="Businesses"
              count={businesses.length}
            >
              {businesses.length ? businesses.map((business) => (
                <Link
                  key={business.id}
                  href={getBusinessPath(business)}
                  className="block rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4 transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
                      <Buildings size={19} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-black">{getBusinessDisplayName(business)}</h2>
                      <p className="mt-1 truncate text-xs text-[var(--fx-muted)]">
                        {[business.category, business.upazila || business.area].filter(Boolean).join(' · ') || 'Feni'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {business.verification_level && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--fx-primary-strong)]">
                        <ShieldCheck size={13} /> {business.verification_level}
                      </span>
                    )}
                    {business.location_verified && (
                      <span className="rounded-full bg-black/[.03] px-2.5 py-1 text-[10px] font-bold text-[var(--fx-muted)] dark:bg-white/[.04]">
                        Location reviewed
                      </span>
                    )}
                  </div>
                </Link>
              )) : <EmptyState text="No business matched this search." />}
            </ResultSection>

            <ResultSection
              icon={<ShoppingBag size={20} />}
              title="Products"
              count={products.length}
            >
              {products.length ? products.map((product) => (
                <Link
                  key={product.id}
                  href={product.slug ? '/product/' + encodeURIComponent(product.slug) : '/commerce'}
                  className="block rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4 transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
                      <ShoppingBag size={19} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-sm font-black">{product.name_bn || product.name_en || 'Product'}</h2>
                      <p className="mt-1 text-xs text-[var(--fx-muted)]">
                        {product.vendor_display_name || 'FeniX seller'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                    <span className="font-black">
                      {product.currency || 'BDT'} {Number(product.price || 0).toLocaleString('en-BD')}
                    </span>
                    {product.vendor_is_verified && (
                      <span className="inline-flex items-center gap-1 text-[var(--fx-primary-strong)]">
                        <ShieldCheck size={13} /> Verified seller
                      </span>
                    )}
                  </div>
                </Link>
              )) : <EmptyState text="No product matched this search." />}
            </ResultSection>

            <ResultSection
              icon={<MapPin size={20} />}
              title="Places"
              count={places.length}
            >
              {places.length ? places.map((place) => (
                <Link
                  key={place.id}
                  href={'/guide?q=' + encodeURIComponent(place.name_en || place.name_bn)}
                  className="block rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4 transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
                      <MapPin size={19} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-black">{place.name_bn || place.name_en}</h2>
                      <p className="mt-1 text-xs text-[var(--fx-muted)]">
                        {place.level} · {place.match_type.replaceAll('_', ' ')}
                      </p>
                    </div>
                  </div>
                </Link>
              )) : <EmptyState text="No matching Feni place found." />}
            </ResultSection>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <SearchTip icon={<Storefront size={22} />} title="Businesses" body="Find local businesses, suppliers and services." />
            <SearchTip icon={<ShoppingBag size={22} />} title="Products" body="Find published products from approved sellers." />
            <SearchTip icon={<MapPin size={22} />} title="Places" body="Search Feni locations using common local names." />
          </div>
        )}

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <InfoCard title="One search" body="Start with one query instead of guessing which module to open." />
          <InfoCard title="Trust stays visible" body="Public verification labels remain separate from search relevance." />
          <InfoCard title="Brain is next" body="When direct results are not enough, pass the same query to Feni Brain." />
        </section>
      </section>
    </main>
  )
}

function ResultSection({
  icon,
  title,
  count,
  children,
}: {
  icon: ReactNode
  title: string
  count: number
  children: ReactNode
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">{icon}</span>
          <h2 className="text-lg font-black">{title}</h2>
        </div>
        <span className="text-xs font-bold text-[var(--fx-muted)]">{count}</span>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

function SearchTip({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">{icon}</div>
      <h2 className="mt-4 font-black">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--fx-muted)]">{body}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-[var(--fx-border)] p-5 text-sm text-[var(--fx-muted)]">{text}</div>
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
      <p className="text-xs font-black uppercase tracking-[.12em] text-[var(--fx-primary-strong)]">{title}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--fx-muted)]">{body}</p>
    </div>
  )
}
