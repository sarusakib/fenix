import Link from 'next/link'
import { ArrowLeft, ArrowRight, Briefcase, Lightbulb, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'

export default function JobsPage(){
  return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
    <Navbar/>
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Home</Link>
      <div className="mt-7 rounded-[2rem] border border-black/10 bg-white/85 p-7 dark:border-white/10 dark:bg-white/[.045] sm:p-10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#008080]/[.08] text-[#008080]"><Briefcase size={25}/></div>
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Work & opportunity</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Jobs in the FeniX network</h1><p className="mt-3 max-w-2xl text-sm leading-7 opacity-60">The Jobs module is reserved for verified postings and privacy-safe applicant workflows. No unverified vacancy is presented as a live listing here.</p></div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/guide?q=How%20can%20I%20find%20jobs%20and%20work%20opportunities%20in%20Feni%3F" className="rounded-2xl border border-[#008080]/15 bg-[#008080]/[.05] p-5"><MagnifyingGlass size={24} className="text-[#008080]"/><h2 className="mt-4 text-lg font-black">Ask Feni Brain</h2><p className="mt-1 text-sm leading-6 opacity-55">Get a sourced guide for finding work opportunities and preparing for applications.</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#007171]">Open Guide <ArrowRight size={15}/></span></Link>
          <Link href="/directory" className="rounded-2xl border border-black/10 bg-black/[.018] p-5 dark:border-white/10 dark:bg-white/[.02]"><Lightbulb size={24} className="text-[#008080]"/><h2 className="mt-4 text-lg font-black">Build your local network</h2><p className="mt-1 text-sm leading-6 opacity-55">Discover local businesses and services that may help you learn about opportunities directly.</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">Open Directory <ArrowRight size={15}/></span></Link>
        </div>
        <p className="mt-6 text-xs leading-5 opacity-45">A future job board must show posting source, freshness, employer identity and application privacy controls before it is treated as verified FeniX inventory.</p>
      </div>
    </section>
  </main>
}
