import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  Brain,
  Buildings,
  ChartLineUp,
  GearSix,
  ShieldCheck,
  ShoppingBag,
  Storefront,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/')

  const [
    usersResult,
    businessesResult,
    sellersResult,
    productsResult,
    ordersResult,
    returnsResult,
    reviewsResult,
    brainSourcesResult,
    brainCandidatesResult,
    investmentOpportunitiesResult,
    investmentInterestsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('businesses').select('id', { count: 'exact', head: true }),
    supabase.from('vendor_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('commerce_return_requests').select('id', { count: 'exact', head: true }),
    supabase.from('product_reviews').select('id', { count: 'exact', head: true }),
    supabase.from('fenix_brain_sources').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('fenix_brain_update_candidates').select('id', { count: 'exact', head: true }),
    supabase.from('investment_opportunities').select('id', { count: 'exact', head: true }).in('status', ['approved', 'fully_funded', 'closed']),
    supabase.from('investment_interests').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    ['Users', usersResult.count ?? 0, UsersThree],
    ['Businesses', businessesResult.count ?? 0, Buildings],
    ['Sellers', sellersResult.count ?? 0, Storefront],
    ['Products', productsResult.count ?? 0, ShoppingBag],
    ['Orders', ordersResult.count ?? 0, ChartLineUp],
    ['Returns', returnsResult.count ?? 0, ShieldCheck],
    ['Reviews', reviewsResult.count ?? 0, GearSix],
    ['Brain queue', brainCandidatesResult.count ?? 0, Brain],
    ['Invest offers', investmentOpportunitiesResult.count ?? 0, ChartLineUp],
    ['Invest interest', investmentInterestsResult.count ?? 0, UsersThree],
  ] as const

  const modules = [
    {
      title: 'Trust & Safety',
      body: 'Ownership claims, reviews, reports and verification review.',
      href: '/admin/trust',
      icon: ShieldCheck,
      tone: 'teal',
    },
    {
      title: 'Commerce Operations',
      body: 'Seller approval, delivery rules, returns, reviews and order payment status.',
      href: '/commerce/admin',
      icon: ShoppingBag,
      tone: 'navy',
    },
    {
      title: 'Investment Operations',
      body: 'Opportunity review, investor verification, documents, interests and reports.',
      href: '/admin/investment',
      icon: ChartLineUp,
      tone: 'gold',
    },
    {
      title: 'Brain & Knowledge',
      body: 'Open Feni Brain and monitor the current source-aware experience.',
      href: '/guide',
      icon: Brain,
      tone: 'teal',
    },
    {
      title: 'Public Experience',
      body: 'Check Directory and Invest exactly as members see them.',
      href: '/directory',
      icon: Storefront,
      tone: 'navy',
    },
    {
      title: 'Policy & Settings',
      body: 'Keep public trust rules, privacy guidance and admin-facing notes visible.',
      href: '/policy',
      icon: GearSix,
      tone: 'gold',
    },
  ] as const

  return (
    <main className="min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="fenix-surface-strong overflow-hidden rounded-[2.2rem] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-600/[.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-teal-800 dark:bg-teal-300/[.07] dark:text-teal-100">
                <ShieldCheck size={13} /> Central Admin
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em] text-[#0b1736] sm:text-6xl dark:text-white">Control the ecosystem.<br /><span className="opacity-40">Keep trust visible.</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/45">A single operating surface for FeniX moderation, commerce, investment, Brain and policy workflows.</p>
            </div>
            <div className="rounded-2xl bg-black/[.025] px-4 py-3 text-xs leading-5 dark:bg-white/[.035]">
              Signed in as <span className="font-bold">{profile.full_name || user.email || 'Admin'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(([label, value, Icon]) => (
            <div key={label} className="fenix-surface rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[.11em] opacity-45">{label}</span>
                <Icon size={18} className="text-teal-700 dark:text-teal-200" />
              </div>
              <p className="mt-3 text-2xl font-black">{value.toLocaleString('en-BD')}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700 dark:text-teal-300">Admin modules</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">Operate by domain, not by scattered pages.</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {modules.map(({ title, body, href, icon: Icon, tone }) => (
              <AdminLink key={title} href={href} title={title} description={body} icon={<Icon size={23} />} tone={tone} />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[1.7rem] border border-teal-600/12 bg-teal-600/[.05] p-6 dark:border-teal-300/12 dark:bg-teal-300/[.045]">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-teal-700 dark:text-teal-200">Brain status snapshot</p>
            <p className="mt-2 text-2xl font-black">{(brainSourcesResult.count ?? 0).toLocaleString('en-BD')} active sources</p>
            <p className="mt-2 text-sm leading-6 opacity-60">{(brainCandidatesResult.count ?? 0).toLocaleString('en-BD')} update candidates currently in the queue. Keep source freshness and verification visible.</p>
            <Link href="/guide" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0b1736] px-3.5 text-xs font-bold text-white dark:bg-white/[.1]">Open Brain <ArrowRight size={15} /></Link>
          </div>

          <div className="rounded-[1.7rem] border border-amber-500/18 bg-amber-500/[.05] p-6">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-700 dark:text-amber-200">Admin rule</p>
            <p className="mt-2 text-sm leading-7 opacity-70">Verification means FeniX checked defined information. It is not government certification, a performance guarantee, or a promised investment outcome.</p>
            <Link href="/policy" className="mt-5 inline-flex items-center gap-2 text-xs font-bold">Read policy <ArrowRight size={14} /></Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function AdminLink({
  href,
  icon,
  title,
  description,
  tone,
}: {
  href: string
  icon: ReactNode
  title: string
  description: string
  tone: 'teal' | 'navy' | 'gold'
}) {
  const toneClass =
    tone === 'gold'
      ? 'bg-amber-500/[.08] text-amber-700 dark:bg-amber-300/[.08] dark:text-amber-200'
      : tone === 'navy'
        ? 'bg-[#0b1736]/[.06] text-[#0b1736] dark:bg-white/[.05] dark:text-white'
        : 'bg-teal-600/[.08] text-teal-700 dark:bg-teal-300/[.08] dark:text-teal-200'

  return (
    <Link href={href} className="fenix-interactive group rounded-[1.7rem] border border-black/[.07] bg-white/70 p-5 dark:border-white/[.07] dark:bg-white/[.03]">
      <div className="flex items-start justify-between gap-4">
        <div className={'grid h-11 w-11 place-items-center rounded-2xl ' + toneClass}>{icon}</div>
        <ArrowRight size={18} className="mt-2 opacity-25 transition group-hover:translate-x-1 group-hover:opacity-70" />
      </div>
      <h3 className="mt-5 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 opacity-55">{description}</p>
    </Link>
  )
}
