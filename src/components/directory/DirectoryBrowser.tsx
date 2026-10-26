'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Buildings,
  CheckCircle,
  Compass,
  MagnifyingGlass,
  MapPin,
  Phone,
  ShieldCheck,
  Storefront,
  TrendUp,
  X,
} from '@phosphor-icons/react'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import {
  getBusinessDisplayName,
  getBusinessPath,
  getBusinessSecondaryName,
  getDirectoryCategories,
  getDirectoryUpazilas,
  getDirectionsUrl,
  searchDirectoryBusinesses,
  type DirectoryBusiness,
  type DirectoryCategory,
  type DirectoryUpazila,
} from '@/lib/directory'

const PAGE_SIZE = 24

const verificationLabelsEn: Record<string, string> = {
  unverified: 'Basic listing',
  owner_claimed: 'Owner claimed',
  identity_reviewed: 'Identity reviewed',
  business_reviewed: 'Business reviewed',
  fenix_verified: 'FeniX Verified',
}

const verificationLabelsBn: Record<string, string> = {
  unverified: 'সাধারণ তালিকা',
  owner_claimed: 'মালিকানা দাবি অনুমোদিত',
  identity_reviewed: 'পরিচয় পর্যালোচিত',
  business_reviewed: 'ব্যবসা পর্যালোচিত',
  fenix_verified: 'FeniX যাচাইকৃত',
}

function getVerificationLabel(level: string | null | undefined, bn: boolean) {
  const labels = bn ? verificationLabelsBn : verificationLabelsEn
  return (level && Object.prototype.hasOwnProperty.call(labels, level) ? labels[level] : null)
    ?? labels.unverified
}

function isRecognizedReviewLevel(level: string | null | undefined) {
  return Boolean(level && level !== 'unverified' && Object.prototype.hasOwnProperty.call(verificationLabelsEn, level))
}

function formatLocation(business: DirectoryBusiness, bn: boolean) {
  const parts = [business.market, business.area, business.upazila, business.district]
    .map((value) => value?.trim())
    .filter(Boolean) as string[]

  return parts.length
    ? parts.join(' · ')
    : bn
      ? 'ফেনী · অবস্থান যোগ করা হয়নি'
      : 'Feni · Location not added'
}

