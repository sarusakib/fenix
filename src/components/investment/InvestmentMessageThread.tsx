'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChatCircleDots, PaperPlaneTilt } from '@phosphor-icons/react'
import { createClient } from '@/utils/supabase/client'
import type { InvestmentMessage } from '@/types/database'

export default function InvestmentMessageThread({
  opportunityId,
  userId,
  recipientId,
  dealId,
  title = 'Secure conversation',
  compact = false,
}: {
  opportunityId: string
  userId: string
  recipientId?: string | null
  dealId?: string | null
  title?: string
  compact?: boolean
}) {
  const [messages, setMessages] = useState<InvestmentMessage[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    if (!userId || !recipientId) {
      setMessages([])
      setLoading(false)
      return
    }
    const s = createClient()
    const { data, error: readError } = await s
      .from('investment_messages')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (readError) {
      setError(readError.message)
      setMessages([])
      setLoading(false)
      return
    }

    const relevant = ((data ?? []) as InvestmentMessage[]).filter(
      (message) =>
        (message.sender_id === userId && message.recipient_id === recipientId) ||
        (message.sender_id === recipientId && message.recipient_id === userId),
    )
    setMessages(relevant)

    const unread = relevant.filter((message) => message.recipient_id === userId && !message.read_at).slice(-50)
    await Promise.all(
      unread.map((message) =>
        s.rpc('mark_investment_message_read', { p_message_id: message.id }),
      ),
    )

    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [opportunityId, userId, recipientId, dealId])

  const canSend = useMemo(() => Boolean(userId && recipientId && body.trim()), [userId, recipientId, body])

  async function send() {
    if (!canSend || !recipientId) return
    setSending(true)
    setError('')
    const s = createClient()
    const { error: sendError } = await s.from('investment_messages').insert({
      opportunity_id: opportunityId,
      deal_id: dealId ?? null,
      sender_id: userId,
      recipient_id: recipientId,
      body: body.trim(),
    })

    if (sendError) {
      setError(sendError.message)
    } else {
      setBody('')
      await load()
    }
    setSending(false)
  }

  return (
    <section className={`rounded-[2rem] border border-[#0b1736]/10 bg-white/80 p-6 dark:border-white/10 dark:bg-white/[.045] ${compact ? '' : 'sm:p-8'}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#008080]/[.08] text-[#008080]">
          <ChatCircleDots size={21} />
        </div>
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="text-xs opacity-45">Only the two parties and authorized FeniX admins can access this thread.</p>
        </div>
      </div>

      {!recipientId ? (
        <div className="mt-5 rounded-xl bg-black/[.025] p-4 text-sm opacity-60 dark:bg-white/[.03]">
          Conversation becomes available after an investor expresses interest.
        </div>
      ) : (
        <>
          <div className="mt-5 max-h-[24rem] space-y-3 overflow-y-auto rounded-2xl bg-black/[.018] p-3 dark:bg-white/[.02]">
            {loading ? (
              <p className="py-8 text-center text-sm opacity-45">Loading messages...</p>
            ) : messages.length ? (
              messages.map((message) => {
                const mine = message.sender_id === userId
                return (
                  <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${mine ? 'bg-[#008080] text-white' : 'bg-white ring-1 ring-black/[.06] dark:bg-white/[.07] dark:ring-white/[.07]'}`}>
                      <p className="whitespace-pre-wrap">{message.body}</p>
                      <p className={`mt-1 text-[10px] ${mine ? 'opacity-70' : 'opacity-40'}`}>
                        {new Date(message.created_at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="py-8 text-center text-sm opacity-45">No messages yet. Start the conversation with a clear question or next step.</p>
            )}
          </div>

          <div className="mt-4">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={4000}
              rows={4}
              placeholder="Write a message..."
              className="w-full rounded-xl border border-[#0b1736]/10 bg-transparent p-3 text-sm leading-6 outline-none focus:border-[#008080]/40 dark:border-white/10"
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <button
              type="button"
              disabled={sending || !canSend}
              onClick={() => void send()}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PaperPlaneTilt size={17} />
              {sending ? 'Sending...' : 'Send message'}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
