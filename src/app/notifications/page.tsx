'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, ChatCircleDots, CheckCircle, FunnelSimple, ShieldCheck, Users } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type Notification = {
  id: string
  title: string
  body: string
  href: string | null
  kind: string
  read_at: string | null
  created_at: string
}

type Filter = 'all' | 'unread' | 'social' | 'messages' | 'trust'

export default function NotificationsPage() {
  const { locale } = useFenixLocale()
  const [items, setItems] = useState<Notification[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const bn = locale === 'bn'

  async function load() {
    const s = createClient()
    const { data: auth } = await s.auth.getSession()
    const uid = auth.session?.user?.id
    if (!uid) {
      window.location.replace('/login?next=/notifications')
      return
    }
    const { data, error: e } = await s
      .from('fenix_notifications')
      .select('id,user_id,kind,title,body,href,read_at,created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(150)
    if (e) setError(bn ? 'নোটিফিকেশন লোড করা যায়নি।' : 'Notifications could not be loaded.')
    else setItems((data ?? []) as Notification[])
    setLoading(false)
  }

  useEffect(() => { void load() }, [bn])

  const visible = useMemo(() => {
    return items.filter(item => {
      if (filter === 'unread') return !item.read_at
      if (filter === 'social') return item.kind === 'social'
      if (filter === 'messages') return item.kind === 'messages'
      if (filter === 'trust') return item.kind === 'trust' || item.kind === 'verification'
      return true
    })
  }, [items, filter])

  async function markOne(id: string) {
    const item = items.find(value => value.id === id)
    if (!item || item.read_at) return
    const now = new Date().toISOString()
    setItems(value => value.map(row => row.id === id ? { ...row, read_at: now } : row))
    const s = createClient()
    const { data: auth } = await s.auth.getSession()
    if (!auth.session?.user?.id) return
    await s.from('fenix_notifications').update({ read_at: now }).eq('id', id).eq('user_id', auth.session.user.id)
  }

  async function markAll() {
    const s = createClient()
    const { data: auth } = await s.auth.getSession()
    const uid = auth.session?.user?.id
    if (!uid) return
    const now = new Date().toISOString()
    setItems(value => value.map(item => item.read_at ? item : { ...item, read_at: now }))
    await s.from('fenix_notifications').update({ read_at: now }).eq('user_id', uid).is('read_at', null)
  }

  const tabs: Array<[Filter,string]> = [
    ['all', bn ? 'সব' : 'All'],
    ['unread', bn ? 'না-পড়া' : 'Unread'],
    ['social', bn ? 'সামাজিক' : 'Social'],
    ['messages', bn ? 'বার্তা' : 'Messages'],
    ['trust', bn ? 'ট্রাস্ট' : 'Trust'],
  ]

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <Link href="/feed" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold">
          <ArrowLeft size={16} /> {bn ? 'ফিড' : 'Feed'}
        </Link>

        <header className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><Bell size={22} weight="duotone"/></div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[.17em] text-[var(--fx-primary-strong)]">{bn ? 'অ্যাকাউন্ট' : 'Account'}</p>
              <h1 className="mt-1 text-3xl font-black tracking-[-.04em] sm:text-5xl">{bn ? 'নোটিফিকেশন' : 'Notifications'}</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{bn ? 'Follow, comment, message এবং trust update এক জায়গায়।' : 'Follow, comment, message and trust activity in one inbox.'}</p>
            </div>
          </div>

          <div className="mt-5 flex gap-1 overflow-x-auto rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/50 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map(([id,label]) => (
              <button key={id} type="button" onClick={() => setFilter(id)} aria-pressed={filter === id} className={'shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-bold '+(filter===id?'bg-[var(--fx-primary-strong)] text-white':'text-[var(--fx-muted)]')}>
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--fx-muted)]"><FunnelSimple size={14}/>{visible.length} {bn ? 'টি' : 'items'}</span>
            <button type="button" onClick={() => void markAll()} disabled={!items.some(item => !item.read_at)} className="min-h-9 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold disabled:opacity-40">
              {bn ? 'সব পড়া হিসেবে চিহ্নিত করুন' : 'Mark all read'}
            </button>
          </div>
        </header>

        {error && <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-sm text-red-700 dark:text-red-200">{error}</div>}

        {loading ? (
          <div className="mt-5 space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-black/[.03] dark:bg-white/[.04]"/>)}</div>
        ) : visible.length ? (
          <div className="mt-5 space-y-2">
            {visible.map(item => {
              const icon = item.kind === 'messages' ? <ChatCircleDots size={19}/> : item.kind === 'social' ? <Users size={19}/> : item.kind === 'trust' || item.kind === 'verification' ? <ShieldCheck size={19}/> : <Bell size={19}/>
              const node = (
                <article className={'rounded-2xl border p-4 transition '+(item.read_at?'border-[var(--fx-border)] bg-[var(--fx-surface)]':'border-[var(--fx-primary)]/20 bg-[var(--fx-primary-soft)]')}>
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-bg)] text-[var(--fx-primary-strong)]">{icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <h2 className="min-w-0 flex-1 text-sm font-black">{item.title}</h2>
                        {!item.read_at && <span className="rounded-full bg-[var(--fx-primary-strong)] px-2 py-0.5 text-[9px] font-black text-white">{bn?'নতুন':'New'}</span>}
                      </div>
                      <p className="mt-1.5 text-sm leading-6 text-[var(--fx-muted)]">{item.body}</p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--fx-muted)]">
                        <time>{new Date(item.created_at).toLocaleString(bn ? 'bn-BD' : 'en-BD')}</time>
                        <span>·</span>
                        <span>{item.kind}</span>
                      </div>
                    </div>
                  </div>
                </article>
              )
              return item.href
                ? <Link key={item.id} href={item.href} onClick={() => void markOne(item.id)}>{node}</Link>
                : <button key={item.id} type="button" onClick={() => void markOne(item.id)} className="block w-full text-left">{node}</button>
            })}
          </div>
        ) : (
          <section className="mt-5 rounded-[2rem] border border-dashed border-[var(--fx-border)] p-10 text-center">
            <CheckCircle size={31} className="mx-auto opacity-30"/>
            <h2 className="mt-4 text-xl font-black">{bn ? 'সব আপডেট দেখা হয়েছে' : 'You are all caught up'}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{bn ? 'নতুন activity হলে এখানে দেখা যাবে।' : 'New activity will appear here when something needs your attention.'}</p>
          </section>
        )}
      </section>
    </main>
  )
}
