'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, Check, CheckCircle, DotsThreeVertical, File, FileImage,
  Heart, MagnifyingGlass, MapPin, Minus, Paperclip, PaperPlaneRight,
  PencilSimple, PushPin, Smiley, Stop, Trash, UserCircle, X, Microphone,
} from '@phosphor-icons/react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { optimizeImageFile } from '@/lib/media/image-upload'

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
  message_type: string
  metadata: Record<string, unknown>
}

type Person = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

type Reaction = {
  message_id: string
  user_id: string
  reaction: string
  created_at: string
}

type Conversation = {
  person: Person
  messages: Message[]
  latest: Message
  unread: number
}

const EMOJIS = ['😀','😂','❤️','👍','🔥','😊','🎉','🙏','💡','🤝','✨','🚀','👏','🥰','💯','😎']
const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_VOICE_MS = 2 * 60 * 1000

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

function formatBytes(value: number | null) {
  if (!value) return ''
  if (value < 1024) return String(value) + ' B'
  if (value < 1024 * 1024) return String(Math.round(value / 1024)) + ' KB'
  return (value / 1024 / 1024).toFixed(1) + ' MB'
}

function isVisible(message: Message, userId: string) {
  return message.sender_id === userId ? !message.deleted_for_sender_at : !message.deleted_for_recipient_at
}

function jsonLocation(metadata: Record<string, unknown>) {
  const lat = Number(metadata.lat)
  const lng = Number(metadata.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng, accuracy: Number(metadata.accuracy) || 0 }
}

function renderLinks(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return parts.map((part, index) =>
    /^https?:\/\//i.test(part) ? (
      <a key={String(index)} href={part} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">
        {part}
      </a>
    ) : <span key={String(index)}>{part}</span>
  )
}

