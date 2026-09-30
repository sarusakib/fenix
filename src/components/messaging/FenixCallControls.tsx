'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Phone, VideoCamera, PhoneDisconnect, Microphone, MicrophoneSlash, VideoCameraSlash, ShieldCheck, X } from '@phosphor-icons/react'
import type { SupabaseClient } from '@supabase/supabase-js'

type Person = { id: string; full_name: string | null; username: string | null; avatar_url: string | null }
type CallType = 'audio' | 'video'
type Signal = { type: string; callId: string; from: string; to: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit; callType?: CallType; session?: string }

const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 4,
}

function topicForUsers(a: string, b: string, callId: string) {
  return 'call-session:' + [a, b].sort().join(':') + ':' + callId
}

export default function FenixCallControls({
  supabase,
  userId,
  person,
}: {
  supabase: SupabaseClient
  userId: string
  person?: Person
}) {
  const [call, setCall] = useState<{ id: string; type: CallType; direction: 'outgoing' | 'incoming'; peer: Person; status: string; session: string } | null>(null)
  const [incomingOffer, setIncomingOffer] = useState<Signal | null>(null)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [error, setError] = useState('')

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localRef = useRef<MediaStream | null>(null)
  const remoteRef = useRef<MediaStream | null>(null)
  const sessionChannelRef = useRef<ReturnType<SupabaseClient['channel']> | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)

  const inboxTopic = useMemo(() => userId ? 'call-inbox:' + userId : '', [userId])

  function stopMedia() {
    localRef.current?.getTracks().forEach(track => track.stop())
    localRef.current = null
    remoteRef.current?.getTracks().forEach(track => track.stop())
    remoteRef.current = null
  }

  function cleanup() {
    pcRef.current?.close()
    pcRef.current = null
    const channel = sessionChannelRef.current
    if (channel) void supabase.removeChannel(channel)
    sessionChannelRef.current = null
    stopMedia()
    setCall(null)
    setIncomingOffer(null)
    setMuted(false)
    setCameraOff(false)
  }

  async function sendSignal(signal: Signal) {
    const channel = sessionChannelRef.current
    if (!channel) return
    await channel.send({ type: 'broadcast', event: 'signal', payload: signal })
  }

  async function preparePeer(callId: string, type: CallType, peerId: string, session: string) {
    const pc = new RTCPeerConnection(rtcConfig)
    pcRef.current = pc
    pc.ontrack = event => {
      const stream = event.streams[0] || new MediaStream([event.track])
      remoteRef.current = stream
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = stream
    }
    pc.onicecandidate = event => {
      if (event.candidate) void sendSignal({ type: 'ice', callId, from: userId, to: peerId, candidate: event.candidate.toJSON() })
    }
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      if (state === 'connected') setCall(value => value ? { ...value, status: 'Connected' } : value)
      if (['failed', 'disconnected'].includes(state)) setCall(value => value ? { ...value, status: 'Connection interrupted' } : value)
      if (state === 'closed') cleanup()
    }

    const local = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' })
    localRef.current = local
    local.getTracks().forEach(track => pc.addTrack(track, local))
    if (localVideoRef.current) localVideoRef.current.srcObject = local

    const channel = supabase.channel(session, { config: { private: true, broadcast: { ack: true } } })
      .on('broadcast', { event: 'signal' }, async payload => {
        const signal = payload.payload as Signal
        if (signal.to !== userId || signal.callId !== callId) return
        try {
          if (signal.type === 'answer' && signal.sdp) {
            await pc.setRemoteDescription(signal.sdp)
          } else if (signal.type === 'ice' && signal.candidate) {
            await pc.addIceCandidate(signal.candidate)
          } else if (signal.type === 'hangup') {
            cleanup()
          }
        } catch {
          setError('Secure call negotiation failed.')
        }
      })
    sessionChannelRef.current = channel
    const status = await new Promise<string>(resolve => channel.subscribe(value => resolve(value)))
    if (status !== 'SUBSCRIBED') throw new Error('Call channel could not be secured.')
    return pc
  }

  async function startCall(type: CallType) {
    if (!person || !userId || call) return
    setError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === 'undefined') {
      setError('Calling is not supported by this browser.')
      return
    }
    const callId = crypto.randomUUID()
    const session = topicForUsers(userId, person.id, callId)
    try {
      await preparePeer(callId, type, person.id, session)
      const pc = pcRef.current
      if (!pc) throw new Error('Call connection unavailable.')
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      setCall({ id: callId, type, direction: 'outgoing', peer: person, status: 'Calling…', session })
      const inbox = supabase.channel('call-inbox:' + person.id, { config: { private: true, broadcast: { ack: true } } })
      await new Promise<void>((resolve, reject) => {
        inbox.subscribe(async status => {
          if (status !== 'SUBSCRIBED') return reject(new Error('Call invitation could not be delivered securely.'))
          const result = await inbox.send({
            type: 'broadcast',
            event: 'incoming',
            payload: { type: 'invite', callId, from: userId, to: person.id, callType: type, sdp: pc.localDescription, session },
          })
          if (result !== 'ok') return reject(new Error('Call invitation could not be delivered.'))
          resolve()
        })
      })
      window.setTimeout(() => void supabase.removeChannel(inbox), 10000)
    } catch (e) {
      cleanup()
      setError(e instanceof Error ? e.message : 'Could not start the call.')
    }
  }

  async function acceptIncoming() {
    const offer = incomingOffer
    if (!offer?.sdp || !offer.session || !offer.callType) return
    setIncomingOffer(null)
    try {
      await preparePeer(offer.callId, offer.callType, offer.from, offer.session)
      const pc = pcRef.current
      if (!pc) throw new Error('Call connection unavailable.')
      await pc.setRemoteDescription(offer.sdp)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      setCall({ id: offer.callId, type: offer.callType, direction: 'incoming', peer: call?.peer || person || { id: offer.from, full_name: 'FeniX user', username: null, avatar_url: null }, status: 'Connecting…', session: offer.session })
      await sendSignal({ type: 'answer', callId: offer.callId, from: userId, to: offer.from, sdp: pc.localDescription || undefined })
    } catch (e) {
      cleanup()
      setError(e instanceof Error ? e.message : 'Could not accept the call.')
    }
  }

  async function declineIncoming() {
    const offer = incomingOffer
    setIncomingOffer(null)
    if (!offer?.session) return
    const channel = supabase.channel(offer.session, { config: { private: true } })
    channel.subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await channel.send({ type: 'broadcast', event: 'signal', payload: { type: 'hangup', callId: offer.callId, from: userId, to: offer.from } })
        void supabase.removeChannel(channel)
      }
    })
  }

  useEffect(() => {
    if (!userId) return
    const inbox = supabase.channel(inboxTopic, { config: { private: true } })
      .on('broadcast', { event: 'incoming' }, payload => {
        const signal = payload.payload as Signal
        if (signal.type !== 'invite' || signal.to !== userId || !signal.sdp || !signal.session || !signal.callType) return
        if (call || incomingOffer) return
        void (async () => {
          const { data } = await supabase
            .from('fenix_public_profiles')
            .select('id,full_name,username,avatar_url')
            .eq('id', signal.from)
            .maybeSingle()
          const caller: Person = (data as Person | null) || { id: signal.from, full_name: 'FeniX user', username: null, avatar_url: null }
          setIncomingOffer(signal)
          setCall({ id: signal.callId, type: signal.callType as CallType, direction: 'incoming', peer: caller, status: 'Incoming call', session: signal.session! })
        })()
      })
      .subscribe()
    return () => { void supabase.removeChannel(inbox) }
  }, [inboxTopic, supabase, userId, call, incomingOffer, person])

  useEffect(() => () => cleanup(), [])

  function hangup() {
    if (call && sessionChannelRef.current) void sendSignal({ type: 'hangup', callId: call.id, from: userId, to: call.peer.id })
    cleanup()
  }

  function toggleMute() {
    const track = localRef.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMuted(!track.enabled)
  }

  function toggleCamera() {
    const track = localRef.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setCameraOff(!track.enabled)
  }

  if (!person && !incomingOffer && !call) return null

  return (
    <>
      {person && (
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Audio call" title="Audio call" onClick={() => void startCall('audio')} disabled={Boolean(call)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)] disabled:opacity-40">
            <Phone size={18} weight="bold"/>
          </button>
          <button type="button" aria-label="Video call" title="Video call" onClick={() => void startCall('video')} disabled={Boolean(call)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[var(--fx-primary-soft)] disabled:opacity-40">
            <VideoCamera size={19} weight="bold"/>
          </button>
        </div>
      )}

      {error && <div className="fixed bottom-5 left-1/2 z-[120] -translate-x-1/2 rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-semibold text-red-700 shadow-xl">{error}</div>}

      {incomingOffer && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-6 shadow-2xl">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
              {incomingOffer.callType === 'video' ? <VideoCamera size={30}/> : <Phone size={28}/>}
            </div>
            <h3 className="mt-4 text-center text-lg font-black">{call?.peer.full_name || 'FeniX user'}</h3>
            <p className="mt-1 text-center text-xs text-[var(--fx-muted)]">{incomingOffer.callType === 'video' ? 'Incoming video call' : 'Incoming audio call'}</p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={declineIncoming} className="flex-1 rounded-xl border border-[var(--fx-border)] px-4 py-3 text-sm font-bold">Decline</button>
              <button type="button" onClick={() => void acceptIncoming()} className="flex-1 rounded-xl bg-[var(--fx-primary-strong)] px-4 py-3 text-sm font-bold text-white">Accept</button>
            </div>
          </div>
        </div>
      )}

      {call && !incomingOffer && (
        <div className="fixed inset-0 z-[105] bg-black/80 p-4">
          <div className="mx-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-[#071225] text-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">{call.type === 'video' ? <VideoCamera size={18}/> : <Phone size={18}/>}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{call.peer.full_name || call.peer.username || 'FeniX user'}</p><p className="text-[10px] text-white/60">{call.status}</p></div>
              <div className="flex items-center gap-1 text-[10px] text-white/70"><ShieldCheck size={15}/> Secure WebRTC</div>
            </div>
            <div className="relative flex-1 bg-black">
              {call.type === 'video' && <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-contain"/>}
              {call.type === 'audio' && <audio ref={remoteAudioRef} autoPlay/>}
              {call.type === 'video' && <video ref={localVideoRef} autoPlay muted playsInline className="absolute bottom-4 right-4 h-32 w-24 rounded-2xl border border-white/20 bg-black object-cover shadow-xl"/>}
              {call.type === 'audio' && <div className="grid h-full place-items-center"><div className="grid h-24 w-24 place-items-center rounded-full bg-white/10"><Phone size={38}/></div></div>}
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-white/10 px-4 py-4">
              <button type="button" onClick={toggleMute} className="grid h-12 w-12 place-items-center rounded-full bg-white/10">{muted ? <MicrophoneSlash size={20}/> : <Microphone size={20}/>}</button>
              {call.type === 'video' && <button type="button" onClick={toggleCamera} className="grid h-12 w-12 place-items-center rounded-full bg-white/10">{cameraOff ? <VideoCameraSlash size={20}/> : <VideoCamera size={20}/>}</button>}
              <button type="button" onClick={hangup} className="grid h-12 w-12 place-items-center rounded-full bg-red-600"><PhoneDisconnect size={22}/></button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
