'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Buildings, ShieldCheck, Storefront } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { createClient } from '@/utils/supabase/client'

type Business = {
  id: string
  name: string
  title_en: string | null
  title_bn: string | null
  category: string | null
}
type DirectoryProfile = {
  business_id: string
  slug: string | null
  owner_claimed: boolean
  verification_level: string
  listing_status: string
}
type ManagedBusiness = Business & { profile?: DirectoryProfile }

const labelsEn: Record<string, string> = {
  unverified: 'Basic listing',
  owner_claimed: 'Owner claimed',
  identity_reviewed: 'Identity reviewed',
  business_reviewed: 'Business reviewed',
  fenix_verified: 'FeniX Verified',
}
const labelsBn: Record<string, string> = {
  unverified: 'সাধারণ তালিকা',
  owner_claimed: 'মালিকানা দাবি অনুমোদিত',
  identity_reviewed: 'পরিচয় পর্যালোচিত',
  business_reviewed: 'ব্যবসা পর্যালোচিত',
  fenix_verified: 'FeniX যাচাইকৃত',
}

function trustLabel(level: string | undefined, bn: boolean) {
  const labels = bn ? labelsBn : labelsEn
  return (level && Object.prototype.hasOwnProperty.call(labels, level) ? labels[level] : null)
    ?? labels.unverified
}

