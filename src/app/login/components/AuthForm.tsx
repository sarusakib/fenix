'use client'

import {
  ArrowRight,
  SpinnerGap,
  User,
} from '@phosphor-icons/react'
import type { FormEvent } from 'react'

import type { AuthMode } from '../../../lib/auth/auth-utils'
import PasswordField from './PasswordField'

interface AuthFormProps {
  mode: AuthMode
  fullName: string
  email: string
  password: string
  showPassword: boolean
  loading: boolean
  disabled: boolean
  onFullNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onTogglePassword: () => void
  onForgotPassword: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function AuthForm({
  mode,
  fullName,
  email,
  password,
  showPassword,
  loading,
  disabled,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onForgotPassword,
  onSubmit,
}: AuthFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      {mode === 'signup' && (
        <div>
          <label
            htmlFor="fullName"
            className="mb-2 block text-xs font-semibold text-white/55"
          >
            পুরো নাম
          </label>

          <div className="relative">
            <User
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) =>
                onFullNameChange(event.target.value)
              }
              placeholder="আপনার পুরো নাম"
              autoComplete="name"
              disabled={disabled}
              className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.045] pl-12 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#008080]/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#008080]/10 disabled:opacity-50"
            />
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-semibold text-white/55"
        >
          ইমেইল অ্যাড্রেস
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            onEmailChange(event.target.value)
          }
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          disabled={disabled}
          className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#008080]/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#008080]/10 disabled:opacity-50"
        />
      </div>

      <PasswordField
        value={password}
        showPassword={showPassword}
        disabled={disabled}
        onChange={onPasswordChange}
        onToggle={onTogglePassword}
        onForgotPassword={onForgotPassword}
        showForgotPassword={mode === 'login'}
      />

      <button
        type="submit"
        disabled={disabled}
        className="group mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#008080] px-5 text-sm font-bold text-white shadow-[0_12px_35px_rgba(0,128,128,0.18)] transition-all duration-200 hover:bg-[#009999] hover:shadow-[0_15px_40px_rgba(0,128,128,0.25)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <SpinnerGap
              size={20}
              className="animate-spin"
            />

            <span>প্রসেসিং...</span>
          </>
        ) : (
          <>
            <span>
              {mode === 'login'
                ? 'লগইন করুন'
                : 'অ্যাকাউন্ট তৈরি করুন'}
            </span>

            <ArrowRight
              size={19}
              weight="bold"
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </>
        )}
      </button>
    </form>
  )
          }
