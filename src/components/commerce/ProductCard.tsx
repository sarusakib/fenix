'use client'

import Link from 'next/link'
import { CheckCircle, ShoppingCart, ShieldCheck } from '@phosphor-icons/react'

import AddToCartButton from './AddToCartButton'

type ProductCardProduct = {
  id: string
  name_bn: string
  name_en: string
  slug: string
  price: number
  compare_at_price: number | null
  currency: string
  allow_guest_purchase: boolean
  vendor?: {
    display_name: string | null
    is_verified: boolean | null
  } | null
  imageUrl?: string | null
}

export default function ProductCard({
  product,
}: {
  product: ProductCardProduct
}) {
  const title = product.name_bn || product.name_en
  const subtitle = product.name_bn && product.name_en ? product.name_en : null
  const hasDiscount =
    product.compare_at_price !== null &&
    product.compare_at_price > product.price

  return (
    <article className="group overflow-hidden rounded-3xl border border-[#0b1736]/10 bg-white/80 shadow-[0_14px_50px_rgba(11,23,54,0.06)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(11,23,54,0.10)] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-none">
      <Link href={`/product/${encodeURIComponent(product.slug)}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-black/[0.035] dark:bg-white/[0.04]">
          {product.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
              src={product.imageUrl}
              alt={title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[#008080]/60 dark:text-teal-200/50">
              <ShoppingCart size={48} weight="duotone" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#008080]">
          {product.vendor?.is_verified ? (
            <>
              <ShieldCheck size={14} weight="fill" />
              Verified seller
            </>
          ) : (
            <>
              <CheckCircle size={14} weight="fill" />
              Approved seller
            </>
          )}
        </div>

        <Link href={`/product/${encodeURIComponent(product.slug)}`} className="mt-2 block">
          <h3 className="line-clamp-2 text-lg font-bold leading-6">{title}</h3>
          {subtitle && <p className="mt-1 line-clamp-1 text-xs opacity-45">{subtitle}</p>}
        </Link>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-black tabular-nums">
              {product.currency} {product.price.toLocaleString('en-BD')}
            </p>
            {hasDiscount && (
              <p className="mt-1 text-xs opacity-40 line-through">
                {product.currency} {product.compare_at_price!.toLocaleString('en-BD')}
              </p>
            )}
          </div>

          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: title,
              price: product.price,
              currency: product.currency,
              allowGuestPurchase: product.allow_guest_purchase,
              imageUrl: product.imageUrl ?? null,
            }}
          />
        </div>

        {product.vendor?.display_name && (
          <p className="mt-4 truncate text-xs opacity-45">by {product.vendor.display_name}</p>
        )}
      </div>
    </article>
  )
}
