'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type HomeTheme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: HomeTheme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: HomeTheme) => void
}

const STORAGE_KEY = 'fenix-home-theme'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'
const LIGHT_THEME_COLOR = '#F3F7F7'
const DARK_THEME_COLOR = '#030506'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light'
  }

  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
}

function normalizeTheme(value: string | null): HomeTheme {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value
  }

  return 'system'
}

function getSavedTheme(): HomeTheme {
  if (typeof window === 'undefined') {
    return 'system'
  }

  try {
    return normalizeTheme(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return 'system'
  }
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement

  root.classList.toggle('dark', theme === 'dark')
  root.dataset.homeTheme = theme
  root.style.colorScheme = theme

  const themeColor = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  )

  themeColor?.setAttribute(
    'content',
    theme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
  )
}

function resolveTheme(theme: HomeTheme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme
}

export default function HomeThemeProvider({
  children,
}: {
  children: ReactNode
}) {
  const [theme, setThemeState] = useState<HomeTheme>('system')
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light')

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  const setTheme = useCallback((nextTheme: HomeTheme) => {
    const nextSystemTheme =
      nextTheme === 'system' ? getSystemTheme() : undefined
    const nextResolved =
      nextTheme === 'system' ? nextSystemTheme ?? 'light' : nextTheme

    setThemeState(nextTheme)

    if (nextSystemTheme) {
      setSystemTheme(nextSystemTheme)
    }

    applyTheme(nextResolved)

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // Preferences should never block navigation.
    }
  }, [])

  useEffect(() => {
    const savedTheme = getSavedTheme()
    const nextSystemTheme = getSystemTheme()

    setThemeState(savedTheme)
    setSystemTheme(nextSystemTheme)
    applyTheme(savedTheme === 'system' ? nextSystemTheme : savedTheme)
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERY)

    const handleChange = () => {
      const nextSystemTheme: ResolvedTheme = mediaQuery.matches
        ? 'dark'
        : 'light'

      setSystemTheme(nextSystemTheme)

      if (getSavedTheme() === 'system') {
        applyTheme(nextSystemTheme)
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return
      }

      const nextTheme = normalizeTheme(event.newValue)
      const nextSystemTheme =
        nextTheme === 'system' ? getSystemTheme() : systemTheme
      const nextResolved =
        nextTheme === 'system' ? nextSystemTheme : nextTheme

      setThemeState(nextTheme)

      if (nextTheme === 'system') {
        setSystemTheme(nextSystemTheme)
      }

      applyTheme(nextResolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    window.addEventListener('storage', handleStorage)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('storage', handleStorage)
    }
  }, [systemTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useHomeTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useHomeTheme must be used inside HomeThemeProvider')
  }

  return context
}
