import { PolygonCandle } from '../market-data/PolygonService';
import { TradeSignal } from './AITradingEngine';
// Import indicator calculation functions and types
import {
    calculateSMA,
    calculateEMA,
    calculateRSI,
    calculateMACD,
    MACDResult,
    calculateBollingerBands,
    BollingerBandsResult,
    calculateADX,
    ADXResult,
    calculateStochastic,
    StochasticResult,
    calculateOBV,
    // Add other indicators as needed
} from './indicators';

// Define the structure for backtest results
export interface BacktestResult {
    strategyName: string;
    symbol: string;
    startDate: string;
    endDate: string;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number; // winningTrades / totalTrades
    totalProfitLoss: number;
    averageWin?: number;
    averageLoss?: number;
    // Add more metrics later: Sharpe Ratio, Max Drawdown, Profit Factor etc.
    trades: SimulatedTrade[]; // Record of individual trades
}

// Define the structure for a single simulated trade
interface SimulatedTrade {
    entrySignal: TradeSignal;
    entryTime: number; // Timestamp from candle data
    entryPrice: number; // Actual entry price (e.g., next candle open or signal price)
    exitTime?: number;
    exitPrice?: number;
    exitReason?: string; // e.g., 'Opposite Signal', 'Stop Loss', 'Take Profit', 'End of Test'
    profitLoss?: number;
}

// Dictionary to hold calculated indicator arrays
// Separate explicitly known properties from the dynamic indicator results
interface CalculatedIndicators {
    [key: string]: any[]; // e.g., sma9: number[], rsi14: number[], macd_line: number[]
}

interface IndicatorData {
    candles: PolygonCandle[]; // Keep original candles
    closingPrices: number[]; // Explicitly store closing prices
    volumes: number[];       // Explicitly store volumes
    indicators: CalculatedIndicators; // Store calculated results here
}

// Adjusted strategy function signature to pass IndicatorData
type BacktestStrategyFunction = (
    index: number,
    // candles: PolygonCandle[], // Pass full IndicatorData instead
    data: IndicatorData 
) => 'buy' | 'sell' | null;

// Mapping of indicator keys to calculation functions (example)
// This will be used to dynamically calculate required indicators
const indicatorCalculationMap: { [key: string]: Function } = {
    sma: calculateSMA,
    ema: calculateEMA,
    rsi: calculateRSI,
    macd: calculateMACD,
    bbands: calculateBollingerBands,
    adx: calculateADX,
    stochastic: calculateStochastic,
    obv: calculateOBV,
    // Add more indicators here
};

export class StrategyEvaluator {
    
    constructor() {
        console.log("StrategyEvaluator initialized.");
    }

