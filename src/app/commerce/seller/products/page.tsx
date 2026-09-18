'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Funnel, Package, Plus, Storefront } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Status = 'all' | 'draft' | 'pending' | 'published' | 'paused' | 'archived'

type Product = {
  id: string
  name_bn: string | null
  name_en: string | null
  slug: string
  price: number
  status: Exclude<Status, 'all'>
  is_active: boolean
  allow_guest_purchase: boolean
  created_at: string
}

type Vendor = {
  id: string
  display_name: string
  status: 'pending' | 'approved' | 'suspended' | 'rejected'
}

export default function SellerProductsPage() {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<Status>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      const supabase = createClient()
      const { data: auth } = await supabase.auth.getUser()

      if (!active) return

      if (!auth.user) {
        router.replace('/login?next=/commerce/seller/products')
        return
      }

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('id, display_name, status')
        .eq('user_id', auth.user.id)
        .maybeSingle()

      if (!active) return

      if (vendorError || !vendorData) {
        setError('Seller profile পাওয়া যায়নি।')
        setLoading(false)
        return
      }

      const currentVendor = vendorData as Vendor
      setVendor(currentVendor)

      if (currentVendor.status !== 'approved') {
        setLoading(false)
        return
      }

      const { data, error: productError } = await supabase
        .from('products')
        .select('id, name_bn, name_en, slug, price, status, is_active, allow_guest_purchase, created_at')
        .eq('vendor_id', currentVendor.id)
        .order('created_at', { ascending: false })

      if (!active) return

      if (productError) {
        setError('Products load করা যায়নি।')
      } else {
        setProducts((data ?? []) as Product[])
      }

      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [router])

  const filteredProducts = useMemo(
    () => status === 'all' ? products : products.filter((product) => product.status === status),
    [products, status],
  )

  const counts = useMemo(() => ({
    all: products.length,
    draft: products.filter((p) => p.status === 'draft').length,
    pending: products.filter((p) => p.status === 'pending').length,
    published: products.filter((p) => p.status === 'published').length,
    paused: products.filter((p) => p.status === 'paused').length,
    archived: products.filter((p) => p.status === 'archived').length,
  }), [products])

  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/commerce/seller" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]">
            <ArrowLeft size={17} /> Seller Dashboard
          </Link>
          <Link href="/commerce/seller/products/new" className="inline-flex items-center gap-2 rounded-xl bg-[#008080] px-4 py-2.5 text-sm font-bold text-white">
            <Plus size={18} weight="bold" /> Add Product
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-sm opacity-50">Loading products...</div>
        ) : error ? (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-red-500/20 bg-red-500/[.06] p-6 text-center text-sm text-red-700 dark:text-red-200">{error}</div>
        ) : !vendor ? null : vendor.status !== 'approved' ? (
          <div className="mx-auto mt-12 max-w-2xl rounded-[2rem] border border-[#D4A72C]/20 bg-white/75 p-8 text-center dark:border-[#D4A72C]/15 dark:bg-white/[.045]">
            <Storefront size={40} className="mx-auto text-[#D4A72C]" />
            <h1 className="mt-5 text-2xl font-black">Seller approval required</h1>
            <p className="mt-3 text-sm opacity-55">Product management approved seller account-এর জন্য চালু থাকে।</p>
            <Link href="/commerce/sell" className="mt-6 inline-flex rounded-xl bg-[#008080] px-5 py-3 text-sm font-bold text-white">View seller status</Link>
          </div>
        ) : (
          <>
            <div className="mt-9">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#008080]">Catalog</p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-4xl font-black">Your Products</h1>
                  <p className="mt-2 text-sm opacity-50">{vendor.display_name} · manage your catalog</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs opacity-50"><Funnel size={15} /> {filteredProducts.length} shown</div>
              </div>
            </div>

            <div className="mt-7 flex gap-2 overflow-x-auto pb-2">
              {(['all', 'draft', 'pending', 'published', 'paused', 'archived'] as Status[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize transition ${status === item ? 'bg-[#008080] text-white' : 'border border-[#0b1736]/10 bg-white/70 dark:border-white/10 dark:bg-white/[.045]'}`}
                >
                  {item} · {counts[item]}
                </button>
              ))}
            </div>

            {!filteredProducts.length ? (
              <div className="mt-5 rounded-[2rem] border border-[#0b1736]/10 bg-white/70 p-12 text-center dark:border-white/10 dark:bg-white/[.045]">
                <Package size={48} className="mx-auto opacity-25" />
                <h2 className="mt-4 text-xl font-bold">No products in this filter</h2>
                <Link href="/commerce/seller/products/new" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#008080] px-5 py-3 text-sm font-bold text-white"><Plus size={17} /> Add product</Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/commerce/seller/products/${encodeURIComponent(product.id)}`}
                    className="flex flex-col gap-4 rounded-2xl border border-[#0b1736]/10 bg-white/75 p-5 transition hover:bg-white dark:border-white/10 dark:bg-white/[.045] dark:hover:bg-white/[.07] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#008080]/10 text-[#008080]"><Package size={23} weight="duotone" /></div>
                      <div className="min-w-0">
                        <h2 className="truncate font-bold">{product.name_bn || product.name_en || 'Untitled product'}</h2>
                        <p className="mt-1 truncate text-xs opacity-45">{product.slug} · {product.allow_guest_purchase ? 'Guest purchase on' : 'Login required'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <div className="text-right">
                        <p className="font-black">BDT {Number(product.price).toLocaleString('en-BD')}</p>
                        <span className="text-xs capitalize opacity-50">{product.status}{product.is_active ? ' · active' : ''}</span>
                      </div>
                      <ArrowRight size={18} className="opacity-35" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
