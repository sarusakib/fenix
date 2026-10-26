'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  ArrowClockwise,
  ArrowLeft,
  CheckCircle,
  GlobeHemisphereWest,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  ShieldCheck,
  WarningCircle,
  X,
} from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Source = {
  id: string
  source_type: string
  publisher: string
  title: string
  url: string | null
  language_code: string
  trust_tier: number
  status: 'active' | 'needs_review' | 'archived' | string
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

type RefreshState = {
  source_id: string
  enabled: boolean
  refresh_interval_hours: number
  next_refresh_at: string | null
  last_checked_at: string | null
  last_success_at: string | null
  last_http_status: number | null
  last_error: string | null
  parser_key: string
  auto_publish: boolean
}

type Draft = {
  id: string | null
  source_type: string
  publisher: string
  title: string
  url: string
  language_code: string
  trust_tier: number
  status: string
}

const EMPTY_DRAFT: Draft = {
  id: null,
  source_type: 'public_web',
  publisher: '',
  title: '',
  url: '',
  language_code: 'bn',
  trust_tier: 3,
  status: 'needs_review',
}

const SOURCE_TYPES = [
  ['government_official', 'সরকারি / Official government'],
  ['official_document', 'সরকারি নথি / Official document'],
  ['verified_business', 'যাচাইকৃত ব্যবসা / Verified business'],
  ['public_web', 'পাবলিক ওয়েব / Public web'],
  ['community', 'কমিউনিটি / Community'],
  ['social', 'সোশ্যাল / Social'],
  ['internal', 'FeniX নিজস্ব ডেটা / FeniX-owned data'],
] as const

const STATUS_OPTIONS = [
  ['needs_review', 'পর্যালোচনা প্রয়োজন / Needs review'],
  ['active', 'সক্রিয় / Active'],
  ['archived', 'আর্কাইভ / Archived'],
] as const

function safeDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-GB')
}

function friendlyError(message: string) {
  if (message.includes('admin_required')) return 'এই কাজের জন্য Admin access প্রয়োজন।'
  if (message.includes('active_source_host_not_allowlisted')) return 'এই ডোমেইনটি নিরাপদ refresh allowlist-এ নেই। আপাতত “Needs review” রাখুন।'
  if (message.includes('source_url_already_registered')) return 'এই URL ইতিমধ্যে source registry-তে আছে। বিদ্যমান source-টি সম্পাদনা করুন।'
  if (message.includes('source_url_must_be_https_without_credentials')) return 'শুধু নিরাপদ HTTPS URL ব্যবহার করুন; URL-এর মধ্যে username/password দেওয়া যাবে না।'
  if (message.includes('internal_source_must_use_native_data')) return 'FeniX-owned source-এর URL নয়, native database route/metadata ব্যবহার করতে হবে।'
  if (message.includes('invalid_source_type')) return 'Source type সঠিক নয়।'
  if (message.includes('invalid_source_status')) return 'Source status সঠিক নয়।'
  if (message.includes('invalid_language_code')) return 'Language নির্বাচন সঠিক নয়।'
  if (message.includes('invalid_trust_tier')) return 'Trust tier 1 থেকে 4-এর মধ্যে হতে হবে।'
  if (message.includes('publisher_or_title_length_invalid')) return 'Publisher ও title-এর দৈর্ঘ্য যাচাই করুন।'
  return message || 'কাজটি সম্পন্ন করা যায়নি।'
}

