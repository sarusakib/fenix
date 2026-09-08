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
export type ResolvedHomeTheme = 'light' | 'dark'

interface HomeThemeContextValue {
  theme: HomeTheme
  resolvedTheme: ResolvedHomeTheme
  setTheme: (theme: HomeTheme) => void
}

const HomeThemeContext = createContext<HomeThemeContextValue | undefined>(
  undefined,
)

const STORAGE_KEY = 'fenix-home-theme'

function getSystemTheme(): ResolvedHomeTheme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getInitialTheme(): HomeTheme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)

    if (
      storedTheme === 'light' ||
      storedTheme === 'dark' ||
      storedTheme === 'system'
    ) {
      return storedTheme
    }
  } catch {
    // localStorage may be unavailable.
  }

  return 'dark'
}

export default function HomeThemeProvider({
  children,
}: {
  children: ReactNode
}) {
  const [theme, setThemeState] = useState<HomeTheme>('dark')
  const [mounted, setMounted] = useState(false)

  const setTheme = useCallback((nextTheme: HomeTheme) => {
    setThemeState(nextTheme)

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme)
    } catch {
      // Ignore storage errors and keep theme in memory.
    }
  }, [])

  const resolvedTheme: ResolvedHomeTheme = useMemo(() => {
    if (theme === 'system') {
      return getSystemTheme()
    }

    return theme
  }, [theme])

  /* Load saved theme after hydration */
  useEffect(() => {
    setThemeState(getInitialTheme())
    setMounted(true)
  }, [])

  /* Apply theme to <html> */
  useEffect(() => {
    if (!mounted) {
      return
    }

    const root = document.documentElement

    root.classList.toggle('dark', resolvedTheme === 'dark')

    root.dataset.homeTheme = theme
    root.style.colorScheme = resolvedTheme
  }, [mounted, theme, resolvedTheme])

  /* Follow OS theme when "system" is selected */
  useEffect(() => {
    if (!mounted || theme !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)',
    )

    const handleChange = () => {
      const nextResolvedTheme = mediaQuery.matches
        ? 'dark'
        : 'light'

      document.documentElement.classList.toggle(
        'dark',
        nextResolvedTheme === 'dark',
      )

      document.documentElement.style.colorScheme =
        nextResolvedTheme
    }

    handleChange()

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [mounted, theme])

  const value = useMemo<HomeThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  )

  return (
    <HomeThemeContext.Provider value={value}>
      {children}
    </HomeThemeContext.Provider>
  )
}

export function useHomeTheme(): HomeThemeContextValue {
  const context = useContext(HomeThemeContext)

  if (!context) {
    throw new Error(
      'useHomeTheme must be used inside HomeThemeProvider',
    )
  }

  return context
}
