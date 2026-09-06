'use client'

import { useEffect } from 'react'
import { createClient } from '../utils/supabase/client'
import { useAuthStore } from '../store/useAuthStore'

export default function AuthSync() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const loadInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (session) {
        setAuth(session)
      } else {
        clearAuth()
      }
    }

    void loadInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuth(session)
      } else {
        clearAuth()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setAuth, clearAuth])

  return null
}
