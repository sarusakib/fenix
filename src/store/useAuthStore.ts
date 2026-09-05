import { create } from 'zustand'

export type UserRole = 'user' | 'entrepreneur' | 'investor' | 'field_agent' | 'admin'

interface AuthState {
  user: any | null
  role: UserRole
  isLocked: boolean
  failedAttempts: number
  setUser: (user: any) => void
  setRole: (role: UserRole) => void
  recordFailedAttempt: () => void
  resetFailedAttempts: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: 'user',
  isLocked: false,
  failedAttempts: 0,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  recordFailedAttempt: () =>
    set((state) => {
      const newAttempts = state.failedAttempts + 1
      return {
        failedAttempts: newAttempts,
        // ৫ বার ব্যর্থ চেষ্টার পর অ্যাকাউন্টে সাময়িক লক লাগানো হবে
        isLocked: newAttempts >= 5,
      }
    }),
  resetFailedAttempts: () => set({ failedAttempts: 0, isLocked: false }),
  logout: () => set({ user: null, role: 'user', isLocked: false, failedAttempts: 0 }),
}))
