'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  List,
  X,
  House,
  Storefront,
  TrendUp,
  SignIn,
  SignOut,
} from '@phosphor-icons/react'

import { useAuthStore } from '../store/useAuthStore'

export default function Navbar() {
  const { user, role, logout } = useAuthStore()

  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const handleLogout = async () => {
    closeMenu()
    await logout()
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#030506]/80 text-white backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[64px] items-center justify-between gap-3">

            {/* Logo */}
            <Link
              href="/"
              onClick={closeMenu}
              className="flex min-h-[44px] items-center gap-2"
              aria-label="FeniX Home"
            >
              <span className="text-xl font-black tracking-tight text-white sm:text-2xl">
                Feni
                <span className="text-[#56d1ce]">X</span>
              </span>

              <span className="hidden rounded-full border border-[#008080]/25 bg-[#008080]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#72ddda] sm:inline">
                Ecosystem
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/"
                className="rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/directory"
                className="rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
              >
                Directory
              </Link>

              <Link
                href="/invest"
                className="rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
              >
                Investment
              </Link>

              <Link
                href="/guide"
                className="rounded-lg px-3 py-2 text-sm text-white/60 transition hover:bg-white/[0.05] hover:text-white"
              >
                Guide
              </Link>
            </div>

            {/* Desktop auth */}
            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <>
                  <span className="max-w-[180px] truncate rounded-full border border-[#d4b879]/20 bg-[#d4b879]/[0.06] px-3 py-1.5 text-xs text-[#d4b879]">
                    {role}
                  </span>

                  <span className="max-w-[220px] truncate text-xs text-white/45">
                    {user.email}
                  </span>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="min-h-[44px] rounded-xl border border-red-400/15 bg-red-500/[0.07] px-4 text-xs font-semibold text-red-300 transition hover:bg-red-500/[0.12]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-semibold text-white transition hover:bg-[#079494]"
                >
                  <SignIn size={17} />
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08] md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X size={22} />
              ) : (
                <List size={22} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-white/[0.07] bg-[#030506]/95 px-4 pb-5 pt-3 backdrop-blur-2xl md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">

              <Link
                href="/"
                onClick={closeMenu}
                className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/70 hover:bg-white/[0.05] hover:text-white"
              >
                <House size={19} />
                Home
              </Link>

              <Link
                href="/directory"
                onClick={closeMenu}
                className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/70 hover:bg-white/[0.05] hover:text-white"
              >
                <Storefront size={19} />
                Business Directory
              </Link>

              <Link
                href="/invest"
                onClick={closeMenu}
                className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/70 hover:bg-white/[0.05] hover:text-white"
              >
                <TrendUp size={19} />
                Investment
              </Link>

              <Link
                href="/guide"
                onClick={closeMenu}
                className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/70 hover:bg-white/[0.05] hover:text-white"
              >
                <Storefront size={19} />
                Guide
              </Link>

              <div className="my-2 h-px bg-white/[0.06]" />

              {user ? (
                <>
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                    <div className="text-xs text-white/35">
                      Signed in as
                    </div>

                    <div className="mt-1 truncate text-sm text-white/70">
                      {user.email}
                    </div>

                    <div className="mt-2 inline-flex rounded-full border border-[#d4b879]/20 bg-[#d4b879]/[0.06] px-2 py-1 text-[10px] uppercase tracking-wider text-[#d4b879]">
                      {role}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-300 hover:bg-red-500/[0.07]"
                  >
                    <SignOut size={19} />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="mt-1 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#008080] text-sm font-semibold text-white"
                >
                  <SignIn size={18} />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
