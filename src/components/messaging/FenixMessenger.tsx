'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatCircleDots, Check, CheckCircle, MagnifyingGlass, PaperPlaneRight, Smiley, X, Minus, ArrowLeft, UserCircle } from '@phosphor-icons/react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type Message = {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  created_at: string
  read_at: string | null
}

type Person = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

type Conversation = {
  person: Person
  messages: Message[]
  unread: number
  latest: Message
}

const EMOJIS = ['😀', '😂', '❤️', '👍', '🔥', '😊', '🎉', '🙏', '💡', '🤝', '✨', '🚀']

function initials(person?: Person) {
  const value = person?.full_name || person?.username || 'F'
  return value.trim().slice(0, 1).toUpperCase()
}

function formatTime(value: string) {
  const date = new Date(value)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function FenixMessenger() {
  const pathname = usePathname()
  const [userId, setUserId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [people, setPeople] = useState<Record<string, Person>>({})
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [query, setQuery] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  const hidden = pathname === '/messages' || pathname.startsWith('/login') || pathname.startsWith('/auth')
  const supabase = useMemo(() => createClient(), [])

  async function load() {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return
    setUserId(auth.user.id)

    const { data, error: messageError } = await supabase
      .from('fenix_direct_messages')
      .select('id,sender_id,recipient_id,body,created_at,read_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (messageError) {
      setError('Messages could not be loaded.')
      return
    }

    const rows = (data ?? []) as Message[]
    setMessages(rows)

    const ids = [...new Set(rows.flatMap(m => [m.sender_id, m.recipient_id]).filter(id => id !== auth.user.id))]
    if (ids.length) {
      const { data: profiles } = await supabase
        .from('fenix_public_profiles')
        .select('id,full_name,username,avatar_url')
        .in('id', ids)
      if (profiles) {
        setPeople(Object.fromEntries((profiles as Person[]).map(p => [p.id, p])))
      }
    }
  }

  useEffect(() => {
    if (hidden) return
    void load()

    const channel = supabase
      .channel('fenix-messenger-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fenix_direct_messages' }, payload => {
        const next = payload.new as Message
        if (next.sender_id !== userId && next.recipient_id !== userId) return
        setMessages(current => current.some(m => m.id === next.id) ? current : [next, ...current])
        if (next.sender_id !== userId) {
          void supabase
            .from('fenix_public_profiles')
            .select('id,full_name,username,avatar_url')
            .eq('id', next.sender_id)
            .maybeSingle()
            .then(({ data }) => {
              if (data) setPeople(current => ({ ...current, [next.sender_id]: data as Person }))
            })
        }
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [hidden, supabase, userId])

  const conversations = useMemo<Conversation[]>(() => {
    const map = new Map<string, Message[]>()
    for (const message of messages) {
      const other = message.sender_id === userId ? message.recipient_id : message.sender_id
      const list = map.get(other) ?? []
      list.push(message)
      map.set(other, list)
    }
    return [...map.entries()]
      .map(([id, items]) => {
        const ordered = [...items].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
        const latest = ordered[ordered.length - 1]
        return {
          person: people[id] ?? { id, full_name: null, username: null, avatar_url: null },
          messages: ordered,
          latest,
          unread: items.filter(m => m.recipient_id === userId && !m.read_at).length,
        }
      })
      .sort((a, b) => +new Date(b.latest.created_at) - +new Date(a.latest.created_at))
  }, [messages, people, userId])

  const filtered = conversations.filter(c => {
    const haystack = (c.person.full_name || '') + ' ' + (c.person.username || '')
    return haystack.toLowerCase().includes(query.trim().toLowerCase())
  })

  const active = conversations.find(c => c.person.id === activeId)

  useEffect(() => {
    if (!activeId) return
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }, [activeId, active?.messages.length])

  async function openConversation(person: Person) {
    setActiveId(person.id)
    setOpen(true)
    setMinimized(false)
    setShowEmoji(false)
    setError('')
    const unread = messages.filter(m => m.sender_id === person.id && m.recipient_id === userId && !m.read_at).map(m => m.id)
    if (unread.length) {
      const now = new Date().toISOString()
      setMessages(current => current.map(m => unread.includes(m.id) ? { ...m, read_at: now } : m))
      await supabase.from('fenix_direct_messages').update({ read_at: now }).in('id', unread)
    }
  }

  async function resolveUsername() {
    const username = newUsername.trim().replace(/^@/, '').toLowerCase()
    if (!username) return
    setError('')
    const { data } = await supabase
      .from('fenix_public_profiles')
      .select('id,full_name,username,avatar_url')
      .eq('username', username)
      .maybeSingle()

    if (!data) {
      setError('User not found.')
      return
    }
    if (data.id === userId) {
      setError('You cannot message yourself.')
      return
    }
    setPeople(current => ({ ...current, [data.id]: data as Person }))
    setNewUsername('')
    await openConversation(data as Person)
  }

  async function send() {
    const text = body.trim()
    if (!text || !activeId || busy) return
    setBusy(true)
    setError('')
    const { data, error: sendError } = await supabase
      .from('fenix_direct_messages')
      .insert({ sender_id: userId, recipient_id: activeId, body: text.slice(0, 5000) })
      .select('id,sender_id,recipient_id,body,created_at,read_at')
      .single()

    if (sendError) {
      setError(sendError.code === '42501' ? 'This user is not accepting messages.' : 'Message could not be sent.')
    } else if (data) {
      setMessages(current => current.some(m => m.id === data.id) ? current : [data as Message, ...current])
      setBody('')
      setShowEmoji(false)
    }
    setBusy(false)
  }

  if (hidden) return null

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Open FeniX messages"
          onClick={() => { setOpen(true); setMinimized(false) }}
          className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-4 z-[80] grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-[var(--fx-navy)] text-white shadow-[0_18px_55px_rgba(0,128,128,.30)] transition-transform hover:scale-105 sm:bottom-5 sm:right-5"
        >
          <ChatCircleDots size={28} weight="duotone" />
          {unreadTotal > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#e5484d] px-1 text-[10px] font-black">{unreadTotal > 99 ? '99+' : unreadTotal}</span>}
        </button>
      )}

      {open && (
        <section
          aria-label="FeniX Messenger"
          className={[
            'fixed z-[80] overflow-hidden border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] shadow-[0_30px_100px_rgba(4,12,25,.28)] backdrop-blur-2xl',
            minimized
              ? 'bottom-5 right-5 h-[64px] w-[300px] rounded-[1.35rem]'
              : 'inset-x-0 bottom-0 h-[min(720px,calc(100dvh-18px))] rounded-t-[1.5rem] sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(650px,calc(100dvh-40px))] sm:w-[390px] sm:rounded-[1.6rem]',
          ].join(' ')}
        >
          <div className="flex h-16 items-center gap-3 border-b border-[var(--fx-border)] bg-[var(--fx-surface-strong)] px-4">
            {active && !minimized ? (
              <>
                <button type="button" aria-label="Back to conversations" onClick={() => setActiveId('')} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><ArrowLeft size={18}/></button>
                {active.person.avatar_url ? <img src={active.person.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover"/> : <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--fx-primary-soft)] text-xs font-black text-[var(--fx-primary-strong)]">{initials(active.person)}</div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{active.person.full_name || active.person.username || 'FeniX user'}</p>
                  <p className="truncate text-[10px] text-[var(--fx-muted)]">@{active.person.username || 'user'}</p>
                </div>
              </>
            ) : (
              <>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--fx-navy)] text-white shadow-lg"><ChatCircleDots size={22} weight="duotone"/></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">FeniX Messages</p>
                  <p className="text-[10px] text-[var(--fx-muted)]">Private conversations</p>
                </div>
              </>
            )}
            <button type="button" aria-label="Minimize messages" onClick={() => setMinimized(v => !v)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><Minus size={17}/></button>
            <button type="button" aria-label="Close messages" onClick={() => { setOpen(false); setActiveId(''); setMinimized(false) }} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><X size={17}/></button>
          </div>

          {!minimized && !active && (
            <div className="relative flex h-[calc(100%-64px)] flex-col">
              <div className="relative z-10 border-b border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-3">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3">
                  <MagnifyingGlass size={17} className="text-[var(--fx-muted)]"/>
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search conversations" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"/>
                </div>
                <div className="mt-2 flex gap-2">
                  <input value={newUsername} onChange={e => setNewUsername(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') void resolveUsername() }} placeholder="@username for new chat" className="h-10 min-w-0 flex-1 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-xs outline-none"/>
                  <button type="button" onClick={() => void resolveUsername()} className="h-10 rounded-xl bg-[var(--fx-primary-strong)] px-3 text-xs font-black text-white">Chat</button>
                </div>
                {error && <p className="mt-2 text-[11px] font-semibold text-red-600 dark:text-red-300">{error}</p>}
              </div>

              <div className="fenix-chat-wallpaper relative flex-1 overflow-y-auto p-2.5">
                {filtered.length ? filtered.map(c => (
                  <button key={c.person.id} type="button" onClick={() => void openConversation(c.person)} className="relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-[var(--fx-surface-strong)]">
                    {c.person.avatar_url ? <img src={c.person.avatar_url} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover"/> : <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--fx-primary-soft)] text-sm font-black text-[var(--fx-primary-strong)]">{initials(c.person)}</div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold">{c.person.full_name || c.person.username || 'FeniX user'}</p><span className="shrink-0 text-[9px] text-[var(--fx-muted)]">{formatTime(c.latest.created_at)}</span></div>
                      <p className={['mt-1 truncate text-xs', c.unread ? 'font-bold text-[var(--fx-text)]' : 'text-[var(--fx-muted)]'].join(' ')}>{c.latest.sender_id === userId ? 'You: ' : ''}{c.latest.body}</p>
                    </div>
                    {c.unread > 0 && <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-[var(--fx-primary-strong)] px-1 text-[9px] font-black text-white">{c.unread > 9 ? '9+' : c.unread}</span>}
                  </button>
                )) : (
                  <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><ChatCircleDots size={34} weight="duotone"/></div>
                    <p className="mt-4 text-sm font-black">Your conversations</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">Search an existing chat or enter a @username above to start one.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!minimized && active && (
            <div className="flex h-[calc(100%-64px)] flex-col">
              <div className="fenix-chat-wallpaper flex-1 overflow-y-auto px-3 py-4">
                <div className="mx-auto mb-4 w-fit rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] px-3 py-1 text-[9px] font-bold text-[var(--fx-muted)] shadow-sm">Private • FeniX protected chat</div>
                {active.messages.map(message => {
                  const mine = message.sender_id === userId
                  return (
                    <div key={message.id} className={mine ? 'mb-2 flex justify-end' : 'mb-2 flex justify-start'}>
                      <div className={['max-w-[82%] rounded-[1.15rem] px-3.5 py-2.5 shadow-sm', mine ? 'rounded-br-md bg-[var(--fx-primary-strong)] text-white' : 'rounded-bl-md bg-[var(--fx-surface-strong)] text-[var(--fx-text)] border border-[var(--fx-border)]'].join(' ')}>
                        <p className="whitespace-pre-wrap break-words text-[13px] leading-5">{message.body}</p>
                        <div className={['mt-1 flex items-center justify-end gap-1 text-[9px]', mine ? 'text-white/70' : 'text-[var(--fx-muted)]'].join(' ')}>
                          <span>{formatTime(message.created_at)}</span>
                          {mine && (message.read_at ? <CheckCircle size={12}/> : <Check size={12}/>)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={endRef}/>
              </div>

              {error && <p className="border-t border-[var(--fx-border)] bg-[var(--fx-primary-soft)] px-4 py-2 text-[11px] font-semibold text-red-600 dark:text-red-300">{error}</p>}
              {showEmoji && (
                <div className="border-t border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-2">
                  <div className="grid grid-cols-6 gap-1">{EMOJIS.map(emoji => <button key={emoji} type="button" onClick={() => setBody(v => v + emoji)} className="grid h-9 place-items-center rounded-lg text-lg hover:bg-[var(--fx-primary-soft)]">{emoji}</button>)}</div>
                </div>
              )}
              <div className="flex items-end gap-2 border-t border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-3">
                <button type="button" aria-label="Emoji" onClick={() => setShowEmoji(v => !v)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><Smiley size={20}/></button>
                <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 5000))} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() } }} rows={1} placeholder="Write a message..." className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 py-2.5 text-sm leading-5 outline-none"/>
                <button type="button" aria-label="Send message" disabled={busy || !body.trim()} onClick={() => void send()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-strong)] text-white disabled:opacity-40"><PaperPlaneRight size={18} weight="fill"/></button>
              </div>
            </div>
          )}
        </section>
      )}
    </>
  )
}
