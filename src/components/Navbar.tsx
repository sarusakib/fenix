'use client'

import { useState } from 'react'
import Link from 'next/link'
import { List, X, House, Storefront, TrendUp, SignIn, SignOut, Sun, Moon, ShoppingBag, Lightbulb, MagnifyingGlass } from '@phosphor-icons/react'
import { useAuthStore } from '../store/useAuthStore'
import { useHomeTheme } from './theme/HomeThemeProvider'

export default function Navbar() {
  const { user, role, logout } = useAuthStore()
  const { resolvedTheme, setTheme } = useHomeTheme()
  const [menuOpen,setMenuOpen]=useState(false)
  const close=()=>setMenuOpen(false)
  const toggle=()=>setTheme(resolvedTheme==='dark'?'light':'dark')
  const logoutNow=async()=>{close();await logout()}
  const nav=[['/','Home',House],['/directory','Directory',Storefront],['/invest','Investment',TrendUp],['/guide','Guide',Lightbulb],['/commerce','Shop Local',ShoppingBag]] as const

  return <nav className="sticky top-0 z-50 border-b border-black/[0.07] bg-white/72 text-[#0b1736] backdrop-blur-2xl dark:border-white/[0.07] dark:bg-[#030506]/72 dark:text-white">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex min-h-[68px] items-center justify-between gap-3">
        <Link href="/" onClick={close} className="group flex min-h-[44px] items-center gap-2.5" aria-label="FeniX Home">
          <span className="text-[22px] font-black tracking-[-.055em]">Feni<span className="text-teal-700 dark:text-teal-300">X</span></span>
          <span className="hidden rounded-full border border-teal-600/15 bg-teal-600/[0.06] px-2 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-teal-700 dark:border-teal-300/15 dark:bg-teal-300/[0.06] dark:text-teal-200 sm:inline">Ecosystem</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {nav.map(([href,label,Icon])=><Link key={href} href={href} className="group flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-black/[.035] hover:text-[#0b1736] dark:text-white/55 dark:hover:bg-white/[.045] dark:hover:text-white">{label}</Link>)}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/guide" aria-label="Ask FeniX" className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/[.08] bg-black/[.025] text-slate-600 transition hover:bg-black/[.05] dark:border-white/[.08] dark:bg-white/[.03] dark:text-white/65"><MagnifyingGlass size={18}/></Link>
          <button type="button" onClick={toggle} aria-label={resolvedTheme==='dark'?'Switch to light mode':'Switch to dark mode'} className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/[.08] bg-black/[.025] text-slate-600 transition hover:bg-black/[.05] dark:border-white/[.08] dark:bg-white/[.03] dark:text-white/65">{resolvedTheme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
          {user ? <><span className="max-w-[150px] truncate rounded-full border border-amber-500/20 bg-amber-500/[.06] px-3 py-1.5 text-xs text-amber-800 dark:border-amber-300/20 dark:bg-amber-300/[.06] dark:text-amber-200">{role}</span><button onClick={logoutNow} className="min-h-[44px] rounded-xl border border-red-500/15 bg-red-500/[.05] px-4 text-xs font-semibold text-red-700 dark:text-red-300">Logout</button></> : <Link href="/login" className="flex min-h-[44px] items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-semibold text-white transition hover:bg-[#007474]"><SignIn size={17}/>Login</Link>}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={toggle} aria-label="Toggle theme" className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/[.08] bg-black/[.025] text-slate-600 dark:border-white/[.08] dark:bg-white/[.03] dark:text-white/65">{resolvedTheme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
          <button onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?'Close menu':'Open menu'} aria-expanded={menuOpen} className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/[.08] bg-black/[.025] dark:border-white/[.08] dark:bg-white/[.03]">{menuOpen?<X size={22}/>:<List size={22}/>}</button>
        </div>
      </div>
    </div>
    {menuOpen&&<div className="border-t border-black/[.07] bg-white/95 px-4 pb-5 pt-3 backdrop-blur-2xl dark:border-white/[.07] dark:bg-[#030506]/95 md:hidden"><div className="mx-auto flex max-w-7xl flex-col gap-1">{nav.map(([href,label,Icon])=><Link key={href} href={href} onClick={close} className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-black/[.04] dark:text-white/70 dark:hover:bg-white/[.05]"><Icon size={19}/>{label}</Link>)}<div className="my-2 h-px bg-black/[.07] dark:bg-white/[.06]"/>{user?<><div className="rounded-xl border border-black/[.07] bg-black/[.025] p-3 dark:border-white/[.07] dark:bg-white/[.03]"><div className="text-xs text-slate-400 dark:text-white/35">Signed in as</div><div className="mt-1 truncate text-sm">{user.email}</div><div className="mt-2 inline-flex rounded-full border border-amber-500/20 bg-amber-500/[.06] px-2 py-1 text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-200">{role}</div></div><button onClick={logoutNow} className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-red-700 dark:text-red-300"><SignOut size={19}/>Logout</button></>:<Link href="/login" onClick={close} className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#008080] text-sm font-semibold text-white"><SignIn size={18}/>Login</Link>}</div></div>}
  </nav>
}
