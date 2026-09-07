'use client'

import {
  Eye,
  EyeSlash,
  LockKey,
} from '@phosphor-icons/react'

interface PasswordFieldProps {
  value: string
  showPassword: boolean
  disabled: boolean
  onChange: (value: string) => void
  onToggle: () => void
  onForgotPassword: () => void
  showForgotPassword: boolean
}

export default function PasswordField({
  value,
  showPassword,
  disabled,
  onChange,
  onToggle,
  onForgotPassword,
  showForgotPassword,
}: PasswordFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor="password"
          className="block text-xs font-semibold text-white/55"
        >
          পাসওয়ার্ড
        </label>

        {showForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={disabled}
            className="text-xs font-semibold text-[#008080] transition-colors hover:text-teal-300 disabled:opacity-50"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </button>
        )}
      </div>

      <div className="relative">
        <LockKey
          size={19}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />

        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="আপনার পাসওয়ার্ড"
          autoComplete={
            showForgotPassword
              ? 'current-password'
              : 'new-password'
          }
          disabled={disabled}
          className="h-[52px] w-full rounded-xl border border-white/10 bg-white/[0.045] pl-12 pr-12 text-sm text-white outline-none transition-all placeholder:text-white/25 focus:border-[#008080]/70 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#008080]/10 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            showPassword
              ? 'পাসওয়ার্ড লুকান'
              : 'পাসওয়ার্ড দেখান'
          }
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/10 hover:text-white"
        >
          {showPassword ? (
            <EyeSlash size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>
    </div>
  )
}
