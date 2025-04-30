import { createLineIndicator, createBandIndicator, createVolumeIndicator, createMLIndicator } from './helpers'

export const indicatorDefinitions = [
  { name: 'SMA', create: createLineIndicator('sma') },
  { name: 'EMA', create: createLineIndicator('ema') },
  { name: 'RSI', create: createLineIndicator('rsi') },
  { name: 'MACD', create: createLineIndicator('macd') },
  { name: 'Bollinger Bands', create: createBandIndicator('bbands') },
  { name: 'Volume', create: createVolumeIndicator() },
  { name: 'Stochastic', create: createLineIndicator('stochastic') },
  { name: 'ATR', create: createLineIndicator('atr') },
  { name: 'ADX', create: createLineIndicator('adx') },
  { name: 'OBV', create: createLineIndicator('obv') },
  { name: 'Parabolic SAR', create: createLineIndicator('psar') },
  { name: 'Pivot Points', create: createLineIndicator('pivots') },
  { name: 'Ichimoku Cloud', create: createBandIndicator('ichimoku') },
  // Machine Learning Indicators
  { name: 'AI Trend Prediction', create: createMLIndicator('ai_trend') },
  { name: 'Neural Oscillator', create: createMLIndicator('neural_osc') },
  { name: 'Adaptive MA', create: createMLIndicator('adaptive_ma') }
]
