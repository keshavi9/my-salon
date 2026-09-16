import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials } from '@/types'
import api from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })



        try {
          const res = await api.post('/auth/login', credentials)
          const { token, user } = res.data.data
          if (typeof window !== 'undefined') localStorage.setItem('token', token)
          set({ user, token, isAuthenticated: true, isLoading: false })
        } catch (err: any) {
          const message = err.response?.data?.message || 'Invalid email or password'
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateProfile: async (data: Partial<User>) => {
        set(state => ({ user: state.user ? { ...state.user, ...data } : null }))
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
