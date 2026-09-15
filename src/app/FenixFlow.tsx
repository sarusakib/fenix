'use client'

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  usePathname,
  useRouter,
} from 'next/navigation'

import FenixIntro from './FenixIntro'

const INTRO_SEEN_KEY = 'fenix_intro_seen'

function hasSeenIntro(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === 'true'
  } catch {
    // Browser storage may be unavailable or blocked.
    // Fail open so the application is never permanently blocked.
    return false
  }
}

function markIntroAsSeen(): void {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, 'true')
  } catch {
    // Storage failure must never block navigation.
  }
}

export default function FenixFlow({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const [introState, setIntroState] = useState<boolean | null>(null)

  useEffect(() => {
    /*
     * The cinematic intro belongs only to the home route.
     *
     * Every other route must immediately become available,
     * regardless of sessionStorage availability.
     */
    if (pathname !== '/') {
      setIntroState(false)
      return
    }

    setIntroState(!hasSeenIntro())
  }, [pathname])

  const handleIntroComplete = useCallback(() => {
    markIntroAsSeen()
    router.replace('/login')
  }, [router])

  /*
   * Prevent hydration mismatch while browser-only storage
   * state is being resolved.
   */
  if (introState === null) {
    return (
      <div
        className="fixed inset-0 z-[999999] min-h-screen bg-[#030506]"
        aria-hidden="true"
      />
    )
  }

  /*
   * Show the cinematic intro only on "/".
   */
  if (pathname === '/' && introState) {
    return (
      <div
        className="fixed inset-0 z-[999999] min-h-screen overflow-hidden bg-[#030506]"
      >
        <FenixIntro onComplete={handleIntroComplete} />
      </div>
    )
  }

  return <>{children}</>
}
