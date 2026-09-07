import type { AuthMode } from '../../../lib/auth/auth-utils'

interface AuthHeaderProps {
  mode: AuthMode
}

export default function AuthHeader({
  mode,
}: AuthHeaderProps) {
  return (
    <div className="mb-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#008080]">
        {mode === 'login' ? 'Welcome back' : 'Join FeniX'}
      </p>

      <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl 2xl:text-5xl">
        {mode === 'login'
          ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন'
          : 'FeniX-এ অ্যাকাউন্ট তৈরি করুন'}
      </h2>

      <p className="mt-3 text-sm leading-6 text-white/45">
        {mode === 'login'
          ? 'আপনার FeniX journey আবার শুরু করুন।'
          : 'ফেনীর ডিজিটাল ব্যবসায়িক ecosystem-এর সাথে যুক্ত হন।'}
      </p>
    </div>
  )
}
