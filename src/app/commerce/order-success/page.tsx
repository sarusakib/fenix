import Link from 'next/link'
import { CheckCircle, ShoppingBag, Storefront } from '@phosphor-icons/react/dist/ssr'

import Navbar from '@/components/Navbar'

export default async function CommerceOrderSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto flex min-h-[75vh] max-w-2xl items-center justify-center px-4 py-16 text-center">
        <div className="w-full rounded-[2rem] border border-[#008080]/15 bg-white/80 p-8 shadow-[0_20px_80px_rgba(11,23,54,0.07)] dark:border-teal-300/10 dark:bg-white/[0.045] dark:shadow-none sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#008080]/10 text-[#008080] dark:bg-teal-300/10 dark:text-teal-200"><CheckCircle size={44} weight="fill" /></div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#008080]">Order placed</p>
          <h1 className="mt-2 text-4xl font-black">Thank you!</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 opacity-55">আপনার order সফলভাবে নেওয়া হয়েছে। Seller order confirm ও delivery process শুরু করবে।</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/commerce" className="inline-flex items-center gap-2 rounded-xl bg-[#008080] px-5 py-3 text-sm font-bold text-white"><ShoppingBag size={18} /> Continue shopping</Link>
            <Link href="/commerce/orders" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 px-5 py-3 text-sm font-bold dark:border-white/10"><Storefront size={18} /> My orders</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
