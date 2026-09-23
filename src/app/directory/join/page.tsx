'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Buildings, CheckCircle, SignIn, Storefront } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { GuidedFormProgress } from '@/components/forms/GuidedFormProgress'
import {
  FenixField,
  FenixFormMessage,
  FenixInput,
  FenixSelect,
  FenixSubmitButton,
  FenixTextarea,
} from '@/components/forms/FenixForm'
import { createClient } from '@/utils/supabase/client'

const CATEGORIES = [
  'Retail',
  'Food & Beverage',
  'Services',
  'Manufacturing',
  'Agriculture',
  'Education',
  'Technology',
  'Healthcare',
  'Transport',
  'Online',
  'Other',
]

export default function DirectoryJoinPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [authChecked, setAuthChecked] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    let active = true

    async function checkAuth() {
      const { data } = await createClient().auth.getUser()
      if (!active) return
      setSignedIn(Boolean(data.user))
      setAuthChecked(true)
    }

    void checkAuth()
    return () => {
      active = false
    }
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const safeName = name.trim().slice(0, 180)
    const safeDescription = description.trim().slice(0, 2000)

    if (safeName.length < 2) {
      setError('Business name must be at least 2 characters.')
      setStep(1)
      return
    }

    if (!category) {
      setError('Choose a business category.')
      setStep(2)
      return
    }

    setBusy(true)

    const supabase = createClient()
    const { data: auth } = await supabase.auth.getUser()

    if (!auth.user) {
      setBusy(false)
      setSignedIn(false)
      setError('Please sign in before creating a business.')
      return
    }

    const { data, error: insertError } = await supabase
      .from('businesses')
      .insert({
        owner_id: auth.user.id,
        name: safeName,
        title_en: safeName,
        category,
        description: safeDescription || null,
      })
      .select('id')
      .single()

    if (insertError || !data) {
      setError('Business could not be added right now. Please try again.')
      setBusy(false)
      return
    }

    router.push('/directory/manage?created=1')
  }

  return (
    <main className="min-h-dvh bg-[var(--fx-bg)] text-[var(--fx-text)]">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
        <Link
          href="/directory"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 text-sm font-bold"
        >
          <ArrowLeft size={17} /> Directory
        </Link>

        <div className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-6 shadow-[0_18px_60px_rgba(15,23,42,.06)] sm:p-9">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
              <Buildings size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[var(--fx-primary-strong)]">Business presence</p>
              <h1 className="mt-1 text-3xl font-black sm:text-4xl">Add your business</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">
                Create the shared business identity used by Directory, Commerce, Start and future FeniX services.
              </p>
            </div>
          </div>

          {!authChecked ? (
            <div className="mt-8 animate-pulse rounded-2xl border border-[var(--fx-border)] p-5">
              <div className="h-4 w-32 rounded bg-black/[.06] dark:bg-white/[.08]" />
              <div className="mt-3 h-10 w-full rounded-xl bg-black/[.04] dark:bg-white/[.06]" />
            </div>
          ) : !signedIn ? (
            <div className="mt-8 rounded-2xl border border-[var(--fx-primary)]/15 bg-[var(--fx-primary-soft)] p-6">
              <div className="flex items-start gap-3">
                <SignIn size={23} className="mt-0.5 shrink-0 text-[var(--fx-primary-strong)]" />
                <div>
                  <h2 className="text-lg font-black">Sign in before starting</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--fx-muted)]">
                    Your business ownership is tied to your FeniX account. Sign in first so your form progress is not lost.
                  </p>
                </div>
              </div>
              <Link
                href="/login?next=/directory/join"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white"
              >
                Sign in to continue <SignIn size={17} />
              </Link>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (step === 3) void submit(event)
              }}
              className="mt-8"
            >
              <GuidedFormProgress
                step={step}
                total={3}
                title={step === 1 ? 'Business identity' : step === 2 ? 'Business type' : 'Public description'}
                subtitle={
                  step === 1
                    ? 'First tell us the business name.'
                    : step === 2
                      ? 'Choose the category that fits best.'
                      : 'Add a short description, then create your business.'
                }
                onBack={() => {
                  setError('')
                  setStep((value) => Math.max(1, value - 1))
                }}
                onNext={() => {
                  setError('')
                  if (step === 1 && name.trim().length < 2) {
                    setError('Business name must be at least 2 characters.')
                    return
                  }
                  if (step === 2 && !category) {
                    setError('Choose a business category.')
                    return
                  }
                  setStep((value) => Math.min(3, value + 1))
                }}
                nextLabel={step === 2 ? 'Continue' : 'Next'}
                nextDisabled={step === 1 && name.trim().length < 2}
                submit
              />

              <div className="space-y-5">
                {step === 1 && (
                  <FenixField label="Business name" htmlFor="business-name" required hint="Use the name customers actually know.">
                    <FenixInput
                      id="business-name"
                      autoFocus
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value.slice(0, 180))}
                      maxLength={180}
                      placeholder="e.g. Feni Fashion House"
                    />
                  </FenixField>
                )}

                {step === 2 && (
                  <FenixField label="Category" htmlFor="business-category" required>
                    <FenixSelect
                      id="business-category"
                      autoFocus
                      required
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </FenixSelect>
                  </FenixField>
                )}

                {step === 3 && (
                  <>
                    <FenixField label="Short description" htmlFor="business-description" hint="Keep it factual. Avoid unverifiable claims.">
                      <FenixTextarea
                        id="business-description"
                        autoFocus
                        value={description}
                        onChange={(event) => setDescription(event.target.value.slice(0, 2000))}
                        maxLength={2000}
                        rows={7}
                        placeholder="What does this business do?"
                      />
                    </FenixField>

                    {error && <FenixFormMessage tone="error">{error}</FenixFormMessage>}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <FenixSubmitButton loading={busy}>
                        {busy ? 'Creating…' : 'Create business'}
                        <Storefront size={18} />
                      </FenixSubmitButton>
                      <span className="inline-flex items-center gap-2 text-xs text-[var(--fx-muted)]">
                        <CheckCircle size={16} /> Ownership stays protected by Supabase RLS.
                      </span>
                    </div>
                  </>
                )}
              </div>
            </form>
          )}

          {error && authChecked && signedIn && step !== 3 && (
            <div className="mt-4">
              <FenixFormMessage tone="error">{error}</FenixFormMessage>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
