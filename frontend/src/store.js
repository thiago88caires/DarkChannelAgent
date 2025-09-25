import { create } from 'zustand'

export const useAuthStore = create(set => ({
  session: null,
  setSession: (session) => set({ session })
}))

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