export default function BrainSourcesAdminPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [refreshStates, setRefreshStates] = useState<Record<string, RefreshState>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [formOpen, setFormOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      setAllowed(false)
      setLoading(false)
      return
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc('is_fenix_admin')
    if (adminError || isAdmin !== true) {
      setAllowed(false)
      setLoading(false)
      return
    }

    setAllowed(true)
    const [sourceResult, refreshResult] = await Promise.all([
      supabase
        .from('fenix_brain_sources')
        .select('id,source_type,publisher,title,url,language_code,trust_tier,status,metadata,created_at,updated_at')
        .order('updated_at', { ascending: false })
        .limit(500),
      supabase
        .from('fenix_brain_source_refresh')
        .select('source_id,enabled,refresh_interval_hours,next_refresh_at,last_checked_at,last_success_at,last_http_status,last_error,parser_key,auto_publish')
        .limit(500),
    ])

    if (sourceResult.error) {
      setError('Source registry পড়া যায়নি। Database migration ও admin read policy প্রয়োগ হয়েছে কি না পরীক্ষা করুন।')
      setLoading(false)
      return
    }

    setSources((sourceResult.data ?? []) as Source[])
    if (refreshResult.error) {
      setRefreshStates({})
      setError('Source তালিকা এসেছে, কিন্তু refresh status পড়া যায়নি। Migration প্রয়োগ এবং অনুমতি পরীক্ষা করুন।')
    } else {
      setRefreshStates(Object.fromEntries((refreshResult.data ?? []).map((row) => [
        row.source_id,
        row as RefreshState,
      ])))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return sources.filter((source) => {
      const matchesSearch = !needle || [
        source.title,
        source.publisher,
        source.url ?? '',
        String(source.metadata?.source_category ?? ''),
      ].some((value) => value.toLowerCase().includes(needle))
      const matchesType = typeFilter === 'all' || source.source_type === typeFilter
      const matchesStatus = statusFilter === 'all' || source.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [sources, search, typeFilter, statusFilter])

  const summary = useMemo(() => ({
    total: sources.length,
    active: sources.filter((source) => source.status === 'active').length,
    review: sources.filter((source) => source.status === 'needs_review').length,
    refreshErrors: Object.values(refreshStates).filter((row) => row.enabled && row.last_error).length,
  }), [sources, refreshStates])

  function startNew() {
    setDraft({ ...EMPTY_DRAFT })
    setFormOpen(true)
    setError('')
    setNotice('')
  }

  function startEdit(source: Source) {
    setDraft({
      id: source.id,
      source_type: source.source_type,
      publisher: source.publisher,
      title: source.title,
      url: source.url ?? '',
      language_code: source.language_code,
      trust_tier: source.trust_tier,
      status: source.status,
    })
    setFormOpen(true)
    setError('')
    setNotice('')
  }

  async function submitSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')

    const publisher = draft.publisher.trim()
    const title = draft.title.trim()
    const url = draft.url.trim()

    if (publisher.length < 2 || title.length < 2) {
      setError('Publisher ও source title কমপক্ষে ২ অক্ষরের হতে হবে।')
      setSaving(false)
      return
    }

    if (url) {
      try {
        if (new URL(url).protocol !== 'https:') throw new Error('https')
      } catch {
        setError('Source URL অবশ্যই সঠিক HTTPS link হতে হবে।')
        setSaving(false)
        return
      }
    } else if (draft.status === 'active' && draft.source_type !== 'internal') {
      setError('Active external source-এর HTTPS URL দিতে হবে। URL না থাকলে “Needs review” রাখুন।')
      setSaving(false)
      return
    }

    const supabase = createClient()
    const { error: saveError } = await supabase.rpc('fenix_brain_admin_upsert_source', {
      p_id: draft.id,
      p_source_type: draft.source_type,
      p_publisher: publisher,
      p_title: title,
      p_url: url || null,
      p_language_code: draft.language_code,
      p_trust_tier: Number(draft.trust_tier),
      p_status: draft.status,
      p_metadata: null,
    })

    if (saveError) {
      setError(friendlyError(saveError.message))
      setSaving(false)
      return
    }

    setNotice(draft.id ? 'Source তথ্য আপডেট হয়েছে।' : 'Source registry-তে যোগ হয়েছে।')
    setFormOpen(false)
    setDraft({ ...EMPTY_DRAFT })
    await load()
    setSaving(false)
  }

  if (allowed === null && loading) {
    return (
      <main className="fenix-shell min-h-dvh">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-[var(--fx-muted)]">Checking admin access…</div>
      </main>
    )
  }

  if (!allowed) {
    return (
      <main className="fenix-shell min-h-dvh">
        <Navbar />
        <section className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-3xl font-black">Admin access required</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--fx-muted)]">Brain source registry শুধু অনুমোদিত Admin পরিচালনা করতে পারবেন।</p>
          <Link href="/admin" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
            <ArrowLeft size={17} /> Admin center
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold">
          <ArrowLeft size={15} /> Admin center
        </Link>

        <header className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">
                <GlobeHemisphereWest size={15} /> Feni Brain · Roadmap 2C
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-[-.05em] sm:text-5xl">Source registry</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">
                সরকারি তথ্য, স্বাস্থ্য রেজিস্ট্রি, স্থানীয় প্ল্যাটফর্ম, মানচিত্র, ব্যবসা ডিরেক্টরি, সংবাদ এবং FeniX-এর নিজস্ব ডেটা—প্রতিটি উৎসের পরিচয়, বিশ্বাস-স্তর ও refresh অবস্থা এখানে পরিচালিত হয়।
              </p>
            </div>
            <button type="button" onClick={startNew} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
              <Plus size={18} /> Add source
            </button>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Total sources', summary.total],
              ['Active', summary.active],
              ['Needs review', summary.review],
              ['Refresh errors', summary.refreshErrors],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)] p-4">
                <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--fx-muted)]">{label}</p>
                <p className="mt-2 text-2xl font-black">{Number(value).toLocaleString('en-BD')}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[.06] p-3 text-xs leading-6 text-[var(--fx-muted)]">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-amber-600" />
            <p>নতুন source স্বয়ংক্রিয়ভাবে publish হয় না। External refresh কেবল allowlisted HTTPS host-এ চলে; social URL আগে manually verify করতে হবে। FeniX-owned source native database থেকে আসে, HTML fetch থেকে নয়।</p>
          </div>
        </header>

        {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200"><WarningCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
        {notice && <div role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-teal-500/20 bg-teal-500/[.06] p-3 text-sm text-teal-800 dark:text-teal-200"><CheckCircle size={17} className="mt-0.5 shrink-0" />{notice}</div>}

        {formOpen && (
          <form onSubmit={submitSource} className="mt-5 rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">{draft.id ? 'Edit source' : 'New source'}</p>
                <h2 className="mt-1 text-xl font-black">{draft.id ? 'Update source details' : 'Register a source'}</h2>
              </div>
              <button type="button" aria-label="Close source form" onClick={() => setFormOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--fx-border)]"><X size={17} /></button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold">Source type
                <select value={draft.source_type} onChange={(event) => setDraft((v) => ({ ...v, source_type: event.target.value }))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-sm">
                  {SOURCE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold">Status
                <select value={draft.status} onChange={(event) => setDraft((v) => ({ ...v, status: event.target.value }))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-sm">
                  {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold">Publisher / source owner
                <input required minLength={2} maxLength={200} value={draft.publisher} onChange={(event) => setDraft((v) => ({ ...v, publisher: event.target.value }))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-sm" placeholder="e.g. Feni District Administration" />
              </label>
              <label className="text-xs font-bold">Source title
                <input required minLength={2} maxLength={300} value={draft.title} onChange={(event) => setDraft((v) => ({ ...v, title: event.target.value }))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-sm" placeholder="Short descriptive title" />
              </label>
              <label className="text-xs font-bold sm:col-span-2">HTTPS source URL <span className="font-normal text-[var(--fx-muted)]">(internal source হলে খালি রাখতে হবে)</span>
                <input type="url" value={draft.url} onChange={(event) => setDraft((v) => ({ ...v, url: event.target.value }))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-sm" placeholder="https://example.gov.bd/..." />
              </label>
              <label className="text-xs font-bold">Language
                <select value={draft.language_code} onChange={(event) => setDraft((v) => ({ ...v, language_code: event.target.value }))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-sm">
                  <option value="bn">বাংলা</option><option value="en">English</option><option value="mixed">বাংলা + English</option><option value="unknown">Unknown</option>
                </select>
              </label>
              <label className="text-xs font-bold">Trust tier
                <select value={draft.trust_tier} onChange={(event) => setDraft((v) => ({ ...v, trust_tier: Number(event.target.value) }))} className="mt-2 min-h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-sm">
                  <option value={1}>1 · Highest / official primary source</option>
                  <option value={2}>2 · Strong / established source</option>
                  <option value={3}>3 · Secondary directory</option>
                  <option value={4}>4 · Unverified / discovery lead</option>
                </select>
              </label>
            </div>

            <p className="mt-4 text-xs leading-6 text-[var(--fx-muted)]">“Active” করলে source refresh worker URL-এর host পরীক্ষা করবে। নতুন social/community URL-এর জন্য “Needs review” ব্যবহার করুন; অনুমোদিত access method ও সঠিক public page নিশ্চিত না হওয়া পর্যন্ত সেটি active করবেন না।</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white disabled:opacity-60">
                {saving ? <ArrowClockwise size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {saving ? 'Saving…' : 'Save source'}
              </button>
              <button type="button" onClick={() => { setFormOpen(false); setDraft({ ...EMPTY_DRAFT }) }} className="min-h-11 rounded-xl border border-[var(--fx-border)] px-4 text-sm font-bold">Cancel</button>
            </div>
          </form>
        )}

        <section className="mt-6 rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-[1fr_210px_210px_auto]">
            <label className="relative block">
              <MagnifyingGlass size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fx-muted)]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] pl-9 pr-3 text-sm" placeholder="Search source, publisher, URL…" aria-label="Search source registry" />
            </label>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="min-h-11 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-sm" aria-label="Filter by source type">
              <option value="all">All source types</option>
              {SOURCE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-sm" aria-label="Filter by status">
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-sm font-bold disabled:opacity-50">
              <ArrowClockwise size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Registered sources</h2>
            <span className="text-xs text-[var(--fx-muted)]">{filtered.length.toLocaleString('en-BD')} shown</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-[var(--fx-muted)]">Loading registry…</div>
          ) : filtered.length ? (
            <div className="mt-4 space-y-3">
              {filtered.map((source) => {
                const refresh = refreshStates[source.id]
                const category = typeof source.metadata?.source_category === 'string' ? source.metadata.source_category : source.source_type
                return (
                  <article key={source.id} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)] p-4 sm:p-5">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words text-base font-black">{source.title}</h3>
                          <span className={'rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] ' + (source.status === 'active' ? 'bg-teal-600/10 text-teal-700 dark:text-teal-300' : source.status === 'needs_review' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-200' : 'bg-gray-500/10 text-[var(--fx-muted)]')}>{source.status.replaceAll('_', ' ')}</span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--fx-muted)]">{source.publisher} · {category.replaceAll('_', ' ')} · Trust tier {source.trust_tier}</p>
                        {source.url ? (
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block max-w-full break-all text-xs font-semibold text-[var(--fx-primary-strong)] underline underline-offset-2">{source.url}</a>
                        ) : (
                          <p className="mt-2 text-xs italic text-[var(--fx-muted)]">{source.source_type === 'internal' ? 'Native FeniX database source — no external fetch' : 'URL not verified yet — manual review required'}</p>
                        )}
                        <div className="mt-3 grid gap-x-4 gap-y-1 text-xs text-[var(--fx-muted)] sm:grid-cols-2">
                          <p>Refresh: <strong className="font-bold text-[var(--fx-text)]">{refresh?.enabled ? 'Enabled' : 'Disabled / not configured'}</strong>{refresh ? ' · ' + refresh.refresh_interval_hours + 'h' : ''}</p>
                          <p>Parser: <strong className="font-bold text-[var(--fx-text)]">{refresh?.parser_key ?? 'native / none'}</strong></p>
                          <p>Last checked: {safeDate(refresh?.last_checked_at)}</p>
                          <p>Last success: {safeDate(refresh?.last_success_at)}{refresh?.last_http_status ? ' · HTTP ' + refresh.last_http_status : ''}</p>
                          {refresh?.last_error && <p className="sm:col-span-2 text-red-700 dark:text-red-300">Last error: {refresh.last_error}</p>}
                        </div>
                      </div>
                      <button type="button" onClick={() => startEdit(source)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold">
                        <PencilSimple size={15} /> Edit
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-[var(--fx-muted)]">এই filter-এ কোনো source পাওয়া যায়নি।</div>
          )}
        </section>
      </section>
    </main>
  )
}
