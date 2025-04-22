import { create } from 'zustand'

type AdminStore = {
  isAdmin: boolean
  toggleAdmin: () => void
}

export const useAdminStore = create<AdminStore>((set) => ({
  isAdmin: false,
  toggleAdmin: () => set((state) => ({ isAdmin: !state.isAdmin })),
}))