    // Main backtesting function (implementing indicator calculation)
    async runBacktest(
        symbol: string,
        candles: PolygonCandle[],
        strategyName: string,
        strategyFn: BacktestStrategyFunction,
        // Instead of functions, pass keys and parameters for indicators needed
        requiredIndicatorConfigs: { [key: string]: { funcKey: string, params: any[] } } 
        // Example: { sma9: { funcKey: 'sma', params: [9] }, sma21: { funcKey: 'sma', params: [21] } }
    ): Promise<BacktestResult | null> {
        
        console.log(`[Backtest] Starting for ${symbol} with strategy: ${strategyName}`);
        if (!candles || candles.length < 50) { // Need a reasonable amount of data
            console.error('[Backtest] Insufficient candle data provided.');
            return null;
        }

        // Initialize IndicatorData structure
        const indicatorData: IndicatorData = {
            candles: candles,
            closingPrices: candles.map(c => c.c),
            volumes: candles.map(c => c.v),
            indicators: {} // Initialize empty calculated indicators
        };

        // 1. Calculate all required indicators based on config
        console.log("[Backtest] Calculating required indicators...");
        try {
            for (const key in requiredIndicatorConfigs) {
                const config = requiredIndicatorConfigs[key];
                const calcFunction = indicatorCalculationMap[config.funcKey];
                if (!calcFunction) {
                    console.warn(`[Backtest] Indicator function key '${config.funcKey}' not found.`);
                    continue;
                }
                
                // Determine input data (most use close, some use candles)
                let inputData: any;
                if (['adx', 'stochastic', 'obv'].includes(config.funcKey)) {
                    inputData = indicatorData.candles; // Pass full candle data
                } else {
                    inputData = indicatorData.closingPrices; // Default to closing prices
                }

                console.log(`[Backtest] Calculating ${key} using ${config.funcKey} with params:`, config.params);
                const result = calcFunction(inputData, ...config.params);
                
                // Store the result(s) in the nested 'indicators' object
                if (result) {
                    if (typeof result === 'object' && !Array.isArray(result)) {
                        for (const subKey in result) {
                            indicatorData.indicators[`${key}_${subKey}`] = result[subKey as keyof typeof result];
                            // console.log(`[Backtest] Stored ${key}_${subKey} (Length: ${result[subKey as keyof typeof result]?.length})`);
                        }
                    } else if (Array.isArray(result)) {
                        indicatorData.indicators[key] = result;
                        // console.log(`[Backtest] Stored ${key} (Length: ${result.length})`);
                    }
                } else {
                    console.warn(`[Backtest] Calculation failed for ${key}`);
                }
            }
        } catch (error) { 
            console.error(`[Backtest] Error calculating indicators:`, error);
            return null;
        }
        
        const simulatedTrades: SimulatedTrade[] = [];
        let activePosition: SimulatedTrade | null = null;
        let totalProfitLoss = 0;
        let winningTrades = 0;
        let losingTrades = 0;

        // Determine a safe warmup period based on longest indicator need
        let maxLookback = 0;
        // Example: Calculate max lookback from configs (needs refinement)
        // For now, using a fixed large enough value
        const warmupPeriod = 60; 
        
        console.log(`[Backtest] Iterating from index ${warmupPeriod} to ${candles.length - 2}`); // Iterate up to second-to-last candle for next-bar entry
        
        for (let i = warmupPeriod; i < candles.length - 1; i++) { // Stop one bar early to use i+1 for entry/exit
            const currentCandle = candles[i];
            const nextCandle = candles[i+1]; // Used for entry/exit price simulation
            // Pass the full indicatorData object to the strategy function
            const signalDirection = strategyFn(i, indicatorData);

            // --- Position Management --- 
            if (!activePosition) {
                // Check for ENTRY signal
                if (signalDirection === 'buy') {
                    // Simulate entry on NEXT bar's open
                    const entryPrice = nextCandle.o;
                    const entryTime = nextCandle.t;
                    // Create a mock TradeSignal for record keeping
                    const entrySignal: TradeSignal = { 
                        symbol, direction: 'buy', price: currentCandle.c, // Signal based on current close
                        confidence: 1.0, // Confidence not used in this backtest
                        timestamp: currentCandle.t, strategy: strategyName 
                    };
                    
                    activePosition = {
                        entrySignal: entrySignal,
                        entryTime: entryTime,
                        entryPrice: entryPrice,
                    };
                    console.log(`[Backtest @ ${new Date(entryTime).toLocaleDateString()}] ENTER LONG @ ${entryPrice.toFixed(2)}`);
                }
                 // TODO: Add short entry logic if needed

            } else { // Already in a position
                // Check for EXIT signal (opposite direction)
                let exitReason: string | null = null;
                if (signalDirection === 'sell' && activePosition.entrySignal.direction === 'buy') {
                    exitReason = 'Opposite Signal';
                }
                // TODO: Add other exit reasons (stop loss, take profit, time stop)
                
                // Check if it's the last possible bar to exit before loop ends
                if (i === candles.length - 2) { 
                    exitReason = exitReason || 'End of Test'; 
                }

                if (exitReason) {
                    // Simulate exit on NEXT bar's open
                    const exitPrice = nextCandle.o;
                    const exitTime = nextCandle.t;
                    const profitLoss = exitPrice - activePosition.entryPrice; // Simple P/L for long only
                    
                    console.log(`[Backtest @ ${new Date(exitTime).toLocaleDateString()}] EXIT LONG @ ${exitPrice.toFixed(2)}, P/L: ${profitLoss.toFixed(2)} (${exitReason})`);

                    // Update metrics
                    totalProfitLoss += profitLoss;
                    if (profitLoss > 0) winningTrades++;
                    else losingTrades++;

                    // Record completed trade
                    simulatedTrades.push({
                        ...activePosition,
                        exitTime,
                        exitPrice,
                        exitReason,
                        profitLoss
                    });

                    // Clear active position
                    activePosition = null;
                }
            }
        } // End of loop
        
        // Note: Any position open at the very end wasn't closed in this simple logic

        // 3. Calculate Final Metrics
        const totalTrades = simulatedTrades.length;
        const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;
        const avgWin = winningTrades > 0 ? simulatedTrades.filter(t => t.profitLoss! > 0).reduce((sum, t) => sum + t.profitLoss!, 0) / winningTrades : 0;
        const avgLoss = losingTrades > 0 ? simulatedTrades.filter(t => t.profitLoss! < 0).reduce((sum, t) => sum + t.profitLoss!, 0) / losingTrades : 0;

        const result: BacktestResult = {
            strategyName,
            symbol,
            startDate: new Date(candles[warmupPeriod].t).toISOString().split('T')[0], // Start date of actual test
            endDate: new Date(candles[candles.length - 1].t).toISOString().split('T')[0],
            totalTrades,
            winningTrades,
            losingTrades,
            winRate,
            totalProfitLoss,
            averageWin: avgWin,
            averageLoss: avgLoss,
            trades: simulatedTrades
        };
        
        console.log(`[Backtest] Completed for ${symbol} - ${strategyName}. Trades: ${totalTrades}, Wins: ${winningTrades}, Losses: ${losingTrades}, WinRate: ${(winRate * 100).toFixed(1)}%, Total P/L: ${totalProfitLoss.toFixed(2)}`);
        return result;
    }
} 