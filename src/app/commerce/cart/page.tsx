'use client'

import Link from 'next/link'
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash, ArrowRight } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'

import Navbar from '@/components/Navbar'
import { CartItem, readCart, writeCart } from '@/components/commerce/AddToCartButton'

export default function CommerceCartPage() {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    setCart(readCart())
    const refresh = () => setCart(readCart())
    window.addEventListener('fenix-cart-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('fenix-cart-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])

  function updateQuantity(productId: string, quantity: number) {
    const next = cart.map((item) => item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, 1000)) } : item)
    setCart(next)
    writeCart(next)
  }

  function removeItem(productId: string) {
    const next = cart.filter((item) => item.productId !== productId)
    setCart(next)
    writeCart(next)
  }

  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/commerce" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]"><ArrowLeft size={17} /> Commerce</Link>
        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#008080]">Shopping cart</p><h1 className="mt-2 text-4xl font-black">Your cart</h1></div>
              <span className="text-sm opacity-45">{cart.length} product{cart.length === 1 ? '' : 's'}</span>
            </div>

            {!cart.length ? (
              <div className="mt-7 rounded-[2rem] border border-[#0b1736]/10 bg-white/70 p-12 text-center dark:border-white/10 dark:bg-white/[0.045]"><ShoppingBag size={50} weight="duotone" className="mx-auto opacity-30" /><h2 className="mt-5 text-xl font-bold">Your cart is empty</h2><p className="mt-2 text-sm opacity-50">ফেনীর local products থেকে পছন্দের কিছু যোগ করুন।</p><Link href="/commerce" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#008080] px-5 py-3 text-sm font-bold text-white">Browse products <ArrowRight size={17} /></Link></div>
            ) : (
              <div className="mt-7 space-y-3">
                {cart.map((item) => (
                  <article key={item.productId} className="flex gap-4 rounded-2xl border border-[#0b1736]/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.045]">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#008080]/[0.07] text-[#008080]"><ShoppingBag size={30} weight="duotone" /></div>
                    <div className="min-w-0 flex-1"><Link href={`/product/${encodeURIComponent(item.slug)}`} className="font-bold hover:underline">{item.name}</Link><p className="mt-1 text-sm opacity-55">{item.currency} {item.price.toLocaleString('en-BD')}</p><div className="mt-3 flex items-center gap-2"><button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="h-8 w-8 rounded-lg border border-[#0b1736]/10 dark:border-white/10"><Minus size={14} className="mx-auto" /></button><span className="w-7 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="h-8 w-8 rounded-lg border border-[#0b1736]/10 dark:border-white/10"><Plus size={14} className="mx-auto" /></button></div></div>
                    <div className="flex flex-col items-end justify-between"><p className="font-black">{item.currency} {(item.price * item.quantity).toLocaleString('en-BD')}</p><button type="button" onClick={() => removeItem(item.productId)} className="p-2 text-red-500" aria-label={`Remove ${item.name}`}><Trash size={18} /></button></div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {cart.length > 0 && <aside className="h-fit rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.045]"><h2 className="text-lg font-black">Order summary</h2><div className="mt-6 flex justify-between text-sm"><span className="opacity-55">Subtotal</span><strong>{cart[0]?.currency ?? 'BDT'} {subtotal.toLocaleString('en-BD')}</strong></div><div className="mt-3 flex justify-between text-sm"><span className="opacity-55">Delivery</span><span>Calculated at checkout</span></div><div className="my-5 border-t border-[#0b1736]/10 dark:border-white/10" /><div className="flex justify-between"><span className="font-bold">Total</span><strong className="text-xl">{cart[0]?.currency ?? 'BDT'} {subtotal.toLocaleString('en-BD')}</strong></div><Link href="/commerce/checkout" className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#008080] px-5 py-3.5 text-sm font-bold text-white">Proceed to checkout <ArrowRight size={17} /></Link></aside>}
        </div>
      </section>
    </main>
  )
}
