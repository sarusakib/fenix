import Link from 'next/link'
import { ArrowLeft, CheckCircle, ShoppingCart, ShieldCheck, Storefront } from '@phosphor-icons/react/dist/ssr'

import Navbar from '@/components/Navbar'
import AddToCartButton from '@/components/commerce/AddToCartButton'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `id, vendor_id, name_bn, name_en, slug, description_bn, description_en, sku, price, compare_at_price, currency, allow_guest_purchase, vendor_profiles(display_name, is_verified), product_images(id, storage_bucket, storage_path, alt_text_bn, alt_text_en, sort_order, is_primary)`,
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('is_active', true)
    .maybeSingle()

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
        <Navbar />
        <section className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-3xl font-black">Product not found</h1>
          <p className="mt-3 text-sm opacity-55">এই productটি আর available নেই বা প্রকাশিত হয়নি।</p>
          <Link href="/commerce" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#008080] px-5 py-3 text-sm font-bold text-white">
            <ArrowLeft size={17} /> Back to Commerce
          </Link>
        </section>
      </main>
    )
  }

  const vendor = Array.isArray(product.vendor_profiles) ? product.vendor_profiles[0] : product.vendor_profiles
  const title = product.name_bn || product.name_en
  const image = Array.isArray(product.product_images)
    ? [...product.product_images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0]
    : null

  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/commerce" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]">
          <ArrowLeft size={17} /> Commerce
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-[2rem] border border-[#0b1736]/10 bg-white/70 dark:border-white/10 dark:bg-white/[0.045]">
            {image ? (
              <div className="flex h-full items-center justify-center p-6 text-center opacity-55">
                <div>
                  <ShoppingCart size={64} weight="duotone" className="mx-auto" />
                  <p className="mt-3 text-xs">Product image storage is configured for this item.</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center opacity-30"><ShoppingCart size={80} weight="duotone" /></div>
            )}
          </div>

          <div className="self-center">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#008080]">
              <CheckCircle size={15} weight="fill" /> Approved seller
              {vendor?.is_verified && <><span className="opacity-30">•</span><ShieldCheck size={15} weight="fill" /> Verified</>}
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">{title}</h1>
            {product.name_bn && product.name_en && <p className="mt-2 text-sm opacity-45">{product.name_en}</p>}
            <p className="mt-7 text-3xl font-black">{product.currency} {Number(product.price).toLocaleString('en-BD')}</p>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <p className="mt-1 text-sm opacity-40 line-through">{product.currency} {Number(product.compare_at_price).toLocaleString('en-BD')}</p>
            )}

            {(product.description_bn || product.description_en) && (
              <div className="mt-7 rounded-2xl border border-[#0b1736]/10 bg-white/70 p-5 text-sm leading-7 dark:border-white/10 dark:bg-white/[0.045]">
                {product.description_bn || product.description_en}
              </div>
            )}

            {vendor?.display_name && <p className="mt-5 inline-flex items-center gap-2 text-sm opacity-55"><Storefront size={17} /> {vendor.display_name}</p>}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <AddToCartButton product={{ id: product.id, slug: product.slug, name: title, price: Number(product.price), currency: product.currency, allowGuestPurchase: product.allow_guest_purchase, imageUrl: null }} />
              <Link href="/commerce/cart" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 px-5 py-3 text-sm font-bold dark:border-white/10">
                View cart <ShoppingCart size={17} />
              </Link>
            </div>
            {!product.allow_guest_purchase && <p className="mt-3 text-xs text-[#8c6a0e]">Guest checkout is disabled for this product. Sign in to continue.</p>}
          </div>
        </div>
      </section>
    </main>
  )
}
