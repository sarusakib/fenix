import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  Brain,
  Buildings,
  Compass,
  MagnifyingGlass,
  RocketLaunch,
  ShoppingBag,
  Storefront,
  TrendUp,
} from '@phosphor-icons/react/dist/ssr'
import { createClient } from '@/utils/supabase/server'
import UltraAqueousBackground from '@/components/ultra/UltraAqueousBackground'

const destinations = [
  { icon: RocketLaunch, title: 'Start a Business', text: 'Plan, launch and build your local presence.', href: '/start' },
  { icon: TrendUp, title: 'Invest in Feni', text: 'Explore opportunities and investment intelligence.', href: '/invest' },
  { icon: Storefront, title: 'Business Directory', text: 'Find suppliers, services and local businesses.', href: '/directory' },
  { icon: ShoppingBag, title: 'Shop Local', text: 'Discover approved local sellers and products.', href: '/commerce' },
  { icon: Brain, title: 'Feni Brain', text: 'Ask questions in Bangla, English or Banglish.', href: '/guide' },
]

export default async function MainHomePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    redirect('/login')
  }

  const displayName =
    data.user.user_metadata?.full_name ||
    data.user.email?.split('@')[0] ||
    'FeniX User'

  return (
    <main className="relative min-h-dvh overflow-x-clip bg-[#06080c] text-white">
      <UltraAqueousBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-20 sm:px-6 lg:px-10">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-white/[0.06]">
          <Link href="/home" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-100/10 bg-cyan-300/[0.045] text-xs font-black">FX</span>
            <div>
              <div className="text-base font-bold tracking-[0.16em]">FeniX</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/30">Main ecosystem</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/home" className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs text-white/80">Home</Link>
            <Link href="/directory" className="rounded-xl px-3 py-2 text-xs text-white/45 hover:bg-white/[0.05] hover:text-white">Directory</Link>
            <Link href="/invest" className="rounded-xl px-3 py-2 text-xs text-white/45 hover:bg-white/[0.05] hover:text-white">Invest</Link>
            <Link href="/guide" className="rounded-xl px-3 py-2 text-xs text-white/45 hover:bg-white/[0.05] hover:text-white">Feni Brain</Link>
            <Link href="/commerce" className="rounded-xl px-3 py-2 text-xs text-white/45 hover:bg-white/[0.05] hover:text-white">Shop</Link>
          </nav>

          <Link href="/login" className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-xs font-semibold text-white/65 hover:bg-white/[0.08]">
            Account
          </Link>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.25fr_0.75fr] lg:py-16">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.045] p-7 backdrop-blur-2xl sm:p-10 lg:p-14">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-100/50">Welcome back</div>
            <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Good to see you,
              <br />
              <span className="text-white/35">{displayName}.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              Your FeniX workspace connects discovery, business, investment, commerce and Feni Brain in one calm interface.
            </p>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <Link href="/guide" className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-cyan-100/15 bg-cyan-300/[0.055] px-4 text-sm font-semibold text-white/80 hover:bg-cyan-300/[0.09]">
                <MagnifyingGlass size={20} className="text-cyan-100/70" />
                <span className="min-w-0 flex-1">Ask Feni Brain anything…</span>
                <ArrowRight size={17} />
              </Link>
              <Link href="/directory" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-5 text-sm font-semibold text-white/65 hover:bg-white/[0.07]">
                Discover
                <Compass size={18} />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <Buildings size={23} className="text-cyan-100/65" />
              <div className="mt-7 text-2xl font-semibold">Feni-first</div>
              <p className="mt-2 text-sm leading-6 text-white/40">Location-aware discovery across the district.</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <Brain size={23} className="text-cyan-100/65" />
              <div className="mt-7 text-2xl font-semibold">Feni Brain</div>
              <p className="mt-2 text-sm leading-6 text-white/40">Source-backed knowledge and hybrid search.</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <Storefront size={23} className="text-cyan-100/65" />
              <div className="mt-7 text-2xl font-semibold">Commerce</div>
              <p className="mt-2 text-sm leading-6 text-white/40">Approved local sellers and products.</p>
            </div>
          </div>
        </section>

        <section className="py-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/30">Your ecosystem</div>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Choose your next move.</h2>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {destinations.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.title} href={item.href} className="group rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.065]">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-cyan-100/70">
                    <Icon size={21} weight="duotone" />
                  </span>
                  <h3 className="mt-8 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/40">{item.text}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-white/45 group-hover:text-cyan-100">
                    Open <ArrowRight size={14} />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
