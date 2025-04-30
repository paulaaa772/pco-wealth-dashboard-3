import * as tf from '@tensorflow/tfjs';
import { PolygonCandle } from '../market-data/PolygonService';

// Interface for AI Trend Prediction
export interface AITrendPredictionResult {
  historicalValues: number[];  // Actual data points
  predictedValues: number[];   // Model predictions
  futurePredictions: number[]; // Future predictions (forecast)
}

// Simple trend prediction using linear regression model
export const calculateAITrendPrediction = async (
  candles: PolygonCandle[],
  lookbackPeriod: number = 20,
  forecastPeriod: number = 5
): Promise<AITrendPredictionResult | null> => {
  if (!candles || candles.length < lookbackPeriod) return null;
  
  // Extract closing prices (our target values)
  const prices = candles.map(c => c.c);
  
  // Create input features (time steps)
  // For simple linear regression, we use time indices as input features
  const timeIndices = Array.from({ length: prices.length }, (_, i) => i);
  
  // Prepare the training data
  const xs = tf.tensor2d(timeIndices.map(i => [i]), [timeIndices.length, 1]);
  const ys = tf.tensor2d(prices.map(p => [p]), [prices.length, 1]);
  
  // Create and train a linear regression model
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 10, inputShape: [1], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1 }));
  
  model.compile({
    optimizer: tf.train.adam(0.1),
    loss: 'meanSquaredError'
  });
  
  // Train the model
  await model.fit(xs, ys, {
    epochs: 100,
    verbose: 0
  });
  
  // Get predictions for historical data
  const historicalPredictions = model.predict(xs) as tf.Tensor;
  const historicalValues = await historicalPredictions.array() as number[][];
  
  // Generate future time indices
  const futureTimeIndices = Array.from(
    { length: forecastPeriod }, 
    (_, i) => timeIndices.length + i
  );
  
  // Predict future values
  const futurePredictionsInput = tf.tensor2d(futureTimeIndices.map(i => [i]), [futureTimeIndices.length, 1]);
  const futurePredictions = model.predict(futurePredictionsInput) as tf.Tensor;
  const futureValues = await futurePredictions.array() as number[][];
  
  // Clean up tensors
  xs.dispose();
  ys.dispose();
  historicalPredictions.dispose();
  futurePredictionsInput.dispose();
  futurePredictions.dispose();
  model.dispose();
  
  return {
    historicalValues: historicalValues.map(v => v[0]),
    predictedValues: historicalValues.map(v => v[0]),
    futurePredictions: futureValues.map(v => v[0])
  };
};

// Neural Network Oscillator
export interface NeuralOscillatorResult {
  values: number[];        // Oscillator values (-1 to 1 range)
  overbought: number[];    // Overbought signals (1 if overbought, 0 otherwise)
  oversold: number[];      // Oversold signals (1 if oversold, 0 otherwise)
}

