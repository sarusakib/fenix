'use client'

import {
  FacebookLogo,
  GoogleLogo,
  SpinnerGap,
} from '@phosphor-icons/react'

import type {
  OAuthProvider,
} from '../../../lib/auth/auth-utils'

interface SocialLoginProps {
  loading: 'google' | 'facebook' | null
  disabled: boolean
  onLogin: (provider: OAuthProvider) => void
}

export default function SocialLogin({
  loading,
  disabled,
  onLogin,
}: SocialLoginProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onLogin('google')}
          className="group flex h-[52px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === 'google' ? (
            <SpinnerGap
              size={20}
              className="animate-spin"
            />
          ) : (
            <GoogleLogo size={20} weight="bold" />
          )}

          <span>Google</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onLogin('facebook')}
          className="group flex h-[52px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading === 'facebook' ? (
            <SpinnerGap
              size={20}
              className="animate-spin"
            />
          ) : (
            <FacebookLogo size={20} weight="fill" />
          )}

          <span>Facebook</span>
        </button>
      </div>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/[0.08]" />

        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
          অথবা
        </span>

        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>
    </>
  )
}
