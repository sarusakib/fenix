'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Buildings,
  Compass,
  Globe,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Storefront,
  TrendUp,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { createClient } from '@/utils/supabase/client'
import {
  getBusinessDisplayName,
  getBusinessSecondaryName,
  getDirectoryBusiness,
  getDirectionsUrl,
  type DirectoryDetail,
} from '@/lib/directory'
import BusinessTrustPanel from '@/components/directory/BusinessTrustPanel'

type ProductPreview = {
  id: string
  name_bn: string
  name_en: string
  price: number
  currency: string
  slug: string
}

type InvestmentPreview = {
  id: string
  title_bn: string
  title_en: string
  category: string
}

const verificationLabels: Record<string, string> = {
  unverified: 'Basic listing',
  owner_claimed: 'Owner claimed',
  identity_reviewed: 'Identity reviewed',
  business_reviewed: 'Business reviewed',
  fenix_verified: 'FeniX Verified',
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency || 'BDT',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function DirectoryBusinessPage() {
  const params = useParams<{ slug: string }>()
  const identifier = decodeURIComponent(String(params.slug ?? ''))
  const [business, setBusiness] = useState<DirectoryDetail | null>(null)
  const [products, setProducts] = useState<ProductPreview[]>([])
  const [investments, setInvestments] = useState<InvestmentPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let active = true
    const supabase = createClient()

    async function load() {
      setLoading(true)
      const result = await getDirectoryBusiness(identifier)
      if (!active) return

      if (result.error || !result.data) {
        setBusiness(null)
        setMissing(true)
        setLoading(false)
        return
      }

      setBusiness(result.data)

      const [productsResult, investmentsResult] = await Promise.all([
        supabase
          .from('products')
          .select('id, name_bn, name_en, price, currency, slug')
          .eq('business_id', result.data.id)
          .eq('status', 'published')
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(8),
        supabase
          .from('investment_opportunities')
          .select('id, title_bn, title_en, category')
          .eq('business_id', result.data.id)
          .eq('status', 'published')
          .eq('verification_status', 'verified')
          .order('updated_at', { ascending: false })
          .limit(6),
      ])

      if (!active) return
      setProducts((productsResult.data ?? []) as ProductPreview[])
      setInvestments((investmentsResult.data ?? []) as InvestmentPreview[])
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [identifier])

  if (loading) {
    return (
      <main className="min-h-dvh bg-[#f8fafc] dark:bg-[#030506]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200 dark:bg-white/[0.06]" />
          <div className="mt-8 h-72 animate-pulse rounded-[2rem] bg-slate-200 dark:bg-white/[0.05]" />
        </div>
      </main>
    )
  }

  if (missing || !business) {
    return (
      <main className="min-h-dvh bg-[#f8fafc] px-4 py-10 text-[#0b1736] dark:bg-[#030506] dark:text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/directory" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold shadow-sm dark:bg-white/[0.05]">
            <ArrowLeft size={17} />
            Directory
          </Link>
          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-8 text-center dark:border-white/[0.08] dark:bg-white/[0.04]">
            <Storefront size={32} className="mx-auto text-slate-400 dark:text-white/35" />
            <h1 className="mt-4 text-2xl font-black">Business not found</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-white/45">
              This business may be unpublished, removed or the link may be incorrect.
            </p>
            <Link href="/directory" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
              Find another business
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const name = getBusinessDisplayName(business)
  const secondary = getBusinessSecondaryName(business)
  const directionsUrl = getDirectionsUrl(business)
  const location = [business.market, business.area, business.upazila, business.district]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' · ')

  return (
    <main className="min-h-dvh overflow-x-clip bg-[#f8fafc] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/directory"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold shadow-sm transition hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
        >
          <ArrowLeft size={17} />
          Back to Directory
        </Link>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_20px_70px_rgba(15,23,42,.07)] dark:border-white/[0.08] dark:bg-white/[0.045] dark:shadow-none">
          <div className="border-b border-slate-100 p-6 sm:p-8 dark:border-white/[0.06]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-600/10 text-teal-700 dark:bg-teal-300/10 dark:text-teal-200">
                  <Buildings size={30} weight="duotone" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-teal-600/10 px-2.5 py-1 text-[10px] font-bold text-teal-800 dark:bg-teal-300/10 dark:text-teal-100">
                      {verificationLabels[business.verification_level] ?? 'Basic listing'}
                    </span>
                    {business.phone_verified && (
                      <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold text-sky-800 dark:bg-sky-300/10 dark:text-sky-100">
                        Phone reviewed
                      </span>
                    )}
                    {business.location_verified && (
                      <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold text-violet-800 dark:bg-violet-300/10 dark:text-violet-100">
                        Location reviewed
                      </span>
                    )}
                  </div>
                  <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{name}</h1>
                  {secondary && <p className="mt-1 text-sm text-slate-500 dark:text-white/45">{secondary}</p>}
                  {business.business_type && (
                    <p className="mt-3 text-sm font-semibold text-teal-700 dark:text-teal-200">
                      {business.business_type}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {business.phone && (
                  <a href={'tel:' + business.phone} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-black text-white">
                    <Phone size={17} />
                    Call
                  </a>
                )}
                {business.whatsapp && (
                  <a
                    href={'https://wa.me/' + business.whatsapp.replace(/[^0-9]/g, '')}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white"
                  >
                    <WhatsappLogo size={18} />
                    WhatsApp
                  </a>
                )}
                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#0b1736] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                  >
                    <Compass size={17} />
                    Directions
                  </a>
                )}
              </div>
            </div>

            {business.category && (
              <div className="mt-6 inline-flex rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-300/10 dark:text-amber-100">
                {business.category}
              </div>
            )}
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.35fr_.65fr]">
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-black">About this business</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-white/55">
                {business.about_bn || business.about_en || business.description || 'No business description has been published yet.'}
              </p>

              {business.tagline_bn || business.tagline_en ? (
                <p className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm font-semibold leading-6 text-teal-900 dark:border-teal-300/10 dark:bg-teal-300/[0.06] dark:text-teal-100">
                  {business.tagline_bn || business.tagline_en}
                </p>
              ) : null}

              {products.length > 0 && (
                <section className="mt-8">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-black">Available in Shop</h2>
                    <Link href="/shop" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-200">
                      Shop Local <ArrowUpRight size={14} />
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {products.map((product) => (
                      <div key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.07] dark:bg-white/[0.025]">
                        <div className="flex items-start gap-3">
                          <ShoppingBag size={20} className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-200" />
                          <div className="min-w-0">
                            <p className="font-bold">{product.name_bn || product.name_en}</p>
                            {product.name_bn && product.name_en && product.name_bn !== product.name_en && (
                              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-white/40">{product.name_en}</p>
                            )}
                            <p className="mt-2 text-sm font-black">{money(product.price, product.currency)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {investments.length > 0 && (
                <section className="mt-8">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-black">Verified investment opportunities</h2>
                    <Link href="/invest" className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-200">
                      View Investment <ArrowUpRight size={14} />
                    </Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {investments.map((item) => (
                      <Link
                        key={item.id}
                        href={'/invest/' + encodeURIComponent(item.id)}
                        className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 transition hover:bg-emerald-100 dark:border-emerald-300/10 dark:bg-emerald-300/[0.05] dark:hover:bg-emerald-300/[0.08]"
                      >
                        <TrendUp size={20} className="shrink-0 text-emerald-700 dark:text-emerald-200" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-emerald-950 dark:text-emerald-100">
                            {item.title_bn || item.title_en}
                          </span>
                          <span className="mt-0.5 block text-xs text-emerald-800/60 dark:text-emerald-100/45">
                            {item.category}
                          </span>
                        </span>
                        <ArrowUpRight size={17} className="text-emerald-700 dark:text-emerald-200" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="border-t border-slate-100 p-6 dark:border-white/[0.06] lg:border-l lg:border-t-0 sm:p-8">
              <h2 className="text-lg font-black">Business details</h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={19} className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-200" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-white/30">Location</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/55">
                      {location || 'Feni · Location not added'}
                    </p>
                    {business.address && <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-white/40">{business.address}</p>}
                  </div>
                </div>

                {business.phone && (
                  <div className="flex items-start gap-3">
                    <Phone size={19} className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-200" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-white/30">Public phone</p>
                      <a href={'tel:' + business.phone} className="mt-1 block text-sm font-semibold hover:underline">{business.phone}</a>
                    </div>
                  </div>
                )}

                {business.website_url && (
                  <div className="flex items-start gap-3">
                    <Globe size={19} className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-200" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-white/30">Website</p>
                      <a href={business.website_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 dark:text-teal-200">
                        Open website <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.07] dark:bg-white/[0.025]">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={20} className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-200" />
                    <div>
                      <p className="text-sm font-black">What the trust label means</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-white/40">
                        This label describes the verification state recorded by FeniX. It is not a guarantee of business quality, safety or government approval.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/[0.07] dark:bg-transparent">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-white/40">
                    <Storefront size={16} />
                    Last updated
                  </div>
                  <p className="mt-1 text-sm font-semibold">
                    {new Date(business.updated_at).toLocaleDateString('en-BD', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
        <BusinessTrustPanel
          businessId={business.id}
          businessPath={'/directory/' + encodeURIComponent(business.slug || business.id)}
        />
      </div>
    </main>
  )
}
