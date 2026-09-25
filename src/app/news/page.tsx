import Link from 'next/link'
import { ArrowRight, Clock, Newspaper, ShieldCheck, TrendUp } from '@phosphor-icons/react/dist/ssr'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const categories = [
  ['all','All'], ['local','Local'], ['business','Business'], ['jobs','Jobs'],
  ['events','Events'], ['public_notice','Public Notices'], ['fenix','FeniX'],
] as const

const labels: Record<string,string> = {
  local:'Local', business:'Business', jobs:'Jobs', events:'Events',
  public_notice:'Public Notice', fenix:'FeniX Update',
}

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const params = await searchParams
  const category = categories.some(([id]) => id === params.category) ? params.category : 'all'
  const q = (params.q ?? '').trim().slice(0, 80)
  const s = await createClient()
  const cookieStore = await cookies()
  const seenCookie = cookieStore.get('fenix_news_seen')?.value ?? ''
  const seenIds = seenCookie.split(',').map(v => v.trim()).filter(v => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)).slice(0, 80)
  let query = (s as any).from('news_posts').select('id,slug,title_bn,title_en,excerpt_bn,excerpt_en,category,featured,breaking,verification_status,image_url,published_at,source_name').eq('status','published').order('published_at',{ascending:false}).limit(48)
  if (seenIds.length) query = query.not('id','in','(' + seenIds.join(',') + ')')
  if (category !== 'all') query = query.eq('category', category)
  if (q) query = query.or('title_bn.ilike.%'+q+'%,title_en.ilike.%'+q+'%,excerpt_bn.ilike.%'+q+'%,excerpt_en.ilike.%'+q+'%')
  const { data, error } = await query
  const posts = (data ?? []) as any[]
  const featured = posts.filter(p=>p.featured).slice(0,3)
  const lead = featured[0] ?? posts[0]
  const latest = lead ? posts.filter(p=>p.id!==lead.id) : posts

  return <main className="fenix-shell min-h-dvh overflow-x-clip">
    <Navbar />
    <section className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:px-8">
      <div className="border-b border-[var(--fx-border)] py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[var(--fx-primary-strong)]"><Newspaper size={15}/> FeniX News</div>
            <h1 className="mt-2 text-4xl font-black tracking-[-.06em] sm:text-6xl">News that stays clear.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">A public FeniX newsroom for Feni local updates, business, jobs, events, public notices and official FeniX updates.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--fx-muted)]"><ShieldCheck size={15}/> Published and controlled by FeniX</div>
        </div>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map(([id,label])=><Link key={id} href={id==='all'?'/news':'/news?category='+id} className={'shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold '+(category===id?'border-[var(--fx-primary)]/20 bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-muted)]')}>{label}</Link>)}
        </div>
      </div>

      {error ? <div className="mt-8 rounded-[1.7rem] border border-amber-500/20 bg-amber-500/[.05] p-6 text-sm leading-7 text-[var(--fx-muted)]"><strong className="text-[var(--fx-text)]">FeniX News is being prepared.</strong><br/>The newsroom database is not connected to this deployment yet.</div> :
      !posts.length ? <div className="mt-8 rounded-[2rem] border border-dashed border-[var(--fx-border)] p-12 text-center"><Newspaper size={34} className="mx-auto opacity-30"/><p className="mt-4 text-lg font-black">You’re caught up.</p><p className="mt-2 text-sm text-[var(--fx-muted)]">You’ve already seen the available stories. New stories will appear here when they are published.</p></div> :
      <div className="mt-7">
        {lead && <Link href={'/news/'+lead.slug} className="group grid overflow-hidden rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] lg:grid-cols-[1.18fr_.82fr]">
          <div className="min-h-[320px] bg-[var(--fx-primary-soft)] p-6 sm:p-9 lg:p-10">
            <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[var(--fx-primary-strong)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-white">{lead.breaking?'Breaking':'Featured'}</span><span className="rounded-full border border-[var(--fx-border)] bg-[var(--fx-bg)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em]">{labels[lead.category]}</span></div>
            <h2 className="mt-7 max-w-3xl text-3xl font-black leading-tight tracking-[-.04em] sm:text-5xl">{lead.title_en}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--fx-muted)]">{lead.excerpt_en || lead.excerpt_bn}</p>
            <span className="mt-7 inline-flex items-center gap-2 text-xs font-black text-[var(--fx-primary-strong)]">Read story <ArrowRight size={15} className="transition-transform group-hover:translate-x-1"/></span>
          </div>
          <div className="hidden min-h-[320px] items-end border-l border-[var(--fx-border)] bg-[var(--fx-bg)] p-8 lg:flex"><div><p className="text-[10px] font-black uppercase tracking-[.17em] text-[var(--fx-muted)]">FeniX News</p><p className="mt-2 text-2xl font-black">Public by default.</p><p className="mt-2 max-w-xs text-sm leading-6 text-[var(--fx-muted)]">Source and verification context stay visible with the story.</p></div></div>
        </Link>}

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_.34fr]">
          <div>
            <div className="flex items-center justify-between"><h2 className="text-xl font-black">Latest</h2><span className="text-[10px] font-black uppercase tracking-[.14em] text-[var(--fx-muted)]">{posts.length} stories</span></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {latest.map(post=><NewsCard key={post.id} post={post}/>)}
            </div>
          </div>
          <aside className="h-fit rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
            <div className="flex items-center gap-2 text-[var(--fx-primary-strong)]"><TrendUp size={18}/><span className="text-xs font-black">News standards</span></div>
            <ul className="mt-4 space-y-3 text-xs leading-5 text-[var(--fx-muted)]"><li>• Every story is published through FeniX control.</li><li>• Source information is shown where available.</li><li>• Verification labels describe editorial evidence, not a guarantee.</li><li>• Corrections can be made by FeniX Admin.</li></ul>
            <Link href="/policy#news" className="mt-5 inline-flex items-center gap-2 text-xs font-bold">Read policy <ArrowRight size={14}/></Link>
          </aside>
        </div>
      </div>}
    </section>
  </main>
}

function NewsCard({post}:{post:any}) {
  return <Link href={'/news/'+post.slug} className="group rounded-[1.6rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.1em] text-[var(--fx-primary-strong)]">{labels[post.category]}</span><span className="inline-flex items-center gap-1 text-[10px] text-[var(--fx-muted)]"><Clock size={12}/>{post.published_at?new Date(post.published_at).toLocaleDateString('en-BD'):''}</span></div>
    <h3 className="mt-4 text-xl font-black leading-tight tracking-[-.03em]">{post.title_en}</h3>
    <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{post.excerpt_en || post.excerpt_bn || ''}</p>
    <div className="mt-4 flex items-center justify-between gap-3 text-[10px] font-bold text-[var(--fx-muted)]"><span>{post.source_name || 'FeniX News Desk'}</span><ArrowRight size={15} className="text-[var(--fx-primary-strong)] transition-transform group-hover:translate-x-1"/></div>
  </Link>
}