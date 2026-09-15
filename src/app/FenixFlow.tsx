'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import {
  usePathname,
  useRouter,
} from 'next/navigation'

import FenixIntro from './FenixIntro'

const INTRO_SEEN_KEY = 'fenix_intro_seen'

function hasSeenIntro(): boolean {
  try {
    return (
      sessionStorage.getItem(INTRO_SEEN_KEY) === 'true'
    )
  } catch {
    // If sessionStorage is unavailable,
    // fail open so the application never gets
    // permanently blocked behind the intro loader.
    return false
  }
}

function markIntroAsSeen(): void {
  try {
    sessionStorage.setItem(
      INTRO_SEEN_KEY,
      'true',
    )
  } catch {
    // Ignore storage errors.
  }
}

export default function FenixFlow({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [introState, setIntroState] =
    useState<boolean | null>(null)

  useEffect(() => {
    /*
     * Resolve the initial state on the client.
     *
     * Only the home route can show the cinematic intro.
     * Every other route must always continue to the
     * application even if browser storage is unavailable.
     */
    if (pathname !== '/') {
      setIntroState(false)
      return
    }

    const introSeen = hasSeenIntro()

    setIntroState(!introSeen)
  }, [pathname])

  const handleIntroComplete = useCallback(() => {
    markIntroAsSeen()
    router.replace('/login')
  }, [router])

  /*
   * Keep the first client render deterministic while
   * the browser-only storage state is being resolved.
   */
  if (introState === null) {
    return (
      <div
        className="
          fixed
          inset-0
          z-[999999]
          min-h-screen
          bg-[#030506]
        "
        aria-hidden="true"
      />
    )
  }

  /*
   * The cinematic intro is strictly limited to "/".
   */
  if (
    pathname === '/' &&
    introState === true
  ) {
    return (
      <div
        className="
          fixed
          inset-0
          z-[999999]
          min-h-screen
          overflow-hidden
          bg-[#030506]
        "
      >
        <FenixIntro
          onComplete={handleIntroComplete}
        />
      </div>
    )
  }

  return <>{children}</>
}
