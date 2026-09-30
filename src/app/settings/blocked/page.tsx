'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, UserCircle, X } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type BlockedPerson = { id: string; full_name: string | null; username: string | null; avatar_url: string | null }

export default function BlockedAccountsPage() {
  const { locale } = useFenixLocale()
  const [items, setItems] = useState<BlockedPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      const s = createClient()
      const { data: auth } = await s.auth.getUser()
      if (!auth.user) { window.location.replace('/login?next=/settings/blocked'); return }
      const { data: blocks, error: blockError } = await s.from('fenix_dm_blocks').select('blocked_id').eq('blocker_id', auth.user.id).order('created_at', { ascending: false })
      if (blockError) { if (active) { setError('Could not load blocked accounts.'); setLoading(false) }; return }
      const ids = [...new Set((blocks ?? []).map(row => row.blocked_id).filter(Boolean))]
      if (!ids.length) { if (active) { setItems([]); setLoading(false) }; return }
      const { data: profiles } = await s.from('profiles').select('id,full_name,username,avatar_url').in('id', ids)
      if (active) { setItems((profiles ?? []) as BlockedPerson[]); setLoading(false) }
    }
    void load()
    return () => { active = false }
  }, [])

  async function unblock(id: string) {
    setBusyId(id)
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) return
    const { error: e } = await s.from('fenix_dm_blocks').delete().eq('blocker_id', auth.user.id).eq('blocked_id', id)
    if (e) setError('Could not unblock this account.')
    else setItems(value => value.filter(person => person.id !== id))
    setBusyId('')
  }

  const bn = locale === 'bn'
  return <main className="fenix-shell min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 pb-28 pt-7 sm:px-6">
    <Link href="/settings" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> {bn ? 'সেটিংস' : 'Settings'}</Link>
    <header className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-5 sm:p-7">
      <div className="flex items-start gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><ShieldCheck size={20}/></div><div><h1 className="text-2xl font-black sm:text-4xl">{bn ? 'Blocked accounts' : 'Blocked accounts'}</h1><p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{bn ? 'যাদের আপনি block করেছেন, তাদের এখান থেকে unblock করতে পারবেন।' : 'Review and unblock accounts you previously blocked.'}</p></div></div>
    </header>
    {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[.06] p-3 text-sm text-red-700 dark:text-red-200">{error}</p>}
    {loading ? <div className="mt-5 space-y-2">{[1,2,3].map(i=><div key={i} className="h-20 animate-pulse rounded-2xl bg-black/[.03] dark:bg-white/[.04]"/>)}</div> :
      items.length ? <div className="mt-5 space-y-2">{items.map(person=><div key={person.id} className="flex items-center gap-3 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-3">
        {person.avatar_url ? <img src={person.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover"/> : <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><UserCircle size={27}/></div>}
        <Link href={person.username ? '/profile/'+encodeURIComponent(person.username) : '/profile'} className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{person.full_name || person.username || 'FeniX user'}</p><p className="mt-0.5 truncate text-xs text-[var(--fx-muted)]">{person.username ? '@'+person.username : 'FeniX user'}</p></Link>
        <button type="button" disabled={busyId === person.id} onClick={()=>void unblock(person.id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold disabled:opacity-45"><X size={15}/>{bn ? 'Unblock' : 'Unblock'}</button>
      </div>)}</div> :
      <div className="mt-5 rounded-3xl border border-dashed border-[var(--fx-border)] p-10 text-center"><ShieldCheck size={28} className="mx-auto opacity-30"/><h2 className="mt-3 text-lg font-black">{bn ? 'কোনো blocked account নেই' : 'No blocked accounts'}</h2><p className="mt-2 text-sm text-[var(--fx-muted)]">{bn ? 'আপনি কাউকে block করলে এখানে দেখা যাবে।' : 'Accounts you block will appear here.'}</p></div>}
  </section></main>
}
