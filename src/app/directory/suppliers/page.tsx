import Link from 'next/link'
import { ArrowLeft, ArrowRight, Handshake, MagnifyingGlass, Storefront } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'

export default function SuppliersPage() {
  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/directory" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]">
          <ArrowLeft size={17} /> Directory
        </Link>
        <div className="mt-7 rounded-[2rem] border border-black/10 bg-white/85 p-7 dark:border-white/10 dark:bg-white/[.045] sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008080]/[.08] text-[#008080]"><Handshake size={25}/></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Supplier discovery</p>
              <h1 className="mt-2 text-3xl font-black sm:text-5xl">Find local suppliers</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">Use the same FeniX business directory to discover suppliers by name, business type, category and published location. Supplier verification is shown separately from any recommendation.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/directory?q=supplier" className="group rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-5 transition hover:bg-[#008080]/[.08]">
              <MagnifyingGlass size={24} className="text-[#008080]" />
              <h2 className="mt-4 text-lg font-black">Search supplier records</h2>
              <p className="mt-1 text-sm leading-6 opacity-55">Search the live public directory for supplier-related records.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#007171]">Open search <ArrowRight size={15}/></span>
            </Link>
            <Link href="/start/suppliers" className="group rounded-2xl border border-black/10 bg-black/[.018] p-5 transition hover:bg-black/[.035] dark:border-white/10 dark:bg-white/[.02] dark:hover:bg-white/[.04]">
              <Storefront size={24} className="text-[#008080]" />
              <h2 className="mt-4 text-lg font-black">Supplier planning</h2>
              <p className="mt-1 text-sm leading-6 opacity-55">Connect supplier discovery to an active Start a Business Journey.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">Continue planning <ArrowRight size={15}/></span>
            </Link>
          </div>
          <p className="mt-6 text-xs leading-5 opacity-45">FeniX does not treat a directory listing as a guarantee of price, quality, stock, delivery or business legitimacy. Confirm important details directly.</p>
        </div>
      </section>
    </main>
  )
}
