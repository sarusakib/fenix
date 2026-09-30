'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookmarkSimple, Trash, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type SavedPost = {
  id: string
  body: string | null
  created_at: string
  author_name: string | null
  author_username: string | null
  author_avatar_url: string | null
}

export default function SavedPage() {
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'
  const [items, setItems] = useState<SavedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const s = createClient()
    const { data: auth } = await s.auth.getSession()
    const uid = auth.session?.user?.id
    if (!uid) {
      window.location.replace('/login?next=/saved')
      return
    }

    const { data: bookmarks, error: bookmarkError } = await s
      .from('fenix_content_bookmarks')
      .select('content_id,created_at')
      .eq('user_id', uid)
      .eq('content_type', 'post')
      .order('created_at', { ascending: false })
      .limit(100)

    if (bookmarkError) {
      setMessage(bn ? 'Saved posts লোড করা যায়নি।' : 'Saved posts could not be loaded.')
      setLoading(false)
      return
    }

    const ids = (bookmarks ?? []).map(row => row.content_id).filter(Boolean)
    if (!ids.length) {
      setItems([])
      setLoading(false)
      return
    }

    const { data: posts, error: postError } = await s
      .from('fenix_public_feed')
      .select('id,body,created_at,author_name,author_username,author_avatar_url')
      .in('id', ids)

    if (postError) {
      setMessage(bn ? 'Saved content পাওয়া যায়নি।' : 'Saved content could not be loaded.')
      setItems([])
    } else {
      const order = new Map(ids.map((id, index) => [id, index]))
      setItems(((posts ?? []) as SavedPost[]).sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999)))
    }
    setLoading(false)
  }

  useEffect(() => { void load() }, [bn])

  async function remove(id: string) {
    const s = createClient()
    const { data: auth } = await s.auth.getSession()
    const uid = auth.session?.user?.id
    if (!uid) return
    setItems(value => value.filter(item => item.id !== id))
    const { error } = await s.from('fenix_content_bookmarks').delete().eq('user_id', uid).eq('content_type', 'post').eq('content_id', id)
    if (error) {
      setMessage(bn ? 'Saved item সরানো যায়নি।' : 'Could not remove the saved item.')
      void load()
    }
  }

  return (
    <main className="fenix-shell min-h-dvh">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6">
        <Link href="/feed" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3.5 text-xs font-bold">
          <ArrowLeft size={16}/> {bn ? 'ফিড' : 'Feed'}
        </Link>

        <header className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><BookmarkSimple size={22} weight="duotone"/></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.17em] text-[var(--fx-primary-strong)]">{bn ? 'আপনার সংগ্রহ' : 'Your collection'}</p>
              <h1 className="mt-1 text-3xl font-black sm:text-5xl">{bn ? 'Saved' : 'Saved'}</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{bn ? 'পরে দেখার জন্য রাখা post এখানে থাকবে।' : 'Posts you save for later live here.'}</p>
            </div>
          </div>
        </header>

        {message && <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-sm text-red-700 dark:text-red-200">{message}</p>}

        {loading ? (
          <div className="mt-5 space-y-2">{[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-black/[.03] dark:bg-white/[.04]"/>)}</div>
        ) : items.length ? (
          <div className="mt-5 space-y-2">
            {items.map(post => (
              <article key={post.id} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
                <div className="flex items-start gap-3">
                  {post.author_avatar_url ? <img src={post.author_avatar_url} alt="" loading="lazy" width={42} height={42} className="h-[42px] w-[42px] shrink-0 rounded-full object-cover"/> : <UserCircle size={42} className="shrink-0 opacity-35"/>}
                  <div className="min-w-0 flex-1">
                    <Link href={post.author_username ? '/profile/'+encodeURIComponent(post.author_username) : '/profile'} className="truncate text-sm font-bold hover:underline">{post.author_name || post.author_username || 'FeniX user'}</Link>
                    <p className="mt-1 text-[10px] text-[var(--fx-muted)]">{new Date(post.created_at).toLocaleString(bn ? 'bn-BD' : 'en-BD')}</p>
                    {post.body && <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-6">{post.body}</p>}
                  </div>
                  <button type="button" onClick={() => void remove(post.id)} aria-label={bn ? 'Saved থেকে সরান' : 'Remove saved post'} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--fx-muted)] hover:bg-red-500/10 hover:text-red-600"><Trash size={16}/></button>
                </div>
                <Link href={'/feed/post/'+post.id} className="mt-3 inline-flex min-h-9 items-center rounded-xl bg-[var(--fx-primary-soft)] px-3 text-[10px] font-bold text-[var(--fx-primary-strong)]">{bn ? 'Post খুলুন' : 'Open post'}</Link>
              </article>
            ))}
          </div>
        ) : (
          <section className="mt-5 rounded-[2rem] border border-dashed border-[var(--fx-border)] p-10 text-center">
            <BookmarkSimple size={30} className="mx-auto opacity-30"/>
            <h2 className="mt-4 text-lg font-black">{bn ? 'কোনো saved post নেই' : 'No saved posts yet'}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{bn ? 'Feed থেকে একটি post Save করলে এখানে দেখা যাবে।' : 'Save a post from Feed and it will appear here.'}</p>
          </section>
        )}
      </section>
    </main>
  )
}
