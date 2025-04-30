import { createLineIndicator, createBandIndicator, createVolumeIndicator } from './helpers'

export const indicatorDefinitions = [
  { name: 'SMA', create: createLineIndicator('sma') },
  { name: 'EMA', create: createLineIndicator('ema') },
  { name: 'RSI', create: createLineIndicator('rsi') },
  { name: 'MACD', create: createLineIndicator('macd') },
  { name: 'Bollinger Bands', create: createBandIndicator('bbands') },
  { name: 'Volume', create: createVolumeIndicator() },
  { name: 'Stochastic', create: createLineIndicator('stochastic') }
]
