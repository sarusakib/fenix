'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  House,
  Lightbulb,
  List,
  MagnifyingGlass,
  Moon,
  ShoppingBag,
  SignIn,
  SignOut,
  Storefront,
  Sun,
  TrendUp,
  X,
} from '@phosphor-icons/react'
import { useAuthStore } from '../store/useAuthStore'
import { useHomeTheme } from './theme/HomeThemeProvider'

const navItems = [
  ['/directory', 'Directory', Storefront],
  ['/invest', 'Investment', TrendUp],
  ['/guide', 'Guide', Lightbulb],
  ['/commerce', 'Shop Local', ShoppingBag],
] as const

export default function Navbar() {
  const { user, role, logout } = useAuthStore()
  const { resolvedTheme, setTheme } = useHomeTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  const close = () => setMenuOpen(false)
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const logoutNow = async () => {
    close()
    await logout()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/70 text-[#0b1736] shadow-[0_8px_30px_rgba(15,23,42,.05)] backdrop-blur-2xl dark:bg-[#030506]/72 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[72px] items-center justify-between gap-3">
          <Link href="/" onClick={close} className="flex min-h-[44px] items-center gap-2.5" aria-label="FeniX Home">
            <span className="text-[23px] font-black tracking-[-.06em]">
              Feni<span className="text-teal-700 dark:text-teal-300">X</span>
            </span>
            <span className="hidden rounded-full bg-teal-600/[0.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-teal-700 dark:bg-teal-300/[0.08] dark:text-teal-200 sm:inline">
              Ecosystem
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <Link href="/" className="rounded-xl bg-black/[0.035] px-3 py-2 text-sm font-semibold text-[#0b1736] dark:bg-white/[0.05] dark:text-white">
              Home
            </Link>
            {navItems.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-black/[.035] hover:text-[#0b1736] dark:text-white/55 dark:hover:bg-white/[.045] dark:hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/guide"
              aria-label="Ask FeniX"
              className="flex h-11 items-center gap-2 rounded-xl bg-teal-600/[0.07] px-3.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-600/[0.11] dark:bg-teal-300/[0.08] dark:text-teal-100"
            >
              <MagnifyingGlass size={18} />
              <span>Ask FeniX</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[.03] text-slate-600 transition hover:bg-black/[.06] dark:bg-white/[.04] dark:text-white/70 dark:hover:bg-white/[.07]"
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <span className="max-w-[140px] truncate rounded-full bg-amber-500/[.07] px-3 py-1.5 text-xs font-medium text-amber-800 dark:bg-amber-300/[.07] dark:text-amber-200">
                  {role}
                </span>
                <button
                  type="button"
                  onClick={logoutNow}
                  className="min-h-[44px] rounded-xl bg-red-500/[.06] px-4 text-xs font-semibold text-red-700 dark:bg-red-300/[.07] dark:text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-semibold text-white transition hover:bg-[#007474]">
                <SignIn size={17} />
                Login
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[.03] text-slate-600 dark:bg-white/[.04] dark:text-white/70">
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[.03] dark:bg-white/[.04]"
            >
              {menuOpen ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-black/[.06] bg-white/95 px-4 pb-5 pt-3 backdrop-blur-2xl dark:border-white/[.06] dark:bg-[#030506]/96 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <Link href="/" onClick={close} className="flex min-h-[48px] items-center gap-3 rounded-xl bg-black/[.035] px-3 text-sm font-semibold dark:bg-white/[.05]">
              <House size={19} />
              Home
            </Link>
            {navItems.map(([href, label, Icon]) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-black/[.04] dark:text-white/70 dark:hover:bg-white/[.05]"
              >
                <Icon size={19} />
                {label}
              </Link>
            ))}

            <Link href="/guide" onClick={close} className="mt-2 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white">
              <MagnifyingGlass size={18} />
              Ask FeniX
            </Link>

            <div className="my-2 h-px bg-black/[.06] dark:bg-white/[.06]" />

            {user ? (
              <>
                <div className="rounded-xl bg-black/[.025] p-3 dark:bg-white/[.03]">
                  <div className="text-xs text-slate-400 dark:text-white/35">Signed in as</div>
                  <div className="mt-1 truncate text-sm">{user.email}</div>
                  <div className="mt-2 inline-flex rounded-full bg-amber-500/[.07] px-2 py-1 text-[10px] uppercase tracking-wider text-amber-800 dark:bg-amber-300/[.07] dark:text-amber-200">
                    {role}
                  </div>
                </div>
                <button type="button" onClick={logoutNow} className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-700 dark:text-red-300">
                  <SignOut size={19} />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={close} className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#008080] text-sm font-semibold text-white">
                <SignIn size={18} />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
