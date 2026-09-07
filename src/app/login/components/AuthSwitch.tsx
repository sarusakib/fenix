'use client'

import type { AuthMode } from '../../../lib/auth/auth-utils'

interface AuthSwitchProps {
  mode: AuthMode
  disabled: boolean
  onSwitch: () => void
}

export default function AuthSwitch({
  mode,
  disabled,
  onSwitch,
}: AuthSwitchProps) {
  return (
    <div className="mt-7 text-center">
      <p className="text-sm text-white/40">
        {mode === 'login'
          ? 'নতুন এখানে?'
          : 'ইতিমধ্যে অ্যাকাউন্ট আছে?'}{' '}
        <button
          type="button"
          onClick={onSwitch}
          disabled={disabled}
          className="font-bold text-[#008080] transition-colors hover:text-teal-300 disabled:opacity-50"
        >
          {mode === 'login'
            ? 'সাইন-আপ করুন'
            : 'লগইন করুন'}
        </button>
      </p>
    </div>
  )
}
