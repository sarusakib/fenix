'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  Bell,
  CaretDown,
  GearSix,
  House,
  Lightbulb,
  List,
  MagnifyingGlass,
  Moon,
  ShieldCheck,
  SignIn,
  SignOut,
  Sun,
  Storefront,
  TrendUp,
  X,
  UserCircle,
} from '@phosphor-icons/react'
import { useAuthStore } from '../store/useAuthStore'
import { useHomeTheme } from './theme/HomeThemeProvider'
import ServiceHub from './ServiceHub'

export default function Navbar() {
  const { user, role, logout } = useAuthStore()
  const { resolvedTheme, setTheme } = useHomeTheme()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  const close = () => {
    setMenuOpen(false)
    setServicesOpen(false)
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const logoutNow = async () => {
    close()
    await logout()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setServicesOpen(false)
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const isServicesActive =
    pathname?.startsWith('/services') ||
    pathname === '/start' ||
    pathname?.startsWith('/directory') ||
    pathname?.startsWith('/invest') ||
    pathname?.startsWith('/commerce') ||
    pathname?.startsWith('/guide')

  return (
    <nav className="sticky top-0 z-[80] bg-white/78 text-[#0b1736] shadow-[0_10px_34px_rgba(15,23,42,.055)] backdrop-blur-2xl dark:bg-[#030506]/78 dark:text-white dark:shadow-[0_10px_34px_rgba(0,0,0,.22)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[70px] items-center justify-between gap-3">
          <Link href="/" onClick={close} className="group flex min-h-[44px] items-center gap-2.5" aria-label="FeniX Home">
            <span className="text-[23px] font-black tracking-[-.065em]">
              Feni<span className="text-teal-700 dark:text-teal-300">X</span>
            </span>
            <span className="hidden rounded-full bg-teal-600/[.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-teal-700 transition group-hover:bg-teal-600/[.11] dark:bg-teal-300/[.08] dark:text-teal-200 sm:inline">
              Ecosystem
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink href="/" active={pathname === '/'}>
              <House size={17} /> Home
            </NavLink>

            <button
              type="button"
              aria-expanded={servicesOpen}
              aria-haspopup="dialog"
              onClick={() => setServicesOpen((value) => !value)}
              className={
                'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ' +
                (isServicesActive
                  ? 'bg-teal-600/[.08] text-teal-800 dark:bg-teal-300/[.08] dark:text-teal-100'
                  : 'text-slate-600 hover:bg-black/[.035] hover:text-[#0b1736] dark:text-white/55 dark:hover:bg-white/[.045] dark:hover:text-white')
              }
            >
              <Storefront size={17} />
              Services
              <CaretDown size={15} className={servicesOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>

            <NavLink href="/directory" active={pathname?.startsWith('/directory')}>
              Directory
            </NavLink>
            <NavLink href="/invest" active={pathname?.startsWith('/invest')}>
              <TrendUp size={17} /> Invest
            </NavLink>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/guide"
              aria-label="Ask Feni Brain"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-600/[.07] px-3.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-600/[.11] dark:bg-teal-300/[.08] dark:text-teal-100"
            >
              <Lightbulb size={18} weight="duotone" />
              <span>Ask Brain</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[.03] text-slate-600 transition hover:bg-black/[.06] dark:bg-white/[.04] dark:text-white/70 dark:hover:bg-white/[.07]"
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user && (
              <Link href="/notifications" aria-label="Notifications" className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[.03] text-slate-600 transition hover:bg-black/[.06] dark:bg-white/[.04] dark:text-white/70 dark:hover:bg-white/[.07]">
                <Bell size={18} />
              </Link>
            )}

            {user ? (
              <>
                {role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-600/[.07] px-3.5 text-sm font-semibold text-teal-800 dark:bg-teal-300/[.08] dark:text-teal-100"
                  >
                    <ShieldCheck size={17} />
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  aria-label="Account"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[.03] text-slate-600 transition hover:bg-black/[.06] dark:bg-white/[.04] dark:text-white/70 dark:hover:bg-white/[.07]"
                >
                  <UserCircle size={19} />
                </Link>
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

      {servicesOpen && (
        <div className="hidden border-t border-black/[.055] bg-white/88 px-4 py-3 backdrop-blur-2xl dark:border-white/[.06] dark:bg-[#05090d]/92 md:block">
          <div className="mx-auto max-h-[72vh] max-w-5xl overflow-y-auto pr-1">
            <ServiceHub compact onNavigate={() => setServicesOpen(false)} />
            <div className="mt-3 flex justify-end">
              <Link
                href="/services"
                onClick={() => setServicesOpen(false)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0b1736] px-3.5 text-xs font-bold text-white dark:bg-white/[.1]"
              >
                Open full service hub <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="border-t border-black/[.055] bg-white/96 px-4 pb-5 pt-3 backdrop-blur-2xl dark:border-white/[.06] dark:bg-[#030506]/97 md:hidden">
          <div className="mx-auto max-w-xl">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" onClick={close} className="flex min-h-12 items-center gap-3 rounded-xl bg-black/[.035] px-3 text-sm font-semibold dark:bg-white/[.05]">
                <House size={18} /> Home
              </Link>
              <Link href="/guide" onClick={close} className="flex min-h-12 items-center gap-3 rounded-xl bg-teal-600/[.08] px-3 text-sm font-semibold text-teal-800 dark:bg-teal-300/[.08] dark:text-teal-100">
                <Lightbulb size={18} /> Ask Brain
              </Link>
            </div>

            <div className="mt-3 rounded-2xl border border-black/[.06] bg-black/[.018] p-2 dark:border-white/[.07] dark:bg-white/[.02]">
              <div className="px-2 pb-2 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-[.17em] text-teal-700 dark:text-teal-300">Services</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-white/40">Tap a path to reveal its tools.</p>
              </div>
              <ServiceHub compact onNavigate={close} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/dashboard" onClick={close} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-black/[.04] dark:text-white/70 dark:hover:bg-white/[.05]">
                <GearSix size={18} /> My account
              </Link>
              <Link href="/notifications" onClick={close} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-black/[.04] dark:text-white/70 dark:hover:bg-white/[.05]">
                <Bell size={18} /> Notifications
              </Link>
            </div>

            {user ? (
              <div className="mt-3 rounded-2xl bg-black/[.025] p-4 dark:bg-white/[.03]">
                <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400 dark:text-white/30">Signed in as</div>
                <div className="mt-1 truncate text-sm">{user.email}</div>
                <div className="mt-2 inline-flex rounded-full bg-amber-500/[.07] px-2 py-1 text-[10px] uppercase tracking-[.12em] text-amber-800 dark:bg-amber-300/[.07] dark:text-amber-200">
                  {role}
                </div>
                {role === 'admin' && (
                  <Link href="/admin" onClick={close} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-600/[.08] text-xs font-bold text-teal-800 dark:bg-teal-300/[.08] dark:text-teal-100">
                    <ShieldCheck size={17} /> Admin control center
                  </Link>
                )}
                <button type="button" onClick={logoutNow} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500/[.06] text-xs font-bold text-red-700 dark:bg-red-300/[.07] dark:text-red-300">
                  <SignOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={close} className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#008080] text-sm font-semibold text-white">
                <SignIn size={18} /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={
        'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition ' +
        (active
          ? 'bg-black/[.035] text-[#0b1736] dark:bg-white/[.055] dark:text-white'
          : 'text-slate-600 hover:bg-black/[.035] hover:text-[#0b1736] dark:text-white/55 dark:hover:bg-white/[.045] dark:hover:text-white')
      }
    >
      {children}
    </Link>
  )
}
