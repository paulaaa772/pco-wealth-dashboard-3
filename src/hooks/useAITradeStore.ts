'use client'

import { create } from 'zustand'

type Trade = {
  type: 'BUY' | 'SELL'
  ticker: string
  price: number
  timestamp: Date
}

interface AITradeState {
  trades: Trade[]
  addTrade: (trade: Omit<Trade, 'timestamp'>) => void
}

export const useAITradeStore = create<AITradeState>((set) => ({
  trades: [],
  addTrade: (trade) => set((state) => ({
    trades: [...state.trades, { ...trade, timestamp: new Date() }]
  }))
}))
