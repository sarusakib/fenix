'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Flag, PencilSimple, PaperPlaneRight, Trash, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type FeedPost = {
  id: string
  body: string
  created_at: string
  updated_at: string
  author_id: string
  author_name: string | null
  author_username: string | null
  author_avatar_url: string | null
}

export default function FeedPage() {
  const { locale } = useFenixLocale()
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [reporting, setReporting] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const s = createClient()
    const [{ data: auth }, { data, error }] = await Promise.all([
      s.auth.getUser(),
      s.from('fenix_public_feed').select('*').order('created_at', { ascending: false }).limit(50),
    ])
    setUserId(auth.user?.id ?? null)
    if (!error) setPosts((data ?? []) as FeedPost[])
  }, [])

  useEffect(() => { void load() }, [load])

  async function publish() {
    const clean = body.trim()
    if (!clean || clean.length > 5000) return
    setBusy(true); setMessage('')
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) { setMessage(locale === 'bn' ? 'Post করতে আগে login করুন।' : 'Please sign in to post.'); setBusy(false); return }
    const { error } = await s.from('fenix_posts').insert({ author_id: auth.user.id, body: clean, visibility: 'public' })
    if (error) setMessage(locale === 'bn' ? 'Post প্রকাশ করা যায়নি।' : 'Could not publish the post.')
    else { setBody(''); setMessage(locale === 'bn' ? 'Post প্রকাশ হয়েছে।' : 'Post published.'); await load() }
    setBusy(false)
  }

  async function saveEdit(postId: string) {
    const clean = editBody.trim()
    if (!clean || clean.length > 5000 || !userId) return
    setBusy(true); setMessage('')
    const s = createClient()
    const { error } = await s.from('fenix_posts').update({ body: clean, updated_at: new Date().toISOString() }).eq('id', postId).eq('author_id', userId)
    if (error) setMessage(locale === 'bn' ? 'Post update করা যায়নি।' : 'Could not update the post.')
    else { setEditing(null); setEditBody(''); await load() }
    setBusy(false)
  }

  async function remove(postId: string) {
    if (!userId) return
    setBusy(true); setMessage('')
    const s = createClient()
    const { error } = await s.from('fenix_posts').update({ deleted_at: new Date().toISOString() }).eq('id', postId).eq('author_id', userId)
    if (error) setMessage(locale === 'bn' ? 'Post মুছতে পারেনি।' : 'Could not remove the post.')
    else await load()
    setBusy(false)
  }

  async function reportPost(postId: string) {
    if (!reportReason.trim()) return
    setBusy(true); setMessage('')
    const s = createClient()
    const { data: auth } = await s.auth.getUser()
    if (!auth.user) { setMessage(locale === 'bn' ? 'Report করতে login করুন।' : 'Please sign in to report.'); setBusy(false); return }
    const { error } = await s.from('fenix_content_reports').insert({
      reporter_id: auth.user.id, content_type: 'post', content_id: postId,
      reason: reportReason.trim().slice(0, 120), details: reportReason.trim().slice(0, 2000),
    })
    if (error) setMessage(locale === 'bn' ? 'Report পাঠানো যায়নি।' : 'Could not submit the report.')
    else { setReporting(null); setReportReason(''); setMessage(locale === 'bn' ? 'Report admin review queue-তে গেছে।' : 'Report sent to the admin review queue.') }
    setBusy(false)
  }

  const copy = locale === 'bn'
    ? { title: 'ফিড', intro: 'ফেনীX কমিউনিটিতে শুধু লেখা পোস্ট। সংক্ষিপ্ত, পরিষ্কার এবং স্থানীয়ভাবে কাজে লাগে এমন কথা শেয়ার করুন।', login: 'Post করতে Login করুন', placeholder: 'আপনি কী শেয়ার করতে চান?', post: 'Post করুন', report: 'Report', edit: 'Edit', remove: 'Delete', save: 'Save', cancel: 'Cancel', empty: 'এখনও কোনো public post নেই।' }
    : { title: 'Feed', intro: 'A text-only community feed for useful, local and respectful conversations around FeniX.', login: 'Sign in to post', placeholder: 'What would you like to share?', post: 'Post', report: 'Report', edit: 'Edit', remove: 'Delete', save: 'Save', cancel: 'Cancel', empty: 'No public posts yet.' }

  return (
    <main className="min-h-dvh">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 pb-28 pt-7 sm:px-6">
        <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> {locale === 'bn' ? 'হোম' : 'Home'}</Link>
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">FeniX Community</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{copy.title}</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--fx-muted)]">{copy.intro}</p>
        </div>

        {userId ? (
          <section className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
            <textarea value={body} onChange={e => setBody(e.target.value)} maxLength={5000} rows={5} placeholder={copy.placeholder} className="w-full resize-none rounded-2xl border border-[var(--fx-border)] bg-transparent p-4 text-sm leading-7 outline-none" />
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--fx-muted)]">{body.length}/5000 · text only</span>
              <button type="button" disabled={busy || !body.trim()} onClick={() => void publish()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white disabled:opacity-45"><PaperPlaneRight size={16}/> {copy.post}</button>
            </div>
          </section>
        ) : (
          <Link href="/login?next=/feed" className="mt-6 flex min-h-12 items-center justify-center rounded-2xl bg-[var(--fx-primary-soft)] px-4 text-sm font-bold text-[var(--fx-primary-strong)]">{copy.login}</Link>
        )}

        {message && <p className="mt-3 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-xs leading-5">{message}</p>}

        <div className="mt-6 space-y-3">
          {posts.length ? posts.map(post => (
            <article key={post.id} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
              <div className="flex items-start gap-3">
                {post.author_avatar_url ? <img src={post.author_avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <UserCircle size={40} weight="duotone" className="shrink-0 opacity-40" />}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link href={post.author_username ? `/profile/${encodeURIComponent(post.author_username)}` : '/profile'} className="font-bold hover:underline">{post.author_name || post.author_username || 'FeniX user'}</Link>
                    <time className="text-[11px] text-[var(--fx-muted)]">{new Date(post.created_at).toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-BD')}</time>
                  </div>
                  {editing === post.id ? (
                    <div className="mt-3">
                      <textarea value={editBody} onChange={e => setEditBody(e.target.value)} maxLength={5000} rows={4} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-6" />
                      <div className="mt-2 flex gap-2">
                        <button type="button" disabled={busy} onClick={() => void saveEdit(post.id)} className="rounded-lg bg-[var(--fx-primary-strong)] px-3 py-2 text-xs font-bold text-white">{copy.save}</button>
                        <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-[var(--fx-border)] px-3 py-2 text-xs font-bold">{copy.cancel}</button>
                      </div>
                    </div>
                  ) : <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{post.body}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {userId === post.author_id && editing !== post.id && <button type="button" onClick={() => { setEditing(post.id); setEditBody(post.body) }} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-3 text-xs font-bold"><PencilSimple size={14}/> {copy.edit}</button>}
                    {userId === post.author_id && editing !== post.id && <button type="button" disabled={busy} onClick={() => void remove(post.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-500/15 px-3 text-xs font-bold text-red-600"><Trash size={14}/> {copy.remove}</button>}
                    {userId && <button type="button" onClick={() => setReporting(reporting === post.id ? null : post.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-3 text-xs font-bold"><Flag size={14}/> {copy.report}</button>}
                  </div>
                  {reporting === post.id && <div className="mt-3 rounded-2xl border border-red-500/15 bg-red-500/[.035] p-4">
                    <textarea value={reportReason} onChange={e => setReportReason(e.target.value)} maxLength={2000} rows={3} placeholder={locale === 'bn' ? 'কী সমস্যা হয়েছে লিখুন' : 'Describe the problem'} className="w-full rounded-xl border border-red-500/15 bg-transparent p-3 text-xs leading-6" />
                    <button type="button" disabled={busy || !reportReason.trim()} onClick={() => void reportPost(post.id)} className="mt-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">Send report</button>
                  </div>}
                </div>
              </div>
            </article>
          )) : <div className="rounded-[1.7rem] border border-dashed border-[var(--fx-border)] p-10 text-center text-sm text-[var(--fx-muted)]">{copy.empty}</div>}
        </div>
      </section>
    </main>
  )
}
