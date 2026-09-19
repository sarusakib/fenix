'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  MagnifyingGlass,
  Brain,
  GlobeHemisphereWest,
  ShieldCheck,
} from '@phosphor-icons/react'
import Link from 'next/link'\nimport { ROUTES } from '../../lib/core/routes'

import { answerFeniBrain } from '../actions/answerFeniBrain'

type BrainResult = {
  id: string
  content: string
  similarity: number
  source_title: string
  source_url: string | null
  trust_tier: number
  document_title: string
  retrieval_method?: string
  subject_key?: string
}

type ChildLocation = {
  id: string
  level: string
  name_bn: string
  name_en: string | null
  slug: string
  official_code: string | null
}

type LocationResult = {
  id: string
  level: string
  name_bn: string
  name_en: string | null
  slug: string
  alias: string
  match_type: string
}

type LiveSource = {
  title: string
  url: string
  fetched_at: string
  http_status?: number
}

type BrainAnswer = {
  success: boolean
  error?: string
  answer?: string
  intent?: string
  locations?: LocationResult[]
  childLocations?: ChildLocation[]
  results?: BrainResult[]
  liveWebChecked?: boolean
  liveSources?: LiveSource[]
  confidence?: number
}

function FeniBrainGuide() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery.slice(0, 120))
  const [results, setResults] = useState<BrainResult[]>([])
  const [locations, setLocations] = useState<LocationResult[]>([])
  const [childLocations, setChildLocations] = useState<ChildLocation[]>([])
  const [liveSources, setLiveSources] = useState<LiveSource[]>([])
  const [intent, setIntent] = useState('')
  const [answer, setAnswer] = useState('')
  const [confidence, setConfidence] = useState(0)\n  const [guidance, setGuidance] = useState<BrainAnswer['guidance']>([])\n  const [guidanceTitle, setGuidanceTitle] = useState('পরের ধাপ')\n  const [guidanceText, setGuidanceText] = useState('')\n  const [safetyNote, setSafetyNote] = useState<string | null>(null)
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
    setStatus('Feni Brain বুঝে search করছে...')
    setResults([])
    setLocations([])
    setChildLocations([])
    setLiveSources([])
    setIntent('')
    setAnswer('')
    setConfidence(0)\n    setGuidance([])\n    setGuidanceTitle('পরের ধাপ')\n    setGuidanceText('')\n    setSafetyNote(null)

    try {
      const result = (await answerFeniBrain(nextQuery)) as BrainAnswer

      if (!result.success) {
        setStatus(result.error || 'Search failed.')
        return
      }

      const nextResults = result.results || []
      const nextLocations = result.locations || []
      const nextChildLocations = result.childLocations || []
      const nextLiveSources = result.liveSources || []
      const nextConfidence = Number(result.confidence || 0)

      setResults(nextResults)
      setLocations(nextLocations)
      setChildLocations(nextChildLocations)
      setLiveSources(nextLiveSources)
      setAnswer(result.answer || '')
      setIntent(result.intent || 'general_feni')
      setConfidence(nextConfidence)\n      setGuidance(result.guidance || [])\n      setGuidanceTitle(result.guidanceTitle || 'পরের ধাপ')\n      setGuidanceText(result.guidanceText || '')\n      setSafetyNote(result.safetyNote || null)

      if (result.liveWebChecked && nextLiveSources.length) {
        setStatus('Stored Feni data + official live web data মিলিয়ে উত্তর তৈরি হয়েছে।')
      } else if (result.liveWebChecked) {
        setStatus('Live web check করা হয়েছে; usable official live source না পেলে stored verified data রাখা হয়েছে।')
      } else if (nextResults.length || nextChildLocations.length) {
        setStatus('Verified Feni knowledge থেকে answer তৈরি হয়েছে।')
      } else {
        setStatus('এই প্রশ্নের জন্য এখনো পর্যাপ্ত matching Feni knowledge পাওয়া যায়নি।')
      }
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
                  Feni Intelligence
                </h1>
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/55">
              Feni-এর verified local data, location hierarchy, knowledge base এবং প্রয়োজন হলে
              official live web source মিলিয়ে natural-language প্রশ্নের উত্তর দেয়।
            </p>

            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <div className="flex min-h-[54px] flex-1 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4">
                <MagnifyingGlass size={20} className="shrink-0 text-white/30" />
                <input
                  value={query}
                  maxLength={120}
                  onChange={(event) => setQuery(event.target.value.slice(0, 120))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !loading) {
                      void runSearch()
                    }
                  }}
                  placeholder="যেমন: ami feni te koyta upazila ase?"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                />
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => void runSearch()}
                className="min-h-[54px] rounded-2xl bg-[#008080] px-6 text-sm font-bold text-white transition hover:bg-[#079494] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Thinking…' : 'Ask Feni Brain'}
              </button>
            </div>

            {status && (
              <div className="mt-5 flex items-start gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-sm text-white/60">
                <CheckCircle size={17} className="mt-0.5 shrink-0 text-[#72ddda]" />
                <span>{status}</span>
              </div>
            )}

            {answer && (
              <div className="mt-8 rounded-3xl border border-[#72ddda]/15 bg-[#008080]/[0.06] p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#72ddda]">
                    Feni Brain Answer
                  </div>

                  {confidence > 0 && (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/55">
                      Source confidence {Math.round(confidence * 100)}%
                    </span>
                  )}

                  {safetyNote && (
              <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-500/[0.07] p-4 text-sm leading-6 text-amber-800 dark:text-amber-100">
                <strong className="font-bold">Safety note:</strong> {safetyNote}
              </div>
            )}

            {guidance && guidance.length > 0 && (
              <div className="mt-6 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#72ddda]">
                  {guidanceTitle}
                </div>
                {guidanceText && (
                  <p className="mt-2 text-sm leading-6 text-white/55">{guidanceText}</p>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {guidance.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-2xl border border-white/[0.08] bg-black/20 p-4 transition hover:bg-white/[0.06]"
                    >
                      <div className="text-sm font-bold text-white">{item.label}</div>
                      <div className="mt-1 text-xs leading-5 text-white/45">{item.reason}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/35">
              <span>FeniX follows a source-first, privacy-aware AI policy.</span>
              <Link href={ROUTES.policy} className="text-[#72ddda] hover:underline">Read FeniX Policy</Link>
            </div>

            {liveSources.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#72ddda]/15 bg-[#72ddda]/[0.06] px-2.5 py-1 text-[11px] font-semibold text-[#72ddda]">
                      <GlobeHemisphereWest size={13} />
                      Live checked
                    </span>
                  )}
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/85">
                  {answer}
                </p>
              </div>
            )}

            {liveSources.length > 0 && (
              <div className="mt-6 rounded-2xl border border-[#72ddda]/15 bg-white/[0.025] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#72ddda]">
                  <GlobeHemisphereWest size={16} />
                  Official live sources
                </div>

                <div className="mt-3 grid gap-2">
                  {liveSources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-xs text-white/65 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      <span className="font-semibold text-white/80">{source.title}</span>
                      <span className="mt-1 block break-all text-white/35">{source.url}</span>
                      <span className="mt-1 block text-white/25">
                        Checked {new Date(source.fetched_at).toLocaleString()}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {(intent || locations.length > 0 || childLocations.length > 0) && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#72ddda]">
                    Detected intent
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {intent || 'general_feni'}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#72ddda]">
                    <ShieldCheck size={15} />
                    Feni data scope
                  </div>

                  <div className="mt-2 text-sm text-white/65">
                    {locations.length > 0
                      ? locations.slice(0, 4).map((location) => location.name_bn).join(' · ')
                      : 'Local Feni knowledge'}
                  </div>
                </div>
              </div>
            )}

            {childLocations.length > 0 && (
              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#72ddda]">
                  Matching places
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {childLocations.map((location) => (
                    <span
                      key={location.id}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70"
                    >
                      {location.name_bn}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-8 grid gap-4">
                {results.map((result) => (
                  <article
                    key={result.id}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/30">
                          {result.document_title}
                        </div>

                        <p className="mt-2 text-sm leading-7 text-white/70">
                          {result.content}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/35">
                          <span>Source: {result.source_title}</span>

                          {result.source_url && (
                            <a
                              href={result.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#72ddda] hover:underline"
                            >
                              Open source
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 rounded-full border border-[#72ddda]/15 bg-[#72ddda]/[0.06] px-3 py-1.5 text-xs font-semibold text-[#72ddda]">
                        {result.retrieval_method || 'matched'} · {Math.round(Number(result.similarity || 0) * 100)}%
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

export default function GuidePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-[#030506] px-4 py-10 text-white">
          <div className="mx-auto max-w-6xl rounded-3xl border border-white/[0.08] bg-black/35 p-8 text-sm text-white/60 backdrop-blur-xl">
            Feni Brain loading…
          </div>
        </main>
      }
    >
      <FeniBrainGuide />
    </Suspense>
  )
}
