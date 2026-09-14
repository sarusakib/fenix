'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  MagnifyingGlass,
  ShoppingBag,
  Storefront,
  ShieldCheck,
  MapPin,
  Sparkle,
  Package,
  UserCircle,
} from '@phosphor-icons/react'

import Navbar from '../../components/Navbar'

const categories = [
  {
    title: 'All Products',
    titleBn: 'সব পণ্য',
    description: 'Explore products from local sellers.',
    icon: ShoppingBag,
  },
  {
    title: 'Fashion',
    titleBn: 'ফ্যাশন',
    description: 'Clothing, accessories and local fashion.',
    icon: Sparkle,
  },
  {
    title: 'Food',
    titleBn: 'খাদ্য',
    description: 'Local food, groceries and specialties.',
    icon: Package,
  },
  {
    title: 'Electronics',
    titleBn: 'ইলেকট্রনিক্স',
    description: 'Electronics and everyday technology.',
    icon: ShoppingBag,
  },
  {
    title: 'Home & Living',
    titleBn: 'হোম ও লিভিং',
    description: 'Useful products for home and lifestyle.',
    icon: Package,
  },
  {
    title: 'Services',
    titleBn: 'সেবা',
    description: 'Products and services from local businesses.',
    icon: Storefront,
  },
]

