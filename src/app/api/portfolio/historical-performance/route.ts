import { NextRequest, NextResponse } from 'next/server';
import { PolygonService, PolygonCandle } from '@/lib/market-data/PolygonService';
import { format, parseISO, eachDayOfInterval, isValid, subDays, startOfDay } from 'date-fns';

interface PortfolioAsset {
    symbol: string;
    quantity: number;
    // value is not needed here, quantity is key
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
        let earliestDataDate: Date | null = null;
        let latestDataDate: Date | null = null;

        console.log(`[API /historical-performance] Fetching data for ${assets.length} assets from ${startDate} to ${endDate}`);

        // Fetch candle data for all assets concurrently
        const candlePromises = assets.map(async (asset) => {
            // Fetch slightly more data to handle missing start points better
            const adjustedStartDate = format(subDays(parseISO(startDate), 7), 'yyyy-MM-dd');
            const candles = await polygonService.getStockCandles(asset.symbol, adjustedStartDate, endDate, 'day', 1);
            if (candles && candles.length > 0) {
                priceData[asset.symbol] = {};
                candles.forEach(candle => {
                    const dateStr = format(new Date(candle.t), 'yyyy-MM-dd');
                    priceData[asset.symbol][dateStr] = candle.c; // Store closing price
                    
                    // Track overall date range
                    const candleDate = startOfDay(new Date(candle.t));
                    if (!earliestDataDate || candleDate < earliestDataDate) earliestDataDate = candleDate;
                    if (!latestDataDate || candleDate > latestDataDate) latestDataDate = candleDate;
                });
                console.log(`[API /historical-performance] Fetched ${candles.length} candles for ${asset.symbol}`);
            } else {
                console.warn(`[API /historical-performance] No candle data returned for ${asset.symbol}`);
            }
        });

        await Promise.all(candlePromises);

        // Check if any data was fetched
        if (Object.keys(priceData).length === 0 || !earliestDataDate || !latestDataDate) {
            console.error('[API /historical-performance] Failed to fetch candle data for all requested assets.');
            return NextResponse.json({ error: 'Failed to fetch historical data for assets' }, { status: 500 });
        }
        
        // Ensure date range starts from the requested start date, not just the earliest fetched data date
        const requestedStartDate = startOfDay(parseISO(startDate));
        const finalStartDate = earliestDataDate > requestedStartDate ? earliestDataDate : requestedStartDate;

        console.log(`[API /historical-performance] Processing data from ${format(finalStartDate, 'yyyy-MM-dd')} to ${format(latestDataDate, 'yyyy-MM-dd')}`);

        // Generate all dates in the interval
        const dateInterval = eachDayOfInterval({ start: finalStartDate, end: latestDataDate });
        const historicalValues: HistoricalValue[] = [];
        const lastKnownPrices: { [symbol: string]: number } = {};

        // Calculate portfolio value for each day
        for (const date of dateInterval) {
            const dateStr = format(date, 'yyyy-MM-dd');
            let dailyTotalValue = 0;
            let dataFoundForDay = false;

            for (const asset of assets) {
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