'use client'

import { PolygonService, PolygonCandle } from '../market-data/PolygonService';
import { calculateRSI } from './indicators';

export interface ScanResult {
  symbol: string;
  reason: string; // e.g., "RSI Oversold (<30)", "High Volume Spike"
  currentPrice: number;
  details?: any; // For additional info like RSI value, volume ratio
}

export interface ScanCriteria {
  minRsi?: number; // Scan for RSI below this value (oversold)
  maxRsi?: number; // Scan for RSI above this value (overbought)
  volumeThreshold?: number; // Scan for volume > N times average volume (e.g., 2 for 2x)
  rsiPeriod?: number;
  volumeAvgPeriod?: number;
}

export class AIScanner {
  private polygonService: PolygonService;
  private defaultCriteria: ScanCriteria;

  constructor() {
    this.polygonService = PolygonService.getInstance();
    // Default criteria: RSI < 30 or > 70, Volume > 2x 20-day average
    this.defaultCriteria = {
      minRsi: 30,
      maxRsi: 70,
      volumeThreshold: 2,
      rsiPeriod: 14,
      volumeAvgPeriod: 20,
    };
    console.log('[AI Scanner] Initialized');
  }

  async scanMarket(
    assetList: string[],
    criteria: ScanCriteria = this.defaultCriteria
  ): Promise<ScanResult[]> {
    console.log(`[AI Scanner] Starting market scan for ${assetList.length} assets...`);
    const results: ScanResult[] = [];
    const batchSize = 5; // Process in batches to avoid rate limits
    let processedCount = 0;

    for (let i = 0; i < assetList.length; i += batchSize) {
      const batch = assetList.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => this.analyzeAsset(symbol, criteria));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(result => {
          if (result) {
            results.push(result);
          }
        });
        processedCount += batch.length;
        console.log(`[AI Scanner] Processed batch ${i/batchSize + 1}, ${processedCount}/${assetList.length} assets analyzed.`);
        
        // Add a small delay between batches if needed
        if (i + batchSize < assetList.length) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
      } catch (error) {
        console.error(`[AI Scanner] Error processing batch ${i/batchSize + 1}:`, error);
        // Continue with the next batch
      }
    }

    console.log(`[AI Scanner] Scan complete. Found ${results.length} potential opportunities.`);
    return results;
  }

  private async analyzeAsset(
    symbol: string,
    criteria: ScanCriteria
  ): Promise<ScanResult | null> {
    try {
      // Fetch recent daily candles (enough for calculations)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (criteria.rsiPeriod || 14) * 2); // Fetch more data than needed
      
      const candles = await this.polygonService.getStockCandles(
        symbol,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        'day'
      );

      if (!candles || candles.length < (criteria.rsiPeriod || 14)) {
        // console.warn(`[AI Scanner] Insufficient data for ${symbol}`);
        return null;
      }

      const latestCandle = candles[candles.length - 1];
      const currentPrice = latestCandle.c;
      const volumes = candles.map(c => c.v);
      const closePrices = candles.map(c => c.c);

      // Calculate RSI
      const rsiValues = calculateRSI(closePrices, criteria.rsiPeriod || 14);
      const latestRsi = rsiValues[rsiValues.length - 1];

      // Calculate Average Volume
      const volumePeriod = criteria.volumeAvgPeriod || 20;
      if (volumes.length >= volumePeriod) {
          const relevantVolumes = volumes.slice(-volumePeriod);
          const avgVolume = relevantVolumes.reduce((sum, v) => sum + v, 0) / volumePeriod;
          const latestVolume = latestCandle.v;
          const volumeRatio = latestVolume / avgVolume;
          
          // Check Volume Criteria
          if (criteria.volumeThreshold && volumeRatio > criteria.volumeThreshold) {
              return {
                  symbol,
                  reason: `Volume Spike (${volumeRatio.toFixed(1)}x avg)`,
                  currentPrice,
                  details: { volumeRatio: volumeRatio.toFixed(1), avgVolume: avgVolume.toFixed(0) }
              };
          }
      }

      // Check RSI Criteria
      if (criteria.minRsi && latestRsi < criteria.minRsi) {
        return {
          symbol,
          reason: `RSI Oversold (${latestRsi.toFixed(1)})`,
          currentPrice,
          details: { rsi: latestRsi.toFixed(1) }
        };
      }
      if (criteria.maxRsi && latestRsi > criteria.maxRsi) {
        return {
          symbol,
          reason: `RSI Overbought (${latestRsi.toFixed(1)})`,
          currentPrice,
          details: { rsi: latestRsi.toFixed(1) }
        };
      }

      return null; // No criteria met
    } catch (error) {
      // console.error(`[AI Scanner] Error analyzing ${symbol}:`, error.message);
      return null; // Skip asset on error
    }
  }
} 