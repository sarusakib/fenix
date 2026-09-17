import Link from 'next/link'
import {
  ArrowRight,
  ShoppingBag,
  Storefront,
  ShieldCheck,
} from '@phosphor-icons/react/dist/ssr'

import Navbar from '@/components/Navbar'
import ProductCard from '@/components/commerce/ProductCard'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

type CommercePageProps = {
  searchParams: Promise<{
    q?: string
    category?: string
  }>
}

export default async function CommercePage({
  searchParams,
}: CommercePageProps) {
  const params = await searchParams

  const q = (params.q || '').trim().slice(0, 120)
  const category = (params.category || '').trim().slice(0, 120)

  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select(
      `
        id,
        vendor_id,
        category_id,
        name_bn,
        name_en,
        slug,
        description_bn,
        description_en,
        sku,
        price,
        compare_at_price,
        currency,
        status,
        is_active,
        is_featured,
        allow_guest_purchase,
        vendor_profiles(
          display_name,
          is_verified
        ),
        product_images(
          id,
          storage_bucket,
          storage_path,
          alt_text_bn,
          alt_text_en,
          sort_order,
          is_primary
        )
      `,
    )
    .eq('status', 'published')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(48)

  if (q) {
    query = query.or(
      [
        `name_bn.ilike.%${q}%`,
        `name_en.ilike.%${q}%`,
        `description_bn.ilike.%${q}%`,
        `description_en.ilike.%${q}%`,
      ].join(','),
    )
  }

  if (category) {
    query = query.eq('category_id', category)
  }

  const { data, error } = await query

  const products = (data || []).map((row) => {
    const product = row as any

    return {
      ...product,
      vendor: product.vendor_profiles,
      images: product.product_images,
    }
  })

  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2rem] border border-[#0b1736]/10 bg-white/70 p-7 dark:border-white/10 dark:bg-white/[0.04] lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#008080]">
              <ShoppingBag size={16} weight="bold" />
              FeniX Commerce
            </div>

            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
              Shop local.
              <br />
              <span className="opacity-45">Connect directly.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 opacity-60">
              ফেনীর approved seller ও business থেকে products discover
              করুন। Guest checkout-ও supported.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/commerce/sell"
              className="inline-flex items-center gap-2 rounded-xl bg-[#008080] px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <Storefront size={18} weight="bold" />
              Sell on FeniX
              <ArrowRight size={16} weight="bold" />
            </Link>

            <Link
              href="/commerce/cart"
              className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 px-5 py-3 text-sm font-bold transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.05]"
            >
              <ShoppingBag size={18} weight="bold" />
              Cart
            </Link>
          </div>
        </div>

        <form
          action="/commerce"
          method="get"
          className="mt-7 flex gap-2 rounded-2xl border border-[#0b1736]/10 bg-white/80 p-2 dark:border-white/10 dark:bg-white/[0.04]"
        >
          <input
            name="q"
            defaultValue={q}
            maxLength={120}
            placeholder="Search products..."
            autoComplete="off"
            className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:opacity-40"
          />

          <button
            type="submit"
            className="rounded-xl bg-[#0b1736] px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 dark:bg-white/[0.12]"
          >
            Search
          </button>
        </form>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#008080]">
              Marketplace
            </p>

            <h2 className="mt-1 text-2xl font-black">
              {q ? `Results for “${q}”` : 'Published products'}
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 text-xs opacity-50">
            <ShieldCheck size={16} weight="bold" />
            Approved sellers are verified separately
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-600 dark:text-red-400">
            Products could not be loaded.
          </div>
        ) : products.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[2rem] border border-[#0b1736]/10 bg-white/70 p-12 text-center dark:border-white/10 dark:bg-white/[0.04]">
            <ShoppingBag
              size={40}
              weight="duotone"
              className="mx-auto opacity-30"
            />

            <h3 className="mt-4 text-xl font-bold">
              No published products yet
            </h3>

            <p className="mt-2 text-sm opacity-55">
              Approved sellers can create product drafts from the seller
              area.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
