// src/lib/trading-engine/indicators.ts

import { PolygonCandle } from '../market-data/PolygonService';

// --- Calculation Helpers --- 

export const calculateSMA = (data: number[], period: number): number[] => {
    if (period <= 0 || !data || data.length < period) return [];
    const sma: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        sma.push(sum / period);
    }
    return sma;
};

export const calculateEMA = (data: number[], period: number): number[] => {
    if (period <= 0 || !data || data.length < period) return [];
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    let sum = 0;
    for(let i = 0; i < period; i++) { sum += data[i]; }
    let previousEma = sum / period;
    ema.push(previousEma);
    for (let i = period; i < data.length; i++) {
        const currentEma = (data[i] - previousEma) * multiplier + previousEma;
        ema.push(currentEma);
        previousEma = currentEma;
    }
    return ema;
};

export const calculateRSI = (data: number[], period: number = 14): number[] => {
    if (period <= 0 || !data || data.length < period + 1) return [];
    const rsi: number[] = [];
    let avgGain = 0, avgLoss = 0;
    let firstGainSum = 0, firstLossSum = 0;
    for (let i = 1; i <= period; i++) {
        const change = data[i] - data[i - 1];
        if (change > 0) firstGainSum += change; else firstLossSum += Math.abs(change);
    }
    avgGain = firstGainSum / period; avgLoss = firstLossSum / period;
    let rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
    for (let i = period + 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        let currentGain = change > 0 ? change : 0;
        let currentLoss = change < 0 ? Math.abs(change) : 0;
        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
        rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
    }
    return rsi;
};

export interface MACDResult {
    macdLine: number[];
    signalLine: number[];
    histogram: number[];
}

export const calculateMACD = (
    data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9
): MACDResult | null => {
    if (slowPeriod <= fastPeriod || signalPeriod <= 0 || !data || data.length < slowPeriod) return null;
    const emaFast = calculateEMA(data, fastPeriod);
    const emaSlow = calculateEMA(data, slowPeriod);
    const macdLine: number[] = [];
    const startOffset = emaFast.length - emaSlow.length;
    for (let i = 0; i < emaSlow.length; i++) { macdLine.push(emaFast[i + startOffset] - emaSlow[i]); }
    if (macdLine.length < signalPeriod) return null;
    const signalLine = calculateEMA(macdLine, signalPeriod);
    const histogram: number[] = [];
    const signalStartOffset = macdLine.length - signalLine.length;
    for (let i = 0; i < signalLine.length; i++) { histogram.push(macdLine[i + signalStartOffset] - signalLine[i]); }
    return { macdLine: macdLine.slice(signalStartOffset), signalLine: signalLine, histogram: histogram };
};

export interface BollingerBandsResult {
    upperBand: number[];
    middleBand: number[]; 
    lowerBand: number[];
}

export const calculateBollingerBands = (
    data: number[], period: number = 20, stdDevMultiplier: number = 2
): BollingerBandsResult | null => {
    if (period <= 0 || stdDevMultiplier <= 0 || !data || data.length < period) return null;
    const middleBand = calculateSMA(data, period);
    if (middleBand.length === 0) return null;
    const upperBand: number[] = [];
    const lowerBand: number[] = [];
    const dataOffset = data.length - middleBand.length;
    for (let i = 0; i < middleBand.length; i++) {
        const slice = data.slice(i + dataOffset - period + 1, i + dataOffset + 1);
        if (slice.length !== period) continue;
        const mean = middleBand[i];
        const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        upperBand.push(mean + stdDevMultiplier * stdDev);
        lowerBand.push(mean - stdDevMultiplier * stdDev);
    }
    if (upperBand.length !== middleBand.length) { console.error("[BBands] Length mismatch!"); return null; }
    return { upperBand, middleBand, lowerBand };
};

export const wilderSmoothing = (data: number[], period: number): number[] => {
    if (period <= 0 || !data || data.length < period) return [];
    const smoothed: number[] = [];
    let sum = 0;
    for(let i = 0; i < period; i++) { sum += data[i]; }
    smoothed.push(sum / period); 
    for (let i = period; i < data.length; i++) {
        const previousSmoothed = smoothed[smoothed.length - 1];
        const currentSmoothed = (previousSmoothed * (period - 1) + data[i]) / period;
        smoothed.push(currentSmoothed);
    }
    return smoothed;
};

export interface ADXResult {
    adx: number[];
    plusDI: number[];
    minusDI: number[];
}

