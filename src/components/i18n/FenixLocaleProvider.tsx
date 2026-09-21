'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export type FeniXLocale = 'bn' | 'en'

type LocaleContextValue = {
  locale: FeniXLocale
  setLocale: (locale: FeniXLocale) => void
  isReady: boolean
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'bn',
  setLocale: () => undefined,
  isReady: false,
})

export function FenixLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<FeniXLocale>('bn')
  const [isReady, setReady] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const stored = localStorage.getItem('fenix-locale')
        if (stored === 'bn' || stored === 'en') setLocaleState(stored)
      } catch {}

      try {
        const s = createClient()
        const { data: auth } = await s.auth.getUser()
        if (auth.user) {
          const { data } = await s.from('profile_settings').select('locale').eq('user_id', auth.user.id).maybeSingle()
          if (active && (data?.locale === 'bn' || data?.locale === 'en')) {
            setLocaleState(data.locale)
            try { localStorage.setItem('fenix-locale', data.locale) } catch {}
          }
        }
      } catch {
        // Device preference remains the fallback.
      } finally {
        if (active) setReady(true)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  const setLocale = useCallback((next: FeniXLocale) => {
    setLocaleState(next)
    try { localStorage.setItem('fenix-locale', next) } catch {}
    document.documentElement.lang = next === 'bn' ? 'bn' : 'en'
    void (async () => {
      try {
        const s = createClient()
        const { data: auth } = await s.auth.getUser()
        if (auth.user) await s.from('profile_settings').upsert({ user_id: auth.user.id, locale: next }, { onConflict: 'user_id' })
      } catch {}
    })()
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'bn' ? 'bn' : 'en'
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, isReady }), [locale, setLocale, isReady])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useFenixLocale() {
  return useContext(LocaleContext)
}
