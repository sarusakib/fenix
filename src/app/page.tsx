'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Rocket,
  TrendUp,
  Storefront,
  Lightbulb,
  MagnifyingGlass,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  Buildings,
  Users,
} from '@phosphor-icons/react'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const actionCards = [
    {
      id: 'start',
      title: 'ব্যবসা শুরু করুন',
      desc: 'লাইসেন্স, সাপ্লায়ার ও গাইডলাইন পান এক জায়গায়',
      icon: Rocket,
      accent: 'teal',
      badge: 'স্টার্টআপ',
      href: '/start',
    },
    {
      id: 'invest',
      title: 'ইনভেস্টমেন্ট',
      desc: 'ভেরিফাইড স্থানীয় ব্যবসায় নিরাপদ বিনিয়োগ করুন',
      icon: TrendUp,
      accent: 'gold',
      badge: 'স্মার্ট রিটার্ন',
      href: '/invest',
    },
    {
      id: 'suppliers',
      title: 'সাপ্লায়ার খুঁজুন',
      desc: 'পাইকারি বিক্রেতা ও প্রস্তুতকারকদের সাথে যুক্ত হন',
      icon: Storefront,
      accent: 'cyan',
      badge: 'বিটুবি',
      href: '/directory',
    },
    {
      id: 'guide',
      title: 'বিজনেস কুপাস / গাইড',
      desc: 'ফেনী ব্রেইন AI-এর থেকে ব্যবসার পরামর্শ নিন',
      icon: Lightbulb,
      accent: 'purple',
      badge: 'AI হেল্পার',
      href: '/guide',
    },
  ]

  const quickPrompts = [
    'কম টাকায় কাপড়ের ব্যবসা',
    'ফেনীর সেরা এগ্রো প্রজেক্ট',
    'পাইকারি ইলেকট্রনিক্স বাজার',
    'ট্রেড লাইসেন্স আবেদন',
  ]

  const handleSearch = () => {
    const query = searchQuery.trim()

    if (!query) {
      router.push('/guide')
      return
    }

    router.push(`/guide?q=${encodeURIComponent(query)}`)
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-[#030506] text-[#eef4f3] flex flex-col font-sans overflow-x-hidden">

      {/* =========================================================
          BACKGROUND ATMOSPHERE
      ========================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, rgba(0,128,128,0.14) 0%, rgba(0,128,128,0.035) 42%, transparent 72%)',
          }}
        />

        <div
          className="absolute right-[-180px] top-[35%] h-[420px] w-[420px] rounded-full blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, rgba(0,128,128,0.08) 0%, transparent 70%)',
          }}
        />

        <div
          className="absolute bottom-[-180px] left-[-150px] h-[420px] w-[420px] rounded-full blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, rgba(170,125,64,0.055) 0%, transparent 70%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* =========================================================
          TOP NAVIGATION
      ========================================================= */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#030506]/85 text-white backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            <div className="flex items-center">
              <Link
                href="/"
                className="group flex items-center gap-2"
              >
                <span
                  className="text-2xl font-extrabold tracking-wider text-[#eef4f3] transition-all duration-300 group-hover:text-[#008080]"
                  style={{
                    textShadow:
                      '0 0 22px rgba(0,128,128,0.18)',
                  }}
                >
                  FeniX
                </span>

                <span className="rounded-full border border-[#008080]/25 bg-[#008080]/10 px-2 py-0.5 text-[10px] font-medium text-[#78d7d4]">
                  Ecosystem
                </span>
              </Link>
            </div>

            <div className="hidden items-center gap-7 text-sm font-medium md:flex">
              <Link
                href="/"
                className="text-white transition-colors hover:text-[#63d4d1]"
              >
                হোম
              </Link>

              <Link
                href="/directory"
                className="text-white/65 transition-colors hover:text-[#63d4d1]"
              >
                বিজনেস ডিরেক্টরি
              </Link>

              <Link
                href="/invest"
                className="text-white/65 transition-colors hover:text-[#d4b879]"
              >
                ইনভেস্টমেন্ট
              </Link>
            </div>

            <div className="flex items-center">
              <Link
                href="/login"
                className="rounded-xl border border-[#008080]/40 bg-[#008080]/90 px-4 py-2 text-sm font-medium text-white shadow-[0_0_22px_rgba(0,128,128,0.12)] transition-all duration-300 hover:bg-[#009999] hover:shadow-[0_0_30px_rgba(0,128,128,0.22)]"
              >
                লগইন করুন
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-white/[0.055] bg-[#030506] px-4 pb-24 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-250px] h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(0,128,128,0.10) 0%, rgba(0,80,82,0.035) 40%, transparent 72%)',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-220px] left-[-150px] h-[440px] w-[440px] rounded-full blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(170,125,64,0.045) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl text-center">

          {/* Identity pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.035] px-3 py-1.5 text-xs font-medium text-[#d4b879] shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:text-sm">
            <Sparkle
              weight="fill"
              className="h-4 w-4 text-[#d4b879]"
            />

            <span>
              ফেনীর এক নম্বর ডিজিটাল বিজনেস ইকোসিস্টেম
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            আজ আপনি আপনার ব্যবসার জন্য
            <br />

            <span
              className="bg-gradient-to-r from-[#f1f4f3] via-[#62d4d1] to-[#d4b879] bg-clip-text text-transparent"
              style={{
                textShadow:
                  '0 0 35px rgba(0,128,128,0.12)',
              }}
            >
              কী করতে চান?
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm font-normal leading-7 text-white/55 sm:text-base">
            ফেনীর উদ্যোক্তা, বিনিয়োগকারী এবং ব্যবসার জন্য তৈরি সমন্বিত
            প্ল্যাটফর্ম। সঠিক তথ্য, বিশ্বস্ত পার্টনার ও আধুনিক প্রযুক্তিতে
            গড়ে তুলুন আপনার বিজনেস।
          </p>

          {/* =====================================================
              SEARCH BAR
          ===================================================== */}
          <div className="mx-auto mt-9 max-w-3xl">

            <div className="group relative flex items-center rounded-2xl border border-[#008080]/30 bg-white/[0.055] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.30)] backdrop-blur-2xl transition-all duration-300 focus-within:border-[#008080]/70 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_45px_rgba(0,128,128,0.10)]">

              <div className="shrink-0 p-3 text-gray-400">
                <MagnifyingGlass
                  size={24}
                  className="text-[#48c6c3]"
                />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Feni Brain-কে যা ইচ্ছা জিজ্ঞাসা করুন..."
                className="w-full min-w-0 bg-transparent px-2 text-sm font-medium text-white outline-none placeholder:text-white/30 sm:text-base"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-[#008080] px-4 py-3 text-sm font-medium text-white shadow-[0_0_20px_rgba(0,128,128,0.12)] transition-all duration-300 hover:bg-[#009999] hover:shadow-[0_0_28px_rgba(0,128,128,0.20)] sm:px-5 sm:text-base"
              >
                <span>খুঁজুন</span>

                <ArrowRight
                  size={18}
                  weight="bold"
                />
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              <span className="font-medium text-white/35">
                জনপ্রিয় সার্চ:
              </span>

              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() =>
                    setSearchQuery(prompt)
                  }
                  className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-white/55 transition-all duration-200 hover:border-[#008080]/30 hover:bg-[#008080]/10 hover:text-[#8ee2df]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ACTION CARDS
      ========================================================= */}
      <section className="relative z-20 mx-auto -mt-8 mb-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {actionCards.map((card) => {
            const IconComponent = card.icon

            const accentStyles = {
              teal: {
                icon:
                  'border-[#008080]/25 bg-[#008080]/10 text-[#56d1ce]',
                hover:
                  'hover:border-[#008080]/45',
                title:
                  'group-hover:text-[#56d1ce]',
              },
              gold: {
                icon:
                  'border-[#d4b879]/25 bg-[#d4b879]/10 text-[#d4b879]',
                hover:
                  'hover:border-[#d4b879]/40',
                title:
                  'group-hover:text-[#d4b879]',
              },
              cyan: {
                icon:
                  'border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300',
                hover:
                  'hover:border-cyan-400/35',
                title:
                  'group-hover:text-cyan-300',
              },
              purple: {
                icon:
                  'border-purple-400/20 bg-purple-400/[0.07] text-purple-300',
                hover:
                  'hover:border-purple-400/35',
                title:
                  'group-hover:text-purple-300',
              },
            }[card.accent]

            return (
              <Link
                key={card.id}
                href={card.href}
                className={`group flex min-h-[230px] cursor-pointer flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#080c0e]/90 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#0a1012] hover:shadow-[0_22px_65px_rgba(0,0,0,0.35)] ${accentStyles.hover}`}
              >
                <div>

                  <div className="mb-5 flex items-center justify-between">

                    <div
                      className={`rounded-xl border p-3 transition-all duration-300 ${accentStyles.icon}`}
                    >
                      <IconComponent
                        size={28}
                        weight="duotone"
                      />
                    </div>

                    <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[10px] font-semibold text-white/45">
                      {card.badge}
                    </span>
                  </div>

                  <h3
                    className={`text-lg font-bold text-white transition-colors duration-300 ${accentStyles.title}`}
                  >
                    {card.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-white/40 sm:text-sm">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-xs font-bold text-[#4fc9c6] transition-transform duration-300 group-hover:translate-x-1">
                  <span>বিস্তারিত দেখুন</span>

                  <ArrowRight
                    size={14}
                    className="ml-1"
                    weight="bold"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* =========================================================
          TRUST & STATS
      ========================================================= */}
      <section className="mx-auto mb-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080c0e]/85 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full blur-[90px]"
            style={{
              background:
                'rgba(0,128,128,0.055)',
            }}
          />

          <div className="relative z-10">

            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-white">
                কেন FeniX প্ল্যাটফর্ম ব্যবহার করবেন?
              </h2>

              <p className="mt-2 text-sm text-white/40">
                ফেনীর স্থানীয় ব্যবসার নিরাপত্তা ও স্বচ্ছতা নিশ্চিত করাই
                আমাদের প্রথম অগ্রাধিকার
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">

              {/* Trust */}
              <div className="flex flex-col items-center space-y-3 p-4">
                <div className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] p-4 text-emerald-300">
                  <ShieldCheck
                    size={36}
                    weight="duotone"
                  />
                </div>

                <h4 className="text-lg font-bold text-white">
                  ট্রাফিক লাইট ট্রাস্ট সিস্টেম
                </h4>

                <p className="text-xs leading-6 text-white/40">
                  ফিল্ড এজেন্ট দ্বারা সরেজমিনে ভেরিফাইড ব্যবসার তালিকা।
                  গ্রীন ট্যাব দিয়ে সুরক্ষিত ব্যবসা চিনুন।
                </p>
              </div>

              {/* Network */}
              <div className="flex flex-col items-center space-y-3 p-4">
                <div className="rounded-full border border-[#d4b879]/15 bg-[#d4b879]/[0.07] p-4 text-[#d4b879]">
                  <Buildings
                    size={36}
                    weight="duotone"
                  />
                </div>

                <h4 className="text-lg font-bold text-white">
                  স্থানীয় বিজনেস নেটওয়ার্ক
                </h4>

                <p className="text-xs leading-6 text-white/40">
                  ফেনীর ৬টি উপজেলার পাইকারি বিক্রেতা ও সাপ্লায়ারদের
                  সরাসরি পরিচিতি ও যোগাযোগের সুবিধা।
                </p>
              </div>

              {/* Investment */}
              <div className="flex flex-col items-center space-y-3 p-4">
                <div className="rounded-full border border-cyan-400/15 bg-cyan-400/[0.07] p-4 text-cyan-300">
                  <Users
                    size={36}
                    weight="duotone"
                  />
                </div>

                <h4 className="text-lg font-bold text-white">
                  নিরাপদ ইনভেস্টমেন্ট সুযোগ
                </h4>

                <p className="text-xs leading-6 text-white/40">
                  ছোট ও মাঝারি ব্যবসায় স্বচ্ছ চুক্তির ভিত্তিতে শেয়ার
                  বা পার্টনারশিপের সুযোগ।
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="mt-auto border-t border-white/[0.07] bg-[#020304] py-8 text-xs text-white/35 sm:text-sm">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">

          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold text-white"
              style={{
                textShadow:
                  '0 0 18px rgba(0,128,128,0.20)',
              }}
            >
              FeniX
            </span>

            <span>
              © 2026 Feni Business Ecosystem. সর্বস্বত্ব সংরক্ষিত।
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/terms"
              className="transition-colors hover:text-white"
            >
              শর্তাবলী
            </Link>

            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              গোপনীয়তা নীতি
            </Link>

            <Link
              href="/contact"
              className="transition-colors hover:text-white"
            >
              যোগাযোগ
            </Link>
          </div>

        </div>
      </footer>
    </div>
  )
                }
