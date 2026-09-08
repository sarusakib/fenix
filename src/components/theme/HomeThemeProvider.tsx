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
    const saved =
      window.localStorage.getItem(STORAGE_KEY)

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
  /*
   * Keep the first render deterministic.
   * The saved preference is restored after mount.
   */
  const [theme, setThemeState] =
    useState<HomeTheme>('system')

  const [systemTheme, setSystemTheme] =
    useState<ResolvedTheme>('dark')

  const resolvedTheme =
    theme === 'system'
      ? systemTheme
      : theme

  const setTheme = useCallback(
    (nextTheme: HomeTheme) => {
      setThemeState(nextTheme)

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          nextTheme,
        )
      } catch {
        // Ignore storage errors.
      }
    },
    [],
  )

  useEffect(() => {
    const savedTheme = getSavedTheme()

    setThemeState(savedTheme)
    setSystemTheme(getSystemTheme())
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)',
    )

    const handleChange = () => {
      setSystemTheme(
        mediaQuery.matches
          ? 'dark'
          : 'light',
      )
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
    const root =
      document.documentElement

    root.classList.toggle(
      'dark',
      resolvedTheme === 'dark',
    )

    root.dataset.homeTheme =
      resolvedTheme

    root.style.colorScheme =
      resolvedTheme
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
  const context =
    useContext(ThemeContext)

  if (!context) {
    throw new Error(
      'useHomeTheme must be used inside HomeThemeProvider',
    )
  }

  return context
}
