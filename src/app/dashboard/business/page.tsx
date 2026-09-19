import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, ArrowRight, Storefront } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export default async function BusinessDashboardPage() {
  const s = await createClient()
  const { data: auth } = await s.auth.getUser()
  if (!auth.user) redirect('/login?next=/dashboard/business')
  const { data: items } = await s.from('businesses').select('id,name,title_bn,title_en,category,updated_at').eq('owner_id',auth.user.id).order('updated_at',{ascending:false})
  return <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar/><section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]"><ArrowLeft size={17}/> Account</Link><div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Business identity</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Your businesses</h1><p className="mt-3 text-sm leading-7 opacity-60">Manage the shared identity used across FeniX Directory, Commerce, Start and future ecosystem services.</p></div><div className="mt-7 space-y-3">{items?.length?items.map(item=><article key={item.id} className="rounded-3xl border border-black/10 bg-white/85 p-5 dark:border-white/10 dark:bg-white/[.045]"><div className="flex gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]"><Storefront size={22}/></div><div className="min-w-0"><h2 className="font-black">{item.title_bn||item.title_en||item.name}</h2><p className="mt-1 text-xs opacity-45">{item.category||'Category not set'}</p><p className="mt-2 text-[11px] opacity-40">Updated {new Date(item.updated_at).toLocaleDateString('en-BD')}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><Link href={'/directory/'+item.id} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#008080] px-4 text-xs font-bold text-white">Profile <ArrowRight size={15}/></Link><Link href="/directory/manage" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/10 px-4 text-xs font-bold dark:border-white/10">Manage</Link></div></article>):<div className="rounded-3xl border border-dashed border-black/15 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-white/[.03]"><Storefront size={30} className="mx-auto opacity-35"/><h2 className="mt-4 text-xl font-black">No business yet</h2><Link href="/directory/join" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">Create business <ArrowRight size={16}/></Link></div>}</div></section></main>
}