export default function CommercePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Products')

  const normalizedQuery = useMemo(
    () => query.trim().slice(0, 120),
    [query],
  )

  function handleSearch() {
    if (!normalizedQuery) {
      return
    }

    const params = new URLSearchParams({
      q: normalizedQuery,
    })

    if (selectedCategory !== 'All Products') {
      params.set('category', selectedCategory)
    }

    router.push(`/commerce?${params.toString()}`)
  }

  function handleCategory(category: string) {
    setSelectedCategory(category)

    const params = new URLSearchParams()

    if (normalizedQuery) {
      params.set('q', normalizedQuery)
    }

    if (category !== 'All Products') {
      params.set('category', category)
    }

    const search = params.toString()

    router.push(search ? `/commerce?${search}` : '/commerce')
  }

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-[#f7faf9] text-[#0b1736] transition-colors dark:bg-[#030506] dark:text-white">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="
            inline-flex items-center gap-2 rounded-xl
            border border-[#0b1736]/10
            bg-white/75 px-3.5 py-2
            text-sm text-[#0b1736]/70
            shadow-sm backdrop-blur-xl
            transition
            hover:bg-white hover:text-[#0b1736]
            dark:border-white/10
            dark:bg-white/[0.045]
            dark:text-white/70
            dark:hover:bg-white/[0.08]
            dark:hover:text-white
          "
        >
          <ArrowLeft size={17} />
          Home
        </button>

        {/* Hero */}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div
              className="
                inline-flex items-center gap-2 rounded-full
                border border-[#008080]/20
                bg-[#008080]/[0.07]
                px-4 py-2
                text-xs font-semibold uppercase
                tracking-[0.16em] text-[#007373]
                dark:border-teal-200/[0.18]
                dark:bg-teal-300/[0.08]
                dark:text-teal-200
              "
            >
              <ShoppingBag size={15} weight="duotone" />
              FeniX Commerce
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Shop local.
              <br />
              <span className="text-[#0b1736]/45 dark:text-white/45">
                Connect directly.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#0b1736]/65 dark:text-white/60 sm:text-base">
              ফেনীর স্থানীয় seller ও business থেকে products discover করুন।
              FeniX account ছাড়াই customer হিসেবে shopping করা যাবে।
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push('/commerce/sell')}
                className="
                  inline-flex items-center gap-2 rounded-xl
                  bg-[#008080] px-5 py-3
                  text-sm font-semibold text-white
                  shadow-lg shadow-[#008080]/15
                  transition hover:-translate-y-0.5 hover:bg-[#006f6f]
                "
              >
                <Storefront size={19} weight="duotone" />
                Sell on FeniX
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All Products')
                  setQuery('')
                  router.push('/commerce')
                }}
                className="
                  inline-flex items-center gap-2 rounded-xl
                  border border-[#0b1736]/10
                  bg-white/70 px-5 py-3
                  text-sm font-semibold text-[#0b1736]
                  backdrop-blur-xl
                  transition hover:bg-white
                  dark:border-white/10
                  dark:bg-white/[0.045]
                  dark:text-white
                  dark:hover:bg-white/[0.08]
                "
              >
                <ShoppingBag size={18} />
                Browse Products
              </button>
            </div>
          </div>

          {/* Trust panel */}
          <div
            className="
              relative overflow-hidden rounded-[2rem]
              border border-[#0b1736]/10
              bg-white/75 p-6
              shadow-[0_20px_70px_rgba(11,23,54,0.07)]
              backdrop-blur-2xl
              dark:border-white/10
              dark:bg-white/[0.045]
              dark:shadow-[0_20px_80px_rgba(0,0,0,0.28)]
            "
          >
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#008080]/10 blur-3xl dark:bg-[#008080]/15" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-11 w-11 items-center justify-center rounded-2xl
                    bg-[#008080]/10 text-[#008080]
                    dark:bg-teal-300/10 dark:text-teal-200
                  "
                >
                  <ShieldCheck size={23} weight="duotone" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    FeniX Trust Layer
                  </p>
                  <p className="mt-0.5 text-xs text-[#0b1736]/50 dark:text-white/45">
                    Built for local commerce
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-[#008080]"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      Feni-first marketplace
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#0b1736]/55 dark:text-white/45">
                      Local sellers, products and businesses in one ecosystem.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-[#D4A72C]"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      Guest checkout
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#0b1736]/55 dark:text-white/45">
                      Customer account is not required to place an order.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={18}
                    className="mt-0.5 shrink-0 text-[#008080]"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      Seller verification
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#0b1736]/55 dark:text-white/45">
                      Seller approval will be handled separately from customer
                      shopping.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div
          className="
            mt-12 flex w-full items-center gap-3 rounded-2xl
            border border-[#0b1736]/10
            bg-white/80 p-2
            shadow-sm backdrop-blur-xl
            dark:border-white/[0.12]
            dark:bg-white/[0.055]
            dark:shadow-none
          "
        >
          <div
            className="
              flex h-11 w-11 shrink-0 items-center justify-center
              rounded-xl bg-[#0b1736]/[0.045]
              text-[#0b1736]/55
              dark:bg-white/[0.06]
              dark:text-white/65
            "
          >
            <MagnifyingGlass size={21} />
          </div>

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value.slice(0, 120))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch()
              }
            }}
            placeholder="Search products or sellers..."
            aria-label="Search products or sellers"
            className="
              min-w-0 flex-1 bg-transparent px-1
              text-sm text-[#0b1736]
              outline-none
              placeholder:text-[#0b1736]/35
              dark:text-white
              dark:placeholder:text-white/40
              sm:text-base
            "
          />

          <button
            type="button"
            onClick={handleSearch}
            className="
              inline-flex h-11 items-center gap-2 rounded-xl
              bg-[#0b1736] px-4
              text-sm font-medium text-white
              transition hover:bg-[#16264d]
              dark:bg-white/[0.10]
              dark:hover:bg-white/[0.16]
            "
          >
            Search
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Categories */}
        <section className="mt-16">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#008080] dark:text-teal-200/80">
              Browse
            </p>

            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Explore categories
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-[#0b1736]/55 dark:text-white/45">
              Choose a category or explore everything available in FeniX
              Commerce.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = category.icon
              const active = selectedCategory === category.title

              return (
                <button
                  key={category.title}
                  type="button"
                  onClick={() => handleCategory(category.title)}
                  className={`
                    group relative overflow-hidden rounded-3xl border p-5
                    text-left transition duration-300
                    ${
                      active
                        ? 'border-[#008080]/30 bg-[#008080]/[0.07] shadow-lg shadow-[#008080]/5 dark:border-teal-300/25 dark:bg-teal-300/[0.07]'
                        : 'border-[#0b1736]/10 bg-white/70 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-[#0b1736]/5 dark:border-white/[0.09] dark:bg-white/[0.035] dark:hover:bg-white/[0.06]'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`
                        flex h-11 w-11 items-center justify-center rounded-2xl
                        ${
                          active
                            ? 'bg-[#008080]/15 text-[#008080] dark:bg-teal-300/15 dark:text-teal-200'
                            : 'bg-[#0b1736]/[0.045] text-[#0b1736]/60 dark:bg-white/[0.06] dark:text-white/65'
                        }
                      `}
                    >
                      <Icon size={22} weight="duotone" />
                    </div>

                    <ArrowRight
                      size={18}
                      className="
                        text-[#0b1736]/25
                        transition
                        group-hover:translate-x-1
                        group-hover:text-[#008080]
                        dark:text-white/20
                        dark:group-hover:text-teal-200
                      "
                    />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {category.title}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-[#008080] dark:text-teal-200/70">
                    {category.titleBn}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[#0b1736]/55 dark:text-white/45">
                    {category.description}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        {/* Products placeholder */}
        <section className="mt-16">
          <div
            className="
              rounded-[2rem] border
              border-[#0b1736]/10
              bg-white/70 p-6
              shadow-sm backdrop-blur-xl
              sm:p-8
              dark:border-white/[0.09]
              dark:bg-white/[0.035]
              dark:shadow-none
            "
          >
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div
                className="
                  flex h-16 w-16 items-center justify-center rounded-3xl
                  bg-[#008080]/10 text-[#008080]
                  dark:bg-teal-300/10 dark:text-teal-200
                "
              >
                <ShoppingBag size={30} weight="duotone" />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#008080] dark:text-teal-200/80">
                Products
              </p>

              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                Your local marketplace is getting ready.
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#0b1736]/55 dark:text-white/45 sm:text-base">
                FeniX Commerce-এর database foundation ইতিমধ্যে প্রস্তুত।
                এখন verified sellers তাদের products publish করলে এখানে
                real product listings দেখা যাবে।
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/commerce/sell')}
                  className="
                    inline-flex items-center gap-2 rounded-xl
                    bg-[#008080] px-5 py-3
                    text-sm font-semibold text-white
                    transition hover:bg-[#006f6f]
                  "
                >
                  <Storefront size={18} weight="duotone" />
                  Become a Seller
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/guide')}
                  className="
                    inline-flex items-center gap-2 rounded-xl
                    border border-[#0b1736]/10
                    bg-white/70 px-5 py-3
                    text-sm font-semibold text-[#0b1736]
                    transition hover:bg-white
                    dark:border-white/10
                    dark:bg-white/[0.045]
                    dark:text-white
                    dark:hover:bg-white/[0.08]
                  "
                >
                  Explore Feni Brain
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Ecosystem connection */}
        <section className="mt-16">
          <div className="grid gap-4 md:grid-cols-3">
            <div
              className="
                rounded-3xl border border-[#0b1736]/10
                bg-white/65 p-5
                dark:border-white/[0.08]
                dark:bg-white/[0.03]
              "
            >
              <ShoppingBag
                size={22}
                className="text-[#008080]"
                weight="duotone"
              />
              <h3 className="mt-5 font-semibold">Discover</h3>
              <p className="mt-2 text-sm leading-6 text-[#0b1736]/55 dark:text-white/45">
                Products, sellers and local businesses can live inside the
                same FeniX ecosystem.
              </p>
            </div>

            <div
              className="
                rounded-3xl border border-[#0b1736]/10
                bg-white/65 p-5
                dark:border-white/[0.08]
                dark:bg-white/[0.03]
              "
            >
              <Storefront
                size={22}
                className="text-[#D4A72C]"
                weight="duotone"
              />
              <h3 className="mt-5 font-semibold">Sell</h3>
              <p className="mt-2 text-sm leading-6 text-[#0b1736]/55 dark:text-white/45">
                Local sellers will be able to publish products and manage
                their orders from their own workspace.
              </p>
            </div>

            <div
              className="
                rounded-3xl border border-[#0b1736]/10
                bg-white/65 p-5
                dark:border-white/[0.08]
                dark:bg-white/[0.03]
              "
            >
              <ShieldCheck
                size={22}
                className="text-[#008080]"
                weight="duotone"
              />
              <h3 className="mt-5 font-semibold">Trust</h3>
              <p className="mt-2 text-sm leading-6 text-[#0b1736]/55 dark:text-white/45">
                Seller verification, secure orders and database-level
                controls will protect the Commerce layer.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
