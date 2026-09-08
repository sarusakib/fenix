'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type HomeTheme = 'light' | 'dark' | 'system'

type HomeThemeContextValue = {
  theme: HomeTheme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: HomeTheme) => void
}

const HomeThemeContext =
  createContext<HomeThemeContextValue | null>(null)

const STORAGE_KEY = 'fenix-home-theme'

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

function applyTheme(theme: HomeTheme) {
  if (typeof document === 'undefined') {
    return
  }

  const resolved =
    theme === 'system'
      ? getSystemTheme()
      : theme

  const root = document.documentElement

  root.classList.toggle(
    'dark',
    resolved === 'dark'
  )

  root.dataset.homeTheme = theme
  root.style.colorScheme = resolved
}

export default function HomeThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [theme, setThemeState] =
    useState<HomeTheme>('system')

  const [resolvedTheme, setResolvedTheme] =
    useState<'light' | 'dark'>('dark')

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          STORAGE_KEY
        ) as HomeTheme | null

      const initialTheme =
        saved === 'light' ||
        saved === 'dark' ||
        saved === 'system'
          ? saved
          : 'system'

      setThemeState(initialTheme)

      const resolved =
        initialTheme === 'system'
          ? getSystemTheme()
          : initialTheme

      setResolvedTheme(resolved)

      applyTheme(initialTheme)
    } catch {
      applyTheme('system')
      setResolvedTheme(getSystemTheme())
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    )

    const handleSystemChange = () => {
      if (theme !== 'system') {
        return
      }

      const nextTheme =
        mediaQuery.matches
          ? 'dark'
          : 'light'

      setResolvedTheme(nextTheme)
      applyTheme('system')
    }

    mediaQuery.addEventListener(
      'change',
      handleSystemChange
    )

    return () => {
      mediaQuery.removeEventListener(
        'change',
        handleSystemChange
      )
    }
  }, [theme])

  const setTheme = (nextTheme: HomeTheme) => {
    setThemeState(nextTheme)

    const resolved =
      nextTheme === 'system'
        ? getSystemTheme()
        : nextTheme

    setResolvedTheme(resolved)

    applyTheme(nextTheme)

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        nextTheme
      )
    } catch {
      // Storage may be unavailable.
    }
  }

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme]
  )

  return (
    <HomeThemeContext.Provider value={value}>
      {children}
    </HomeThemeContext.Provider>
  )
}

export function useHomeTheme() {
  const context =
    useContext(HomeThemeContext)

  if (!context) {
    throw new Error(
      'useHomeTheme must be used inside HomeThemeProvider'
    )
  }

  return context
  }
