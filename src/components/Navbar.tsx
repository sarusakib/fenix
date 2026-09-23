'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Bell, CaretDown, House, Lightbulb, List, Moon, ShieldCheck, SignIn, SignOut,
  Sun, Storefront, TrendUp, UsersThree, X, UserCircle,
} from '@phosphor-icons/react'
import { useAuthStore } from '../store/useAuthStore'
import { useHomeTheme } from './theme/HomeThemeProvider'
import { useFenixLocale } from './i18n/FenixLocaleProvider'
import ServiceHub from './ServiceHub'

export default function Navbar() {
 const {user,role,logout}=useAuthStore(); const {resolvedTheme,setTheme}=useHomeTheme(); const {locale}=useFenixLocale(); const pathname=usePathname()
 const [menuOpen,setMenuOpen]=useState(false); const [servicesOpen,setServicesOpen]=useState(false)
 const bn=locale==='bn'
 const closeMenus=()=>{setMenuOpen(false);setServicesOpen(false)}
 const toggleTheme=()=>setTheme(resolvedTheme==='dark'?'light':'dark')
 useEffect(()=>{const fn=(e:KeyboardEvent)=>{if(e.key==='Escape')closeMenus()};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn)},[])
 const servicesActive=pathname==='/services'||pathname==='/start'||pathname?.startsWith('/start/')||pathname?.startsWith('/directory')||pathname?.startsWith('/invest')||pathname?.startsWith('/commerce')||pathname?.startsWith('/guide')||pathname==='/jobs'||pathname==='/radar'
 return <header className="sticky top-0 z-[80] border-b border-[var(--fx-border)] bg-[var(--fx-bg)]/82 text-[var(--fx-text)] backdrop-blur-2xl">
  <nav aria-label="Primary navigation" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
   <div className="flex min-h-[68px] items-center justify-between gap-3">
    <Link href="/" onClick={closeMenus} className="group flex min-h-11 items-center" aria-label="FeniX home"><img src="/fenix-logo.svg" alt="FeniX — Feni Business Ecosystem" width="260" height="64" className="block h-10 w-auto max-w-[180px] object-contain dark:hidden sm:max-w-none" /><img src="/fenix-logo-dark.svg" alt="" aria-hidden="true" width="260" height="64" className="hidden h-10 w-auto max-w-[180px] object-contain dark:block sm:max-w-none" /></Link>

    <div className="hidden items-center gap-1 md:flex">
      <NavLink href="/" active={pathname==='/' }><House size={17}/> {bn?'হোম':'Home'}</NavLink>
      <NavLink href="/feed" active={pathname==='/feed'||pathname?.startsWith('/feed/')}><UsersThree size={17}/> {bn?'ফিড':'Feed'}</NavLink>
      <button type="button" aria-expanded={servicesOpen} aria-haspopup="true" onClick={()=>setServicesOpen(v=>!v)} className={'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold transition '+(servicesActive?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'text-[var(--fx-muted)] hover:bg-black/[.03] dark:hover:bg-white/[.035]')}><Storefront size={17}/>{bn?'সার্ভিস':'Services'}<CaretDown size={14} className={servicesOpen?'rotate-180 transition-transform':'transition-transform'}/></button>
      <NavLink href="/directory" active={pathname?.startsWith('/directory')}><span className="text-sm">⌕</span> {bn?'এক্সপ্লোর':'Explore'}</NavLink>
      <NavLink href="/invest" active={pathname?.startsWith('/invest')}><TrendUp size={17}/> {bn?'ইনভেস্ট':'Invest'}</NavLink>
    </div>

    <div className="hidden items-center gap-2 md:flex">
      <Link href="/guide" aria-label="Ask Feni Brain" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-3.5 text-sm font-bold text-[var(--fx-primary-strong)]"><Lightbulb size={18} weight="duotone"/>{bn?'ব্রেইন':'Ask Brain'}</Link>
      <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-muted)]">{resolvedTheme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
      {user&&<Link href="/notifications" aria-label={bn?'নোটিফিকেশন':'Notifications'} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-muted)]"><Bell size={18}/></Link>}
      {role==='admin'&&user&&<Link href="/admin" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] px-3.5 text-sm font-bold text-[var(--fx-primary-strong)]"><ShieldCheck size={17}/> {bn?'অ্যাডমিন':'Admin'}</Link>}
      {user?<><Link href="/profile" aria-label={bn?'প্রোফাইল':'Profile'} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] text-[var(--fx-muted)]"><UserCircle size={19}/></Link><button type="button" onClick={()=>void logout()} className="min-h-11 rounded-xl border border-red-500/15 bg-red-500/[.055] px-3.5 text-xs font-bold text-red-700 dark:text-red-300">{bn?'Logout':'Logout'}</button></>:<Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-sm font-bold text-white"><SignIn size={17}/> {bn?'লগইন':'Login'}</Link>}
    </div>

    <div className="flex items-center gap-2 md:hidden">
      <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)]">{resolvedTheme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
      <button type="button" onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?(bn?'মেনু বন্ধ':'Close menu'):(bn?'মেনু খুলুন':'Open menu')} aria-expanded={menuOpen} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)]">{menuOpen?<X size={22}/>:<List size={22}/>}</button>
    </div>
   </div>
  </nav>

  {servicesOpen&&<div className="hidden border-t border-[var(--fx-border)] bg-[var(--fx-bg)]/95 px-4 py-4 backdrop-blur-2xl md:block"><div className="mx-auto max-h-[78vh] max-w-6xl overflow-y-auto"><ServiceHub compact onNavigate={closeMenus} showHeader={false}/></div></div>}
  {menuOpen&&<div className="border-t border-[var(--fx-border)] bg-[var(--fx-bg)]/98 px-4 pb-6 pt-3 backdrop-blur-2xl md:hidden"><div className="mx-auto max-w-xl">
    <div className="grid grid-cols-2 gap-2"><MobileLink href="/" onClick={closeMenus}><House size={18}/> {bn?'হোম':'Home'}</MobileLink><MobileLink href="/feed" onClick={closeMenus} emphasized><UsersThree size={18}/> {bn?'ফিড':'Feed'}</MobileLink><MobileLink href="/guide" onClick={closeMenus} emphasized><Lightbulb size={18}/> {bn?'ব্রেইন':'Brain'}</MobileLink><MobileLink href="/messages" onClick={closeMenus}><UserCircle size={18}/> {bn?'মেসেজ':'Messages'}</MobileLink></div>
    <div className="mt-3 rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-2.5"><div className="px-2 pb-2 pt-1"><p className="text-[10px] font-black uppercase tracking-[.17em] text-[var(--fx-primary-strong)]">Services</p><p className="mt-1 text-xs text-[var(--fx-muted)]">{bn?'একটি service tap করুন, আগে guide দেখুন।':'Tap a service to see its guide before continuing.'}</p></div><ServiceHub compact onNavigate={closeMenus} showHeader={false}/></div>
    <div className="mt-3 grid grid-cols-2 gap-2"><MobileLink href="/directory" onClick={closeMenus}>{bn?'এক্সপ্লোর':'Explore'}</MobileLink><MobileLink href="/invest" onClick={closeMenus}><TrendUp size={18}/> {bn?'ইনভেস্ট':'Invest'}</MobileLink><MobileLink href="/profile" onClick={closeMenus}><UserCircle size={18}/> {bn?'প্রোফাইল':'Profile'}</MobileLink><MobileLink href="/dashboard/settings" onClick={closeMenus}><ShieldCheck size={18}/> {bn?'সেটিংস':'Settings'}</MobileLink></div>
    {user?<div className="mt-3 rounded-3xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><p className="text-[10px] font-black uppercase tracking-[.15em] text-[var(--fx-muted)]">{bn?'Logged in':'Signed in'}</p><p className="mt-1 truncate text-sm font-semibold">{user.email}</p>{role&&<span className="mt-2 inline-flex rounded-full bg-[var(--fx-primary-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[var(--fx-primary-strong)]">{role}</span>}{role==='admin'&&<Link href="/admin" onClick={closeMenus} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-soft)] text-xs font-bold text-[var(--fx-primary-strong)]"><ShieldCheck size={17}/> {bn?'Admin Center':'Admin Center'}</Link>}<button type="button" onClick={()=>{closeMenus();void logout()}} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500/[.055] text-xs font-bold text-red-700 dark:text-red-300"><SignOut size={18}/> Logout</button></div>:<Link href="/login" onClick={closeMenus} className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] text-sm font-bold text-white"><SignIn size={18}/> {bn?'লগইন':'Login'}</Link>}
  </div></div>}
 </header>
}

function NavLink({href,active,children}:{href:string;active:boolean;children:React.ReactNode}){return <Link href={href} className={'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold transition '+(active?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'text-[var(--fx-muted)] hover:bg-black/[.03] dark:hover:bg-white/[.035]')}>{children}</Link>}
function MobileLink({href,onClick,emphasized=false,children}:{href:string;onClick:()=>void;emphasized?:boolean;children:React.ReactNode}){return <Link href={href} onClick={onClick} className={'flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold '+(emphasized?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'bg-black/[.025] text-[var(--fx-text)] dark:bg-white/[.035]')}>{children}</Link>}