export const calculateNeuralOscillator = async (
  candles: PolygonCandle[],
  lookbackPeriod: number = 14,
  threshold: number = 0.8
): Promise<NeuralOscillatorResult | null> => {
  if (!candles || candles.length < lookbackPeriod * 2) return null;
  
  // Extract price data
  const prices = candles.map(c => c.c);
  
  // Normalize prices to values between 0 and 1
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  const normalizedPrices = prices.map(p => (p - minPrice) / priceRange);
  
  // Prepare input sequences (using past N prices to predict oscillator value)
  const inputs: number[][] = [];
  const outputs: number[] = [];
  
  // For each position, create a sequence of lookbackPeriod prices
  for (let i = lookbackPeriod; i < normalizedPrices.length - 1; i++) {
    const sequence = normalizedPrices.slice(i - lookbackPeriod, i);
    inputs.push(sequence);
    
    // Calculate price change ratio over next few periods as target
    const currentPrice = normalizedPrices[i];
    const nextPrice = normalizedPrices[i + 1];
    const priceChange = (nextPrice - currentPrice) / currentPrice;
    
    // Convert to range -1 to 1 using tanh-like approach
    outputs.push(Math.tanh(priceChange * 10)); // Scale to make small changes more visible
  }
  
  // Convert to tensors
  const xs = tf.tensor2d(inputs, [inputs.length, lookbackPeriod]);
  const ys = tf.tensor2d(outputs.map(o => [o]), [outputs.length, 1]);
  
  // Create a neural network model
  const model = tf.sequential();
  
  // Add layers with a simpler architecture to avoid tensor shape issues
  model.add(tf.layers.dense({
    units: 10,
    inputShape: [lookbackPeriod],
    activation: 'relu'
  }));
  
  model.add(tf.layers.dense({ units: 5, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'tanh' })); // tanh for -1 to 1 range
  
  // Compile the model
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'meanSquaredError'
  });
  
  // Train the model
  await model.fit(xs, ys, {
    epochs: 50,
    batchSize: 32,
    verbose: 0
  });
  
  // Generate predictions for all data
  const allInputs = [];
  for (let i = lookbackPeriod; i < normalizedPrices.length; i++) {
    allInputs.push(normalizedPrices.slice(i - lookbackPeriod, i));
  }
  
  // Use tensor2d instead of tensor3d to match our model architecture
  const allXs = tf.tensor2d(allInputs, [allInputs.length, lookbackPeriod]);
  const predictions = model.predict(allXs) as tf.Tensor;
  const oscillatorValues = await predictions.array() as number[][];
  
  // Clean up tensors
  xs.dispose();
  ys.dispose();
  allXs.dispose();
  predictions.dispose();
  model.dispose();
  
  // Calculate overbought/oversold signals
  const values = oscillatorValues.map(v => v[0]);
  const overbought = values.map(v => v > threshold ? 1 : 0);
  const oversold = values.map(v => v < -threshold ? 1 : 0);
  
  return {
    values,
    overbought,
    oversold
  };
};

// Self-Adaptive Moving Average
export interface AdaptiveMAResult {
  values: number[];     // The MA values
  periods: number[];    // The period used at each point
}

export const calculateAdaptiveMA = (
  candles: PolygonCandle[],
  minPeriod: number = 5,
  maxPeriod: number = 50,
  volatilityWindow: number = 10
): AdaptiveMAResult | null => {
  if (!candles || candles.length < maxPeriod + volatilityWindow) return null;
  
  // Extract closing prices
  const prices = candles.map(c => c.c);
  
  // Calculate rolling volatility (using standard deviation of returns)
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] / prices[i - 1]) - 1);
  }
  
  const volatility = [];
  for (let i = volatilityWindow; i < returns.length; i++) {
    const windowReturns = returns.slice(i - volatilityWindow, i);
    const mean = windowReturns.reduce((sum, r) => sum + r, 0) / volatilityWindow;
    const variance = windowReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / volatilityWindow;
    volatility.push(Math.sqrt(variance));
  }
  
  // Map volatility to periods (higher volatility = shorter period)
  const periods = volatility.map(v => {
    // Normalize volatility to range [0, 1] using a simple percentile rank
    const sortedVolatility = [...volatility].sort((a, b) => a - b);
    const rank = sortedVolatility.indexOf(v) / sortedVolatility.length;
    
    // Map rank to period range (0 = maxPeriod, 1 = minPeriod)
    return Math.round(maxPeriod - rank * (maxPeriod - minPeriod));
  });
  
  // Calculate MA values using adaptive periods
  const maValues = [];
  
  for (let i = 0; i < periods.length; i++) {
    const period = periods[i];
    const dataIndex = i + volatilityWindow + 1; // Adjust for volatility window offset
    
    if (dataIndex < period) {
      // Not enough data for this period, use simple average
      maValues.push(prices.slice(0, dataIndex).reduce((sum, p) => sum + p, 0) / dataIndex);
    } else {
      // Calculate MA using the adaptive period
      const sum = prices.slice(dataIndex - period, dataIndex).reduce((total, p) => total + p, 0);
      maValues.push(sum / period);
    }
  }
  
  return {
    values: maValues,
    periods: periods
  };
}; 