function BusinessCard({ business, bn }: { business: DirectoryBusiness; bn: boolean }) {
  const name = getBusinessDisplayName(business)
  const secondary = getBusinessSecondaryName(business)
  const directionsUrl = getDirectionsUrl(business)

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(15,23,42,.10)] dark:border-white/[0.08] dark:bg-white/[0.045] dark:shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-700 dark:bg-teal-300/10 dark:text-teal-200">
            <Storefront size={24} weight="duotone" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-black text-[#0b1736] dark:text-white">
              {name}
            </h2>
            {secondary && (
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-white/45">
                {secondary}
              </p>
            )}
          </div>
        </div>
        {isRecognizedReviewLevel(business.verification_level) ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-600/10 px-2.5 py-1 text-[10px] font-bold text-teal-800 dark:bg-teal-300/10 dark:text-teal-100">
            <ShieldCheck size={13} />
            {getVerificationLabel(business.verification_level, bn)}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-white/[0.06] dark:text-white/45">
            {getVerificationLabel('unverified', bn)}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {business.category && (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-300/10 dark:text-amber-100">
            {business.category}
          </span>
        )}
        {business.owner_claimed && business.verification_level !== 'owner_claimed' && (
          <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-800 dark:bg-sky-300/10 dark:text-sky-100">
            {bn ? 'মালিকানা দাবি অনুমোদিত' : 'Owner claim approved'}
          </span>
        )}
        {business.phone_verified && (
          <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-800 dark:bg-sky-300/10 dark:text-sky-100">
            {bn ? 'ফোন যাচাইকৃত' : 'Phone verified'}
          </span>
        )}
        {business.location_verified && (
          <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-800 dark:bg-violet-300/10 dark:text-violet-100">
            {bn ? 'অবস্থান যাচাইকৃত' : 'Location verified'}
          </span>
        )}
        {business.product_count > 0 && (
          <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-800 dark:bg-violet-300/10 dark:text-violet-100">
            {bn ? 'দোকানে পণ্য আছে' : 'Shop available'}
          </span>
        )}
        {business.has_investment && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-100">
            <TrendUp size={13} />
            {bn ? 'বিনিয়োগ' : 'Investment'}
          </span>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-600 dark:text-white/55">
        <MapPin className="mt-1 shrink-0" size={16} />
        <span>{formatLocation(business, bn)}</span>
      </p>

      {(business.description || business.tagline_bn || business.tagline_en) && (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-white/50">
          {business.tagline_bn || business.tagline_en || business.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <Link
          href={getBusinessPath(business)}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white transition hover:bg-[#007474]"
        >
          {bn ? 'ব্যবসার তথ্য দেখুন' : 'View business'}
          <ArrowRight size={16} />
        </Link>
        {business.phone && (
          <a
            href={'tel:' + business.phone}
            aria-label={bn ? name + '-এ ফোন করুন' : 'Call ' + name}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.1]"
          >
            <Phone size={18} />
          </a>
        )}
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={bn ? name + '-এ যাওয়ার পথ' : 'Directions to ' + name}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/[0.1]"
          >
            <Compass size={18} />
          </a>
        )}
      </div>
    </article>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string; count?: number }>
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-white/35">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-[#0b1736] outline-none transition focus:border-teal-500 dark:border-white/[0.08] dark:bg-white/[0.045] dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value || 'all'} value={option.value}>
            {option.label}
            {typeof option.count === 'number' ? ' (' + option.count + ')' : ''}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function DirectoryBrowser() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'
  const urlQuery = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const upazila = searchParams.get('upazila') ?? ''
  const filtersKey = JSON.stringify([urlQuery, category, upazila])
  const filtersKeyRef = useRef(filtersKey)
  filtersKeyRef.current = filtersKey

  const [draftQuery, setDraftQuery] = useState(urlQuery)
  const [businesses, setBusinesses] = useState<DirectoryBusiness[]>([])
  const [categories, setCategories] = useState<DirectoryCategory[]>([])
  const [upazilas, setUpazilas] = useState<DirectoryUpazila[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [retryVersion, setRetryVersion] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [moreError, setMoreError] = useState<string | null>(null)
  const [optionsWarning, setOptionsWarning] = useState<string | null>(null)

  useEffect(() => {
    setDraftQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    let active = true

    async function loadOptions() {
      try {
        const [categoryResult, upazilaResult] = await Promise.all([
          getDirectoryCategories(),
          getDirectoryUpazilas(),
        ])
        if (!active) return
        if (!categoryResult.error) setCategories(categoryResult.data)
        if (!upazilaResult.error) setUpazilas(upazilaResult.data)
        if (categoryResult.error || upazilaResult.error) {
          setOptionsWarning(
            bn
              ? 'কিছু ফিল্টার লোড হয়নি। আপনি সার্চ চালিয়ে যেতে পারবেন।'
              : 'Some filters could not be loaded. You can still search the directory.',
          )
        }
      } catch {
        if (active) {
          setOptionsWarning(
            bn
              ? 'ফিল্টারের তথ্য এখন পাওয়া যাচ্ছে না। আপনি সার্চ চালিয়ে যেতে পারবেন।'
              : 'Filter options are temporarily unavailable. You can still search.',
          )
        }
      }
    }

    void loadOptions()
    return () => {
      active = false
    }
  }, [bn])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setMoreError(null)
    setLoadingMore(false)
    setHasMore(false)

    async function loadBusinesses() {
      try {
        const result = await searchDirectoryBusinesses({
          query: urlQuery,
          category,
          upazila,
          limit: PAGE_SIZE,
          offset: 0,
        })

        if (!active) return

        if (result.error) {
          setBusinesses([])
          setError(
            bn
              ? 'ব্যবসার তালিকা এখন লোড করা যাচ্ছে না।'
              : 'Business list could not be loaded right now.',
          )
        } else {
          setBusinesses(result.data)
          setHasMore(result.data.length === PAGE_SIZE)
        }
      } catch {
        if (active) {
          setBusinesses([])
          setError(
            bn
              ? 'সংযোগের সমস্যার কারণে ব্যবসার তালিকা লোড হয়নি। আবার চেষ্টা করুন।'
              : 'The business list could not be loaded because of a connection problem.',
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadBusinesses()
    return () => {
      active = false
    }
  }, [urlQuery, category, upazila, retryVersion, bn])

  const loadMore = async () => {
    const requestedFilters = filtersKey
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    setMoreError(null)

    try {
      const result = await searchDirectoryBusinesses({
        query: urlQuery,
        category,
        upazila,
        limit: PAGE_SIZE,
        offset: businesses.length,
      })

      if (filtersKeyRef.current !== requestedFilters) return
      if (result.error) throw result.error

      setBusinesses((current) => {
        if (filtersKeyRef.current !== requestedFilters) return current
        const existing = new Set(current.map((item) => item.id))
        const additional = result.data.filter((item) => !existing.has(item.id))
        return [...current, ...additional]
      })
      setHasMore(result.data.length === PAGE_SIZE)
    } catch {
      if (filtersKeyRef.current === requestedFilters) {
        setMoreError(
          bn
            ? 'আরও ব্যবসা লোড হয়নি। আবার চেষ্টা করুন।'
            : 'More businesses could not be loaded. Please try again.',
        )
      }
    } finally {
      if (filtersKeyRef.current === requestedFilters) setLoadingMore(false)
    }
  }

  const applyFilters = (nextQuery: string, nextCategory: string, nextUpazila: string) => {
    const params = new URLSearchParams()
    if (nextQuery.trim()) params.set('q', nextQuery.trim().slice(0, 120))
    if (nextCategory) params.set('category', nextCategory)
    if (nextUpazila) params.set('upazila', nextUpazila)
    const value = params.toString()
    router.push('/directory' + (value ? '?' + value : ''))
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,.07)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.045] dark:shadow-none sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-600/10 px-3 py-1.5 text-xs font-bold text-teal-800 dark:bg-teal-300/10 dark:text-teal-100">
              <Buildings size={15} />
              Feni local discovery
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0b1736] sm:text-5xl dark:text-white">
              {bn ? 'স্থানীয় ব্যবসা খুঁজুন' : 'Find Local Businesses'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-white/55">
              {bn
                ? 'ফেনীর ব্যবসা, সরবরাহকারী ও স্থানীয় সেবা নাম, বিভাগ বা এলাকা দিয়ে খুঁজুন। বাংলা ও ইংরেজিতে লেখা তথ্যও অনুসন্ধান করা যায়।'
                : 'Find a business, supplier or local service in Feni by name, category or area. Search across the Bangla and English information businesses publish.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/directory/map"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#0b1736] transition hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.07]"
            >
              <MapPin size={16} />
              {bn ? 'ম্যাপে দেখুন' : 'View map'}
            </Link>
            <Link
              href="/directory/join"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white transition hover:bg-[#007474]"
            >
              {bn ? 'ব্যবসা যোগ করুন' : 'List your business'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <form
          className="mt-7"
          onSubmit={(event) => {
            event.preventDefault()
            applyFilters(draftQuery, category, upazila)
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-teal-500 dark:border-white/[0.08] dark:bg-white/[0.045]">
              <MagnifyingGlass size={21} className="shrink-0 text-teal-700 dark:text-teal-200" />
              <input
                aria-label={bn ? 'ব্যবসা খুঁজুন' : 'Search businesses'}
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                placeholder={bn ? 'ব্যবসা, সরবরাহকারী, ফার্মেসি, রেস্টুরেন্ট...' : 'Business, supplier, pharmacy, restaurant...'}
                maxLength={120}
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#0b1736] outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/30"
              />
              {draftQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftQuery('')
                    applyFilters('', category, upazila)
                  }}
                  aria-label={bn ? 'সার্চ মুছুন' : 'Clear search'}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <X size={17} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#008080] px-6 text-sm font-black text-white transition hover:bg-[#007474]"
            >
              {bn ? 'খুঁজুন' : 'Search'}
              <MagnifyingGlass size={18} />
            </button>
          </div>
        </form>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <FilterSelect
            label={bn ? 'বিভাগ' : 'Category'}
            value={category}
            options={[
              { value: '', label: bn ? 'সব বিভাগ' : 'All categories' },
              ...categories.flatMap((item) =>
                item.category
                  ? [{
                      value: item.category,
                      label: item.category,
                      count: item.business_count,
                    }]
                  : [],
              ),
            ]}
            onChange={(value) => applyFilters(urlQuery, value, upazila)}
          />
          <FilterSelect
            label={bn ? 'উপজেলা' : 'Upazila'}
            value={upazila}
            options={[
              { value: '', label: bn ? 'সব উপজেলা' : 'All upazilas' },
              ...upazilas.flatMap((item) =>
                item.upazila
                  ? [{
                      value: item.upazila,
                      label: item.upazila,
                      count: item.business_count,
                    }]
                  : [],
              ),
            ]}
            onChange={(value) => applyFilters(urlQuery, category, value)}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-white/40">
          <span className="font-semibold" aria-live="polite">
            {loading
              ? (bn ? 'ব্যবসা খোঁজা হচ্ছে…' : 'Finding businesses…')
              : hasMore
                ? (bn ? 'কমপক্ষে ' + businesses.length + 'টি ব্যবসা দেখানো হচ্ছে' : 'Showing ' + businesses.length + '+ businesses')
                : (bn ? businesses.length + 'টি ব্যবসা' : businesses.length + ' business' + (businesses.length === 1 ? '' : 'es'))}
          </span>
          {(urlQuery || category || upazila) && (
            <button
              type="button"
              onClick={() => router.push('/directory')}
              className="rounded-full bg-slate-100 px-3 py-1.5 font-bold text-slate-700 dark:bg-white/[0.06] dark:text-white/75"
            >
              {bn ? 'ফিল্টার মুছুন' : 'Clear filters'}
            </button>
          )}
        </div>
        {optionsWarning && (
          <p role="status" className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[.05] p-3 text-xs leading-5 text-amber-900 dark:text-amber-100">
            {optionsWarning}
          </p>
        )}
      </section>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-white/[0.04]"
            />
          ))}
        </div>
      ) : error ? (
        <section role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-400/20 dark:bg-red-400/10">
          <h2 className="text-xl font-black text-red-900 dark:text-red-100">
            {bn ? 'ব্যবসার তালিকা পাওয়া যাচ্ছে না' : 'Directory temporarily unavailable'}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-red-800/80 dark:text-red-100/75">{error}</p>
          <button
            type="button"
            onClick={() => setRetryVersion((value) => value + 1)}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#008080] px-4 text-sm font-bold text-white"
          >
            {bn ? 'আবার চেষ্টা করুন' : 'Try again'}
          </button>
        </section>
      ) : businesses.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} bn={bn} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-7 flex flex-col items-center gap-3">
              {moreError && <p role="alert" className="text-sm text-red-700 dark:text-red-200">{moreError}</p>}
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-[#0b1736] disabled:opacity-60 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
              >
                {loadingMore
                  ? (bn ? 'লোড হচ্ছে…' : 'Loading…')
                  : (bn ? 'আরও ব্যবসা দেখুন' : 'Load more businesses')}
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center dark:border-white/[0.12] dark:bg-white/[0.03]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-white/50">
            <Storefront size={26} />
          </div>
          <h2 className="mt-5 text-xl font-black text-[#0b1736] dark:text-white">
            No matching business found
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-white/45">
            {bn
              ? 'অন্য বানান, বিভাগ বা এলাকা দিয়ে চেষ্টা করুন। নতুন স্থানীয় ব্যবসা যুক্ত হলে তালিকা আরও সমৃদ্ধ হবে।'
              : 'Try another spelling, category or location. Business coverage will grow as local businesses join and complete their public profiles.'}
          </p>
          <Link
            href="/directory/join"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white"
          >
            {bn ? 'ব্যবসা যোগ করুন' : 'Add a business'}
            <ArrowRight size={16} />
          </Link>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          [
            bn ? 'স্থানীয় ব্যবসা আগে' : 'Local first',
            bn ? 'ফেনীর ব্যবসা এক জায়গায় খুঁজুন।' : 'Search Feni businesses in one place.',
            Buildings,
          ],
          [
            bn ? 'বিশ্বাসযোগ্যতার সংকেত' : 'Trust signals',
            bn ? 'যাচাইয়ের অবস্থা স্পষ্ট থাকে; কোনো নিশ্চয়তার দাবি নয়।' : 'Verification levels stay explicit; no fake guarantees.',
            CheckCircle,
          ],
          [
            bn ? 'পরবর্তী পদক্ষেপ' : 'Useful next step',
            bn ? 'প্রোফাইল খুলুন, ফোন করুন বা প্রকাশিত অবস্থান দেখুন।' : 'Open a profile, call or get directions when published.',
            Compass,
          ],
        ].map(([title, body, Icon]) => {
          const FeatureIcon = Icon as typeof Buildings
          return (
            <div
              key={String(title)}
              className="rounded-2xl border border-slate-200 bg-white/75 p-5 dark:border-white/[0.07] dark:bg-white/[0.025]"
            >
              <FeatureIcon size={22} className="text-teal-700 dark:text-teal-200" />
              <h3 className="mt-3 text-sm font-black text-[#0b1736] dark:text-white">{String(title)}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-white/40">{String(body)}</p>
            </div>
          )
        })}
      </section>
    </div>
  )
}
