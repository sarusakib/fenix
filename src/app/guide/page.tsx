'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  MagnifyingGlass,
  Brain,
} from '@phosphor-icons/react'
import Link from 'next/link'

import { searchBusinesses } from '../actions/searchBusinesses'

type BusinessResult = {
  id: string
  name: string
  description: string
  similarity: number
}

export default function GuidePage() {
  const searchParams = useSearchParams()

  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery.slice(0, 120))
  const [results, setResults] = useState<BusinessResult[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const runSearch = async (value?: string) => {
    const nextQuery = (value ?? query).trim().slice(0, 120)

    if (!nextQuery) {
      setStatus('Search query লিখুন।')
      setResults([])
      return
    }

    if (nextQuery.length < 2) {
      setStatus('কমপক্ষে ২টি অক্ষর লিখুন।')
      setResults([])
      return
    }

    setLoading(true)
    setStatus('Feni Brain search করছে...')
    setResults([])

    try {
      const result = await searchBusinesses(nextQuery)

      if (!result.success) {
        setStatus(result.error || 'Search failed.')
        return
      }

      setResults(result.results || [])
      setStatus(
        result.results?.length
          ? `${result.results.length}টি business result পাওয়া গেছে।`
          : 'কোনো matching business পাওয়া যায়নি।',
      )
    } catch {
      setStatus('Search বর্তমানে unavailable.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery.trim()) {
      void runSearch(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#030506] text-white">
      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white/65 transition hover:bg-white/[0.07] hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <div className="mt-8 rounded-3xl border border-white/[0.08] bg-black/35 p-5 backdrop-blur-xl sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#008080]/25 bg-[#008080]/10 text-[#72ddda]">
                <Brain size={22} weight="duotone" />
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#72ddda]">
                  Feni Brain
                </div>
                <h1 className="mt-1 text-2xl font-black sm:text-4xl">
                  Business Guide & Search
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50">
              Ask a natural-language question and discover relevant business
              results from the Feni ecosystem.
            </p>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <div className="flex min-h-[54px] flex-1 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4">
                <MagnifyingGlass
                  size={20}
                  className="shrink-0 text-white/30"
                />

                <input
                  value={query}
                  maxLength={120}
                  onChange={(event) =>
                    setQuery(event.target.value.slice(0, 120))
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !loading) {
                      void runSearch()
                    }
                  }}
                  placeholder="যেমন: ফেনীতে কম দামে শাড়ি কোথায় পাব?"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => void runSearch()}
                className="min-h-[54px] rounded-2xl bg-[#008080] px-6 text-sm font-bold text-white transition hover:bg-[#079494] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Searching…' : 'Search'}
              </button>
            </div>

            {status && (
              <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm text-white/55">
                <CheckCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-[#72ddda]"
                />
                {status}
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-8 grid gap-4">
                {results.map((business) => (
                  <article
                    key={business.id}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          {business.name}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-white/45">
                          {business.description ||
                            'Business description unavailable.'}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-full border border-[#72ddda]/15 bg-[#72ddda]/[0.06] px-3 py-1.5 text-xs font-semibold text-[#72ddda]">
                        Match{' '}
                        {Number(business.similarity || 0).toFixed(3)}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
