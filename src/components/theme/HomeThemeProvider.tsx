'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type HomeTheme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: HomeTheme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: HomeTheme) => void
}

const STORAGE_KEY = 'fenix-home-theme'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches
    ? 'dark'
    : 'light'
}

function getInitialTheme(): HomeTheme {
  if (typeof window === 'undefined') {
    return 'system'
  }

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

export default function HomeThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setThemeState] =
    useState<HomeTheme>(getInitialTheme)

  const [systemTheme, setSystemTheme] =
    useState<'light' | 'dark'>(getSystemTheme)

  const resolvedTheme =
    theme === 'system' ? systemTheme : theme

  const setTheme = useCallback((nextTheme: HomeTheme) => {
    setThemeState(nextTheme)

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        nextTheme
      )
    } catch {
      // Ignore storage errors.
    }
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    )

    const updateSystemTheme = () => {
      setSystemTheme(
        mediaQuery.matches ? 'dark' : 'light'
      )
    }

    updateSystemTheme()

    mediaQuery.addEventListener(
      'change',
      updateSystemTheme
    )

    return () => {
      mediaQuery.removeEventListener(
        'change',
        updateSystemTheme
      )
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement

    root.classList.toggle(
      'dark',
      resolvedTheme === 'dark'
    )

    root.dataset.homeTheme = resolvedTheme

    root.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
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
      'useHomeTheme must be used inside HomeThemeProvider'
    )
  }

  return context
}
