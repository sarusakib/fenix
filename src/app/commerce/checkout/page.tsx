'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle, LockKey, MapPin, ShoppingBag, User } from '@phosphor-icons/react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import Navbar from '@/components/Navbar'
import { CartItem, readCart, writeCart } from '@/components/commerce/AddToCartButton'
import { createClient } from '@/utils/supabase/client'

export default function CommerceCheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [area, setArea] = useState('')
  const [upazila, setUpazila] = useState('')
  const [district, setDistrict] = useState('Feni')
  const [note, setNote] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const items = readCart()
      if (active) setCart(items)
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (active) {
        setUserId(data.user?.id ?? null)
        setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const cleanName = name.trim().slice(0, 200)
    const cleanPhone = phone.trim().slice(0, 40)
    const cleanAddress = address.trim().slice(0, 1000)
    if (!cart.length) { setError('Your cart is empty.'); return }
    if (cleanName.length < 2) { setError('নাম দিন।'); return }
    if (cleanPhone.length < 7) { setError('সঠিক ফোন নম্বর দিন।'); return }
    if (cleanAddress.length < 5) { setError('সম্পূর্ণ delivery address দিন।'); return }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      const currentUserId = authData.user?.id ?? null
      const items = cart.map((item) => ({ product_id: item.productId, quantity: item.quantity }))
      const { data, error: rpcError } = await supabase.rpc('create_commerce_order', {
        p_items: items,
        p_customer_id: currentUserId,
        p_guest_name: currentUserId ? null : cleanName,
        p_guest_phone: currentUserId ? null : cleanPhone,
        p_guest_email: currentUserId ? null : (email.trim().slice(0, 254) || null),
        p_shipping_name: cleanName,
        p_shipping_phone: cleanPhone,
        p_shipping_address: cleanAddress,
        p_shipping_area: area.trim().slice(0, 120) || null,
        p_shipping_upazila: upazila.trim().slice(0, 120) || null,
        p_shipping_district: district.trim().slice(0, 120) || null,
        p_customer_note: note.trim().slice(0, 1000) || null,
      })
      if (rpcError || !data) {
        console.error('Commerce checkout failed:', { code: rpcError?.code })
        setError('Order তৈরি করা যায়নি। Product stock বা তথ্য পরিবর্তিত হয়ে থাকতে পারে।')
        return
      }
      const result = Array.isArray(data) ? data[0] : data
      writeCart([])
      router.replace(`/commerce/order-success?id=${encodeURIComponent(result.order_id)}`)
    } catch (submitError) {
      console.error('Checkout error:', { name: submitError instanceof Error ? submitError.name : 'UnknownError' })
      setError('কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <main className="min-h-screen bg-[#f7faf9] dark:bg-[#030506]"><Navbar /><div className="flex min-h-[70vh] items-center justify-center text-sm opacity-50">Checkout loading...</div></main>

  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <Link href="/commerce/cart" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]"><ArrowLeft size={17} /> Cart</Link>
        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} noValidate>
            <div className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.045] sm:p-8">
              <div className="flex items-center gap-3"><MapPin size={25} className="text-[#008080]" /><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#008080]">Delivery</p><h1 className="mt-1 text-3xl font-black">Checkout</h1></div></div>
              {error && <div role="alert" className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-700 dark:text-red-200">{error}</div>}
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <Field label="Full name" value={name} onChange={setName} required />
                <Field label="Phone" value={phone} onChange={setPhone} type="tel" required />
                <Field label="Email (optional)" value={email} onChange={setEmail} type="email" />
                <Field label="Area / Union / Ward" value={area} onChange={setArea} />
                <Field label="Upazila" value={upazila} onChange={setUpazila} />
                <Field label="District" value={district} onChange={setDistrict} />
              </div>
              <label className="mt-5 block text-sm font-semibold">Delivery address<input value={address} onChange={(e) => setAddress(e.target.value.slice(0, 1000))} required className="mt-2 min-h-24 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#008080] dark:border-white/10" /></label>
              <label className="mt-5 block text-sm font-semibold">Order note (optional)<textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 1000))} className="mt-2 min-h-20 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#008080] dark:border-white/10" /></label>
              <div className="mt-7 flex items-center gap-2 rounded-xl bg-[#008080]/[0.06] p-4 text-xs leading-5 text-[#006b6b] dark:text-teal-200"><LockKey size={17} /> Checkout price and stock are revalidated securely by the database.</div>
              <button disabled={submitting || !cart.length} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#008080] px-5 py-4 text-sm font-bold text-white disabled:opacity-50">{submitting ? 'Placing order…' : 'Place order — Cash on Delivery'} <ArrowRight size={17} /></button>
            </div>
          </form>
          <aside className="h-fit rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[0.045]"><div className="flex items-center gap-2"><ShoppingBag size={20} /><h2 className="font-black">Order summary</h2></div><div className="mt-5 space-y-3">{cart.map((item) => <div key={item.productId} className="flex justify-between gap-3 text-sm"><span className="min-w-0 truncate opacity-60">{item.name} × {item.quantity}</span><strong>{item.currency} {(item.price * item.quantity).toLocaleString('en-BD')}</strong></div>)}</div><div className="my-5 border-t border-[#0b1736]/10 dark:border-white/10" /><div className="flex justify-between"><span className="font-bold">Total</span><strong className="text-xl">{cart[0]?.currency ?? 'BDT'} {subtotal.toLocaleString('en-BD')}</strong></div><p className="mt-4 text-xs opacity-45">Delivery fee: currently 0 BDT</p></aside>
        </div>
      </section>
    </main>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block text-sm font-semibold">{label}<span className="sr-only">{required ? ' required' : ''}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value.slice(0, 254))} required={required} className="mt-2 h-12 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-4 text-sm outline-none focus:border-[#008080] dark:border-white/10" /></label>
}
