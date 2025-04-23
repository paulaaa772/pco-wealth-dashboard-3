import { create } from 'zustand'

type Trade = {
  type: 'BUY' | 'SELL'
  name: string
  detail: string
  time: string
}

type AITradeState = {
  trades: Trade[]
  add: (trade: Trade) => void
}

export const useAITradeStore = create<AITradeState>((set) => ({
  trades: [],
  add: (trade) =>
    set((state) => ({
      trades: [trade, ...state.trades.slice(0, 10)]
    }))
}))
