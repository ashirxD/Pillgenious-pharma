import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Auth store shape:
 * {
 *   token: string | null,
 *   user: object | null,
 *   setAuth: ({ token, user }) => void,
 *   logout: () => void,
 *   isAuthenticated: () => boolean
 * }
 *
 * Persisted to localStorage under 'pg_auth' key.
 */

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: ({ token, user }) => {
        set(() => ({ token, user }))
      },

      logout: () => {
        set(() => ({ token: null, user: null }))
      },

      isAuthenticated: () => {
        return !!get().token
      }
    }),
    {
      name: 'pg_auth', // localStorage key
      getStorage: () => (typeof window !== 'undefined' ? window.localStorage : null),
      partialize: (state) => ({ token: state.token, user: state.user })
    }
  )
)

export default useAuthStore
