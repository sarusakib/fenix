'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  DeviceMobile,
  Moon,
  ShieldCheck,
  Sun,
  Desktop,
} from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { useHomeTheme, type HomeTheme } from '@/components/theme/HomeThemeProvider'

const THEMES: Array<{ key: HomeTheme; label: string; icon: typeof Sun }> = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'system', label: 'System', icon: Desktop },
  { key: 'dark', label: 'Dark', icon: Moon },
]

export default function DashboardSettingsPage() {
  const { theme, setTheme } = useHomeTheme()
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    try {
      setReduceMotion(localStorage.getItem('fenix-reduce-motion') === 'true')
    } catch {
      // Ignore unavailable storage.
    }
  }, [])

  const changeMotion = (enabled: boolean) => {
    setReduceMotion(enabled)
    try {
      localStorage.setItem('fenix-reduce-motion', String(enabled))
      document.documentElement.dataset.reduceMotion = enabled ? 'true' : 'false'
    } catch {
      // Keep the UI usable even when browser storage is blocked.
    }
  }

  return (
    <main className="min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 pb-28 pt-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-black/[.03] px-3.5 text-xs font-bold dark:bg-white/[.04]">
          <ArrowLeft size={16} /> Account
        </Link>

        <div className="mt-7">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-teal-700 dark:text-teal-300">Settings</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-5xl">Make FeniX yours.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/45">
            Preferences are designed to stay light: appearance and accessibility choices live on your device unless a future account setting is explicitly added.
          </p>
        </div>

        <section className="fenix-surface-strong mt-8 rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-600/[.08] text-teal-700 dark:bg-teal-300/[.08] dark:text-teal-200">
              <Sun size={22} weight="duotone" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black">Appearance</h2>
              <p className="mt-1 text-sm leading-6 opacity-55">Choose light, dark or follow your device automatically.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {THEMES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTheme(key)}
                aria-pressed={theme === key}
                className={
                  'flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-bold transition ' +
                  (theme === key
                    ? 'border-teal-600/[.18] bg-teal-600/[.08] text-teal-800 dark:border-teal-300/[.18] dark:bg-teal-300/[.08] dark:text-teal-100'
                    : 'border-black/[.06] bg-black/[.015] text-slate-500 hover:bg-black/[.04] dark:border-white/[.07] dark:bg-white/[.02] dark:text-white/45 dark:hover:bg-white/[.05]')
                }
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="fenix-surface mt-4 rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black/[.03] text-slate-700 dark:bg-white/[.04] dark:text-white/70">
                <DeviceMobile size={22} weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-black">Phone-friendly mode</h2>
                <p className="mt-1 text-sm leading-6 opacity-55">FeniX is responsive from compact phones to large desktop screens, with a mobile navigation dock.</p>
              </div>
            </div>
            <CheckCircle size={20} className="shrink-0 text-teal-700 dark:text-teal-200" />
          </div>
          <div className="mt-5 rounded-2xl bg-black/[.025] p-4 text-sm leading-6 text-slate-600 dark:bg-white/[.025] dark:text-white/50">
            The web app manifest is enabled. On browsers that support PWA installation, use the browser menu and choose <strong>Add to Home screen</strong> or <strong>Install app</strong>.
          </div>
        </section>

        <section className="fenix-surface mt-4 rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-500/[.08] text-amber-700 dark:bg-amber-300/[.08] dark:text-amber-200">
                <ShieldCheck size={22} weight="duotone" />
              </div>
              <div>
                <h2 className="text-lg font-black">Reduced motion</h2>
                <p className="mt-1 text-sm leading-6 opacity-55">Keep interactions calmer and minimize extra transitions on this device.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reduceMotion}
              onClick={() => changeMotion(!reduceMotion)}
              className={'relative h-7 w-12 shrink-0 rounded-full transition ' + (reduceMotion ? 'bg-teal-600' : 'bg-black/[.12] dark:bg-white/[.12]')}
            >
              <span className={'absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ' + (reduceMotion ? 'left-6' : 'left-1')} />
            </button>
          </div>
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link href="/policy" className="group rounded-3xl border border-black/[.07] bg-white/70 p-5 dark:border-white/[.07] dark:bg-white/[.03]">
            <h2 className="font-black">Privacy & Policy</h2>
            <p className="mt-1 text-sm leading-6 opacity-55">Understand public data, verification and responsible AI rules.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">Open Policy <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
          </Link>
          <Link href="/help" className="group rounded-3xl border border-black/[.07] bg-white/70 p-5 dark:border-white/[.07] dark:bg-white/[.03]">
            <h2 className="font-black">Help & Safety</h2>
            <p className="mt-1 text-sm leading-6 opacity-55">Find quick answers before you act on important information.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold">Open Help <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
          </Link>
        </section>
      </section>
    </main>
  )
}
