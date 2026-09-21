'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, FirstAidKit, Heartbeat, MapPin, ShieldCheck, Van } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

export default function CarePage() {
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'
  const cards = [
    {
      href: '/care/blood',
      Icon: Heartbeat,
      title: bn ? 'রক্ত সহায়তা' : 'Blood Help',
      text: bn ? 'রক্তের request দেখুন বা donor হিসেবে register করুন।' : 'Find open blood requests or register as a donor.',
    },
    {
      href: '/care/ambulance',
      Icon: Van,
      title: bn ? 'অ্যাম্বুল্যান্স' : 'Ambulance',
      text: bn ? 'লোকাল ambulance provider খুঁজুন বা request দিন।' : 'Find a local ambulance provider or send a request.',
    },
    {
      href: '/directory',
      Icon: FirstAidKit,
      title: bn ? 'হাসপাতাল ও ফার্মেসি' : 'Hospitals & Pharmacy',
      text: bn ? 'FeniX Directory-তে local health service খুঁজুন।' : 'Discover local health services in the FeniX directory.',
    },
  ]

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6">
        <Link href="/services" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold">
          <ArrowLeft size={16} /> {bn ? 'সার্ভিস' : 'Services'}
        </Link>

        <div className="mt-7 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">
            <Heartbeat size={17} /> FeniX Care
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-6xl">
            {bn ? 'জরুরি সময়ে দ্রুত সঠিক পথে যান।' : 'Get to the right local help, faster.'}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">
            {bn
              ? 'Emergency information source-first রাখা হয়েছে। FeniX medical diagnosis বা emergency dispatcher নয়; এটি local information, matching এবং request routing-এ সাহায্য করে।'
              : 'Emergency information is source-first. FeniX does not replace medical care or an emergency dispatcher; it helps with local information, matching and request routing.'}
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-200/10 dark:bg-amber-500/[.06] dark:text-amber-100">
            <ShieldCheck size={20} className="mt-0.5 shrink-0" />
            <span>{bn ? 'জরুরি বিপদে স্থানীয় emergency service/হাসপাতালের সঙ্গে সরাসরি যোগাযোগ করুন। FeniX-এর তথ্য ব্যবহার করার আগে latest availability যাচাই করুন।' : 'For an immediate emergency, contact local emergency services or a hospital directly. Verify current availability before relying on FeniX information.'}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {cards.map(({ href, Icon, title, text }) => (
            <Link key={href} href={href} className="group rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 transition hover:-translate-y-0.5">
              <Icon size={25} className="text-[var(--fx-primary-strong)]" weight="duotone" />
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold">{bn ? 'খুলুন' : 'Open'} <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-[var(--fx-primary-strong)]"><MapPin size={16}/> Feni-first</div>
          <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">
            {bn ? 'Area → Upazila → local provider context ধরে results সাজানো হবে, আর exact home address public হবে না।' : 'Results are organized around area → upazila → provider context, while exact home addresses remain private.'}
          </p>
        </div>
      </section>
    </main>
  )
}
