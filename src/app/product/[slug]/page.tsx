import Link from 'next/link'
import { ArrowLeft, ShoppingCart, ShieldCheck, Storefront } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import AddToCartButton from '@/components/commerce/AddToCartButton'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }
type ProductRow = {
  id: string; vendor_id: string; name_bn: string | null; name_en: string | null; slug: string
  description_bn: string | null; description_en: string | null; sku: string | null
  price: number; compare_at_price: number | null; currency: string; allow_guest_purchase: boolean
  vendor_display_name: string | null; vendor_is_verified: boolean | null; shop_slug: string | null
  image_id: string | null; image_bucket: string | null; image_path: string | null
  image_alt_bn: string | null; image_alt_en: string | null
}

export default async function CommerceProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('commerce_public_products').select('*').eq('slug', slug).limit(1)
  if (error || !data?.length) return (
    <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar />
      <section className="mx-auto max-w-xl px-4 py-24 text-center"><ShoppingCart size={48} className="mx-auto opacity-25" />
        <h1 className="mt-5 text-3xl font-black">Product not found</h1><p className="mt-3 text-sm opacity-55">এই productটি আর public listing-এ নেই।</p>
        <Link href="/commerce" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#008080] px-5 py-3 text-sm font-bold text-white"><ArrowLeft size={17} /> Back to Commerce</Link>
      </section>
    </main>
  )
  const product = data[0] as unknown as ProductRow
  const imageUrl = product.image_bucket && product.image_path ? supabase.storage.from(product.image_bucket).getPublicUrl(product.image_path).data.publicUrl : null
  const title = product.name_bn || product.name_en || 'Product'
  const hasDiscount = product.compare_at_price !== null && product.compare_at_price > product.price
  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/commerce" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]"><ArrowLeft size={17} /> Commerce</Link>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-[#0b1736]/10 bg-white/70 dark:border-white/10 dark:bg-white/[0.045]"><div className="aspect-square bg-black/[0.035] dark:bg-white/[0.04]">
            {imageUrl ? <>\n            {/* Intentional public commerce image URL. */}\n            {/* eslint-disable-next-line @next/next/no-img-element */}\n            <img src={imageUrl} alt={product.image_alt_bn || product.image_alt_en || title} className="h-full w-full object-cover" />\n          </> : <div className="flex h-full items-center justify-center text-[#008080]/50"><ShoppingCart size={72} weight="duotone" /></div>}
          </div></div>
          <article className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#008080]/[0.07] px-3 py-1.5 text-xs font-bold text-[#007373] dark:text-teal-200"><ShieldCheck size={15} /> {product.vendor_is_verified ? 'Verified seller' : 'Approved seller'}</div>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">{title}</h1>
            {product.name_bn && product.name_en && <p className="mt-2 text-sm opacity-50">{product.name_en}</p>}
            <div className="mt-6"><p className="text-3xl font-black">{product.currency} {Number(product.price).toLocaleString('en-BD')}</p>{hasDiscount && <p className="mt-1 text-sm opacity-40 line-through">{product.currency} {Number(product.compare_at_price).toLocaleString('en-BD')}</p>}</div>
            {product.vendor_display_name && <Link href={product.shop_slug ? '/shop/' + encodeURIComponent(product.shop_slug) : '/commerce'} className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#008080]"><Storefront size={17} /> {product.vendor_display_name}</Link>}
            {(product.description_bn || product.description_en) && <div className="mt-7 rounded-2xl border border-[#0b1736]/10 bg-white/60 p-5 text-sm leading-7 dark:border-white/10 dark:bg-white/[0.035]">{product.description_bn && <p>{product.description_bn}</p>}{product.description_en && product.description_bn && <p className="mt-4 opacity-60">{product.description_en}</p>}{!product.description_bn && product.description_en && <p>{product.description_en}</p>}</div>}
            <div className="mt-7 flex flex-wrap items-center gap-3"><AddToCartButton product={{ productId: product.id, slug: product.slug, name: title, price: Number(product.price), currency: product.currency, allowGuestPurchase: product.allow_guest_purchase, imageUrl }} /><Link href="/commerce/cart" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 px-4 py-3 text-sm font-bold dark:border-white/10"><ShoppingCart size={18} /> View cart</Link></div>
            <p className="mt-4 text-xs opacity-45">Final price and stock are checked again securely when the order is placed.</p>
          </article>
        </div>
      </section>
    </main>
  )
}