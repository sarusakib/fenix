'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, ShieldCheck, SignIn } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import {
  FenixField,
  FenixFormMessage,
  FenixSubmitButton,
  FenixTextarea,
} from '@/components/forms/FenixForm'
import { createClient } from '@/utils/supabase/client'

type BusinessSummary = {
  id: string
  name: string
  title_bn: string | null
  title_en: string | null
}

export default function DirectoryClaimPage() {
  const [businessId, setBusinessId] = useState('')
  const [business, setBusiness] = useState<BusinessSummary | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const [busy, setBusy] = useState(false)
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

      if (!businessId) {
        setError('This page needs a business ID. Open a business profile first and choose Claim.')
        setLoading(false)
        return
      }

      const { data, error: businessError } = await supabase
        .from('businesses')
        .select('id,name,title_bn,title_en')
        .eq('id', businessId)
        .maybeSingle()

      if (!active) return

      if (businessError || !data) setError('Business could not be found.')
      else setBusiness(data)

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
    setError('')
    setMessage('')

    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()

    if (!auth.user) {
      setBusy(false)
      setSignedIn(false)
      setError('Please sign in before submitting a claim.')
      return
    }

    if (!businessId || !business) {
      setBusy(false)
      setError('Choose a valid business first.')
      return
    }

    const { error: insertError } = await supabase
      .from('business_claim_requests')
      .insert({
        business_id: businessId,
        claimant_id: auth.user.id,
        note: note.trim().slice(0, 2000),
        status: 'pending',
      })

    if (insertError) {
      setError(
        insertError.code === '23505'
          ? 'A pending claim already exists for this business.'
          : 'Claim request could not be submitted right now.',
      )
    } else {
      setMessage('Claim submitted. An authorized FeniX reviewer must approve it before ownership is shown as reviewed.')
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
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Trust workflow</p>
              <h1 className="mt-1 text-3xl font-black">Claim a business</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">
                A claim is a request for ownership review. It does not create a verification guarantee.
              </p>
            </div>
          </div>

          {!authChecked || loading ? (
            <div className="mt-8 animate-pulse rounded-2xl border border-[var(--fx-border)] p-5">
              <div className="h-4 w-36 rounded bg-black/[.06] dark:bg-white/[.08]" />
              <div className="mt-3 h-10 w-full rounded-xl bg-black/[.04] dark:bg-white/[.06]" />
            </div>
          ) : !signedIn ? (
            <div className="mt-8 rounded-2xl border border-[var(--fx-primary)]/15 bg-[var(--fx-primary-soft)] p-6">
              <div className="flex items-start gap-3">
                <SignIn size={23} className="mt-0.5 shrink-0 text-[var(--fx-primary-strong)]" />
                <div>
                  <h2 className="text-lg font-black">Sign in to claim</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--fx-muted)]">
                    Ownership requests must be linked to a FeniX account.
                  </p>
                </div>
              </div>
              <Link
                href={'/login?next=' + encodeURIComponent('/directory/claim?business=' + businessId)}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white"
              >
                Sign in to continue <SignIn size={17} />
              </Link>
            </div>
          ) : business ? (
            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="rounded-2xl bg-[var(--fx-primary-soft)] p-4">
                <p className="text-[10px] font-black uppercase tracking-[.12em] text-[var(--fx-muted)]">Business</p>
                <p className="mt-1 text-lg font-black">{business.title_bn || business.title_en || business.name}</p>
              </div>

              <FenixField
                label="Why should this be linked to you?"
                htmlFor="claim-note"
                hint="Describe your relationship or the evidence you can provide. Do not send passwords, OTPs or card details."
              >
                <FenixTextarea
                  id="claim-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value.slice(0, 2000))}
                  maxLength={2000}
                  rows={7}
                  placeholder="Describe your relationship to this business…"
                />
              </FenixField>

              {error && <FenixFormMessage tone="error">{error}</FenixFormMessage>}
              {message && <FenixFormMessage tone="success">{message}</FenixFormMessage>}

              <FenixSubmitButton loading={busy}>
                {busy ? 'Submitting…' : 'Submit claim request'}
                <CheckCircle size={18} />
              </FenixSubmitButton>
            </form>
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
