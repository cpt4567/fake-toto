import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      balance: 100000,
      user: null,
      toasts: [],

      placeBet: (amount) =>
        set((state) => ({
          balance: Math.max(0, state.balance - amount),
        })),

      addWinnings: (amount) =>
        set((state) => ({
          balance: state.balance + amount,
        })),

      addToast: (toast) =>
        set((state) => ({
          toasts: [...state.toasts, { id: Date.now(), ...toast }],
        })),

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'fake-toto-storage',
      partialize: (state) => ({ balance: state.balance }),
    }
  )
)
