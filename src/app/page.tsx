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
      color: 'bg-teal-50 text-[#008080] border-teal-200',
      badge: 'স্টার্টআপ',
      href: '/start',
    },
    {
      id: 'invest',
      title: 'ইনভেস্টমেন্ট',
      desc: 'ভেরিফাইড স্থানীয় ব্যবসায় নিরাপদ বিনিয়োগ করুন',
      icon: TrendUp,
      color: 'bg-amber-50 text-[#0B1736] border-amber-200',
      badge: 'স্মার্ট রিটার্ন',
      href: '/invest',
    },
    {
      id: 'suppliers',
      title: 'সাপ্লায়ার খুঁজুন',
      desc: 'পাইকারি বিক্রেতা ও প্রস্তুতকারকদের সাথে যুক্ত হন',
      icon: Storefront,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      badge: 'বিটুবি',
      href: '/directory',
    },
    {
      id: 'guide',
      title: 'বিজনেস কুপাস / গাইড',
      desc: 'ফেনী ব্রেইন AI-এর থেকে ব্যবসার পরামর্শ নিন',
      icon: Lightbulb,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-[#0B1736] border-b border-gray-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold text-[#FFD700] tracking-wider">
                  FeniX
                </span>

                <span className="text-xs bg-[#008080] text-white px-2 py-0.5 rounded-full font-medium">
                  Ecosystem
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/"
                className="hover:text-[#FFD700] transition-colors"
              >
                হোম
              </Link>

              <Link
                href="/directory"
                className="hover:text-[#FFD700] transition-colors"
              >
                বিজনেস ডিরেক্টরি
              </Link>

              <Link
                href="/invest"
                className="hover:text-[#FFD700] transition-colors"
              >
                ইনভেস্টমেন্ট
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="bg-[#008080] hover:bg-[#006666] text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                লগইন করুন
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#0B1736] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#008080]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-[#FFD700]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-white/10 text-[#FFD700]">
            <Sparkle
              weight="fill"
              className="text-[#FFD700] w-4 h-4"
            />

            <span>ফেনীর এক নম্বর ডিজিটাল বিজনেস ইকোসিস্টেম</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            আজ আপনি আপনার ব্যবসার জন্য
            <br />

            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-teal-300 to-emerald-400">
              কী করতে চান?
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 font-normal">
            ফেনীর উদ্যোক্তা, বিনিয়োগকারী এবং ব্যবসার জন্য তৈরি সমন্বিত
            প্ল্যাটফর্ম। সঠিক তথ্য, বিশ্বস্ত পার্টনার ও আধুনিক প্রযুক্তিতে
            গড়ে তুলুন আপনার বিজনেস।
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mt-8">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl border-2 border-teal-500/30 p-2 focus-within:border-[#008080] transition-all duration-300">
              <div className="p-3 text-gray-400">
                <MagnifyingGlass
                  size={24}
                  className="text-[#008080]"
                />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Feni Brain-কে যা ইচ্ছা জিজ্ঞাসা করুন..."
                className="w-full text-gray-800 text-sm sm:text-base outline-none bg-transparent px-2 placeholder-gray-400 font-medium"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="bg-[#008080] hover:bg-[#006666] text-white px-5 py-3 rounded-xl font-medium text-sm sm:text-base flex items-center space-x-2 transition-all shadow-md shrink-0"
              >
                <span>খুঁজুন</span>
                <ArrowRight size={18} weight="bold" />
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs sm:text-sm">
              <span className="text-gray-400 font-medium">
                জনপ্রিয় সার্চ:
              </span>

              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setSearchQuery(prompt)}
                  className="bg-white/10 hover:bg-white/20 text-gray-200 px-3 py-1 rounded-lg border border-white/10 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Action Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 w-full mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actionCards.map((card) => {
            const IconComponent = card.icon

            return (
              <Link
                key={card.id}
                href={card.href}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl border ${card.color}`}
                    >
                      <IconComponent
                        size={28}
                        weight="duotone"
                      />
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0B1736] group-hover:text-[#008080] transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center text-xs font-bold text-[#008080] group-hover:translate-x-1 transition-transform">
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

      {/* Trust & Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-[#0B1736]">
              কেন FeniX প্ল্যাটফর্ম ব্যবহার করবেন?
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              ফেনীর স্থানীয় ব্যবসার নিরাপত্তা ও স্বচ্ছতা নিশ্চিত করাই
              আমাদের প্রথম অগ্রাধিকার
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center space-y-3 p-4">
              <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
                <ShieldCheck size={36} weight="duotone" />
              </div>

              <h4 className="text-lg font-bold text-[#0B1736]">
                ট্রাফিক লাইট ট্রাস্ট সিস্টেম
              </h4>

              <p className="text-xs text-gray-500">
                ফিল্ড এজেন্ট দ্বারা সরেজমিনে ভেরিফাইড ব্যবসার তালিকা।
                গ্রীন ট্যাব দিয়ে সুরক্ষিত ব্যবসা চিনুন।
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 p-4">
              <div className="p-4 bg-amber-50 rounded-full text-amber-600">
                <Buildings size={36} weight="duotone" />
              </div>

              <h4 className="text-lg font-bold text-[#0B1736]">
                স্থানীয় বিজনেস নেটওয়ার্ক
              </h4>

              <p className="text-xs text-gray-500">
                ফেনীর ৬টি উপজেলার পাইকারি বিক্রেতা ও সাপ্লায়ারদের
                সরাসরি পরিচিতি ও যোগাযোগের সুবিধা।
              </p>
            </div>

            <div className="flex flex-col items-center space-y-3 p-4">
              <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                <Users size={36} weight="duotone" />
              </div>

              <h4 className="text-lg font-bold text-[#0B1736]">
                নিরাপদ ইনভেস্টমেন্ট সুযোগ
              </h4>

              <p className="text-xs text-gray-500">
                ছোট ও মাঝারি ব্যবসায় স্বচ্ছ চুক্তির ভিত্তিতে শেয়ার
                বা পার্টনারশিপের সুযোগ।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1736] text-gray-400 py-8 border-t border-gray-800 mt-auto text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-[#FFD700]">
              FeniX
            </span>

            <span>
              © 2026 Feni Business Ecosystem. সর্বস্বত্ব সংরক্ষিত।
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              শর্তাবলী
            </Link>

            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              গোপনীয়তা নীতি
            </Link>

            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              যোগাযোগ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
                                                          }
