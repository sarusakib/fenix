'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, CheckCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

type Notification = {
  id: string
  title: string
  body: string
  href: string | null
  kind: string
  read_at: string | null
  created_at: string
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) {
      setLoading(false)
      setError('Please sign in to view notifications.')
      return
    }
    const { data, error: e } = await s
      .from('fenix_notifications')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(100)
    if (e) setError('Notifications could not be loaded.')
    else setItems((data ?? []) as Notification[])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  async function markAll() {
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) return
    const now = new Date().toISOString()
    const { error: e } = await s
      .from('fenix_notifications')
      .update({ read_at: now })
      .eq('user_id', auth.user.id)
      .is('read_at', null)
    if (!e) setItems(v => v.map(n => ({ ...n, read_at: n.read_at || now })))
  }

  return (
    <main className="min-h-dvh bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 text-sm font-bold dark:border-white/10 dark:bg-white/[.04]">
          <ArrowLeft size={17} /> Account
        </Link>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">Account</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">Notifications</h1></div>
          <button onClick={() => void markAll()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-black/10 px-3 text-xs font-bold dark:border-white/10">Mark all read</button>
        </div>
        {error && <div className="mt-6 rounded-2xl bg-red-500/[.06] p-4 text-sm text-red-700 dark:text-red-200">{error}</div>}
        {loading ? (
          <div className="mt-8 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-black/[.03] dark:bg-white/[.04]" />)}</div>
        ) : items.length ? (
          <div className="mt-8 space-y-3">
            {items.map(item => {
              const node = (
                <article className={'rounded-2xl border p-5 ' + (item.read_at ? 'border-black/10 bg-white/75 dark:border-white/10 dark:bg-white/[.035]' : 'border-[#008080]/20 bg-[#008080]/[.05]')}>
                  <div className="flex items-start gap-3">
                    <Bell size={20} className="mt-0.5 shrink-0 text-[#008080]" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-black">{item.title}</h2>
                        {!item.read_at && <span className="rounded-full bg-[#008080]/10 px-2 py-0.5 text-[10px] font-bold text-[#007171]">New</span>}
                      </div>
                      <p className="mt-2 text-sm leading-6 opacity-65">{item.body}</p>
                      <p className="mt-2 text-[11px] opacity-40">{new Date(item.created_at).toLocaleString('en-GB')}</p>
                    </div>
                  </div>
                </article>
              )
              return item.href ? <Link key={item.id} href={item.href}>{node}</Link> : <div key={item.id}>{node}</div>
            })}
          </div>
        ) : (
          <section className="mt-8 rounded-3xl border border-dashed border-black/15 bg-white/70 p-10 text-center dark:border-white/10 dark:bg-white/[.03]">
            <CheckCircle size={30} className="mx-auto opacity-35" />
            <h2 className="mt-4 text-xl font-black">You are all caught up</h2>
            <p className="mt-2 text-sm opacity-50">FeniX notifications will appear here as connected activity grows.</p>
          </section>
        )}
      </section>
    </main>
  )
}
