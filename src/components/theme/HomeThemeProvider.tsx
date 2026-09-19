'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type HomeTheme =
  | 'light'
  | 'dark'
  | 'system'

type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: HomeTheme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: HomeTheme) => void
}

const STORAGE_KEY = 'fenix-home-theme'

const ThemeContext =
  createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches
    ? 'dark'
    : 'light'
}

function getSavedTheme(): HomeTheme {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)

    if (
      saved === 'light' ||
      saved === 'dark' ||
      saved === 'system'
    ) {
      return saved
    }
  } catch {
    // Ignore storage errors.
  }

  return 'system'
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.homeTheme = theme
  root.style.colorScheme = theme
}

export default function HomeThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setThemeState] = useState<HomeTheme>('system')
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('dark')

  const resolvedTheme =
    theme === 'system'
      ? systemTheme
      : theme

  const setTheme = useCallback((nextTheme: HomeTheme) => {
    setThemeState(nextTheme)

    const nextResolved =
      nextTheme === 'system'
        ? getSystemTheme()
        : nextTheme

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

    applyTheme(
      savedTheme === 'system'
        ? nextSystemTheme
        : savedTheme,
    )
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)',
    )

    const handleChange = () => {
      const nextSystemTheme: ResolvedTheme =
        mediaQuery.matches
          ? 'dark'
          : 'light'

      setSystemTheme(nextSystemTheme)

      if (getSavedTheme() === 'system') {
        applyTheme(nextSystemTheme)
      }
    }

    handleChange()

    mediaQuery.addEventListener(
      'change',
      handleChange,
    )

    return () => {
      mediaQuery.removeEventListener(
        'change',
        handleChange,
      )
    }
  }, [])

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  const value = useMemo(
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
    throw new Error(
      'useHomeTheme must be used inside HomeThemeProvider',
    )
  }

  return context
}
