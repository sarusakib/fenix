'use client'

import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  MagnifyingGlass,
  ShoppingBag,
  Storefront,
  ShieldCheck,
  MapPin,
} from '@phosphor-icons/react'

import Navbar from '../../components/Navbar'

const categories = [
  {
    title: 'All Products',
    description: 'Explore products from local sellers.',
  },
  {
    title: 'Fashion',
    description: 'Clothing, accessories and local fashion.',
  },
  {
    title: 'Food',
    description: 'Local food, groceries and specialties.',
  },
  {
    title: 'Electronics',
    description: 'Electronics and everyday technology.',
  },
  {
    title: 'Home & Living',
    description: 'Useful products for home and lifestyle.',
  },
  {
    title: 'Services',
    description: 'Products and services from local businesses.',
  },
]

export default function CommercePage() {
  const router = useRouter()

  return (
    <main className="min-h-screen w-full overflow-x-clip text-white">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-white/[0.12]
            bg-white/[0.04]
            px-3.5
            py-2
            text-sm
            text-white/70
            transition
            hover:bg-white/[0.08]
            hover:text-white
          "
        >
          <ArrowLeft size={17} />
          Home
        </button>

        <div className="mt-12 max-w-3xl">
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-teal-200/[0.18]
              bg-teal-300/[0.08]
              px-4
              py-2
              text-xs
              font-semibold
              uppercase
              tracking-[0.16em]
              text-teal-200
            "
          >
            <ShoppingBag size={15} weight="duotone" />
            FeniX Commerce
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
            Shop local.
            <br />
            <span className="text-white/65">
              Connect directly.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Discover products and sellers from the Feni ecosystem.
            Buy locally without needing a FeniX account for checkout.
          </p>
        </div>

        <div
          className="
            mt-10
            flex
            w-full
            max-w-3xl
            items-center
            gap-3
            rounded-2xl
            border
            border-white/[0.16]
            bg-white/[0.055]
            p-2
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white/[0.06]
              text-white/70
            "
          >
            <MagnifyingGlass size={21} />
          </div>

          <input
            type="search"
            placeholder="Search products or sellers..."
            aria-label="Search products or sellers"
            className="
              min-w-0
              flex-1
              bg-transparent
              px-1
              text-sm
              text-white
              outline-none
              placeholder:text-white/40
              sm:text-base
            "
          />

          <button
            type="button"
            className="
              inline-flex
              h-11
              items-center
              gap-2
              rounded-xl
              bg-white/[0.10]
              px-4
              text-sm
              font-medium
              text-white
              transition
              hover:bg-white/[0.16]
            "
          >
            Search
            <ArrowRight size={17} />
          </button>
        </div>

        <section className="mt-16">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200/80">
              Browse
            </p>

            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Explore categories
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <button
                key={category.title}
                type="button"
                className="
                  group
                  rounded-3xl
                  border
                  border-white/[0.14]
                  bg-white/[0.045]
                  p-6
                  text-left
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:border-white/[0.25]
                  hover:bg-white/[0.075]
                  hover:-translate-y-0.5
                "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-teal-200/[0.16]
                      bg-teal-300/[0.08]
                      text-teal-200
                    "
                  >
                    <ShoppingBag size={21} weight="duotone" />
                  </div>

                  <ArrowRight
                    size={18}
                    className="
                      text-white/30
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                      group-hover:text-white/70
                    "
                  />
                </div>

                <h3 className="mt-6 text-lg font-semibold">
                  {category.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {category.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div
            className="
              grid
              gap-4
              md:grid-cols-3
            "
          >
            <div className="rounded-3xl border border-white/[0.12] bg-white/[0.04] p-6">
              <Storefront
                size={24}
                weight="duotone"
                className="text-teal-200"
              />

              <h3 className="mt-5 text-lg font-semibold">
                Local sellers
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Discover products from businesses and sellers within
                the Feni ecosystem.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.12] bg-white/[0.04] p-6">
              <ShieldCheck
                size={24}
                weight="duotone"
                className="text-amber-200"
              />

              <h3 className="mt-5 text-lg font-semibold">
                Trust-focused
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Commerce is being built with verification,
                ownership and secure order handling in mind.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.12] bg-white/[0.04] p-6">
              <MapPin
                size={24}
                weight="duotone"
                className="text-white/80"
              />

              <h3 className="mt-5 text-lg font-semibold">
                Built for Feni
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Start local, connect the ecosystem, and expand later
                without rebuilding the commerce foundation.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-white/[0.14] bg-white/[0.045] p-7 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200/80">
                Coming next
              </p>

              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Products are coming to FeniX Commerce.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
                Product listing, seller profiles, product images,
                cart, guest checkout and order management will be
                connected to the secure Commerce database foundation.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-white/[0.16]
                bg-white/[0.08]
                px-5
                py-3
                text-sm
                font-semibold
                transition
                hover:bg-white/[0.14]
              "
            >
              Back to FeniX
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </section>
    </main>
  )
}
