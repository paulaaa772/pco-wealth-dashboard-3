import { NextRequest, NextResponse } from 'next/server';
import { PolygonService } from '@/lib/market-data/PolygonService';
import { format, parseISO, eachDayOfInterval, subDays, startOfDay } from 'date-fns';

interface PortfolioAsset {
    symbol: string;
    quantity: number;
    assetType?: string; // Add asset type to handle different securities differently
}

interface RequestBody {
    assets: PortfolioAsset[];
    startDate: string; // e.g., '2023-01-01'
    endDate: string;   // e.g., '2024-01-01'
}

interface PriceData {
    [symbol: string]: {
        [date: string]: number; // Store closing price per date
    };
}

interface HistoricalValue {
    date: string; // 'YYYY-MM-DD'
    value: number;
}

export async function POST(request: NextRequest) {
    console.log('[API /historical-performance] Received request');
    try {
        const body: RequestBody = await request.json();
        const { assets, startDate, endDate } = body;

        if (!assets || assets.length === 0 || !startDate || !endDate) {
            console.error('[API /historical-performance] Bad Request: Missing parameters', body);
            return NextResponse.json({ error: 'Missing required parameters: assets, startDate, endDate' }, { status: 400 });
        }

        const polygonService = PolygonService.getInstance();
        const priceData: PriceData = {};
        
        // Type-safe date tracking with definite initialization
        let earliestDateFound = new Date(9999, 0, 1); // Initialize with far future date
        let latestDateFound = new Date(1970, 0, 1);   // Initialize with far past date
        let hasAnyData = false;

        console.log(`[API /historical-performance] Fetching data for ${assets.length} assets from ${startDate} to ${endDate}`);

        // Fetch candle data for all assets concurrently
        const candlePromises = assets.map(async (asset) => {
            try {
                // Fetch slightly more data to handle missing start points better
                const adjustedStartDate = format(subDays(parseISO(startDate), 7), 'yyyy-MM-dd');
                
                // Use different timespan for bonds if available
                const timespan = asset.assetType === 'Bond' ? 'day' : 'day';
                
                // Skip certain assets that might not have market data
                if (asset.assetType === 'Cash' || asset.assetType === 'Other') {
                    console.log(`[API /historical-performance] Skipping ${asset.symbol} (type: ${asset.assetType}) - using constant value`);
                    // For cash or other, add a constant value
                    const fromDateObj = parseISO(adjustedStartDate);
                    const toDateObj = parseISO(endDate);
                    
                    const dayInterval = eachDayOfInterval({ start: fromDateObj, end: toDateObj });
                    priceData[asset.symbol] = {};
                    
                    dayInterval.forEach(date => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        priceData[asset.symbol][dateStr] = 1; // Use price of 1 for each day
                    });
                    
                    // Update date range
                    if (fromDateObj < earliestDateFound) {
                        earliestDateFound = fromDateObj;
                    }
                    if (toDateObj > latestDateFound) {
                        latestDateFound = toDateObj;
                    }
                    
                    hasAnyData = true;
                    return;
                }
                
                // For all other assets, fetch candles
                const candles = await polygonService.getStockCandles(
                    asset.symbol, 
                    adjustedStartDate, 
                    endDate, 
                    timespan, 
                    1,
                    asset.assetType // Pass asset type to the candle generator for better modeling
                );
                
                if (candles && candles.length > 0) {
                    hasAnyData = true;
                    priceData[asset.symbol] = {};
                    
                    candles.forEach(candle => {
                        const candleDate = startOfDay(new Date(candle.t));
                        const dateStr = format(candleDate, 'yyyy-MM-dd');
                        priceData[asset.symbol][dateStr] = candle.c; // Store closing price
                        
                        // Update date range
                        if (candleDate < earliestDateFound) {
                            earliestDateFound = candleDate;
                        }
                        if (candleDate > latestDateFound) {
                            latestDateFound = candleDate;
                        }
                    });
                    
                    console.log(`[API /historical-performance] Fetched ${candles.length} candles for ${asset.symbol} (type: ${asset.assetType || 'unknown'})`);
                } else {
                    console.warn(`[API /historical-performance] No candle data returned for ${asset.symbol} (type: ${asset.assetType || 'unknown'})`);
                }
            } catch (err) {
                console.error(`[API /historical-performance] Error fetching data for ${asset.symbol}:`, err);
            }
        });

        await Promise.allSettled(candlePromises);

        // Check if any data was fetched
        if (!hasAnyData) {
            console.error('[API /historical-performance] Failed to fetch candle data for all requested assets.');
            return NextResponse.json({ error: 'Failed to fetch historical data for assets' }, { status: 500 });
        }
        
        // Calculate final date range
        const requestedStartDate = startOfDay(parseISO(startDate));
        const finalStartDate = earliestDateFound < requestedStartDate ? requestedStartDate : earliestDateFound;

        console.log(`[API /historical-performance] Processing data from ${format(finalStartDate, 'yyyy-MM-dd')} to ${format(latestDateFound, 'yyyy-MM-dd')}`);

        // Generate all dates in the interval
        const dateInterval = eachDayOfInterval({ start: finalStartDate, end: latestDateFound });
        const historicalValues: HistoricalValue[] = [];
        const lastKnownPrices: { [symbol: string]: number } = {};

        // Calculate portfolio value for each day
        for (const date of dateInterval) {
            const dateStr = format(date, 'yyyy-MM-dd');
            let dailyTotalValue = 0;
            let dataFoundForDay = false;

            for (const asset of assets) {
                // For cash assets, use quantity directly
                if (asset.assetType === 'Cash') {
                    dailyTotalValue += asset.quantity;
                    dataFoundForDay = true;
                    continue;
                }
                
                let price = lastKnownPrices[asset.symbol]; // Start with last known price

                // Update price if data exists for the current symbol and date
                if (priceData[asset.symbol]?.[dateStr]) {
                    price = priceData[asset.symbol][dateStr];
                    lastKnownPrices[asset.symbol] = price; // Update last known price
                    dataFoundForDay = true;
                }
                
                // Only add value if we have a price (either current or last known)
                if (price !== undefined) {
                    dailyTotalValue += asset.quantity * price;
                }
            }

            // Only add point if we had actual data for the day OR it's the first day with carry-over prices
            // And avoid adding points if the total value is zero (e.g., missing all prices)
            if ((dataFoundForDay || historicalValues.length === 0) && dailyTotalValue > 0) {
                historicalValues.push({
                   date: dateStr,
                   value: parseFloat(dailyTotalValue.toFixed(2)), // Round to 2 decimal places
                });
            } else if (!dataFoundForDay && historicalValues.length > 0) {
                // If no new data, carry forward the previous day's value if available
                const previousValue = historicalValues[historicalValues.length - 1].value;
                historicalValues.push({
                    date: dateStr,
                    value: previousValue
                });
            }
        }

        console.log(`[API /historical-performance] Calculated ${historicalValues.length} historical data points`);
        return NextResponse.json(historicalValues);

    } catch (error) {
        console.error('[API /historical-performance] Internal Server Error:', error);
        return NextResponse.json({ error: 'Internal server error processing historical performance' }, { status: 500 });
    }
} 