export default function FenixMessenger() {
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const hidden = pathname === '/messages' || pathname.startsWith('/login') || pathname.startsWith('/auth')

  const [userId, setUserId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [people, setPeople] = useState<Record<string, Person>>({})
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [conversationQuery, setConversationQuery] = useState('')
  const [messageQuery, setMessageQuery] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAttach, setShowAttach] = useState(false)
  const [menuId, setMenuId] = useState('')
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingId, setEditingId] = useState('')
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({})
  const [blocked, setBlocked] = useState(false)
  const [recording, setRecording] = useState(false)
  const [notificationReady, setNotificationReady] = useState(false)
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())
  const [typingIds, setTypingIds] = useState<Set<string>>(new Set())
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())

  const userIdRef = useRef('')
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const voiceChunksRef = useRef<Blob[]>([])
  const typingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const fields = 'id,sender_id,recipient_id,body,created_at,read_at,deleted_for_sender_at,deleted_for_recipient_at,reply_to_id,attachment_path,attachment_name,attachment_type,attachment_size,edited_at,message_type,metadata'

  async function hydrateUrls(rows: Message[]) {
    const paths = Array.from(new Set(rows.map(row => row.attachment_path).filter(Boolean) as string[]))
    const missing = paths.filter(path => !attachmentUrls[path])
    if (!missing.length) return
    const { data } = await supabase.storage.from('chat-media').createSignedUrls(missing, 3600)
    const next: Record<string, string> = {}
    ;(data || []).forEach((item, index) => {
      if (item.signedUrl) next[missing[index]] = item.signedUrl
    })
    if (Object.keys(next).length) setAttachmentUrls(value => ({ ...value, ...next }))
  }

  async function load(authId: string) {
    const { data, error: loadError } = await supabase
      .from('fenix_direct_messages')
      .select(fields)
      .or('sender_id.eq.' + authId + ',recipient_id.eq.' + authId)
      .order('created_at', { ascending: false })
      .limit(250)

    if (loadError) {
      setError('Messages could not be loaded.')
      return
    }

    const rows = (data || []) as unknown as Message[]
    setMessages(rows)
    void hydrateUrls(rows)

    const ids = Array.from(new Set(rows.flatMap(row => [row.sender_id, row.recipient_id]).filter(id => id !== authId)))
    if (ids.length) {
      const { data: profiles } = await supabase
        .from('fenix_public_profiles')
        .select('id,full_name,username,avatar_url')
        .in('id', ids)
      if (profiles) {
        setPeople(Object.fromEntries((profiles as Person[]).map(person => [person.id, person])))
      }
    }
  }

  useEffect(() => {
    if (hidden) return
    let disposed = false

    async function boot() {
      const { data: auth } = await supabase.auth.getUser()
      if (disposed || !auth.user) return
      const authId = auth.user.id
      userIdRef.current = authId
      setUserId(authId)
      await load(authId)
      if (disposed) return

      const channel = supabase
        .channel('fenix-messenger-' + authId, { config: { presence: { key: authId } } })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'fenix_direct_messages' }, payload => {
          const next = payload.new as Message
          if (next.sender_id !== userIdRef.current && next.recipient_id !== userIdRef.current) return
          setMessages(value => value.some(row => row.id === next.id) ? value : [next, ...value])
          void hydrateUrls([next])
          if (next.sender_id !== userIdRef.current) {
            void supabase.from('fenix_public_profiles')
              .select('id,full_name,username,avatar_url')
              .eq('id', next.sender_id)
              .maybeSingle()
              .then(({ data }) => {
                if (data) setPeople(value => ({ ...value, [next.sender_id]: data as Person }))
              })
            if (!open && notificationReady && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification('FeniX message', { body: next.message_type === 'text' ? next.body : 'You received new media.' })
            }
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'fenix_direct_messages' }, payload => {
          const next = payload.new as Message
          if (next.sender_id !== userIdRef.current && next.recipient_id !== userIdRef.current) return
          setMessages(value => value.map(row => row.id === next.id ? next : row))
          void hydrateUrls([next])
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'fenix_message_reactions' }, payload => {
          const next = (payload.new || payload.old) as Reaction
          if (!next?.message_id) return
          setReactions(value => {
            if (payload.eventType === 'INSERT') return value.some(item => item.message_id === next.message_id && item.user_id === next.user_id) ? value : [...value, next]
            if (payload.eventType === 'UPDATE') return value.map(item => item.message_id === next.message_id && item.user_id === next.user_id ? next : item)
            return value.filter(item => !(item.message_id === next.message_id && item.user_id === next.user_id))
          })
        })
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState()
          setOnlineIds(new Set(Object.keys(state)))
        })
        .on('broadcast', { event: 'typing' }, message => {
          const sender = String(message.payload?.userId || '')
          if (!sender || sender === authId) return
          setTypingIds(value => {
            const copy = new Set(value)
            if (message.payload?.typing) copy.add(sender)
            else copy.delete(sender)
            return copy
          })
          if (typingTimersRef.current[sender]) clearTimeout(typingTimersRef.current[sender])
          if (message.payload?.typing) {
            typingTimersRef.current[sender] = setTimeout(() => {
              setTypingIds(value => {
                const copy = new Set(value)
                copy.delete(sender)
                return copy
              })
            }, 2500)
          }
        })
        .subscribe(async status => {
          if (status === 'SUBSCRIBED') await channel.track({ online_at: new Date().toISOString() })
        })

      channelRef.current = channel
    }

    void boot()
    return () => {
      disposed = true
      const channel = channelRef.current
      if (channel) {
        void channel.untrack()
        void supabase.removeChannel(channel)
        channelRef.current = null
      }
      Object.values(typingTimersRef.current).forEach(clearTimeout)
      typingTimersRef.current = {}
    }
  }, [hidden, supabase])

  useEffect(() => {
    const handleOpen = (event: Event) => {
      const id = (event as CustomEvent<{ userId?: string }>).detail?.userId
      if (id) setRequestedUser(id)
    }
    if (!hidden) window.addEventListener('fenix:open-message', handleOpen)
    return () => window.removeEventListener('fenix:open-message', handleOpen)

    function setRequestedUser(id: string) {
      if (id === userIdRef.current) {
        setError('You cannot message yourself.')
        return
      }
      void supabase.from('fenix_public_profiles').select('id,full_name,username,avatar_url').eq('id', id).maybeSingle().then(({ data }) => {
        if (data) void openConversation(data as Person)
        else setError('This profile is not available.')
      })
    }
  }, [hidden, supabase])

  const visibleMessages = useMemo(() => messages.filter(message => isVisible(message, userId)), [messages, userId])

  const conversations = useMemo<Conversation[]>(() => {
    const grouped = new Map<string, Message[]>()
    visibleMessages.forEach(message => {
      const other = message.sender_id === userId ? message.recipient_id : message.sender_id
      const list = grouped.get(other) || []
      list.push(message)
      grouped.set(other, list)
    })

    return Array.from(grouped.entries())
      .map(([id, items]) => {
        const ordered = [...items].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
        return {
          person: people[id] || { id, full_name: null, username: null, avatar_url: null },
          messages: ordered,
          latest: ordered[ordered.length - 1],
          unread: ordered.filter(message => message.recipient_id === userId && !message.read_at).length,
        }
      })
      .sort((a, b) => +new Date(b.latest.created_at) - +new Date(a.latest.created_at))
  }, [visibleMessages, people, userId])

  const filteredConversations = conversations.filter(conversation => {
    const query = conversationQuery.trim().toLowerCase()
    if (!query) return true
    const value = (conversation.person.full_name || '') + ' ' + (conversation.person.username || '')
    return value.toLowerCase().includes(query)
  })

  const activeConversation = conversations.find(conversation => conversation.person.id === activeId)
  const activePerson = activeConversation?.person || (activeId ? people[activeId] : undefined)

  const activeMessages = useMemo(() => {
    const raw = activeConversation?.messages || visibleMessages.filter(message => message.sender_id === activeId || message.recipient_id === activeId)
    const ordered = [...raw].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    const query = messageQuery.trim().toLowerCase()
    if (!query) return ordered
    return ordered.filter(message => ((message.body || '') + ' ' + (message.attachment_name || '')).toLowerCase().includes(query))
  }, [activeConversation, visibleMessages, activeId, messageQuery])

  const unreadTotal = conversations.reduce((sum, conversation) => sum + conversation.unread, 0)
  const activeOnline = Boolean(activeId && onlineIds.has(activeId))
  const activeTyping = Boolean(activeId && typingIds.has(activeId))
  const activePinned = activeMessages.filter(message => pinnedIds.has(message.id))
  const reactionGroups = useMemo(() => {
    const output: Record<string, Reaction[]> = {}
    reactions.forEach(item => {
      if (!output[item.message_id]) output[item.message_id] = []
      output[item.message_id].push(item)
    })
    return output
  }, [reactions])

  useEffect(() => {
    if (!activeId) return
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }, [activeId, activeMessages.length])

  async function openConversation(person: Person) {
    setActiveId(person.id)
    setOpen(true)
    setMinimized(false)
    setError('')
    setShowEmoji(false)
    setShowAttach(false)
    setMenuId('')
    setReplyingTo(null)
    setEditingId('')
    setMessageQuery('')
    setBody('')

    const ids = messages.filter(message => message.sender_id === person.id || message.recipient_id === person.id).map(message => message.id)
    if (ids.length) {
      const [{ data: pinRows }, { data: reactionRows }, { data: blockRow }] = await Promise.all([
        supabase.from('fenix_message_pins').select('message_id,user_id').eq('user_id', userId).in('message_id', ids),
        supabase.from('fenix_message_reactions').select('message_id,user_id,reaction,created_at').in('message_id', ids),
        supabase.from('fenix_dm_blocks').select('blocked_id').eq('blocker_id', userId).eq('blocked_id', person.id).maybeSingle(),
      ])
      setPinnedIds(new Set((pinRows || []).map(row => row.message_id)))
      setReactions((reactionRows || []) as Reaction[])
      setBlocked(Boolean(blockRow))
    } else {
      setPinnedIds(new Set())
      setReactions([])
      const { data: blockRow } = await supabase.from('fenix_dm_blocks').select('blocked_id').eq('blocker_id', userId).eq('blocked_id', person.id).maybeSingle()
      setBlocked(Boolean(blockRow))
    }

    const unread = messages.filter(message => message.sender_id === person.id && message.recipient_id === userId && !message.read_at).map(message => message.id)
    if (unread.length) {
      const now = new Date().toISOString()
      setMessages(value => value.map(message => unread.includes(message.id) ? { ...message, read_at: now } : message))
      await supabase.from('fenix_direct_messages').update({ read_at: now }).in('id', unread)
    }
  }

  async function sendText() {
    if (!activeId || busy || blocked) return
    const text = body.trim().slice(0, 5000)
    if (!text) return
    setBusy(true)
    setError('')

    if (editingId) {
      const { data, error: updateError } = await supabase
        .from('fenix_direct_messages')
        .update({ body: text, edited_at: new Date().toISOString() })
        .eq('id', editingId)
        .select(fields)
        .single()
      if (updateError) setError('Message could not be edited.')
      else if (data) {
        const next = data as unknown as Message
        setMessages(value => value.map(row => row.id === editingId ? next : row))
        setEditingId('')
        setBody('')
      }
      setBusy(false)
      return
    }

    const { data, error: sendError } = await supabase
      .from('fenix_direct_messages')
      .insert({
        sender_id: userId,
        recipient_id: activeId,
        body: text,
        reply_to_id: replyingTo?.id || null,
        message_type: 'text',
        metadata: {},
      })
      .select(fields)
      .single()

    if (sendError) {
      setError(sendError.code === '42501' ? 'This user is not accepting messages.' : 'Message could not be sent.')
    } else if (data) {
      setMessages(value => value.some(row => row.id === data.id) ? value : [data as unknown as Message, ...value])
      setBody('')
      setReplyingTo(null)
      void channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { userId, typing: false } })
    }
    setBusy(false)
  }

  async function sendAttachment(file: File) {
    if (!activeId || busy || blocked) return
    setBusy(true)
    setError('')
    let uploadFile = file
    let messageType = 'file'

    try {
      if (file.type.startsWith('image/')) {
        uploadFile = (await optimizeImageFile(file, { maxDimension: 1600, targetBytes: 190 * 1024 })).file
        messageType = 'image'
      } else if (file.type === 'video/mp4' || file.type === 'video/webm') {
        if (file.size > MAX_FILE_BYTES) throw new Error('Video must be 10MB or smaller.')
        messageType = 'video'
      } else if (file.type === 'application/pdf') {
        if (file.size > MAX_FILE_BYTES) throw new Error('PDF must be 10MB or smaller.')
        messageType = 'file'
      } else {
        throw new Error('Supported chat files are photos, MP4/WebM video, and PDF.')
      }

      const extension = uploadFile.name.split('.').pop()?.toLowerCase() || 'bin'
      const path = userId + '/' + crypto.randomUUID() + '.' + extension
      const { error: uploadError } = await supabase.storage.from('chat-media').upload(path, uploadFile, {
        cacheControl: '3600',
        contentType: uploadFile.type,
        upsert: false,
      })
      if (uploadError) throw uploadError

      const { data, error: messageError } = await supabase.from('fenix_direct_messages').insert({
        sender_id: userId,
        recipient_id: activeId,
        body: uploadFile.name.slice(0, 180),
        reply_to_id: replyingTo?.id || null,
        attachment_path: path,
        attachment_name: uploadFile.name.slice(0, 180),
        attachment_type: uploadFile.type,
        attachment_size: uploadFile.size,
        message_type: messageType,
        metadata: {},
      }).select(fields).single()

      if (messageError) {
        await supabase.storage.from('chat-media').remove([path])
        throw messageError
      }

      const next = data as unknown as Message
      setMessages(value => value.some(row => row.id === next.id) ? value : [next, ...value])
      await hydrateUrls([next])
      setReplyingTo(null)
      setShowAttach(false)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Attachment could not be sent.')
    } finally {
      setBusy(false)
    }
  }

  function chooseAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) void sendAttachment(file)
  }

  async function startVoice() {
    if (!activeId || busy || blocked || recording) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Voice recording is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      voiceChunksRef.current = []
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg']
      const mime = candidates.find(type => MediaRecorder.isTypeSupported(type)) || ''
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = event => { if (event.data.size) voiceChunksRef.current.push(event.data) }
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm'
        const ext = type.includes('ogg') ? 'ogg' : 'webm'
        const voice = new File(voiceChunksRef.current, 'voice-' + Date.now() + '.' + ext, { type })
        voiceChunksRef.current = []
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
        setRecording(false)
        void sendAttachment(voice)
      }
      recorder.start(250)
      setRecording(true)
      window.setTimeout(() => {
        if (recorderRef.current === recorder && recorder.state === 'recording') recorder.stop()
      }, MAX_VOICE_MS)
    } catch {
      setError('Microphone permission was denied or unavailable.')
    }
  }

  function stopVoice() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  async function shareLocation() {
    if (!activeId || busy || blocked) return
    if (!navigator.geolocation) {
      setError('Location is not available in this browser.')
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(async position => {
      const { data, error: insertError } = await supabase.from('fenix_direct_messages').insert({
        sender_id: userId,
        recipient_id: activeId,
        body: 'Shared location',
        reply_to_id: replyingTo?.id || null,
        message_type: 'location',
        metadata: {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy || 0),
        },
      }).select(fields).single()
      if (insertError) setError('Location could not be shared.')
      else if (data) {
        setMessages(value => [data as unknown as Message, ...value])
        setReplyingTo(null)
        setShowAttach(false)
      }
      setBusy(false)
    }, () => {
      setBusy(false)
      setError('Location permission was denied.')
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 })
  }

  async function shareGifUrl() {
    const raw = window.prompt('Paste a GIF URL')
    if (!raw || !activeId || busy || blocked) return
    try {
      const url = new URL(raw)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('bad')
      const { data, error: insertError } = await supabase.from('fenix_direct_messages').insert({
        sender_id: userId,
        recipient_id: activeId,
        body: url.toString(),
        reply_to_id: replyingTo?.id || null,
        message_type: 'gif',
        metadata: { url: url.toString() },
      }).select(fields).single()
      if (insertError) throw insertError
      if (data) {
        setMessages(value => [data as unknown as Message, ...value])
        setReplyingTo(null)
        setShowAttach(false)
      }
    } catch {
      setError('Please paste a valid http/https GIF URL.')
    }
  }

  function notify() {
    if (typeof Notification === 'undefined') {
      setError('Browser notifications are not supported.')
      return
    }
    void Notification.requestPermission().then(permission => {
      setNotificationReady(permission === 'granted')
      if (permission !== 'granted') setError('Notification permission was not granted.')
    })
  }

  function typing(typingNow: boolean) {
    if (!activeId || !userId) return
    void channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, typing: typingNow },
    })
  }

  async function toggleReaction(messageId: string, reaction: string) {
    const own = reactions.find(item => item.message_id === messageId && item.user_id === userId)
    if (own?.reaction === reaction) {
      await supabase.from('fenix_message_reactions').delete().eq('message_id', messageId).eq('user_id', userId)
    } else {
      await supabase.from('fenix_message_reactions').upsert(
        { message_id: messageId, user_id: userId, reaction },
        { onConflict: 'message_id,user_id' },
      )
    }
    setReactions(value => {
      const without = value.filter(item => !(item.message_id === messageId && item.user_id === userId))
      return own?.reaction === reaction ? without : [...without, { message_id: messageId, user_id: userId, reaction, created_at: new Date().toISOString() }]
    })
  }

  async function togglePin(messageId: string) {
    if (pinnedIds.has(messageId)) {
      await supabase.from('fenix_message_pins').delete().eq('message_id', messageId).eq('user_id', userId)
      setPinnedIds(value => {
        const copy = new Set(value)
        copy.delete(messageId)
        return copy
      })
    } else {
      const { error: pinError } = await supabase.from('fenix_message_pins').insert({ message_id: messageId, user_id: userId })
      if (pinError) setError('Message could not be pinned.')
      else setPinnedIds(value => new Set(value).add(messageId))
    }
    setMenuId('')
  }

  async function deleteForMe(message: Message) {
    const field = message.sender_id === userId ? 'deleted_for_sender_at' : 'deleted_for_recipient_at'
    const now = new Date().toISOString()
    const { error: deleteError } = await supabase.from('fenix_direct_messages').update({ [field]: now }).eq('id', message.id)
    if (deleteError) setError('Message could not be removed.')
    else setMessages(value => value.map(row => row.id === message.id ? { ...row, [field]: now } as Message : row))
    setMenuId('')
  }

  async function unsend(message: Message) {
    if (message.sender_id !== userId) return
    const now = new Date().toISOString()
    const { error: unsendError } = await supabase.from('fenix_direct_messages').update({
      deleted_for_sender_at: now,
      deleted_for_recipient_at: now,
    }).eq('id', message.id)
    if (unsendError) setError('Message could not be unsent.')
    else setMessages(value => value.map(row => row.id === message.id ? { ...row, deleted_for_sender_at: now, deleted_for_recipient_at: now } : row))
    setMenuId('')
  }

  function edit(message: Message) {
    if (message.sender_id !== userId || message.message_type !== 'text') return
    if (Date.now() - new Date(message.created_at).getTime() > 15 * 60 * 1000) {
      setError('Messages can be edited for 15 minutes after sending.')
      return
    }
    setEditingId(message.id)
    setReplyingTo(null)
    setBody(message.body)
    setMenuId('')
  }

  async function blockPerson() {
    if (!activeId) return
    const { error: blockError } = await supabase.from('fenix_dm_blocks').upsert(
      { blocker_id: userId, blocked_id: activeId },
      { onConflict: 'blocker_id,blocked_id' },
    )
    if (blockError) setError('Could not block this person.')
    else {
      setBlocked(true)
      setMenuId('')
    }
  }

  async function unblockPerson() {
    if (!activeId) return
    const { error: unblockError } = await supabase.from('fenix_dm_blocks').delete().eq('blocker_id', userId).eq('blocked_id', activeId)
    if (unblockError) setError('Could not unblock this person.')
    else setBlocked(false)
    setMenuId('')
  }

  async function clearConversation() {
    if (!activeId) return
    const now = new Date().toISOString()
    const [a, b] = await Promise.all([
      supabase.from('fenix_direct_messages').update({ deleted_for_sender_at: now }).eq('sender_id', userId).eq('recipient_id', activeId),
      supabase.from('fenix_direct_messages').update({ deleted_for_recipient_at: now }).eq('sender_id', activeId).eq('recipient_id', userId),
    ])
    if (a.error || b.error) setError('The conversation could not be cleared.')
    else {
      setMessages(value => value.map(row => {
        if (row.sender_id === userId && row.recipient_id === activeId) return { ...row, deleted_for_sender_at: now }
        if (row.sender_id === activeId && row.recipient_id === userId) return { ...row, deleted_for_recipient_at: now }
        return row
      }))
      setMenuId('')
    }
  }

  async function reportMessage(message: Message) {
    const note = window.prompt('Why are you reporting this message?')?.trim()
    if (!note) return
    const { error: reportError } = await supabase.from('fenix_content_reports').insert({
      reporter_id: userId,
      content_type: 'message',
      content_id: message.id,
      reason: 'message_report',
      details: note.slice(0, 2000),
    })
    setError(reportError ? 'Report could not be submitted.' : 'Report submitted for FeniX review.')
    setMenuId('')
  }

  if (hidden) return null

  return (
    <>
      {!open && (
        <button
          type="button"
          aria-label="Open FeniX messages"
          onClick={() => { setOpen(true); setMinimized(false) }}
          className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-4 z-[80] grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-[var(--fx-navy)] text-white shadow-[0_18px_55px_rgba(0,128,128,.30)] transition-transform hover:scale-105 sm:bottom-5 sm:right-5"
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/20 bg-white/10"><PaperPlaneRight size={20} weight="fill"/></span>
          {unreadTotal > 0 && <span className="absolute -right-0.5 -top-0.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#e5484d] px-1 text-[10px] font-black">{unreadTotal > 99 ? '99+' : unreadTotal}</span>}
        </button>
      )}

      {open && (
        <section
          aria-label="FeniX Messenger"
          className={[
            'fixed z-[80] overflow-hidden border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] shadow-[0_30px_100px_rgba(4,12,25,.28)] backdrop-blur-2xl',
            minimized ? 'bottom-5 right-5 h-16 w-[320px] rounded-[1.35rem]' : 'inset-x-0 bottom-0 h-[min(760px,calc(100dvh-18px))] rounded-t-[1.5rem] sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(720px,calc(100dvh-40px))] sm:w-[420px] sm:rounded-[1.6rem]',
          ].join(' ')}
        >
          <div className="flex h-16 items-center gap-2 border-b border-[var(--fx-border)] bg-[var(--fx-surface-strong)] px-3">
            {activePerson ? (
              <>
                <button type="button" aria-label="Back" onClick={() => { setActiveId(''); setMessageQuery('') }} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><ArrowLeft size={18}/></button>
                {activePerson.avatar_url ? <img src={activePerson.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover"/> : <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--fx-primary-soft)] text-xs font-black text-[var(--fx-primary-strong)]">{initials(activePerson)}</div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black">{activePerson.full_name || activePerson.username || 'FeniX user'}</p>
                  <p className="truncate text-[10px] text-[var(--fx-muted)]">{activeTyping ? 'typing…' : blocked ? 'Blocked by you' : activeOnline ? 'Active now' : 'Private • protected'}</p>
                </div>
              </>
            ) : (
              <>
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--fx-navy)] text-white shadow-lg"><PaperPlaneRight size={19} weight="fill"/></div>
                <div className="min-w-0 flex-1"><p className="text-sm font-black">FeniX Messages</p><p className="text-[10px] text-[var(--fx-muted)]">Private communication space</p></div>
              </>
            )}

            {activePerson && <button type="button" aria-label="Chat actions" onClick={() => setMenuId(menuId === '__chat__' ? '' : '__chat__')} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><DotsThreeVertical size={18}/></button>}
            {!activePerson && <button type="button" aria-label="Enable notifications" onClick={notify} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><CheckCircle size={17}/></button>}
            <button type="button" aria-label="Minimize" onClick={() => setMinimized(value => !value)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><Minus size={17}/></button>
            <button type="button" aria-label="Close" onClick={() => { setOpen(false); setActiveId(''); setMinimized(false); setMenuId('') }} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><X size={17}/></button>
          </div>

          {activePerson && menuId === '__chat__' && !minimized && (
            <div className="absolute right-3 top-[4.35rem] z-40 w-56 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-2 shadow-2xl">
              {blocked ? <button type="button" onClick={() => void unblockPerson()} className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]">Unblock person</button>
                : <button type="button" onClick={() => void blockPerson()} className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]">Block new messages</button>}
              <button type="button" onClick={() => void clearConversation()} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]"><Trash size={15}/> Clear conversation</button>
              <button type="button" onClick={() => { setMenuId(''); setMessageQuery('') }} className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]">Close chat menu</button>
            </div>
          )}

          {!minimized && !activePerson && (
            <div className="flex h-[calc(100%-64px)] flex-col">
              <div className="border-b border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-3">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3">
                  <MagnifyingGlass size={17} className="text-[var(--fx-muted)]"/>
                  <input value={conversationQuery} onChange={event => setConversationQuery(event.target.value)} placeholder="Search conversations" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"/>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 py-2 text-[11px] text-[var(--fx-muted)]"><UserCircle size={15}/><span>Open a profile and tap <b className="text-[var(--fx-text)]">Message</b> to start a chat.</span></div>
                {error && <p className="mt-2 text-[11px] font-semibold text-red-600 dark:text-red-300">{error}</p>}
              </div>

              <div className="fenix-chat-wallpaper flex-1 overflow-y-auto p-2.5">
                {filteredConversations.length ? filteredConversations.map(conversation => (
                  <button key={conversation.person.id} type="button" onClick={() => void openConversation(conversation.person)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-[var(--fx-surface-strong)]">
                    {conversation.person.avatar_url ? <img src={conversation.person.avatar_url} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover"/> : <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--fx-primary-soft)] text-sm font-black text-[var(--fx-primary-strong)]">{initials(conversation.person)}</div>}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold">{conversation.person.full_name || conversation.person.username || 'FeniX user'}</p><span className="shrink-0 text-[9px] text-[var(--fx-muted)]">{formatTime(conversation.latest.created_at)}</span></div>
                      <p className={conversation.unread ? 'mt-1 truncate text-xs font-bold' : 'mt-1 truncate text-xs text-[var(--fx-muted)]'}>{conversation.latest.message_type === 'text' ? conversation.latest.body : conversation.latest.message_type === 'image' ? 'Photo' : conversation.latest.message_type === 'audio' ? 'Voice message' : conversation.latest.message_type === 'video' ? 'Video' : conversation.latest.message_type === 'location' ? 'Shared location' : 'Attachment'}</p>
                    </div>
                    {conversation.unread > 0 && <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-[var(--fx-primary-strong)] px-1 text-[9px] font-black text-white">{conversation.unread > 9 ? '9+' : conversation.unread}</span>}
                  </button>
                )) : (
                  <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><PaperPlaneRight size={30} weight="fill"/></div>
                    <p className="mt-4 text-sm font-black">Your conversations</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">Profile-first messaging. No username lookup is needed.</p>
                    <button type="button" onClick={notify} className="mt-4 rounded-xl border border-[var(--fx-border)] px-3 py-2 text-xs font-bold">Enable notifications</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!minimized && activePerson && (
            <div className="flex h-[calc(100%-64px)] flex-col">
              <div className="border-b border-[var(--fx-border)] bg-[var(--fx-surface-strong)] px-3 py-2">
                <div className="flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3">
                  <MagnifyingGlass size={15} className="text-[var(--fx-muted)]"/>
                  <input value={messageQuery} onChange={event => setMessageQuery(event.target.value)} placeholder="Search in this chat" className="h-9 min-w-0 flex-1 bg-transparent text-xs outline-none"/>
                </div>
              </div>

              <div className="fenix-chat-wallpaper flex-1 overflow-y-auto px-3 py-4">
                <div className="mx-auto mb-3 w-fit rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] px-3 py-1 text-[9px] font-bold text-[var(--fx-muted)] shadow-sm">Private • FeniX protected chat</div>
                {activePinned.length > 0 && <div className="mx-auto mb-3 w-fit rounded-full bg-[var(--fx-primary-soft)] px-3 py-1 text-[9px] font-bold text-[var(--fx-primary-strong)]"><PushPin size={10} className="mr-1 inline"/>{String(activePinned.length)} pinned</div>}

                {activeMessages.map(message => {
                  const mine = message.sender_id === userId
                  const mediaUrl = message.attachment_path ? attachmentUrls[message.attachment_path] : ''
                  const loc = message.message_type === 'location' ? jsonLocation(message.metadata) : null
                  const reply = message.reply_to_id ? messages.find(row => row.id === message.reply_to_id) : null
                  const items = reactionGroups[message.id] || []

                  return (
                    <div id={'fenix-message-' + message.id} key={message.id} className={mine ? 'group relative mb-2 flex justify-end' : 'group relative mb-2 flex justify-start'}>
                      <div className={[
                        'relative max-w-[86%] rounded-[1.15rem] px-3.5 py-2.5 shadow-sm',
                        mine ? 'rounded-br-md bg-[var(--fx-primary-strong)] text-white' : 'rounded-bl-md border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] text-[var(--fx-text)]',
                        pinnedIds.has(message.id) ? 'ring-2 ring-[#c49a35]/45' : '',
                      ].join(' ')}>
                        {reply && <button type="button" onClick={() => document.getElementById('fenix-message-' + reply.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="mb-2 w-full rounded-lg border-l-2 border-[var(--fx-primary)] bg-black/[.04] px-2 py-1 text-left text-[10px] leading-4"><b>Reply</b> · {reply.body.slice(0, 60)}</button>}

                        {message.message_type === 'image' && mediaUrl && <a href={mediaUrl} target="_blank" rel="noreferrer noopener" className="mb-2 block overflow-hidden rounded-xl"><img src={mediaUrl} alt={message.attachment_name || 'Shared photo'} className="max-h-64 w-full rounded-xl object-contain"/></a>}
                        {message.message_type === 'video' && mediaUrl && <video src={mediaUrl} controls className="mb-2 max-h-64 w-full rounded-xl"/>}
                        {message.message_type === 'audio' && mediaUrl && <audio src={mediaUrl} controls className="mb-2 w-full max-w-[255px]"/>}
                        {message.message_type === 'file' && mediaUrl && <a href={mediaUrl} target="_blank" rel="noreferrer noopener" className="mb-2 flex items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 py-2 text-xs font-bold"><File size={17}/><span className="min-w-0 flex-1 truncate">{message.attachment_name || 'Document'}</span><span className="text-[9px] opacity-60">{formatBytes(message.attachment_size)}</span></a>}
                        {message.message_type === 'gif' && <a href={String(message.metadata.url || message.body)} target="_blank" rel="noreferrer noopener"><img src={String(message.metadata.url || message.body)} alt="Shared GIF" referrerPolicy="no-referrer" className="mb-2 max-h-64 rounded-xl object-contain"/></a>}
                        {loc && <a href={'https://www.google.com/maps?q=' + String(loc.lat) + ',' + String(loc.lng)} target="_blank" rel="noreferrer noopener" className="mb-2 flex items-center gap-3 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 py-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><MapPin size={18}/></span><span><b className="block text-xs">Shared location</b><span className="text-[9px] opacity-65">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</span></span></a>}
                        {message.message_type === 'text' && <p className="whitespace-pre-wrap break-words text-[13px] leading-5">{renderLinks(message.body)}</p>}
                        {message.message_type !== 'text' && message.message_type !== 'location' && message.message_type !== 'gif' && message.message_type !== 'file' && message.body && <p className="whitespace-pre-wrap break-words text-[12px] leading-5">{message.body}</p>}

                        <div className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-65">
                          {message.edited_at && <span>edited</span>}
                          {pinnedIds.has(message.id) && <PushPin size={10}/>}
                          <span>{formatTime(message.created_at)}</span>
                          {mine && (message.read_at ? <CheckCircle size={12}/> : <Check size={12}/>)} 
                        </div>

                        {items.length > 0 && <div className="mt-1 flex flex-wrap gap-1"><button type="button" onClick={() => void toggleReaction(message.id, items[0].reaction)} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">{items[0].reaction}{items.length > 1 ? ' ' + String(items.length) : ''}</button></div>}

                        <button type="button" aria-label="Message actions" onClick={() => setMenuId(menuId === message.id ? '' : message.id)} className={mine ? 'absolute -left-9 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100' : 'absolute -right-9 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100'}><DotsThreeVertical size={15}/></button>

                        {menuId === message.id && (
                          <div className={mine ? 'absolute right-0 top-8 z-30 w-48 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-2 shadow-2xl' : 'absolute left-0 top-8 z-30 w-48 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-2 shadow-2xl'}>
                            <button type="button" onClick={() => { setReplyingTo(message); setMenuId('') }} className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]">Reply</button>
                            <div className="grid grid-cols-6 gap-1 px-1 py-1">{EMOJIS.slice(0, 6).map(emoji => <button key={emoji} type="button" onClick={() => void toggleReaction(message.id, emoji)} className="grid h-7 place-items-center rounded-lg text-sm hover:bg-[var(--fx-primary-soft)]">{emoji}</button>)}</div>
                            <button type="button" onClick={() => void togglePin(message.id)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]"><PushPin size={14}/>{pinnedIds.has(message.id) ? 'Unpin' : 'Pin'}</button>
                            {mine && message.message_type === 'text' && <button type="button" onClick={() => edit(message)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]"><PencilSimple size={14}/>Edit</button>}
                            <button type="button" onClick={() => void deleteForMe(message)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]"><Trash size={14}/>Delete for me</button>
                            {mine && <button type="button" onClick={() => void unsend(message)} className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold hover:bg-red-500/10">Unsend for everyone</button>}
                            <button type="button" onClick={() => void reportMessage(message)} className="w-full rounded-xl px-3 py-2 text-left text-xs font-bold hover:bg-red-500/10">Report</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {!activeMessages.length && <div className="flex h-full min-h-48 items-center justify-center px-8 text-center"><p className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] px-4 py-3 text-xs leading-5 text-[var(--fx-muted)]">You’re connected. Send the first message.</p></div>}
                <div ref={endRef}/>
              </div>

              {error && <p className="border-t border-[var(--fx-border)] bg-red-500/[.04] px-4 py-2 text-[11px] font-semibold text-red-600 dark:text-red-300">{error}</p>}

              {(replyingTo || editingId) && <div className="flex items-center gap-2 border-t border-[var(--fx-border)] bg-[var(--fx-surface-strong)] px-3 py-2"><div className="min-w-0 flex-1 rounded-xl bg-[var(--fx-primary-soft)] px-3 py-2 text-xs"><b className="block text-[10px]">{editingId ? 'Editing message' : 'Replying to'}</b><span className="block truncate opacity-70">{editingId ? body : replyingTo?.body}</span></div><button type="button" onClick={() => { setReplyingTo(null); setEditingId(''); setBody('') }} className="grid h-8 w-8 place-items-center rounded-lg"><X size={15}/></button></div>}

              {showEmoji && <div className="border-t border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-2"><div className="grid grid-cols-8 gap-1">{EMOJIS.map(emoji => <button key={emoji} type="button" onClick={() => setBody(value => value + emoji)} className="grid h-8 place-items-center rounded-lg text-base hover:bg-[var(--fx-primary-soft)]">{emoji}</button>)}</div></div>}

              {showAttach && <div className="border-t border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-2"><div className="grid grid-cols-4 gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-1 rounded-xl border border-[var(--fx-border)] p-2 text-[9px] font-bold"><Paperclip size={17}/>File</button>
                <button type="button" onClick={() => void shareLocation()} className="flex flex-col items-center gap-1 rounded-xl border border-[var(--fx-border)] p-2 text-[9px] font-bold"><MapPin size={17}/>Location</button>
                <button type="button" onClick={() => void shareGifUrl()} className="flex flex-col items-center gap-1 rounded-xl border border-[var(--fx-border)] p-2 text-[9px] font-bold"><FileImage size={17}/>GIF URL</button>
                <button type="button" onClick={notify} className="flex flex-col items-center gap-1 rounded-xl border border-[var(--fx-border)] p-2 text-[9px] font-bold"><CheckCircle size={17}/>Notify</button>
              </div></div>}

              <div className="flex items-end gap-1 border-t border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-3">
                <button type="button" aria-label="Attachment" onClick={() => { setShowAttach(value => !value); setShowEmoji(false) }} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><Paperclip size={19}/></button>
                <button type="button" aria-label="Emoji" onClick={() => { setShowEmoji(value => !value); setShowAttach(false) }} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)]"><Smiley size={19}/></button>
                <textarea data-fenix-message-input value={body} onChange={event => { setBody(event.target.value.slice(0, 5000)); typing(true) }} onBlur={() => typing(false)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendText() } }} rows={1} disabled={blocked} placeholder={blocked ? 'Unblock this person to reply' : editingId ? 'Edit your message…' : 'Write a message…'} className="max-h-28 min-h-10 flex-1 resize-none rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 py-2.5 text-sm leading-5 outline-none disabled:opacity-50"/>
                {recording ? <button type="button" aria-label="Stop voice recording" onClick={stopVoice} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-600 text-white"><Stop size={18} weight="fill"/></button> : <button type="button" aria-label="Voice message" disabled={busy || blocked} onClick={() => void startVoice()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)] disabled:opacity-35"><Microphone size={19}/></button>}
                <button type="button" aria-label="Send" disabled={busy || blocked || !body.trim()} onClick={() => void sendText()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-strong)] text-white disabled:opacity-40"><PaperPlaneRight size={18} weight="fill"/></button>
              </div>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,application/pdf,audio/webm,audio/ogg,audio/mpeg" className="hidden" onChange={chooseAttachment}/>
        </section>
      )}
    </>
  )
}
