'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, BookmarkSimple, ChatCircleDots, GearSix, House, Lightbulb, List, MagnifyingGlass, Moon, ShieldCheck, SignIn, SignOut, Sun, TrendUp, X, UserCircle } from '@phosphor-icons/react'
import { useAuthStore } from '../store/useAuthStore'
import { useHomeTheme } from './theme/HomeThemeProvider'
import { useFenixLocale } from './i18n/FenixLocaleProvider'
import FenixBrand from './FenixBrand'
import { createClient } from '@/utils/supabase/client'
import { ROUTES } from '@/lib/core/routes'

export default function Navbar() {
  const { user, role, logout } = useAuthStore()
  const { resolvedTheme, setTheme } = useHomeTheme()
  const { locale } = useFenixLocale()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const bn = locale === 'bn'

  const closeMenus = () => setMenuOpen(false)
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0)
      setUnreadMessages(0)
      return
    }
    let active = true
    const s = createClient()
    void Promise.all([
      s.from('fenix_notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null),
      s.from('fenix_direct_messages').select('id', { count: 'exact', head: true }).eq('recipient_id', user.id).is('read_at', null).is('deleted_for_recipient_at', null),
    ]).then(([notifications, messages]) => {
      if (!active) return
      setUnreadNotifications(notifications.count ?? 0)
      setUnreadMessages(messages.count ?? 0)
    })
    const refresh = () => {
      void Promise.all([
        s.from('fenix_notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null),
        s.from('fenix_direct_messages').select('id', { count: 'exact', head: true }).eq('recipient_id', user.id).is('read_at', null).is('deleted_for_recipient_at', null),
      ]).then(([notifications, messages]) => {
        if (!active) return
        setUnreadNotifications(notifications.count ?? 0)
        setUnreadMessages(messages.count ?? 0)
      })
    }
    window.addEventListener('fenix:notifications-changed', refresh)
    return () => { active = false; window.removeEventListener('fenix:notifications-changed', refresh) }
  }, [user])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenus() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])


  return (
    <header className="sticky top-0 z-[80] border-b border-[var(--fx-border)] bg-[var(--fx-bg)]/88 text-[var(--fx-text)] backdrop-blur-2xl">
      <nav aria-label="Primary navigation" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[72px] items-center justify-between gap-3">
          <FenixBrand onClick={closeMenus} />

          <div className="hidden items-center gap-1 md:flex">
            <NavLink href={ROUTES.feed} active={pathname === ROUTES.feed}><House size={16}/>{bn ? 'ফিড' : 'Feed'}</NavLink>
            <NavLink href={ROUTES.search} active={pathname === ROUTES.search}><MagnifyingGlass size={16}/>{bn ? 'সার্চ' : 'Search'}</NavLink>
            <NavLink href={ROUTES.services} active={pathname === ROUTES.services}><List size={16}/>{bn ? 'নেটওয়ার্ক' : 'Network'}</NavLink>
            <Link href={ROUTES.core.messages} aria-label={bn ? 'মেসেজ' : 'Messages'} className={'group relative grid h-11 w-11 place-items-center rounded-xl transition ' + (pathname === ROUTES.core.messages ? 'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]' : 'text-[var(--fx-muted)] hover:bg-black/[.03] dark:hover:bg-white/[.035]')}>
              <ChatCircleDots size={21} weight="duotone"/>
              {unreadMessages > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white">{unreadMessages > 99 ? '99+' : unreadMessages}</span>}
              <span className="pointer-events-none absolute left-1/2 top-[calc(100%+7px)] z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] px-2 py-1 text-[10px] font-bold text-[var(--fx-text)] shadow-lg group-hover:block">{bn ? 'মেসেজ' : 'Messages'}</span>
            </Link>
            <NavLink href={ROUTES.core.guide} active={pathname === ROUTES.core.guide}><Lightbulb size={16}/>{bn ? 'ব্রেইন' : 'Brain'}</NavLink>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link href={ROUTES.investment.root} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-3.5 text-sm font-bold text-[var(--fx-primary-strong)]"><TrendUp size={17}/>{bn ? 'ইনভেস্ট' : 'Invest'}</Link>
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-muted)]">{resolvedTheme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
            {user && <Link href={ROUTES.core.notifications} aria-label={bn ? 'নোটিফিকেশন' : 'Notifications'} className={'relative grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] ' + (pathname === ROUTES.core.notifications ? 'text-[var(--fx-primary-strong)]' : 'text-[var(--fx-muted)]')}><Bell size={18}/>{unreadNotifications > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>}</Link>}
            {role === 'admin' && user && <Link href={ROUTES.admin} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-3.5 text-sm font-bold text-[var(--fx-primary-strong)]"><ShieldCheck size={17}/>{bn ? 'অ্যাডমিন' : 'Admin'}</Link>}
            {user ? (
              <div className="flex items-center gap-2">
                <Link href={ROUTES.core.profile} aria-label={bn ? 'প্রোফাইল' : 'Profile'} className={'flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-2.5 text-xs font-bold ' + (pathname?.startsWith(ROUTES.core.profile) ? 'text-[var(--fx-primary-strong)]' : '')}><UserCircle size={18}/><span className="hidden xl:inline">{bn ? 'প্রোফাইল' : 'Profile'}</span></Link>
                <Link href={ROUTES.settings} aria-label={bn ? 'সেটিংস' : 'Settings'} className={'grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] ' + (pathname?.startsWith(ROUTES.settings) ? 'text-[var(--fx-primary-strong)]' : 'text-[var(--fx-muted)]')}><GearSix size={18}/></Link>
                <button type="button" onClick={() => void logout()} className="min-h-11 rounded-xl border border-red-500/15 bg-red-500/[.055] px-3.5 text-xs font-bold text-red-700 dark:text-red-300">{bn ? 'লগআউট' : 'Logout'}</button>
              </div>
            ) : <Link href={ROUTES.auth.login} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white"><SignIn size={17}/>{bn ? 'লগইন' : 'Login'}</Link>}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {user && <Link href={ROUTES.core.messages} aria-label={bn ? 'বার্তা' : 'Messages'} className={'relative grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] ' + (pathname === ROUTES.core.messages ? 'text-[var(--fx-primary-strong)]' : 'text-[var(--fx-muted)]')}><ChatCircleDots size={21} weight="duotone"/>{unreadMessages > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white">{unreadMessages > 99 ? '99+' : unreadMessages}</span>}</Link>}
            {user && <Link href={ROUTES.core.notifications} aria-label={bn ? 'নোটিফিকেশন' : 'Notifications'} className={'relative grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] ' + (pathname === ROUTES.core.notifications ? 'text-[var(--fx-primary-strong)]' : 'text-[var(--fx-muted)]')}><Bell size={19}/>{unreadNotifications > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>}</Link>}
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)]">{resolvedTheme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
            <button type="button" onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? (bn ? 'মেনু বন্ধ' : 'Close menu') : (bn ? 'মেনু খুলুন' : 'Open menu')} aria-expanded={menuOpen} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)]">{menuOpen ? <X size={22}/> : <List size={22}/>}</button>
          </div>
        </div>
      </nav>


      {menuOpen && (
        <div className="border-t border-[var(--fx-border)] bg-[var(--fx-bg)]/98 px-4 pb-6 pt-3 backdrop-blur-2xl md:hidden">
          <div className="mx-auto max-w-xl">
            <div className="grid grid-cols-2 gap-2">
              <MobileLink href={ROUTES.feed} onClick={closeMenus} icon={<House size={18}/>} emphasized>{bn ? 'ফিড' : 'Feed'}</MobileLink>
              <MobileLink href={ROUTES.search} onClick={closeMenus} emphasized icon={<MagnifyingGlass size={18}/>}>{bn ? 'সার্চ' : 'Search'}</MobileLink>
              <MobileLink href={ROUTES.services} onClick={closeMenus} emphasized icon={<List size={18}/>}>{bn ? 'নেটওয়ার্ক' : 'Network'}</MobileLink>
              <MobileLink href={ROUTES.core.guide} onClick={closeMenus} emphasized icon={<Lightbulb size={18}/>}>{bn ? 'ব্রেইন' : 'Brain'}</MobileLink>
              {user && <MobileLink href={ROUTES.core.messages} onClick={closeMenus} emphasized icon={<ChatCircleDots size={18}/>}>{bn ? 'বার্তা' : 'Messages'}</MobileLink>}
              {user && <MobileLink href={ROUTES.core.notifications} onClick={closeMenus} emphasized icon={<Bell size={18}/>}>{bn ? 'নোটিফিকেশন' : 'Notifications'}</MobileLink>}
              <MobileLink href={ROUTES.investment.root} onClick={closeMenus} emphasized icon={<TrendUp size={18}/>}>{bn ? 'ইনভেস্ট' : 'Invest'}</MobileLink>
              <MobileLink href={ROUTES.emergency} onClick={closeMenus} icon={<ShieldCheck size={18}/>}>{bn ? 'জরুরি' : 'Emergency'}</MobileLink>
              {user && <MobileLink href={ROUTES.settings} onClick={closeMenus} icon={<GearSix size={18}/>}>{bn ? 'সেটিংস' : 'Settings'}</MobileLink>}
              {user && <MobileLink href={ROUTES.ecosystem.saved} onClick={closeMenus} icon={<BookmarkSimple size={18}/>}>{bn ? 'Saved' : 'Saved'}</MobileLink>}
              {user && <MobileLink href={ROUTES.core.profile} onClick={closeMenus} icon={<UserCircle size={18}/>}>{bn ? 'প্রোফাইল' : 'Profile'}</MobileLink>}
            </div>
            {user ? (
              <div className="mt-3 rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
                <p className="text-[10px] font-black uppercase tracking-[.15em] text-[var(--fx-muted)]">{bn ? 'আপনি লগইন আছেন' : 'Signed in'}</p>
                <p className="mt-1 truncate text-sm font-semibold">{user.email}</p>
                {role && <span className="mt-2 inline-flex rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fx-primary-strong)]">{role}</span>}
                {role === 'admin' && <Link href={ROUTES.admin} onClick={closeMenus} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] text-xs font-bold text-[var(--fx-primary-strong)]"><ShieldCheck size={17}/>{bn ? 'অ্যাডমিন' : 'Admin Center'}</Link>}
                <button type="button" onClick={() => { closeMenus(); void logout() }} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500/[.055] text-xs font-bold text-red-700 dark:text-red-300"><SignOut size={18}/>Logout</button>
              </div>
            ) : <Link href={ROUTES.auth.login} onClick={closeMenus} className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] text-sm font-bold text-white"><SignIn size={18}/>{bn ? 'লগইন' : 'Login'}</Link>}
          </div>
        </div>
      )}
    </header>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} className={'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold transition ' + (active ? 'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]' : 'text-[var(--fx-muted)] hover:bg-black/[.03] dark:hover:bg-white/[.035]')}>{children}</Link>
}
function MobileLink({ href, onClick, emphasized = false, icon, children }: { href: string; onClick: () => void; emphasized?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return <Link href={href} onClick={onClick} className={'flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold ' + (emphasized ? 'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]' : 'bg-black/[.025] text-[var(--fx-text)] dark:bg-white/[.035]')}>{icon}<span>{children}</span></Link>
}
