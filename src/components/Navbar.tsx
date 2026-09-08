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
  Sun,
  Moon,
} from '@phosphor-icons/react'

import { useAuthStore } from '../store/useAuthStore'
import { useHomeTheme } from './theme/HomeThemeProvider'

export default function Navbar() {
  const { user, role, logout } = useAuthStore()

  const {
    resolvedTheme,
    setTheme,
  } = useHomeTheme()

  const [menuOpen, setMenuOpen] =
    useState(false)

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const toggleTheme = () => {
    setTheme(
      resolvedTheme === 'dark'
        ? 'light'
        : 'dark',
    )
  }

  const handleLogout = async () => {
    closeMenu()
    await logout()
  }

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        border-b
        border-black/[0.07]
        bg-white/75
        text-[#111827]
        backdrop-blur-2xl
        dark:border-white/[0.07]
        dark:bg-[#030506]/75
        dark:text-white
      "
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[64px] items-center justify-between gap-3">

          {/* Logo */}

          <Link
            href="/"
            onClick={closeMenu}
            className="flex min-h-[44px] items-center gap-2"
            aria-label="FeniX Home"
          >
            <span
              className="
                text-xl
                font-black
                tracking-tight
                text-[#111827]
                dark:text-white
                sm:text-2xl
              "
            >
              Feni
              <span className="text-[#008080] dark:text-[#56d1ce]">
                X
              </span>
            </span>

            <span
              className="
                hidden
                rounded-full
                border
                border-[#008080]/25
                bg-[#008080]/10
                px-2
                py-0.5
                text-[9px]
                font-semibold
                uppercase
                tracking-wider
                text-[#007373]
                dark:text-[#72ddda]
                sm:inline
              "
            >
              Ecosystem
            </span>
          </Link>

          {/* Desktop Navigation */}

          <div className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className="
                rounded-lg
                px-3
                py-2
                text-sm
                text-black/60
                transition
                hover:bg-black/[0.05]
                hover:text-black
                dark:text-white/60
                dark:hover:bg-white/[0.05]
                dark:hover:text-white
              "
            >
              Home
            </Link>

            <Link
              href="/directory"
              className="
                rounded-lg
                px-3
                py-2
                text-sm
                text-black/60
                transition
                hover:bg-black/[0.05]
                hover:text-black
                dark:text-white/60
                dark:hover:bg-white/[0.05]
                dark:hover:text-white
              "
            >
              Directory
            </Link>

            <Link
              href="/invest"
              className="
                rounded-lg
                px-3
                py-2
                text-sm
                text-black/60
                transition
                hover:bg-black/[0.05]
                hover:text-black
                dark:text-white/60
                dark:hover:bg-white/[0.05]
                dark:hover:text-white
              "
            >
              Investment
            </Link>

            <Link
              href="/guide"
              className="
                rounded-lg
                px-3
                py-2
                text-sm
                text-black/60
                transition
                hover:bg-black/[0.05]
                hover:text-black
                dark:text-white/60
                dark:hover:bg-white/[0.05]
                dark:hover:text-white
              "
            >
              Guide
            </Link>
          </div>

          {/* Desktop Actions */}

          <div className="hidden items-center gap-2 md:flex">

            {/* Theme */}

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
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                border
                border-black/10
                bg-black/[0.035]
                text-black/65
                transition
                hover:bg-black/[0.07]
                hover:text-black
                dark:border-white/10
                dark:bg-white/[0.04]
                dark:text-white/70
                dark:hover:bg-white/[0.08]
                dark:hover:text-white
              "
            >
              {resolvedTheme === 'dark' ? (
                <Sun size={18} weight="bold" />
              ) : (
                <Moon size={18} weight="bold" />
              )}
            </button>

            {user ? (
              <>
                <span
                  className="
                    max-w-[180px]
                    truncate
                    rounded-full
                    border
                    border-[#d4b879]/30
                    bg-[#d4b879]/10
                    px-3
                    py-1.5
                    text-xs
                    text-[#9a751f]
                    dark:text-[#d4b879]
                  "
                >
                  {role}
                </span>

                <span
                  className="
                    max-w-[220px]
                    truncate
                    text-xs
                    text-black/45
                    dark:text-white/45
                  "
                >
                  {user.email}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    min-h-[44px]
                    rounded-xl
                    border
                    border-red-400/20
                    bg-red-500/[0.07]
                    px-4
                    text-xs
                    font-semibold
                    text-red-600
                    transition
                    hover:bg-red-500/[0.12]
                    dark:text-red-300
                  "
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="
                  flex
                  min-h-[44px]
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#008080]
                  px-4
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#079494]
                "
              >
                <SignIn size={17} />
                Login
              </Link>
            )}
          </div>

          {/* Mobile controls */}

          <div className="flex items-center gap-2 md:hidden">

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                resolvedTheme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                border
                border-black/10
                bg-black/[0.035]
                text-black/65
                transition
                hover:bg-black/[0.07]
                dark:border-white/10
                dark:bg-white/[0.04]
                dark:text-white/70
                dark:hover:bg-white/[0.08]
              "
            >
              {resolvedTheme === 'dark' ? (
                <Sun size={18} weight="bold" />
              ) : (
                <Moon size={18} weight="bold" />
              )}
            </button>

            <button
              type="button"
              onClick={() =>
                setMenuOpen((value) => !value)
              }
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                border
                border-black/10
                bg-black/[0.035]
                text-black
                transition
                hover:bg-black/[0.07]
                dark:border-white/10
                dark:bg-white/[0.04]
                dark:text-white
                dark:hover:bg-white/[0.08]
              "
              aria-label={
                menuOpen
                  ? 'Close menu'
                  : 'Open menu'
              }
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
      </div>

      {/* Mobile menu */}

      {menuOpen && (
        <div
          className="
            border-t
            border-black/[0.07]
            bg-white/95
            px-4
            pb-5
            pt-3
            backdrop-blur-2xl
            dark:border-white/[0.07]
            dark:bg-[#030506]/95
            md:hidden
          "
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">

            <Link
              href="/"
              onClick={closeMenu}
              className="
                flex
                min-h-[48px]
                items-center
                gap-3
                rounded-xl
                px-3
                text-sm
                font-medium
                text-black/70
                hover:bg-black/[0.05]
                hover:text-black
                dark:text-white/70
                dark:hover:bg-white/[0.05]
                dark:hover:text-white
              "
            >
              <House size={19} />
              Home
            </Link>

            <Link
              href="/directory"
              onClick={closeMenu}
              className="
                flex
                min-h-[48px]
                items-center
                gap-3
                rounded-xl
                px-3
                text-sm
                font-medium
                text-black/70
                hover:bg-black/[0.05]
                hover:text-black
                dark:text-white/70
                dark:hover:bg-white/[0.05]
                dark:hover:text-white
              "
            >
              <Storefront size={19} />
              Business Directory
            </Link>

            <Link
              href="/invest"
              onClick={closeMenu}
              className="
                flex
                min-h-[48px]
                items-center
                gap-3
                rounded-xl
                px-3
                text-sm
                font-medium
                text-black/70
                hover:bg-black/[0.05]
                hover:text-black
                dark:text-white/70
                dark:hover:bg-white/[0.05]
                dark:hover:text-white
              "
            >
              <TrendUp size={19} />
              Investment
            </Link>

            <Link
              href="/guide"
              onClick={closeMenu}
              className="
                flex
                min-h-[48px]
                items-center
                gap-3
                rounded-xl
                px-3
                text-sm
                font-medium
                text-black/70
                hover:bg-black/[0.05]
                hover:text-black
                dark:text-white/70
                dark:hover:bg-white/[0.05]
                dark:hover:text-white
              "
            >
              <Storefront size={19} />
              Guide
            </Link>

            <div className="my-2 h-px bg-black/[0.07] dark:bg-white/[0.06]" />

            {user ? (
              <>
                <div
                  className="
                    rounded-xl
                    border
                    border-black/[0.07]
                    bg-black/[0.025]
                    p-3
                    dark:border-white/[0.07]
                    dark:bg-white/[0.03]
                  "
                >
                  <div className="text-xs text-black/40 dark:text-white/35">
                    Signed in as
                  </div>

                  <div className="mt-1 truncate text-sm text-black/75 dark:text-white/70">
                    {user.email}
                  </div>

                  <div
                    className="
                      mt-2
                      inline-flex
                      rounded-full
                      border
                      border-[#d4b879]/30
                      bg-[#d4b879]/10
                      px-2
                      py-1
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-[#9a751f]
                      dark:text-[#d4b879]
                    "
                  >
                    {role}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    mt-1
                    flex
                    min-h-[48px]
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    text-sm
                    font-medium
                    text-red-600
                    hover:bg-red-500/[0.07]
                    dark:text-red-300
                  "
                >
                  <SignOut size={19} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="
                  mt-1
                  flex
                  min-h-[48px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#008080]
                  text-sm
                  font-semibold
                  text-white
                "
              >
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
