'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, ShieldCheck, SignIn } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import {
  FenixField,
  FenixFormMessage,
  FenixSelect,
  FenixSubmitButton,
  FenixTextarea,
} from '@/components/forms/FenixForm'
import { createClient } from '@/utils/supabase/client'

const TYPES = [
  ['identity', 'Identity reviewed', 'Explain what identity/business evidence you can provide for ownership review.'],
  ['phone', 'Phone verified', 'Describe how the listed business phone number can be confirmed.'],
  ['location', 'Location verified', 'Describe the public location evidence you can provide.'],
  ['business', 'Business reviewed', 'Describe the business evidence you can provide for a business review.'],
] as const

type VerificationType = typeof TYPES[number][0]

type VerificationHistory = {
  id: string
  verification_type: string
  status: string
  evidence_note: string | null
  review_note: string | null
  created_at: string
  reviewed_at: string | null
}

type OwnedBusiness = {
  id: string
  name: string
  title_bn: string | null
  title_en: string | null
  owner_id: string | null
}

export default function DirectoryVerifyPage() {
  const [businessId, setBusinessId] = useState('')
  const [business, setBusiness] = useState<OwnedBusiness | null>(null)
  const [type, setType] = useState<VerificationType>('identity')
  const [note, setNote] = useState('')
  const [history, setHistory] = useState<VerificationHistory[]>([])
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setBusinessId((new URLSearchParams(window.location.search).get('business') || '').trim())
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      const supabase = createClient()
      const { data: auth } = await supabase.auth.getUser()

      if (!active) return

      setSignedIn(Boolean(auth.user))
      setAuthChecked(true)

      if (!auth.user) {
        setLoading(false)
        return
      }

      if (!businessId) {
        setError('This page needs a business ID. Open your business profile and choose Verification.')
        setLoading(false)
        return
      }

      const [businessResult, historyResult] = await Promise.all([
        supabase
          .from('businesses')
          .select('id,name,title_bn,title_en,owner_id')
          .eq('id', businessId)
          .maybeSingle(),
        supabase
          .from('business_verification_requests')
          .select('id,verification_type,status,evidence_note,review_note,created_at,reviewed_at')
          .eq('business_id', businessId)
          .eq('requester_id', auth.user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      if (!active) return

      if (
        businessResult.error ||
        !businessResult.data ||
        businessResult.data.owner_id !== auth.user.id
      ) {
        setError('You can request verification only for a business you own.')
        setLoading(false)
        return
      }

      setBusiness(businessResult.data)
      setHistory((historyResult.data ?? []) as VerificationHistory[])
      if (historyResult.error) setError('Verification history could not be loaded.')
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [businessId])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    setMessage('')
    setError('')

    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()

    if (!auth.user || !business) {
      setBusy(false)
      setError('Please sign in and select your business.')
      return
    }

    const cleanNote = note.trim().slice(0, 3000)
    if (cleanNote.length < 10) {
      setBusy(false)
      setError('Please provide at least a short evidence note so the reviewer knows what to check.')
      return
    }

    const { data, error: insertError } = await supabase
      .from('business_verification_requests')
      .insert({
        business_id: business.id,
        requester_id: auth.user.id,
        verification_type: type,
        evidence_note: cleanNote,
        status: 'pending',
      })
      .select('id,verification_type,status,evidence_note,created_at')
      .single()

    if (insertError) {
      setError(
        insertError.code === '23505'
          ? 'A request of this type is already under review.'
          : 'Verification request could not be submitted.',
      )
    } else if (data) {
      setMessage('Verification request submitted for authorized review.')
      setHistory((items) => [
        {
          ...(data as VerificationHistory),
          review_note: null,
          reviewed_at: null,
        },
        ...items,
      ])
      setNote('')
    }

    setBusy(false)
  }

  return (
    <main className="min-h-dvh bg-[var(--fx-bg)] text-[var(--fx-text)]">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
        <Link
          href="/directory/manage"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 text-sm font-bold"
        >
          <ArrowLeft size={17} /> Manage businesses
        </Link>

        <div className="mt-7 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-6 sm:p-9">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Verification</p>
              <h1 className="mt-1 text-3xl font-black">Request business verification</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">
                Verification describes what FeniX reviewed. It is not government certification, a quality guarantee, or a promise of business success.
              </p>
            </div>
          </div>

          {!authChecked || loading ? (
            <div className="mt-8 animate-pulse rounded-2xl border border-[var(--fx-border)] p-5">
              <div className="h-4 w-40 rounded bg-black/[.06] dark:bg-white/[.08]" />
              <div className="mt-3 h-10 w-full rounded-xl bg-black/[.04] dark:bg-white/[.06]" />
            </div>
          ) : !signedIn ? (
            <div className="mt-8 rounded-2xl border border-[var(--fx-primary)]/15 bg-[var(--fx-primary-soft)] p-6">
              <div className="flex items-start gap-3">
                <SignIn size={23} className="mt-0.5 shrink-0 text-[var(--fx-primary-strong)]" />
                <div>
                  <h2 className="text-lg font-black">Sign in to request verification</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--fx-muted)]">
                    Verification requests can only be submitted for a business you own.
                  </p>
                </div>
              </div>
              <Link
                href={'/login?next=' + encodeURIComponent(window.location.pathname + window.location.search)}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white"
              >
                Sign in to continue <SignIn size={17} />
              </Link>
            </div>
          ) : business ? (
            <>
              <form onSubmit={submit} className="mt-8 space-y-5">
                <div className="rounded-2xl bg-[var(--fx-primary-soft)] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--fx-muted)]">Business</p>
                  <p className="mt-1 text-lg font-black">{business.title_bn || business.title_en || business.name}</p>
                </div>

                <FenixField label="Verification type" htmlFor="verification-type" required>
                  <FenixSelect
                    id="verification-type"
                    value={type}
                    onChange={(event) => setType(event.target.value as VerificationType)}
                  >
                    {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </FenixSelect>
                </FenixField>

                <div className="rounded-xl bg-black/[.025] p-3 text-xs leading-5 text-[var(--fx-muted)] dark:bg-white/[.03]">
                  {TYPES.find((item) => item[0] === type)?.[2]}
                </div>

                <FenixField
                  label="Evidence note"
                  htmlFor="verification-note"
                  required
                  hint="Never paste passwords, OTPs, card numbers or unnecessary private information."
                >
                  <FenixTextarea
                    id="verification-note"
                    required
                    value={note}
                    onChange={(event) => setNote(event.target.value.slice(0, 3000))}
                    maxLength={3000}
                    rows={7}
                    placeholder="Tell the reviewer what evidence is available and where to check it."
                  />
                </FenixField>

                {error && <FenixFormMessage tone="error">{error}</FenixFormMessage>}
                {message && <FenixFormMessage tone="success">{message}</FenixFormMessage>}

                <FenixSubmitButton loading={busy}>
                  {busy ? 'Submitting…' : 'Request review'}
                  <CheckCircle size={18} />
                </FenixSubmitButton>
              </form>

              <div className="mt-8">
                <h2 className="text-xl font-black">Your request history</h2>
                <div className="mt-4 space-y-3">
                  {history.length ? (
                    history.map((row) => (
                      <article key={row.id} className="rounded-2xl border border-[var(--fx-border)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold">{row.verification_type}</span>
                          <span className="rounded-full bg-black/[.035] px-2 py-1 text-[11px] font-bold dark:bg-white/[.06]">{row.status}</span>
                        </div>
                        <p className="mt-2 text-xs text-[var(--fx-muted)]">
                          {new Date(row.created_at).toLocaleString('en-GB')}
                        </p>
                        {row.review_note && <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{row.review_note}</p>}
                      </article>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-black/[.025] p-5 text-sm text-[var(--fx-muted)] dark:bg-white/[.03]">
                      No verification requests yet.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-8">
              {error && <FenixFormMessage tone="error">{error}</FenixFormMessage>}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
