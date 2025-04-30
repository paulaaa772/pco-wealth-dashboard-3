'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AIPosition } from '@/lib/trading-engine/types'
import { ManualOrder, ActiveIndicator } from '@/app/brokerage/page'

// Define the store state interface
interface AppState {
  // Positions and Orders
  manualOrders: ManualOrder[]
  aiPositions: AIPosition[]
  
  // Chart settings
  selectedSymbol: string
  timeframe: string
  candleInterval: string
  activeIndicators: ActiveIndicator[]
  
  // UI preferences
  activeTab: 'ai' | 'congress' | 'insiders' | 'paper'
  refreshInterval: number

  // Add order methods
  addManualOrder: (order: Omit<ManualOrder, 'id' | 'timestamp' | 'status'>) => void
  updateManualOrder: (id: string, updates: Partial<ManualOrder>) => void
  
  // Position methods
  addAIPosition: (position: AIPosition) => void
  updateAIPosition: (id: string, updates: Partial<AIPosition>) => void
  closeAIPosition: (id: string, exitPrice: number) => void
  
  // Settings methods
  setSymbol: (symbol: string) => void
  setTimeframe: (timeframe: string) => void
  setCandleInterval: (interval: string) => void
  setActiveIndicators: (indicators: ActiveIndicator[]) => void
  setActiveTab: (tab: 'ai' | 'congress' | 'insiders' | 'paper') => void
  setRefreshInterval: (seconds: number) => void
}

// Create the persistent store
export const usePersistentStore = create<AppState>()(
  persist(
    (set) => ({
      // Default state values
      manualOrders: [],
      aiPositions: [],
      selectedSymbol: 'AAPL',
      timeframe: '1D',
      candleInterval: 'day',
      activeIndicators: [],
      activeTab: 'ai',
      refreshInterval: 60,
      
      // Methods for updating state
      addManualOrder: (order) => 
        set((state) => {
          const newOrderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newOrder: ManualOrder = {
            ...order,
            id: newOrderId,
            timestamp: Date.now(),
            status: 'open',
          };
          return { manualOrders: [...state.manualOrders, newOrder] };
        }),
        
      updateManualOrder: (id, updates) =>
        set((state) => ({
          manualOrders: state.manualOrders.map(order => 
            order.id === id ? { ...order, ...updates } : order
          )
        })),
        
      addAIPosition: (position) =>
        set((state) => ({
          aiPositions: [...state.aiPositions, position]
        })),
        
      updateAIPosition: (id, updates) =>
        set((state) => ({
          aiPositions: state.aiPositions.map(position => 
            position.id === id ? { ...position, ...updates } : position
          )
        })),
        
      closeAIPosition: (id, exitPrice) =>
        set((state) => {
          const position = state.aiPositions.find(p => p.id === id);
          if (!position) return state;
          
          const profit = position.type === 'buy' 
            ? (exitPrice - position.entryPrice) * position.quantity
            : (position.entryPrice - exitPrice) * position.quantity;
            
          return {
            aiPositions: state.aiPositions.map(p => 
              p.id === id ? {
                ...p,
                exitPrice,
                closeDate: new Date(),
                status: 'closed',
                profit
              } : p
            )
          };
        }),
        
      setSymbol: (symbol) =>
        set({ selectedSymbol: symbol }),
        
      setTimeframe: (timeframe) =>
        set({ timeframe }),
        
      setCandleInterval: (interval) =>
        set({ candleInterval: interval }),
        
      setActiveIndicators: (indicators) =>
        set({ activeIndicators: indicators }),
        
      setActiveTab: (tab) =>
        set({ activeTab: tab }),
        
      setRefreshInterval: (seconds) =>
        set({ refreshInterval: seconds }),
    }),
    {
      name: 'wealth-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 