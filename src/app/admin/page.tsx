import Link from 'next/link'
import { ArrowRight, Brain, Buildings, ChartLineUp, GearSix, ShieldCheck, ShoppingBag, Storefront, UsersThree } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'

export const dynamic = 'force-dynamic'

type TableName = keyof Database['public']['Tables']

async function countRows(supabase: Awaited<ReturnType<typeof createClient>>, table: TableName, filter?: { column: string; value: string }) {
  const query = supabase.from(table).select('id', { count: 'exact', head: true })
  const filtered = filter ? query.eq(filter.column, filter.value) : query
  const { count } = await filtered
  return count ?? 0
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  const [
    users,
    businesses,
    sellers,
    products,
    orders,
    returns,
    reviews,
    brainSources,
    brainCandidates,
  ] = await Promise.all([
    countRows(supabase, 'profiles'),
    countRows(supabase, 'businesses'),
    countRows(supabase, 'vendor_profiles'),
    countRows(supabase, 'products'),
    countRows(supabase, 'orders'),
    countRows(supabase, 'commerce_return_requests'),
    countRows(supabase, 'product_reviews'),
    countRows(supabase, 'fenix_brain_sources', { column: 'status', value: 'active' }),
    countRows(supabase, 'fenix_brain_update_candidates'),
  ])

  const stats = [
    { label: 'Users', value: users, icon: UsersThree },
    { label: 'Businesses', value: businesses, icon: Buildings },
    { label: 'Sellers', value: sellers, icon: Storefront },
    { label: 'Products', value: products, icon: ShoppingBag },
    { label: 'Orders', value: orders, icon: ChartLineUp },
    { label: 'Returns', value: returns, icon: ShieldCheck },
    { label: 'Reviews', value: reviews, icon: GearSix },
    { label: 'Brain queue', value: brainCandidates, icon: Brain },
  ] as const

  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-7 shadow-[0_18px_60px_rgba(15,23,42,.06)] dark:border-white/10 dark:bg-white/[.045]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">FeniX Admin</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-.03em] sm:text-5xl">System control center</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">
                Platform-level administration for users, businesses, commerce and Feni Brain.
              </p>
            </div>
            <div className="rounded-2xl bg-[#008080]/[.07] px-4 py-3 text-sm">
              Signed in as <span className="font-bold">{profile.full_name || user.email || 'Admin'}</span>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-[1.5rem] border border-[#0b1736]/10 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[.04]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold opacity-55">{label}</span>
                <Icon size={20} className="text-[#008080]" />
              </div>
              <p className="mt-4 text-3xl font-black">{value.toLocaleString('en-BD')}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <AdminLink
            href="/commerce/admin"
            icon={<ShoppingBag size={24} />}
            title="Commerce control"
            description="Seller approval, delivery rules, returns, payment status and review moderation."
          />
          <AdminLink
            href="/guide"
            icon={<Brain size={24} />}
            title="Feni Brain"
            description={'Open the live Feni Brain experience. Active source count: ' + brainSources.toLocaleString('en-BD') + '.'}
          />
          <AdminLink
            href="/directory"
            icon={<Buildings size={24} />}
            title="Business directory"
            description="Review the public business discovery experience and local ecosystem records."
          />
          <AdminLink
            href="/invest"
            icon={<ChartLineUp size={24} />}
            title="Investment"
            description="Review the investment-facing experience while deeper verification controls are built."
          />
        </div>

        <div className="mt-7 rounded-[1.5rem] border border-amber-500/20 bg-amber-500/[.06] p-5">
          <p className="text-sm font-bold">Security status</p>
          <p className="mt-2 text-sm leading-6 opacity-70">
            Database RLS and role-escalation protection are enforced. Supabase leaked-password protection still
            requires enabling the dashboard setting for the project.
          </p>
        </div>
      </section>
    </main>
  )
}

function AdminLink({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="group rounded-[1.75rem] border border-[#0b1736]/10 bg-white/75 p-6 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[.04] dark:hover:bg-white/[.07]"
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008080]/[.08] text-[#008080]">
          {icon}
        </div>
        <ArrowRight size={20} className="mt-2 opacity-25 transition group-hover:translate-x-1 group-hover:opacity-60" />
      </div>
      <h2 className="mt-6 text-xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 opacity-55">{description}</p>
    </Link>
  )
}
