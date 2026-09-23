'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Bell, CaretDown, House, Lightbulb, List, MagnifyingGlass, Moon, ShieldCheck, SignIn, SignOut,
  Sun, TrendUp, UsersThree, X, UserCircle, Newspaper,
} from '@phosphor-icons/react'
import { useAuthStore } from '../store/useAuthStore'
import { useHomeTheme } from './theme/HomeThemeProvider'
import { useFenixLocale } from './i18n/FenixLocaleProvider'
import ServiceHub from './ServiceHub'

export default function Navbar() {
  const { user, role, logout } = useAuthStore()
  const { resolvedTheme, setTheme } = useHomeTheme()
  const { locale } = useFenixLocale()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const bn = locale === 'bn'

  const closeMenus = () => { setMenuOpen(false); setExploreOpen(false) }
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenus() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const exploreActive =
    pathname === '/search' ||
    pathname === '/services' ||
    pathname === '/start' || pathname?.startsWith('/start/') ||
    pathname?.startsWith('/directory') ||
    pathname?.startsWith('/commerce') ||
    pathname === '/jobs' || pathname === '/radar'

  return (
    <header className="sticky top-0 z-[80] border-b border-[var(--fx-border)] bg-[var(--fx-bg)]/90 text-[var(--fx-text)] backdrop-blur-2xl">
      <nav aria-label="Primary navigation" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[68px] items-center justify-between gap-3">
          <Link href="/" onClick={closeMenus} className="flex min-h-11 items-center gap-2.5" aria-label="FeniX home">
            <span className="text-[23px] font-black tracking-[-.07em]">Feni<span className="text-[var(--fx-primary-strong)]">X</span></span>
            <span className="hidden rounded-full border border-[var(--fx-border)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[.13em] text-[var(--fx-muted)] sm:inline">Feni ecosystem</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <NavLink href="/" active={pathname === '/'}><House size={17}/> {bn ? 'হোম' : 'Home'}</NavLink>
            <NavLink href="/search" active={pathname === '/search'}><MagnifyingGlass size={17}/> {bn ? 'সার্চ' : 'Search'}</NavLink>
            <NavLink href="/feed" active={pathname === '/feed' || pathname?.startsWith('/feed/')}><UsersThree size={17}/> {bn ? 'ফিড' : 'Feed'}</NavLink>
            <button type="button" aria-expanded={exploreOpen} aria-haspopup="true" onClick={() => setExploreOpen(v => !v)} className={'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold transition ' + (exploreActive ? 'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]' : 'text-[var(--fx-muted)] hover:bg-black/[.03] dark:hover:bg-white/[.035]')}>
              <List size={17}/>{bn ? 'এক্সপ্লোর' : 'Explore'}<CaretDown size={14} className={exploreOpen ? 'rotate-180 transition-transform' : 'transition-transform'}/>
            </button>
            <NavLink href="/invest" active={pathname?.startsWith('/invest')}><TrendUp size={17}/> {bn ? 'ইনভেস্ট' : 'Invest'}</NavLink>
            <NavLink href="/news" active={pathname?.startsWith('/news')}><Newspaper size={17}/> {bn ? 'নিউজ' : 'News'}</NavLink>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/guide" aria-label="Ask Feni Brain" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-3.5 text-sm font-bold text-[var(--fx-primary-strong)]">
              <Lightbulb size={18} weight="duotone"/>{bn ? 'ব্রেইন' : 'Ask Brain'}
            </Link>
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-muted)]">
              {resolvedTheme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            {user && <Link href="/notifications" aria-label={bn ? 'নোটিফিকেশন' : 'Notifications'} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-muted)]"><Bell size={18}/></Link>}
            {role === 'admin' && user && <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-3.5 text-sm font-bold text-[var(--fx-primary-strong)]"><ShieldCheck size={17}/> {bn ? 'অ্যাডমিন' : 'Admin'}</Link>}
            {user ? (
              <>
                <Link href="/profile" aria-label={bn ? 'প্রোফাইল' : 'Profile'} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-muted)]"><UserCircle size={19}/></Link>
                <button type="button" onClick={() => void logout()} className="min-h-11 rounded-xl border border-red-500/15 bg-red-500/[.055] px-3.5 text-xs font-bold text-red-700 dark:text-red-300">{bn ? 'Logout' : 'Logout'}</button>
              </>
            ) : <Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white"><SignIn size={17}/> {bn ? 'লগইন' : 'Login'}</Link>}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)]">
              {resolvedTheme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <button type="button" onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? (bn ? 'মেনু বন্ধ' : 'Close menu') : (bn ? 'মেনু খুলুন' : 'Open menu')} aria-expanded={menuOpen} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)]">
              {menuOpen ? <X size={22}/> : <List size={22}/>}
            </button>
          </div>
        </div>
      </nav>

      {exploreOpen && (
        <div className="hidden border-t border-[var(--fx-border)] bg-[var(--fx-bg)]/96 px-4 py-4 backdrop-blur-2xl md:block">
          <div className="mx-auto max-h-[72vh] max-w-6xl overflow-y-auto">
            <ServiceHub compact onNavigate={closeMenus} showHeader={false}/>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="border-t border-[var(--fx-border)] bg-[var(--fx-bg)]/98 px-4 pb-6 pt-3 backdrop-blur-2xl md:hidden">
          <div className="mx-auto max-w-xl">
            <div className="grid grid-cols-2 gap-2">
              <MobileLink href="/" onClick={closeMenus}><House size={18}/> {bn ? 'হোম' : 'Home'}</MobileLink>
              <MobileLink href="/search" onClick={closeMenus} emphasized><MagnifyingGlass size={18}/> {bn ? 'সার্চ' : 'Search'}</MobileLink>
              <MobileLink href="/feed" onClick={closeMenus} emphasized><UsersThree size={18}/> {bn ? 'ফিড' : 'Feed'}</MobileLink>
              <MobileLink href="/guide" onClick={closeMenus} emphasized><Lightbulb size={18}/> {bn ? 'ব্রেইন' : 'Brain'}</MobileLink>
              <MobileLink href="/news" onClick={closeMenus} emphasized><Newspaper size={18}/> {bn ? 'নিউজ' : 'News'}</MobileLink>
              <MobileLink href="/services" onClick={closeMenus}><List size={18}/> {bn ? 'সব সার্ভিস' : 'All services'}</MobileLink>
              <MobileLink href="/invest" onClick={closeMenus}><TrendUp size={18}/> {bn ? 'ইনভেস্ট' : 'Invest'}</MobileLink>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <MobileLink href="/directory" onClick={closeMenus}>{bn ? 'ডিরেক্টরি' : 'Directory'}</MobileLink>
              <MobileLink href="/commerce" onClick={closeMenus}>{bn ? 'শপ' : 'Shop local'}</MobileLink>
              <MobileLink href="/messages" onClick={closeMenus}><UserCircle size={18}/> {bn ? 'মেসেজ' : 'Messages'}</MobileLink>
              <MobileLink href="/dashboard/settings" onClick={closeMenus}><ShieldCheck size={18}/> {bn ? 'সেটিংস' : 'Settings'}</MobileLink>
            </div>

            {user ? (
              <div className="mt-3 rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
                <p className="text-[10px] font-black uppercase tracking-[.15em] text-[var(--fx-muted)]">{bn ? 'Logged in' : 'Signed in'}</p>
                <p className="mt-1 truncate text-sm font-semibold">{user.email}</p>
                {role && <span className="mt-2 inline-flex rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fx-primary-strong)]">{role}</span>}
                {role === 'admin' && <Link href="/admin" onClick={closeMenus} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] text-xs font-bold text-[var(--fx-primary-strong)]"><ShieldCheck size={17}/> {bn ? 'অ্যাডমিন' : 'Admin Center'}</Link>}
                <button type="button" onClick={() => { closeMenus(); void logout() }} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500/[.055] text-xs font-bold text-red-700 dark:text-red-300"><SignOut size={18}/> Logout</button>
              </div>
            ) : (
              <Link href="/login" onClick={closeMenus} className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] text-sm font-bold text-white"><SignIn size={18}/> {bn ? 'লগইন' : 'Login'}</Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} className={'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold transition ' + (active ? 'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]' : 'text-[var(--fx-muted)] hover:bg-black/[.03] dark:hover:bg-white/[.035]')}>{children}</Link>
}

function MobileLink({ href, onClick, emphasized = false, children }: { href: string; onClick: () => void; emphasized?: boolean; children: React.ReactNode }) {
  return <Link href={href} onClick={onClick} className={'flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold ' + (emphasized ? 'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]' : 'bg-black/[.025] text-[var(--fx-text)] dark:bg-white/[.035]')}>{children}</Link>
}