export const calculateADX = (candles: PolygonCandle[], period: number = 14): ADXResult | null => {
    if (period <= 0 || !candles || candles.length < period + 1) return null;
    const trueRanges: number[] = []; const plusDMs: number[] = []; const minusDMs: number[] = [];
    for (let i = 1; i < candles.length; i++) {
        const { h: high, l: low, c: close } = candles[i];
        const { h: prevHigh, l: prevLow, c: prevClose } = candles[i - 1];
        const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
        trueRanges.push(tr);
        const moveUp = high - prevHigh; const moveDown = prevLow - low;
        let plusDM = 0; let minusDM = 0;
        if (moveUp > moveDown && moveUp > 0) plusDM = moveUp;
        if (moveDown > moveUp && moveDown > 0) minusDM = moveDown;
        plusDMs.push(plusDM); minusDMs.push(minusDM);
    }
    if (trueRanges.length < period) return null;
    const smoothedTR = wilderSmoothing(trueRanges, period);
    const smoothedPlusDM = wilderSmoothing(plusDMs, period);
    const smoothedMinusDM = wilderSmoothing(minusDMs, period);
    if (smoothedTR.length === 0 || smoothedPlusDM.length !== smoothedTR.length) return null;
    const plusDI: number[] = []; const minusDI: number[] = [];
    for (let i = 0; i < smoothedTR.length; i++) {
        const diPlus = smoothedTR[i] === 0 ? 0 : (smoothedPlusDM[i] / smoothedTR[i]) * 100;
        const diMinus = smoothedTR[i] === 0 ? 0 : (smoothedMinusDM[i] / smoothedTR[i]) * 100;
        plusDI.push(diPlus); minusDI.push(diMinus);
    }
    const dx: number[] = [];
    for (let i = 0; i < plusDI.length; i++) {
        const diSum = plusDI[i] + minusDI[i];
        const dxValue = diSum === 0 ? 0 : (Math.abs(plusDI[i] - minusDI[i]) / diSum) * 100;
        dx.push(dxValue);
    }
    if (dx.length < period) return null;
    const adx = wilderSmoothing(dx, period);
    const adxStartOffset = plusDI.length - adx.length;
    return { adx, plusDI: plusDI.slice(adxStartOffset), minusDI: minusDI.slice(adxStartOffset) };
};

export interface StochasticResult {
    percentK: number[];
    percentD: number[];
}

export const calculateStochastic = (
    candles: PolygonCandle[], kPeriod: number = 14, dPeriod: number = 3
): StochasticResult | null => {
    if (kPeriod <= 0 || dPeriod <= 0 || !candles || candles.length < kPeriod) return null;
    const percentK: number[] = [];
    for (let i = kPeriod - 1; i < candles.length; i++) {
        const slice = candles.slice(i - kPeriod + 1, i + 1);
        const lowestLow = Math.min(...slice.map(c => c.l));
        const highestHigh = Math.max(...slice.map(c => c.h));
        const currentClose = candles[i].c;
        let kValue = 0;
        const range = highestHigh - lowestLow;
        if (range > 0) kValue = ((currentClose - lowestLow) / range) * 100;
        percentK.push(kValue);
    }
    if (percentK.length < dPeriod) return null;
    const percentD = calculateSMA(percentK, dPeriod);
    const kStartOffset = percentK.length - percentD.length;
    return { percentK: percentK.slice(kStartOffset), percentD };
};

export const calculateOBV = (candles: PolygonCandle[]): number[] => {
    if (!candles || candles.length === 0) return [];
    const obv: number[] = [0]; 
    for (let i = 1; i < candles.length; i++) {
        const currentClose = candles[i].c; const prevClose = candles[i-1].c;
        const currentVolume = candles[i].v; const prevObv = obv[obv.length - 1];
        if (currentClose > prevClose) obv.push(prevObv + currentVolume);
        else if (currentClose < prevClose) obv.push(prevObv - currentVolume);
        else obv.push(prevObv);
    }
    return obv;
};

export const calculateATR = (candles: PolygonCandle[], period: number = 14): number[] => {
    if (period <= 0 || !candles || candles.length < period + 1) return [];
    
    // Calculate True Ranges first
    const trueRanges: number[] = [];
    
    for (let i = 1; i < candles.length; i++) {
        const { h: high, l: low } = candles[i];
        const { c: prevClose } = candles[i - 1];
        
        // True Range is the greatest of:
        // 1. Current High - Current Low
        // 2. |Current High - Previous Close|
        // 3. |Current Low - Previous Close|
        const tr = Math.max(
            high - low,
            Math.abs(high - prevClose),
            Math.abs(low - prevClose)
        );
        
        trueRanges.push(tr);
    }
    
    // Calculate ATR using Wilder's smoothing method
    return wilderSmoothing(trueRanges, period);
};

// Add other indicator calculations here... 