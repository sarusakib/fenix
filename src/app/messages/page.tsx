/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, Check, ChatCircleText, File, Flag, MagnifyingGlass,
  Paperclip, PencilSimple, Reply, Smiley, Trash, UserCircle, X
} from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type Message = {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  created_at: string
  read_at: string | null
  deleted_for_sender_at: string | null
  deleted_for_recipient_at: string | null
  reply_to_id: string | null
  attachment_path: string | null
  attachment_name: string | null
  attachment_type: string | null
  attachment_size: number | null
  edited_at: string | null
}

type Person = { id: string; full_name: string | null; username: string | null; avatar_url: string | null }
type Reaction = { message_id: string; user_id: string; reaction: string }

const REACTIONS = ['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const
const MAX_FILE = 10 * 1024 * 1024
const ALLOWED = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/mpeg', 'audio/ogg', 'audio/webm',
  'video/mp4', 'video/webm', 'application/pdf',
])

export default function MessagesPage() {
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'
  const [userId, setUserId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [people, setPeople] = useState<Record<string, Person>>({})
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [to, setTo] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [body, setBody] = useState('')
  const [search, setSearch] = useState('')
  const [activePersonId, setActivePersonId] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [editing, setEditing] = useState<Message | null>(null)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [recording, setRecording] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordTimerRef = useRef<number | null>(null)

  async function load() {
    const s = createClient()
    const [{ data: auth }, { data, error }] = await Promise.all([
      s.auth.getUser(),
      s.from('fenix_direct_messages')
        .select('id,sender_id,recipient_id,body,created_at,read_at,deleted_for_sender_at,deleted_for_recipient_at,reply_to_id,attachment_path,attachment_name,attachment_type,attachment_size,edited_at')
        .order('created_at', { ascending: false })
        .limit(200),
    ])
    if (!auth.user) {
      window.location.replace('/login?next=/messages')
      return
    }
    setUserId(auth.user.id)
    if (error) {
      setStatus(bn ? 'Message লোড করা যায়নি।' : 'Messages could not be loaded.')
      return
    }

    const rows = (data ?? []).filter((m) => {
      const hidden = m.sender_id === auth.user.id ? m.deleted_for_sender_at : m.deleted_for_recipient_at
      return !hidden
    }) as Message[]
    setMessages(rows)

    const ids = [...new Set(rows.flatMap((m) => [m.sender_id, m.recipient_id]).filter((id) => id !== auth.user.id))]
    if (ids.length) {
      const { data: profiles } = await s.from('fenix_public_profiles').select('id,full_name,username,avatar_url').in('id', ids)
      setPeople(Object.fromEntries(((profiles ?? []) as Person[]).map((p) => [p.id, p])))
    }

    if (rows.length) {
      const { data: rx } = await s.from('fenix_message_reactions').select('message_id,user_id,reaction').in('message_id', rows.map((m) => m.id))
      setReactions((rx ?? []) as Reaction[])
    }

    const unread = rows.filter((m) => m.recipient_id === auth.user.id && !m.read_at).map((m) => m.id)
    if (unread.length) {
      await s.from('fenix_direct_messages').update({ read_at: new Date().toISOString() }).in('id', unread)
    }

    const paramTo = new URLSearchParams(window.location.search).get('to') || ''
    const paramName = new URLSearchParams(window.location.search).get('name') || ''
    if (!to && paramTo) setTo(paramTo)
    if (!recipientName && paramName) setRecipientName(paramName)
  }

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => { void load() }, 8000)
    return () => {
      window.clearInterval(timer)
      if (recordTimerRef.current) window.clearTimeout(recordTimerRef.current)
      recorderRef.current?.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
    // load intentionally stays stable as a page-level network operation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bn])

  async function resolveRecipient() {
    if (to) return to
    const username = recipientName.trim().replace(/^@/, '').toLowerCase()
    if (!username) return ''
    const s = createClient()
    const { data } = await s.from('fenix_public_profiles').select('id,full_name,username,avatar_url').eq('username', username).maybeSingle()
    if (data?.id) {
      setTo(data.id)
      setPeople((p) => ({ ...p, [data.id]: data as Person }))
      return data.id
    }
    return ''
  }

  async function uploadAttachment(supabase: ReturnType<typeof createClient>, messageId: string) {
    if (!attachment) return null
    if (!ALLOWED.has(attachment.type) || attachment.size > MAX_FILE) throw new Error(bn ? 'File type/size allowed নয়। Maximum 10MB.' : 'Unsupported file or size. Maximum 10MB.')
    const ext = attachment.name.includes('.') ? attachment.name.split('.').pop()?.toLowerCase() : 'bin'
    const path = userId + '/' + messageId + '.' + (ext || 'bin')
    const { error } = await supabase.storage.from('chat-media').upload(path, attachment, {
      cacheControl: '31536000',
      upsert: false,
      contentType: attachment.type,
    })
    if (error) throw error
    return { path, name: attachment.name.slice(0, 180), type: attachment.type, size: attachment.size }
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop()
      return
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus(bn ? 'এই browser-এ voice recording support নেই। Audio file attach করুন।' : 'Voice recording is not supported here. Attach an audio file instead.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const preferredType = 'audio/webm'
      const options = typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(preferredType)
        ? { mimeType: preferredType }
        : undefined
      const recorder = new MediaRecorder(stream, options)
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
      recorder.onstop = () => {
        if (recordTimerRef.current) window.clearTimeout(recordTimerRef.current)
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        recorderRef.current = null
        setRecording(false)
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
        if (blob.size > MAX_FILE) {
          setStatus(bn ? 'Voice message 10MB-এর বেশি হয়েছে।' : 'Voice message exceeded 10MB.')
          return
        }
        setAttachment(new File([blob], 'voice-' + Date.now() + '.webm', { type: blob.type }))
      }

      recorderRef.current = recorder
      streamRef.current = stream
      setRecording(true)
      recorder.start()
      recordTimerRef.current = window.setTimeout(() => recorder.stop(), 60000)
    } catch {
      setStatus(bn ? 'Microphone permission পাওয়া যায়নি।' : 'Microphone permission was not granted.')
    }
  }

  async function send() {
    if ((!body.trim() && !attachment) || busy) return
    setBusy(true)
    setStatus('')
    const s = createClient()

    try {
      const recipient = await resolveRecipient()
      if (!recipient) throw new Error(bn ? 'Username দিয়ে recipient পাওয়া যায়নি।' : 'Recipient could not be found.')
      if (recipient === userId) throw new Error(bn ? 'নিজেকে message পাঠানো যাবে না।' : 'You cannot message yourself.')

      if (editing) {
        const { error } = await s.from('fenix_direct_messages')
          .update({ body: body.trim().slice(0, 5000), edited_at: new Date().toISOString() })
          .eq('id', editing.id)
          .eq('sender_id', userId)
        if (error) throw error
        setEditing(null)
        setBody('')
        await load()
        setStatus(bn ? 'Message edit হয়েছে।' : 'Message edited.')
        setBusy(false)
        return
      }

      const messageId = crypto.randomUUID()
      const uploaded = await uploadAttachment(s, messageId)

      const { error } = await s.from('fenix_direct_messages').insert({
        id: messageId,
        sender_id: userId,
        recipient_id: recipient,
        body: body.trim().slice(0, 5000) || (uploaded ? uploaded.name : ''),
        reply_to_id: replyTo?.id || null,
        attachment_path: uploaded?.path || null,
        attachment_name: uploaded?.name || null,
        attachment_type: uploaded?.type || null,
        attachment_size: uploaded?.size || null,
      })
      if (error) {
        if (uploaded) await s.storage.from('chat-media').remove([uploaded.path])
        throw error
      }

      setBody('')
      setAttachment(null)
      setReplyTo(null)
      await load()
      setStatus(bn ? 'Message পাঠানো হয়েছে।' : 'Message sent.')
    } catch (error: any) {
      setStatus(error?.message || (bn ? 'Message পাঠানো যায়নি।' : 'Message could not be sent.'))
    } finally {
      setBusy(false)
    }
  }

  async function reportMessage(messageId: string) {
    const reason = window.prompt(bn ? 'Message-এ কী সমস্যা হয়েছে?' : 'What is the problem with this message?')
    if (!reason?.trim()) return
    const s = createClient()
    const { error } = await s.from('fenix_content_reports').insert({
      reporter_id: userId,
      content_type: 'message',
      content_id: messageId,
      reason: reason.trim().slice(0, 120),
      details: reason.trim().slice(0, 2000),
    })
    setStatus(error ? (bn ? 'Report পাঠানো যায়নি।' : 'Could not report the message.') : (bn ? 'Report admin queue-তে গেছে।' : 'Report sent to the admin queue.'))
  }

  async function deleteForMe(m: Message) {
    const s = createClient()
    const field = m.sender_id === userId ? 'deleted_for_sender_at' : 'deleted_for_recipient_at'
    await s.from('fenix_direct_messages').update({ [field]: new Date().toISOString() }).eq('id', m.id)
    await load()
  }

  async function toggleReaction(messageId: string, reaction: string) {
    const s = createClient()
    const current = reactions.find((r) => r.message_id === messageId && r.user_id === userId)
    if (current?.reaction === reaction) {
      await s.from('fenix_message_reactions').delete().eq('message_id', messageId).eq('user_id', userId)
    } else if (current) {
      await s.from('fenix_message_reactions').update({ reaction }).eq('message_id', messageId).eq('user_id', userId)
    } else {
      await s.from('fenix_message_reactions').insert({ message_id: messageId, user_id: userId, reaction })
    }
    await load()
  }

  const counterpart = (m: Message) => m.sender_id === userId ? people[m.recipient_id] : people[m.sender_id]

  const conversations = useMemo(() => {
    const map = new Map<string, Message>()
    for (const m of messages) {
      const id = m.sender_id === userId ? m.recipient_id : m.sender_id
      if (!map.has(id)) map.set(id, m)
    }
    return [...map.entries()]
  }, [messages, userId])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return messages.filter((m) => {
      const personId = m.sender_id === userId ? m.recipient_id : m.sender_id
      if (activePersonId && personId !== activePersonId) return false
      if (!term) return true
      return m.body.toLowerCase().includes(term) || (people[personId]?.full_name || '').toLowerCase().includes(term) || (people[personId]?.username || '').toLowerCase().includes(term)
    })
  }, [messages, userId, activePersonId, search, people])

  const replyBody = replyTo ? replyTo.body.slice(0, 120) : ''
  const activePerson = activePersonId ? people[activePersonId] : null

  return (
    <main className="min-h-dvh bg-[var(--fx-bg)]">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 pb-28 pt-7 sm:px-6">
        <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Account</Link>
        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">FeniX Messenger</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{bn ? 'সহজে কথা বলুন। প্রয়োজন হলে Feni Brain-এ যান।' : 'Simple conversations, connected to FeniX.'}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">
            {bn ? 'Text, photo, voice/video file, document, reply, reaction ও per-user delete এখন একই inbox-এ।' : 'Text, media/files, replies, reactions and delete-for-me stay in one protected inbox.'}
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[18rem_1fr]">
          <aside className="rounded-[1.8rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
            <div className="flex items-center gap-2 text-sm font-black"><ChatCircleText size={19}/> {bn ? 'Chats' : 'Chats'}</div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3">
              <MagnifyingGlass size={16} className="text-[var(--fx-muted)]"/>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={bn ? 'Search message...' : 'Search messages...'} className="h-10 min-w-0 flex-1 bg-transparent text-xs outline-none"/>
            </div>
            <button type="button" onClick={() => setActivePersonId('')} className={'mt-3 w-full rounded-xl p-3 text-left text-xs font-bold '+(!activePersonId?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'hover:bg-black/[.03] dark:hover:bg-white/[.04]')}>
              {bn ? 'সব message' : 'All messages'} <span className="float-right opacity-40">{messages.length}</span>
            </button>
            <div className="mt-2 space-y-1">
              {conversations.map(([id, latest]) => {
                const p = people[id]
                return <button type="button" key={id} onClick={() => {
                  setActivePersonId(id)
                  setTo(id)
                  setRecipientName(p?.username ? '@' + p.username : p?.full_name || '')
                }} className={'flex w-full items-center gap-2 rounded-xl p-2 text-left '+(activePersonId===id?'bg-[var(--fx-primary-soft)]':'hover:bg-black/[.03] dark:hover:bg-white/[.04]')}>
                  {p?.avatar_url ? <img src={p.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover"/> : <UserCircle size={36} className="opacity-35"/>}
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{p?.full_name || p?.username || 'FeniX user'}</span><span className="block truncate text-[10px] text-[var(--fx-muted)]">{latest.body.slice(0, 36)}</span></span>
                </button>
              })}
            </div>
          </aside>

          <section className="min-w-0 rounded-[1.8rem] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
            <div className="border-b border-[var(--fx-border)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.15em] text-[var(--fx-muted)]">Conversation</p>
                  <h2 className="mt-1 text-lg font-black">{activePerson?.full_name || activePerson?.username || (bn ? 'সব message' : 'All messages')}</h2>
                </div>
                <Link href="/guide" className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-[10px] font-bold">Ask Feni Brain</Link>
              </div>
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto p-4">
              {visible.length ? visible.map((m) => {
                const mine = m.sender_id === userId
                const p = counterpart(m)
                const rx = reactions.filter((r) => r.message_id === m.id)
                const mineRx = rx.find((r) => r.user_id === userId)
                const replied = m.reply_to_id ? messages.find((x) => x.id === m.reply_to_id) : null
                return (
                  <article key={m.id} className={'rounded-2xl border border-[var(--fx-border)] p-4 '+(mine?'ml-6 bg-[var(--fx-primary-soft)]/45':'mr-6')}>
                    <div className="flex items-start gap-3">
                      {mine ? null : p?.avatar_url ? <img src={p.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover"/> : <UserCircle size={36} className="shrink-0 opacity-35"/>}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-black">{mine ? 'You' : (p?.full_name || p?.username || 'FeniX user')}</span>
                          <span className="text-[10px] text-[var(--fx-muted)]">{new Date(m.created_at).toLocaleString(bn?'bn-BD':'en-BD')}</span>
                        </div>
                        {replied && <div className="mt-2 rounded-xl border-l-2 border-[var(--fx-primary-strong)] bg-black/[.03] px-3 py-2 text-[10px] dark:bg-white/[.03]">{replied.body.slice(0, 160)}</div>}
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{m.body}</p>
                        {m.attachment_path && (
                          <div className="mt-3 rounded-xl border border-[var(--fx-border)] p-3">
                            {m.attachment_type?.startsWith('image/') ? (
                              <img src={'/api/messages/media?message='+encodeURIComponent(m.id)} alt="" className="max-h-64 max-w-full rounded-lg object-contain" />
                            ) : m.attachment_type?.startsWith('audio/') ? (
                              <audio controls preload="metadata" className="w-full" src={'/api/messages/media?message='+encodeURIComponent(m.id)} />
                            ) : m.attachment_type?.startsWith('video/') ? (
                              <video controls preload="metadata" className="max-h-64 w-full rounded-lg" src={'/api/messages/media?message='+encodeURIComponent(m.id)} />
                            ) : (
                              <a href={'/api/messages/media?message='+encodeURIComponent(m.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold">
                                <File size={17} /> <span className="max-w-[16rem] truncate">{m.attachment_name}</span>
                              </a>
                            )}
                            {m.attachment_type?.startsWith('image/') || m.attachment_type?.startsWith('audio/') || m.attachment_type?.startsWith('video/') ? (
                              <a href={'/api/messages/media?message='+encodeURIComponent(m.id)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-[10px] font-bold text-[var(--fx-muted)]">
                                <File size={13} /> {m.attachment_name}
                              </a>
                            ) : null}
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <button type="button" onClick={() => setReplyTo(m)} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-2.5 text-[10px] font-bold"><Reply size={13}/> Reply</button>
                          <details className="relative">
                            <summary className="flex min-h-8 cursor-pointer list-none items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-2.5 text-[10px] font-bold"><Smiley size={13}/> React</summary>
                            <div className="absolute bottom-10 left-0 z-20 flex gap-1 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-2 shadow-xl">
                              {REACTIONS.map((name) => <button key={name} type="button" title={name} onClick={() => void toggleReaction(m.id,name)} className={'grid h-8 w-8 place-items-center rounded-lg '+(mineRx?.reaction===name?'bg-[var(--fx-primary-soft)]':'hover:bg-black/[.03] dark:hover:bg-white/[.04]')}>{name==='like'?'👍':name==='love'?'❤️':name==='haha'?'😂':name==='wow'?'😮':name==='sad'?'😢':'😡'}</button>)}
                            </div>
                          </details>
                          {mine && <button type="button" onClick={() => {setEditing(m);setBody(m.body);setAttachment(null)}} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-2.5 text-[10px] font-bold"><PencilSimple size={13}/> Edit</button>}
                          <button type="button" onClick={() => void deleteForMe(m)} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-2.5 text-[10px] font-bold"><Trash size={13}/> Delete for me</button>
                          <button type="button" onClick={() => void reportMessage(m.id)} className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[var(--fx-border)] px-2.5 text-[10px] font-bold text-rose-700 dark:text-rose-300"><Flag size={13}/> Report</button>
                          {m.edited_at && <span className="text-[10px] text-[var(--fx-muted)]">edited</span>}
                        </div>
                        {rx.length > 0 && <div className="mt-2 text-[10px] text-[var(--fx-muted)]">{rx.map((r) => r.reaction).join(' · ')}</div>}
                        {mine && <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-[var(--fx-muted)]"><Check size={13}/> {m.read_at?'Read':'Sent'}</span>}
                      </div>
                    </div>
                  </article>
                )
              }) : <div className="p-12 text-center text-sm text-[var(--fx-muted)]">{bn ? 'কোনো matching message নেই।' : 'No matching messages.'}</div>}
            </div>

            <div className="border-t border-[var(--fx-border)] p-4">
              {replyTo && <div className="mb-3 flex items-center justify-between rounded-xl bg-[var(--fx-primary-soft)] p-3"><span className="min-w-0 text-xs"><b>Reply:</b> {replyBody}</span><button type="button" onClick={() => setReplyTo(null)}><X size={16}/></button></div>}
              {editing && <div className="mb-3 flex items-center justify-between rounded-xl bg-amber-500/[.08] p-3 text-xs"><span>Editing message</span><button type="button" onClick={() => {setEditing(null);setBody('')}}><X size={16}/></button></div>}
              {attachment && <div className="mb-3 flex items-center justify-between rounded-xl border border-[var(--fx-border)] p-3"><span className="truncate text-xs font-bold">{attachment.name}</span><button type="button" onClick={() => setAttachment(null)}><X size={16}/></button></div>}
              <div className="flex items-end gap-2">
                <button type="button" onClick={() => void toggleRecording()} disabled={Boolean(attachment)} className={'grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--fx-border)] '+(recording?'bg-rose-500 text-white':'') } title={recording ? 'Stop voice recording' : 'Record voice'}>
                  {recording ? <Stop size={18}/> : <Microphone size={18}/>}
                </button>
                <label className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-[var(--fx-border)]" title="Attach">
                  <Paperclip size={18}/>
                  <input type="file" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    if (file && (!ALLOWED.has(file.type) || file.size > MAX_FILE)) {
                      setStatus(bn ? 'JPG/PNG/WebP/GIF/audio/video/PDF এবং সর্বোচ্চ 10MB.' : 'Supported images/audio/video/PDF, up to 10MB.')
                      return
                    }
                    setAttachment(file)
                  }}/>
                </label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} rows={2} placeholder={bn?'Message লিখুন...':'Write a message...'} className="min-w-0 flex-1 rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-6 outline-none"/>
                <button type="button" disabled={busy || (!body.trim() && !attachment)} onClick={() => void send()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-strong)] text-white disabled:opacity-40"><PaperPlaneRight size={18}/></button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--fx-muted)]">
                <span>{bn ? 'Media max 10MB · private bucket' : 'Media max 10MB · private storage'}</span>
                <span>{body.length}/5000</span>
              </div>
            </div>
          </section>
        </div>

        {status && <p className="mt-3 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-sm">{status}</p>}
      </section>
    </main>
  )
}
