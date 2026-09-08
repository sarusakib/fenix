'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LockKey, ArrowLeft, CheckCircle } from '@phosphor-icons/react'

import { createClient } from '../../../utils/supabase/client'
import SiteBackground from '../../../components/layout/SiteBackground'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (password.length < 8) {
      setStatus('Password কমপক্ষে ৮ characters হতে হবে।')
      return
    }

    if (password !== confirmPassword) {
      setStatus('Password দুটো একই নয়।')
      return
    }

    setLoading(true)
    setStatus('')

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        setStatus('Password update করা যায়নি। Reset link নতুন করে নিন।')
        return
      }

      setStatus('Password successfully updated.')

      setTimeout(() => {
        router.replace('/login')
      }, 800)
    } catch {
      setStatus('Password update করা যায়নি।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#030506] text-white">
      <SiteBackground />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-black/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center gap-2 text-sm text-white/45 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to login
          </Link>

          <div className="mt-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#008080]/25 bg-[#008080]/10 text-[#72ddda]">
            <LockKey size={23} weight="duotone" />
          </div>

          <h1 className="mt-5 text-3xl font-black">
            Set new password
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/45">
            Choose a strong password for your FeniX account.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#008080]/50"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#008080]/50"
            />

            <button
              type="submit"
              disabled={loading}
              className="min-h-12 w-full rounded-xl bg-[#008080] text-sm font-bold text-white transition hover:bg-[#079494] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>

          {status && (
            <div className="mt-5 flex gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-sm text-white/55">
              <CheckCircle
                size={17}
                className="mt-0.5 shrink-0 text-[#72ddda]"
              />
              {status}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
