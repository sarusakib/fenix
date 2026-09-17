'use client'

import { useState } from 'react'
import { Check, ShoppingCart } from '@phosphor-icons/react'

export type CartItem = {
  productId: string
  slug: string
  name: string
  price: number
  currency: string
  quantity: number
  imageUrl: string | null
}

export const CART_STORAGE_KEY = 'fenix-commerce-cart-v1'

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== 'object') return false
      const value = item as Record<string, unknown>
      return (
        typeof value.productId === 'string' &&
        typeof value.slug === 'string' &&
        typeof value.name === 'string' &&
        typeof value.price === 'number' &&
        Number.isFinite(value.price) &&
        typeof value.currency === 'string' &&
        typeof value.quantity === 'number' &&
        Number.isInteger(value.quantity) &&
        value.quantity > 0
      )
    })
  } catch {
    return []
  }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('fenix-cart-updated'))
}

export function addCartItem(item: Omit<CartItem, 'quantity'>) {
  const cart = readCart()
  const existing = cart.find((entry) => entry.productId === item.productId)

  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, 1000)
  } else {
    cart.push({ ...item, quantity: 1 })
  }

  writeCart(cart)
}

export default function AddToCartButton({
  product,
}: {
  product: Omit<CartItem, 'quantity'> & { allowGuestPurchase: boolean }
}) {
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (!product.allowGuestPurchase) return
    addCartItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1200)
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={!product.allowGuestPurchase}
      aria-label={product.allowGuestPurchase ? `Add ${product.name} to cart` : 'Guest purchase unavailable'}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#008080] text-white transition hover:bg-[#006f6f] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {added ? <Check size={20} weight="bold" /> : <ShoppingCart size={20} weight="bold" />}
    </button>
  )
}
