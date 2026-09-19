import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Bell, Buildings, ChartLineUp, ChatCircleText, ClipboardText, Handshake, GearSix, Rocket, ShieldCheck, Storefront } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const s = await createClient()
  const { data: auth } = await s.auth.getUser()
  if (!auth.user) redirect('/login?next=/dashboard')

  const [profile, businesses, starts, interests, orders, notifications] = await Promise.all([
    s.from('profiles').select('full_name,role').eq('id', auth.user.id).maybeSingle(),
    s.from('businesses').select('id',{count:'exact',head:true}).eq('owner_id',auth.user.id),
    s.from('business_start_projects').select('id',{count:'exact',head:true}).eq('user_id',auth.user.id),
    s.from('investment_interests').select('id',{count:'exact',head:true}).eq('investor_id',auth.user.id),
    s.from('orders').select('id',{count:'exact',head:true}).eq('customer_id',auth.user.id),
    s.from('fenix_notifications').select('id',{count:'exact',head:true}).eq('user_id',auth.user.id).is('read_at',null),
  ])

  const cards = [
    ['Businesses', businesses.count ?? 0, Buildings, '/dashboard/business'],
    ['Start journeys', starts.count ?? 0, Rocket, '/start/dashboard'],
    ['Investment interests', interests.count ?? 0, ChartLineUp, '/invest/dashboard'],
    ['Orders', orders.count ?? 0, Storefront, '/commerce/orders'],
    ['Unread notifications', notifications.count ?? 0, Bell, '/notifications'],
  ] as const

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-white/85 p-7 dark:border-white/10 dark:bg-white/[.045] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">One account</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">Your FeniX workspace</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 opacity-60">A single account connects your business identity, Business Journey, investment activity, local commerce and trusted notifications.</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/[.035] px-3 py-1.5 text-xs font-semibold dark:bg-white/[.05]"><ShieldCheck size={15} className="text-[#008080]"/> {profile.data?.role || 'user'} · {profile.data?.full_name || auth.user.email}</div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map(([label,value,Icon,href]) => (
            <Link key={label} href={href} className="rounded-2xl border border-black/10 bg-white/80 p-5 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[.04]">
              <Icon size={22} className="text-[#008080]" />
              <p className="mt-4 text-xs font-bold uppercase tracking-[.12em] opacity-45">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            ['/directory/manage','Business manager','Edit and connect your owned business profiles.',Buildings],
            ['/start/dashboard','Business Journey','Continue planning, validation, legal and launch work.',Rocket],
            ['/invest/dashboard','Investment dashboard','Track your investment interests and deal workflow.',ChartLineUp],
            ['/commerce/orders','Commerce orders','Review your local commerce orders.',Storefront],
            ['/notifications','Notifications','See trust, account and ecosystem activity.',Bell],
            ['/requests','Investment requests','Track your investment interests and review status.',ClipboardText],
            ['/messages','Messages','Open your protected investment conversations.',ChatCircleText],
            ['/deals','Deals','View recorded investment deal workflow.',Handshake],
            ['/dashboard/settings','Account settings','Review account and privacy guidance.',GearSix],
          ].map(([href,title,body,Icon]) => (
            <Link key={String(href)} href={String(href)} className="group rounded-3xl border border-black/10 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[.04]">
              <Icon size={22} className="text-[#008080]" />
              <h2 className="mt-4 text-lg font-black">{String(title)}</h2>
              <p className="mt-1 text-sm leading-6 opacity-55">{String(body)}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold">Open <ArrowRight size={15} className="transition group-hover:translate-x-1"/></span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
