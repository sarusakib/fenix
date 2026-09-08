'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Buildings,
  CaretRight,
  CheckCircle,
  Compass,
  Lightbulb,
  MagnifyingGlass,
  Rocket,
  ShieldCheck,
  Sparkle,
  Storefront,
  TrendUp,
  Users,
} from '@phosphor-icons/react'

import Navbar from '../components/Navbar'

type Accent = 'teal' | 'gold'

type ActionCard = {
  title: string
  description: string
  href: string
  icon: React.ElementType
  accent: Accent
}

const actionCards: ActionCard[] = [
  {
    title: 'Start a Business',
    description:
      'Build your business journey with guidance, discovery and a connected local ecosystem.',
    href: '/start',
    icon: Rocket,
    accent: 'teal',
  },
  {
    title: 'Invest in Feni',
    description:
      'Discover emerging opportunities and connect ideas with local growth.',
    href: '/invest',
    icon: TrendUp,
    accent: 'gold',
  },
  {
    title: 'Find Suppliers',
    description:
      'Explore businesses, suppliers and useful commercial connections across Feni.',
    href: '/directory',
    icon: Storefront,
    accent: 'teal',
  },
  {
    title: 'Business Guide',
    description:
      'Get practical answers and discover the right next step for your business.',
    href: '/guide',
    icon: Lightbulb,
    accent: 'gold',
  },
]

const quickPrompts = [
  'How do I start a business in Feni?',
  'Find suppliers in Feni',
  'Investment opportunities in Feni',
  'Business registration guide',
]

function AccentIcon({
  accent,
  children,
}: {
  accent: Accent
  children: React.ReactNode
}) {
  return (
    <div
      className={[
        'flex h-11 w-11 items-center justify-center rounded-2xl border',
        accent === 'teal'
          ? 'border-[#008080]/20 bg-[#008080]/[0.07] text-[#007d7d] dark:border-[#72ddda]/20 dark:bg-[#72ddda]/[0.07] dark:text-[#72ddda]'
          : 'border-[#d4b879]/25 bg-[#d4b879]/[0.07] text-[#9a751f] dark:border-[#d4b879]/25 dark:bg-[#d4b879]/[0.07] dark:text-[#d4b879]',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedQuery = useMemo(
    () => searchQuery.trim().slice(0, 120),
    [searchQuery],
  )

  const handleSearch = () => {
    if (!normalizedQuery) {
      router.push('/guide')
      return
    }

    router.push(`/guide?q=${encodeURIComponent(normalizedQuery)}`)
  }

  const handlePrompt = (prompt: string) => {
    router.push(`/guide?q=${encodeURIComponent(prompt)}`)
  }

  return (
    <main
      className="
        relative
        min-h-dvh
        overflow-x-clip
        text-[#111827]
        dark:text-white
      "
    >
      <div className="relative z-10">
        <Navbar />

        {/* ================= HERO ================= */}
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-5xl text-center">
            {/* Eyebrow */}
            <div
              className="
                mx-auto
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-black/[0.07]
                bg-white/[0.16]
                px-3
                py-1.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-black/55
                backdrop-blur-sm
                dark:border-white/[0.08]
                dark:bg-black/[0.16]
                dark:text-white/55
                sm:text-xs
              "
            >
              <Sparkle
                size={13}
                className="text-[#008080] dark:text-[#72ddda]"
                weight="fill"
              />
              FeniX Business Ecosystem
            </div>

            {/* Heading */}
            <h1
              className="
                mx-auto
                mt-6
                max-w-5xl
                text-balance
                text-4xl
                font-black
                tracking-[-0.04em]
                text-[#111827]
                sm:text-6xl
                lg:text-7xl
                dark:text-white
              "
            >
              Build the future of business in{' '}
              <span className="text-[#008080] dark:text-[#72ddda]">
                Feni.
              </span>
            </h1>

            {/* Description */}
            <p
              className="
                mx-auto
                mt-6
                max-w-2xl
                text-pretty
                text-sm
                leading-7
                text-black/55
                sm:text-base
                sm:leading-8
                dark:text-white/55
              "
            >
              One connected ecosystem for entrepreneurs,
              investors, businesses, suppliers and local growth.
            </p>

            {/* ================= SEARCH ================= */}
            <div className="mx-auto mt-8 max-w-3xl">
              <div
                className="
                  rounded-2xl
                  border
                  border-black/[0.07]
                  bg-white/[0.13]
                  p-2
                  shadow-xl
                  shadow-black/[0.05]
                  backdrop-blur-lg
                  dark:border-white/[0.08]
                  dark:bg-black/[0.22]
                  dark:shadow-black/20
                  sm:rounded-3xl
                "
              >
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div
                    className="
                      flex
                      min-h-[54px]
                      flex-1
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-black/[0.06]
                      bg-white/[0.07]
                      px-4
                      backdrop-blur-sm
                      sm:min-h-[58px]
                      sm:rounded-2xl
                      dark:border-white/[0.06]
                      dark:bg-white/[0.025]
                    "
                  >
                    <Magn
