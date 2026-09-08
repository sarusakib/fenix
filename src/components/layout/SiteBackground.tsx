'use client'

import Link from 'next/link'
import { Moon, Sun } from '@phosphor-icons/react'

import { useAuthStore } from '../store/useAuthStore'
import { useHomeTheme } from './theme/HomeThemeProvider'

export default function Navbar() {
  const { user, role, logout } = useAuthStore()
  const { resolvedTheme, setTheme } = useHomeTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/30 text-white backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="text-2xl font-extrabold tracking-wider text-[#FFD700]">
              FeniX
            </span>

            <span className="hidden rounded-full bg-[#008080] px-2 py-0.5 text-xs font-medium text-white sm:inline-flex">
              Ecosystem
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link
              href="/"
              className="transition-colors hover:text-[#FFD700]"
            >
              হোম
            </Link>

            <Link
              href="/directory"
              className="transition-colors hover:text-[#FFD700]"
            >
              বিজনেস ডিরেক্টরি
            </Link>

            <Link
              href="/invest"
              className="transition-colors hover:text-[#FFD700]"
            >
              ইনভেস্টমেন্ট
            </Link>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                resolvedTheme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              title={
                resolvedTheme === 'dark'
                  ? 'Light mode'
                  : 'Dark mode'
              }
              className="
                inline-flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-white/[0.06]
                text-white/80
                backdrop-blur-md
                transition
                hover:border-white/20
                hover:bg-white/10
                hover:text-white
                active:scale-95
              "
            >
              {resolvedTheme === 'dark' ? (
                <Sun size={19} weight="duotone" />
              ) : (
                <Moon size={19} weight="duotone" />
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="hidden rounded border border-[#FFD700]/30 bg-amber-500/20 px-2 py-1 text-xs capitalize text-[#FFD700] sm:inline-flex">
                  {role}
                </span>

                <span className="hidden max-w-[180px] truncate text-sm font-medium lg:inline">
                  {user.email}
                </span>

                <button
                  type="button"
                  onClick={logout}
                  className="rounded bg-red-600/80 px-3 py-1.5 text-xs text-white transition-colors hover:bg-red-600"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="
                  rounded-lg
                  bg-[#008080]
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#006666]
                "
              >
                লগইন করুন
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}
