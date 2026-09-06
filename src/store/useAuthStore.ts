import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { createClient } from '../utils/supabase/client'

export type UserRole =
  | 'user'
  | 'entrepreneur'
  | 'investor'
  | 'field_agent'
  | 'admin'

interface AuthState {
  user: User | null
  session: Session | null
  role: UserRole
  isLocked: boolean
  failedAttempts: number
  setAuth: (session: Session | null) => void
  setUser: (user: User | null) => void
  setRole: (role: UserRole) => void
  recordFailedAttempt: () => void
  resetFailedAttempts: () => void
  logout: () => Promise<void>
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: 'user',
  isLocked: false,
  failedAttempts: 0,

  setAuth: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  setUser: (user) => set({ user }),

  setRole: (role) => set({ role }),

  recordFailedAttempt: () =>
    set((state) => {
      const newAttempts = state.failedAttempts + 1

      return {
        failedAttempts: newAttempts,
        isLocked: newAttempts >= 5,
      }
    }),

  resetFailedAttempts: () =>
    set({
      failedAttempts: 0,
      isLocked: false,
    }),

  logout: async () => {
    const supabase = createClient()

    await supabase.auth.signOut()

    set({
      user: null,
      session: null,
      role: 'user',
      isLocked: false,
      failedAttempts: 0,
    })
  },

  clearAuth: () =>
    set({
      user: null,
      session: null,
      role: 'user',
    }),
}))
