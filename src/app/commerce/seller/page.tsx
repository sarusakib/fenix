'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Storefront,
  WarningCircle,
} from '@phosphor-icons/react'

import Navbar from '../../../components/Navbar'
import { createClient } from '../../../utils/supabase/client'

type Vendor = {
  id: string
  display_name: string
  status: 'pending' | 'approved' | 'suspended' | 'rejected'
  is_verified: boolean
}

type Product = {
  id: string
  name_bn: string | null
  name_en: string | null
  price: number
  status: 'draft' | 'pending' | 'published' | 'paused' | 'archived'
  is_active: boolean
  allow_guest_purchase: boolean
  created_at: string
}

export default function SellerDashboardPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        const supabase = createClient()

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (!active) return

        if (userError || !user) {
          router.replace('/login?next=/commerce/seller')
          return
        }

        const { data: vendorData, error: vendorError } = await supabase
          .from('vendor_profiles')
          .select('id, display_name, status, is_verified')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!active) return

        if (vendorError) {
          console.error('Vendor lookup failed:', {
            code: vendorError.code,
          })
          setError('Seller information load করা যায়নি।')
          return
        }

        if (!vendorData) {
          router.replace('/commerce/sell')
          return
        }

        const currentVendor = vendorData as Vendor
        setVendor(currentVendor)

        if (currentVendor.status !== 'approved') {
          return
        }

        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(
            'id, name_bn, name_en, price, status, is_active, allow_guest_purchase, created_at',
          )
          .eq('vendor_id', currentVendor.id)
          .order('created_at', { ascending: false })

        if (!active) return

        if (productError) {
          console.error('Seller products lookup failed:', {
            code: productError.code,
          })
          setError('Products load করা যায়নি।')
          return
        }

        setProducts((productData ?? []) as Product[])
      } catch (loadError) {
        console.error('Seller dashboard failed:', {
          name:
            loadError instanceof Error
              ? loadError.name
              : 'UnknownError',
        })

        if (active) {
          setError('কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      active = false
    }
  }, [router])

  const draftCount = products.filter(
    (product) => product.status === 'draft',
  ).length

  const publishedCount = products.filter(
    (product) =>
      product.status === 'published' && product.is_active,
  ).length

  const pausedCount = products.filter(
    (product) => product.status === 'paused',
  ).length

  function productTitle(product: Product) {
    return product.name_bn || product.name_en || 'Untitled product'
  }

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-[#f7faf9] text-[#0b1736] transition-colors dark:bg-[#030506] dark:text-white">
      <Navbar />

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <button
          type="button"
          onClick={() => router.push('/commerce')}
          className="
            inline-flex items-center gap-2 rounded-xl
            border border-[#0b1736]/10
            bg-white/75 px-3.5 py-2
            text-sm text-[#0b1736]/70
            shadow-sm backdrop-blur-xl
            transition hover:bg-white
            dark:border-white/10
            dark:bg-white/[0.045]
            dark:text-white/70
            dark:hover:bg-white/[0.08]
          "
        >
          <ArrowLeft size={17} />
          Commerce
        </button>

        {loading ? (
          <div className="py-24 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#008080]/20 border-t-[#008080]" />
            <p className="mt-4 text-sm text-[#0b1736]/50 dark:text-white/45">
              Seller dashboard loading...
            </p>
          </div>
        ) : error ? (
          <div
            className="
              mx-auto mt-12 max-w-xl rounded-2xl
              border border-red-500/20
              bg-red-500/[0.06] p-6 text-center
            "
          >
            <WarningCircle
              size={30}
              className="mx-auto text-red-500"
            />
            <p className="mt-4 text-sm text-red-700 dark:text-red-200">
              {error}
            </p>
          </div>
        ) : !vendor ? null : vendor.status !== 'approved' ? (
          <div className="mx-auto mt-12 max-w-2xl">
            <div
              className="
                rounded-[2rem]
                border border-[#D4A72C]/20
                bg-white/75 p-7 text-center
                shadow-sm backdrop-blur-xl
                dark:border-[#D4A72C]/15
                dark:bg-white/[0.045]
              "
            >
              <div
                className="
                  mx-auto flex h-16 w-16 items-center justify-center
                  rounded-3xl bg-[#D4A72C]/10
                  text-[#a17b12]
                  dark:text-[#e2c66f]
                "
              >
                <ShieldCheck size={31} weight="duotone" />
              </div>

              <h1 className="mt-6 text-3xl font-semibold">
                Seller approval required
              </h1>

              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#0b1736]/55 dark:text-white/45">
                আপনার seller application বর্তমানে{' '}
                <strong className="capitalize">
                  {vendor.status}
                </strong>{' '}
                অবস্থায় আছে। Approved হওয়ার পরেই product management
                চালু হবে।
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
                  View Seller Status
                  <ArrowRight size={17} />
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/commerce')}
                  className="
                    inline-flex items-center gap-2 rounded-xl
                    border border-[#0b1736]/10
                    bg-white/70 px-5 py-3
                    text-sm font-semibold
                    dark:border-white/10
                    dark:bg-white/[0.045]
                  "
                >
                  Back to Commerce
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-12 w-12 items-center justify-center
                      rounded-2xl bg-[#008080]/10
                      text-[#008080]
                      dark:bg-teal-300/10
                      dark:text-teal-200
                    "
                  >
                    <Storefront size={25} weight="duotone" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#008080] dark:text-teal-200/80">
                      Seller Dashboard
                    </p>

                    <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
                      {vendor.display_name}
                    </h1>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#008080]/10 px-3 py-1.5 text-xs font-medium text-[#007373] dark:bg-teal-300/10 dark:text-teal-200">
                    <CheckCircle size={14} weight="fill" />
                    Approved
                  </span>

                  {vendor.is_verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A72C]/10 px-3 py-1.5 text-xs font-medium text-[#8c6a0e] dark:text-[#e2c66f]">
                      <ShieldCheck size={14} weight="fill" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push('/commerce/seller/products/new')
                }
                className="
                  inline-flex items-center justify-center gap-2
                  rounded-xl bg-[#008080] px-5 py-3
                  text-sm font-semibold text-white
                  shadow-lg shadow-[#008080]/15
                  transition hover:bg-[#006f6f]
                "
              >
                <Plus size={19} weight="bold" />
                Add Product
              </button>
            </div>

            {/* Stats */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Package size={22} weight="duotone" />}
                label="Total products"
                value={products.length}
              />

              <StatCard
                icon={<ShoppingBag size={22} weight="duotone" />}
                label="Published"
                value={publishedCount}
              />

              <StatCard
                icon={<Package size={22} weight="duotone" />}
                label="Drafts"
                value={draftCount}
              />

              <StatCard
                icon={<WarningCircle size={22} weight="duotone" />}
                label="Paused"
                value={pausedCount}
              />
            </div>

            {/* Products */}
            <section className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#008080] dark:text-teal-200/80">
                    Catalog
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    Your Products
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push('/commerce/seller/products/new')
                  }
                  className="
                    hidden items-center gap-2 rounded-xl
                    border border-[#0b1736]/10
                    bg-white/70 px-4 py-2.5
                    text-sm font-medium
                    sm:inline-flex
                    dark:border-white/10
                    dark:bg-white/[0.045]
                  "
                >
                  <Plus size={17} />
                  Add
                </button>
              </div>

              {products.length === 0 ? (
                <div
                  className="
                    mt-6 rounded-[2rem]
                    border border-[#0b1736]/10
                    bg-white/70 p-10 text-center
                    dark:border-white/[0.09]
                    dark:bg-white/[0.035]
                  "
                >
                  <div
                    className="
                      mx-auto flex h-16 w-16 items-center justify-center
                      rounded-3xl bg-[#008080]/10
                      text-[#008080]
                      dark:bg-teal-300/10
                      dark:text-teal-200
                    "
                  >
                    <Package size={31} weight="duotone" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    No products yet
                  </h3>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#0b1736]/50 dark:text-white/40">
                    আপনার প্রথম product draft তৈরি করুন। পরে image,
                    inventory এবং publishing workflow যোগ হবে।
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push('/commerce/seller/products/new')
                    }
                    className="
                      mt-6 inline-flex items-center gap-2
                      rounded-xl bg-[#008080]
                      px-5 py-3
                      text-sm font-semibold text-white
                    "
                  >
                    <Plus size={18} weight="bold" />
                    Create First Product
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() =>
                        router.push(
                          `/commerce/seller/products/${product.id}`,
                        )
                      }
                      className="
                        group flex w-full flex-col gap-4 rounded-2xl
                        border border-[#0b1736]/10
                        bg-white/70 p-5 text-left
                        transition hover:-translate-y-0.5
                        hover:bg-white hover:shadow-lg
                        sm:flex-row sm:items-center sm:justify-between
                        dark:border-white/[0.08]
                        dark:bg-white/[0.035]
                        dark:hover:bg-white/[0.06]
                      "
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className="
                            flex h-12 w-12 shrink-0 items-center justify-center
                            rounded-2xl bg-[#0b1736]/[0.045]
                            text-[#0b1736]/60
                            dark:bg-white/[0.06]
                            dark:text-white/60
                          "
                        >
                          <Package size={23} weight="duotone" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {productTitle(product)}
                          </h3>

                          <p className="mt-1 text-xs text-[#0b1736]/45 dark:text-white/40">
                            ৳{Number(product.price).toLocaleString('en-BD')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span
                          className={`
                            rounded-full px-3 py-1.5 text-xs font-medium capitalize
                            ${
                              product.status === 'published'
                                ? 'bg-[#008080]/10 text-[#007373] dark:text-teal-200'
                                : product.status === 'paused'
                                  ? 'bg-[#D4A72C]/10 text-[#8c6a0e] dark:text-[#e2c66f]'
                                  : 'bg-[#0b1736]/[0.06] text-[#0b1736]/60 dark:bg-white/[0.07] dark:text-white/55'
                            }
                          `}
                        >
                          {product.status}
                        </span>

                        <ArrowRight
                          size={18}
                          className="text-[#0b1736]/25 transition group-hover:translate-x-1 dark:text-white/20"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div
      className="
        rounded-2xl border border-[#0b1736]/10
        bg-white/70 p-5
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
      "
    >
      <div className="text-[#008080] dark:text-teal-200">
        {icon}
      </div>

      <p className="mt-5 text-xs text-[#0b1736]/45 dark:text-white/40">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
  }