export default function DirectoryManagePage() {
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'
  const [items, setItems] = useState<ManagedBusiness[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retryVersion, setRetryVersion] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')

    try {
      const s = createClient()
      const { data: auth, error: authError } = await s.auth.getUser()
      if (authError) throw authError

      if (!auth.user) {
        setItems([])
        setLoadError(bn ? 'ব্যবসা পরিচালনার জন্য আগে লগইন করুন।' : 'Please sign in to manage your businesses.')
        return
      }

      const { data: businesses, error: businessError } = await s
        .from('businesses')
        .select('id,name,title_en,title_bn,category')
        .eq('owner_id', auth.user.id)
        .order('updated_at', { ascending: false })

      if (businessError) throw businessError

      const ids = (businesses ?? []).map((business) => business.id)
      let profiles: DirectoryProfile[] = []

      if (ids.length) {
        const { data, error: profileError } = await s
          .from('business_directory_profiles')
          .select('business_id,slug,owner_claimed,verification_level,listing_status')
          .in('business_id', ids)

        if (profileError) throw profileError
        profiles = (data ?? []) as DirectoryProfile[]
      }

      const profileByBusiness = new Map(profiles.map((profile) => [profile.business_id, profile]))
      setItems((businesses ?? []).map((business) => ({
        ...business,
        profile: profileByBusiness.get(business.id),
      })))
    } catch {
      setItems([])
      setLoadError(
        bn
          ? 'আপনার ব্যবসার তালিকা এখন লোড করা যাচ্ছে না। আবার চেষ্টা করুন।'
          : 'Your business list could not be loaded. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [bn])

  useEffect(() => {
    void load()
  }, [load, retryVersion])

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/directory" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]">
            <ArrowLeft size={17} /> {bn ? 'ব্যবসার তালিকা' : 'Directory'}
          </Link>
          <Link href="/directory/join" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
            {bn ? 'আরও ব্যবসা যোগ করুন' : 'Add another business'} <ArrowRight size={17} />
          </Link>
        </div>

        <div className="mt-7">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">{bn ? 'মালিকের ওয়ার্কস্পেস' : 'Owner workspace'}</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{bn ? 'আপনার ব্যবসা পরিচালনা করুন' : 'Manage your businesses'}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">
            {bn
              ? 'ব্যবসার পাবলিক প্রোফাইল দেখুন এবং যাচাইয়ের অনুরোধ বা ব্যবসা পরিকল্পনার কাজে যান।'
              : 'Open your public business profile, request a review, or continue planning the business.'}
          </p>
        </div>

        {loadError && (
          <div role="alert" className="mt-6 rounded-2xl border border-red-500/15 bg-red-500/[.06] p-4 text-sm text-red-700 dark:text-red-200">
            <p>{loadError}</p>
            {loadError.includes('sign in') || loadError.includes('লগইন') ? (
              <Link href="/login?next=%2Fdirectory%2Fmanage" className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-[#008080] px-4 text-xs font-bold text-white">
                {bn ? 'লগইন করুন' : 'Sign in'}
              </Link>
            ) : (
              <button type="button" onClick={() => setRetryVersion((value) => value + 1)} className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-[#008080] px-4 text-xs font-bold text-white">
                {bn ? 'আবার চেষ্টা করুন' : 'Try again'}
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div role="status" aria-label={bn ? 'ব্যবসা লোড হচ্ছে' : 'Loading businesses'} className="mt-8 grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((index) => <div key={index} className="h-48 animate-pulse rounded-3xl border border-black/10 bg-white dark:border-white/10 dark:bg-white/[.04]" />)}
          </div>
        ) : !loadError && items.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map((item) => {
              const level = item.profile?.verification_level
              const listingStatus = item.profile?.listing_status ?? 'published'
              const businessName = item.title_bn || item.title_en || item.name
              return (
                <article key={item.id} className="rounded-3xl border border-black/10 bg-white/85 p-5 dark:border-white/10 dark:bg-white/[.045]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]"><Storefront size={23} /></div>
                      <div className="min-w-0">
                        <h2 className="break-words font-black">{businessName}</h2>
                        <p className="mt-1 text-xs opacity-45">{item.category || (bn ? 'বিভাগ দেওয়া হয়নি' : 'Category not set')}</p>
                      </div>
                    </div>
                    <ShieldCheck size={19} className={level === 'fenix_verified' ? 'shrink-0 text-[#008080]' : 'shrink-0 opacity-30'} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/[.04] px-2.5 py-1 text-[11px] font-bold dark:bg-white/[.06]">{trustLabel(level, bn)}</span>
                    {listingStatus === 'published' ? (
                      <span className="rounded-full bg-[#008080]/[.08] px-2.5 py-1 text-[11px] font-bold text-[#007171]">{bn ? 'পাবলিক' : 'Public'}</span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-200">{bn ? 'পাবলিক নয়' : 'Not public'}</span>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={'/directory/' + encodeURIComponent(item.profile?.slug || item.id)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
                      {bn ? 'প্রোফাইল দেখুন' : 'Open profile'} <ArrowRight size={16} />
                    </Link>
                    <Link href={'/directory/verify?business=' + encodeURIComponent(item.id)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#008080]/20 px-4 text-sm font-bold text-[#007171] dark:border-teal-300/15 dark:text-teal-200">
                      <ShieldCheck size={17} /> {bn ? 'যাচাইয়ের অনুরোধ' : 'Request review'}
                    </Link>
                    <Link href="/start" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-black/10 px-4 text-sm font-bold dark:border-white/10">
                      {bn ? 'পরিকল্পনা' : 'Plan'} <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : !loadError ? (
          <section className="mt-8 rounded-3xl border border-dashed border-black/15 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-white/[.03]">
            <Buildings size={32} className="mx-auto opacity-40" />
            <h2 className="mt-4 text-xl font-black">{bn ? 'এখনো কোনো ব্যবসা নেই' : 'No owned business yet'}</h2>
            <p className="mt-2 text-sm opacity-55">
              {bn ? 'প্রথম ব্যবসার প্রোফাইল তৈরি করে FeniX-এ যুক্ত করুন।' : 'Create your first business profile and connect it to the FeniX ecosystem.'}
            </p>
            <Link href="/directory/join" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
              {bn ? 'ব্যবসা তৈরি করুন' : 'Create business'} <ArrowRight size={17} />
            </Link>
          </section>
        ) : null}
      </section>
    </main>
  )
}
