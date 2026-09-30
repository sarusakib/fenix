'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Drop, FirstAidKit, MapPin, Phone, ShieldCheck } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

const ACTIONS = [
  {
    title: 'Find an ambulance',
    titleBn: 'অ্যাম্বুলেন্স খুঁজুন',
    body: 'Search FeniX for published ambulance or transport services. Always confirm availability before relying on a listing.',
    bodyBn: 'প্রকাশিত অ্যাম্বুলেন্স বা পরিবহন সেবা খুঁজুন। কোনো তালিকার ওপর নির্ভর করার আগে প্রাপ্যতা নিশ্চিত করুন।',
    href: '/search?q=ambulance',
    icon: FirstAidKit,
  },
  {
    title: 'Find a blood donor',
    titleBn: 'রক্তদাতা খুঁজুন',
    body: 'Search published local information for blood-donor discovery. Do not treat an unverified profile as a confirmed donor.',
    bodyBn: 'প্রকাশিত স্থানীয় তথ্য থেকে রক্তদাতা খুঁজুন। যাচাইহীন প্রোফাইলকে নিশ্চিত রক্তদাতা হিসেবে ধরে নেবেন না।',
    href: '/search?q=blood%20donor',
    icon: Drop,
  },
  {
    title: 'Ask Feni Brain',
    titleBn: 'ফেনি ব্রেইনকে জিজ্ঞেস করুন',
    body: 'Ask for a Feni-specific emergency or health-service lookup. The Brain should say when verified local data is unavailable.',
    bodyBn: 'ফেনী-সংক্রান্ত জরুরি বা স্বাস্থ্যসেবার তথ্য জিজ্ঞেস করুন। যাচাই করা স্থানীয় তথ্য না থাকলে ব্রেইন তা স্পষ্ট করবে।',
    href: '/guide?q=ফেনীতে%20জরুরি%20সেবা%20খুঁজছি',
    icon: ShieldCheck,
  },
  {
    title: 'Open the Feni map',
    titleBn: 'ফেনী ম্যাপ খুলুন',
    body: 'Use map-first discovery when you already know the service or area you need to reach.',
    bodyBn: 'কোন সেবা বা এলাকায় যেতে হবে জানা থাকলে মানচিত্রভিত্তিক অনুসন্ধান ব্যবহার করুন।',
    href: '/directory/map?q=ambulance',
    icon: MapPin,
  },
] as const

export default function EmergencyPage() {
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'

  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold">
          <ArrowLeft size={16} /> {bn ? 'হোম' : 'Home'}
        </Link>

        <header className="mt-7 overflow-hidden rounded-[2.2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-6 sm:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/[.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.16em] text-red-700 dark:text-red-300">
                <FirstAidKit size={15} /> {bn ? 'জরুরি সহায়তা' : 'Emergency help'}
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-[-.055em] sm:text-6xl">জরুরি সময়ে দ্রুত সঠিক তথ্যের কাছে পৌঁছান।</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--fx-muted)] sm:text-base">
                {bn
                  ? 'FeniX এখানে যাচাই করা বা স্পষ্টভাবে চিহ্নিত জনসাধারণের তথ্য খুঁজে পেতে সাহায্য করে। কোনো যাচাইহীন তালিকা, প্রাপ্যতা বা ফোন নম্বরকে FeniX নিজে থেকে নিশ্চিত হিসেবে দেখাবে না।'
                  : 'FeniX helps you find verified or clearly-labelled public information. It does not independently confirm an unverified listing, availability or phone number.'}
              </p>
            </div>

            <div className="rounded-3xl border border-red-500/10 bg-red-500/[.035] p-5 lg:max-w-sm">
              <div className="flex items-center gap-2 text-xs font-black text-red-700 dark:text-red-300">
                <Phone size={17} /> জরুরি অবস্থায় আগে স্থানীয় জরুরি কর্তৃপক্ষ/হাসপাতালের নির্দেশনা অনুসরণ করুন।
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--fx-muted)]">
                {bn ? 'FeniX-এর search result বা community information বাস্তব জরুরি সেবার বিকল্প নয়।' : 'FeniX search results or community information are not a substitute for real-world emergency response.'}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ACTIONS.map(({ title, titleBn, body, bodyBn, href, icon: Icon }) => (
            <Link key={href} href={href} className="group rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--fx-primary)]/20 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
                  <Icon size={24} weight="duotone" />
                </span>
                <ArrowRight size={19} className="mt-1 shrink-0 text-[var(--fx-muted)] transition-transform group-hover:translate-x-1" />
              </div>
              <h2 className="mt-5 text-xl font-black">{bn ? titleBn : title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--fx-muted)]">{bn ? bodyBn : body}</p>
            </Link>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck size={21} className="mt-0.5 shrink-0 text-[var(--fx-primary-strong)]" />
            <div>
              <h2 className="text-sm font-black">{bn ? 'বিশ্বাস ও তথ্যের সাম্প্রতিকতা' : 'Trust & freshness'}</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--fx-muted)]">
                {bn
                  ? 'জরুরি তথ্য দ্রুত বদলে যেতে পারে। কাজ করার আগে তালিকা, অবস্থান, প্রাপ্যতা ও যোগাযোগের তথ্য যাচাই করুন। FeniX-এর বর্তমান যাচাই করা উৎসকে বেশি গুরুত্ব দেওয়া উচিত।'
                  : 'Emergency data can change quickly. Verify the listing, location, availability and contact details before acting. FeniX should prefer current verified sources over high-similarity guesses.'}
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
