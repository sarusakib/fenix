import Link from 'next/link'
import {
  ArrowRight,
  Brain,
  Buildings,
  ChartLineUp,
  GearSix,
  ShieldCheck,
  ShoppingBag,
  Storefront,
  Newspaper,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const modules = [
  { title: 'Trust & Safety', body: 'Verification, ownership, reviews and reports.', href: '/admin/trust', icon: ShieldCheck },
  { title: 'Community Moderation', body: 'Review reports and manage user suspension or bans.', href: '/admin/community', icon: ShieldCheck },
  { title: 'Commerce Operations', body: 'Seller, product, order and return operations.', href: '/commerce/admin', icon: ShoppingBag },
  { title: 'Investment Operations', body: 'Opportunities, investors, documents and interests.', href: '/admin/investment', icon: ChartLineUp },
  { title: 'Jobs Operations', body: 'Review employer postings and protect applicant workflows.', href: '/admin/jobs', icon: UsersThree },
  { title: 'Brain & Knowledge', body: 'Open the public Feni Brain experience.', href: '/guide', icon: Brain },
  { title: 'Public Experience', body: 'See Directory, Invest and Commerce as members do.', href: '/directory', icon: Storefront },
  { title: 'FeniX News', body: 'Create, review and publish the public FeniX newsroom.', href: '/admin/news', icon: Newspaper },
  { title: 'Platform Settings', body: 'Governance, member preferences and public policy links.', href: '/admin/settings', icon: GearSix },
] as const

const secondary = [
  ['/dashboard', 'Member Workspace'],
  ['/directory/manage', 'Directory Management'],
  ['/commerce/admin', 'Commerce Admin'],
  ['/admin/investment', 'Investment Admin'],
  ['/policy', 'Public Policy'],
  ['/help', 'Help & Safety'],
] as const

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
    jobsResult,
    jobApplicationsResult,
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
    supabase.from('fenix_jobs').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('fenix_job_applications').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    ['Users', usersResult.count ?? 0, UsersThree],
    ['Businesses', businessesResult.count ?? 0, Buildings],
    ['Sellers', sellersResult.count ?? 0, Storefront],
    ['Products', productsResult.count ?? 0, ShoppingBag],
    ['Orders', ordersResult.count ?? 0, ChartLineUp],
    ['Returns', returnsResult.count ?? 0, ShieldCheck],
    ['Reviews', reviewsResult.count ?? 0, GearSix],
    ['Brain sources', brainSourcesResult.count ?? 0, Brain],
    ['Brain queue', brainCandidatesResult.count ?? 0, Brain],
    ['Invest offers', investmentOpportunitiesResult.count ?? 0, ChartLineUp],
    ['Invest interest', investmentInterestsResult.count ?? 0, UsersThree],
    ['Published jobs', jobsResult.count ?? 0, Briefcase],
    ['Job applications', jobApplicationsResult.count ?? 0, UsersThree],
  ] as const

  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <div className="fenix-surface-strong rounded-[2.2rem] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.17em] text-[var(--fx-primary-strong)]">
                <ShieldCheck size={13} /> Central Admin
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-[-.06em] sm:text-6xl">Operate the ecosystem.<br /><span className="opacity-35">Keep trust visible.</span></h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">A single command center for FeniX trust, commerce, investment, Brain and public-policy surfaces.</p>
            </div>
            <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 py-3 text-xs text-[var(--fx-muted)]">
              Signed in as <span className="font-bold text-[var(--fx-text)]">{profile.full_name || user.email || 'Admin'}</span>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {stats.map(([label, value, Icon]) => (
              <div key={label} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3.5">
                <div className="flex items-center justify-between gap-2"><span className="text-[9px] font-black uppercase tracking-[.1em] text-[var(--fx-muted)]">{label}</span><Icon size={17} className="text-[var(--fx-primary-strong)]" /></div>
                <p className="mt-3 text-2xl font-black">{value.toLocaleString('en-BD')}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">Command center</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-.04em] sm:text-3xl">Operate by domain, not scattered pages.</h2>
            </div>
            <Link href="/admin/settings" className="hidden items-center gap-2 text-xs font-bold text-[var(--fx-primary-strong)] sm:inline-flex">Settings <ArrowRight size={14} /></Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {modules.map(({ title, body, href, icon: Icon }) => (
              <Link key={title} href={href} className="fenix-interactive group rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Icon size={23} weight="duotone" /></span>
                  <ArrowRight size={18} className="mt-2 opacity-25 transition-transform group-hover:translate-x-1 group-hover:opacity-70" />
                </div>
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[1.7rem] border border-teal-600/15 bg-teal-600/[.05] p-6">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Knowledge snapshot</p>
            <p className="mt-2 text-2xl font-black">{(brainSourcesResult.count ?? 0).toLocaleString('en-BD')} active sources</p>
            <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{(brainCandidatesResult.count ?? 0).toLocaleString('en-BD')} update candidates currently in the queue.</p>
            <Link href="/guide" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0b1736] px-3.5 text-xs font-bold text-white dark:bg-white/[.10]">Open Brain <ArrowRight size={15} /></Link>
          </div>
          <div className="rounded-[1.7rem] border border-amber-500/18 bg-amber-500/[.055] p-6">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-amber-700 dark:text-amber-200">Operator rule</p>
            <p className="mt-2 text-sm leading-7 text-[var(--fx-muted)]">Verification is an evidence-review decision. It is not government certification, a performance guarantee or a promised investment outcome.</p>
            <Link href="/policy" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[var(--fx-text)]">Read policy <ArrowRight size={14} /></Link>
          </div>
        </section>

        <section className="mt-6 rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--fx-muted)]">Quick access</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {secondary.map(([href, label]) => (
              <Link key={href} href={href} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3.5 text-xs font-bold">
                {label}<ArrowRight size={13} />
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
