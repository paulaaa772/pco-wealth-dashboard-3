'use client'

import { create } from 'zustand'

type Trade = {
  symbol: string
  action: 'Buy' | 'Sell'
  quantity: number
  price: number
  timestamp: string
}

type Store = {
  trades: Trade[]
  addTrade: (trade: Omit<Trade, 'timestamp'>) => void
}

export const useTradeSimStore = create<Store>((set) => ({
  trades: [],
  addTrade: (trade) =>
    set((state) => ({
      trades: [
        ...state.trades,
        { ...trade, timestamp: new Date().toLocaleTimeString() },
      ],
    })),
}))
