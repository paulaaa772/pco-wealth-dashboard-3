import React, { useState, useEffect } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';

// Generate mock forecast data with confidence bands
const generateMockForecastData = (ticker: string, currentPrice: number) => {
  // Generate dates for the next 30 days
  const startDate = new Date();
  const forecastData = [];
  const volatility = Math.random() * 0.1 + 0.05; // Random volatility between 5-15%
  
  // Decide on trend direction (up, down, or sideways)
  const trendCoef = Math.random() > 0.5 ? (Math.random() * 0.005 + 0.001) : -(Math.random() * 0.005 + 0.001);
  
  // Starting values
  let price = currentPrice;
  
  // Historical data - 30 days back
  for (let i = -30; i < 0; i++) {
    const date = new Date();
    date.setDate(startDate.getDate() + i);
    
    // Simulate historical price movement
    const dailyChange = (Math.random() - 0.48) * volatility * currentPrice;
    price += dailyChange;
    
    // Ensure price doesn't go negative
    if (price < 0) price = Math.random() * 5;
    
    forecastData.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      isHistory: true
    });
  }
  
  // Reset price to current
  price = currentPrice;
  
  // Forecast data - 30 days forward
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(startDate.getDate() + i);
    
    // Apply trend coefficient and random noise
    const dailyChange = (trendCoef * currentPrice) + ((Math.random() - 0.5) * volatility * currentPrice);
    price += dailyChange;
    
    // Calculate upper and lower confidence bands (wider as we go further in time)
    const bandWidth = currentPrice * volatility * (i / 10);
    const upperBand = price + bandWidth;
    const lowerBand = price - bandWidth;
    
    forecastData.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      upperBand: parseFloat(upperBand.toFixed(2)),
      lowerBand: parseFloat(lowerBand.toFixed(2)),
      isHistory: false
    });
  }
  
  return forecastData;
};

interface AIStockForecastProps {
  // Add props if needed
}

const AIStockForecast: React.FC<AIStockForecastProps> = () => {
  const { manualAccounts, isLoading: accountsLoading } = useManualAccounts();
  const [selectedTicker, setSelectedTicker] = useState<string>('');
  const [customTicker, setCustomTicker] = useState<string>('');
  const [isGeneratingForecast, setIsGeneratingForecast] = useState<boolean>(false);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [portfolioHoldings, setPortfolioHoldings] = useState<Array<{ticker: string, name: string, currentPrice: number, weight: number, assetType?: string}>>([]);
  
  // Mock AI forecast metadata
  const [forecastMetadata, setForecastMetadata] = useState({
    ticker: '',
    name: '',
    targetPrice: '0.00',
    confidence: 0,
    startPrice: 0,
    timeframe: '30 days',
    sentiment: 'Neutral',
    lastUpdated: new Date().toISOString()
  });
  
  // Extract real portfolio holdings from manual accounts
  useEffect(() => {
    if (!accountsLoading && manualAccounts.length > 0) {
      // Calculate total portfolio value
      const totalValue = manualAccounts.reduce((sum, account) => sum + account.totalValue, 0);
      
      // Extract unique tickers and aggregate their values
      const holdingsMap = new Map<string, {value: number, quantity: number, assetType?: string}>();
      
      manualAccounts.forEach(account => {
        account.assets.forEach(asset => {
          const current = holdingsMap.get(asset.symbol) || {value: 0, quantity: 0, assetType: asset.assetType};
          holdingsMap.set(asset.symbol, {
            value: current.value + asset.value,
            quantity: current.quantity + asset.quantity,
            assetType: asset.assetType || current.assetType
          });
        });
      });
      
      // Convert to array and calculate weights
      const holdingsArray = Array.from(holdingsMap.entries()).map(([ticker, data]) => ({
        ticker,
        name: getName(ticker), // Helper function to get stock names
        currentPrice: data.value / data.quantity,
        weight: (data.value / totalValue) * 100,
        assetType: data.assetType
      }));
      
      // Sort by weight (descending)
      holdingsArray.sort((a, b) => b.weight - a.weight);
      
      // Keep only top 5 holdings that are stocks or ETFs
      const topHoldings = holdingsArray
        .filter(holding => !holding.assetType || holding.assetType === 'Stock' || holding.assetType === 'ETF')
        .slice(0, 5);
      
      setPortfolioHoldings(topHoldings);
      
      // Set initial selection if we have holdings and none is selected yet
      if (topHoldings.length > 0 && !selectedTicker) {
        handleSelectTicker(topHoldings[0].ticker);
      }
    }
  }, [accountsLoading, manualAccounts]);
  
  // Helper function to get stock names
  const getName = (ticker: string): string => {
    // Map common tickers to names
    const nameMap: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corp.',
      'GOOGL': 'Alphabet Inc.',
      'GOOG': 'Alphabet Inc.',
      'AMZN': 'Amazon.com, Inc.',
      'TSLA': 'Tesla, Inc.',
      'META': 'Meta Platforms, Inc.',
      'NVDA': 'NVIDIA Corp.',
      'BRK.B': 'Berkshire Hathaway Inc.',
      'JPM': 'JPMorgan Chase & Co.',
      'JNJ': 'Johnson & Johnson',
      'V': 'Visa Inc.',
      'UNH': 'UnitedHealth Group Inc.',
      'HD': 'Home Depot, Inc.',
      'PG': 'Procter & Gamble Co.',
      'BAC': 'Bank of America Corp.',
      'MA': 'Mastercard Inc.',
      'XOM': 'Exxon Mobil Corp.',
      'AVGO': 'Broadcom Inc.',
      'CSCO': 'Cisco Systems, Inc.'
    };
    
    return nameMap[ticker] || `${ticker} Stock`;
  };
  
  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    setIsGeneratingForecast(true);
    
    // Find holding data
    const holding = portfolioHoldings.find(h => h.ticker === ticker);
    
    // Simulate forecast generation
    setTimeout(() => {
      if (holding) {
        const newForecastData = generateMockForecastData(ticker, holding.currentPrice);
        setForecastData(newForecastData);
        
        // Update metadata
        setForecastMetadata({
          ticker: holding.ticker,
          name: holding.name,
          targetPrice: (holding.currentPrice * (1 + Math.random() * 0.2 - 0.1)).toFixed(2),
          confidence: Math.floor(Math.random() * 40 + 60),
          startPrice: holding.currentPrice,
          timeframe: '30 days',
          sentiment: Math.random() > 0.6 ? 'Bullish' : Math.random() > 0.3 ? 'Neutral' : 'Bearish',
          lastUpdated: new Date().toISOString()
        });
      }
      
      setIsGeneratingForecast(false);
    }, 1500);
  };
  
  const handleCustomSearch = () => {
    if (!customTicker) return;
    
    setSelectedTicker('custom');
    setIsGeneratingForecast(true);
    
    // Simulate forecast generation
    setTimeout(() => {
      const mockPrice = Math.random() * 500 + 50;
      const newForecastData = generateMockForecastData(customTicker, mockPrice);
      setForecastData(newForecastData);
      
      // Update metadata
      setForecastMetadata({
        ticker: customTicker,
        name: `${customTicker} Stock`,
        targetPrice: (mockPrice * (1 + Math.random() * 0.2 - 0.1)).toFixed(2),
        confidence: Math.floor(Math.random() * 40 + 60),
        startPrice: mockPrice,
        timeframe: '30 days',
        sentiment: Math.random() > 0.6 ? 'Bullish' : Math.random() > 0.3 ? 'Neutral' : 'Bearish',
        lastUpdated: new Date().toISOString()
      });
      
      setIsGeneratingForecast(false);
    }, 2000);
  };
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish': return 'bg-green-600 hover:bg-green-700';
      case 'bearish': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-yellow-500 hover:bg-yellow-600';
    }
  };
  
  // Calculate current and forecast prices
  const currentPrice = forecastData.find(d => !d.isHistory)?.price || 0;
  const finalForecast = forecastData[forecastData.length - 1]?.price || 0;
  const priceDifference = finalForecast - currentPrice;
  const percentChange = ((priceDifference / currentPrice) * 100).toFixed(2);

  // Show loading state when accounts data is loading
  if (accountsLoading) {
    return (
      <div className="flex justify-center items-center h-72">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading portfolio holdings...</p>
        </div>
      </div>
    );
  }

  // Handle empty portfolio
  if (!accountsLoading && portfolioHoldings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">AI Stock Price Forecast</h2>
            <p className="text-gray-400 text-sm">Machine learning-based price predictions and trend analysis</p>
          </div>
        </div>
        
        <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-300 mb-4">No holdings found in your portfolio. Add some assets or try a custom ticker instead.</p>
            
            <div className="flex gap-2 mt-4 w-full max-w-md">
              <Input 
                placeholder="Enter ticker symbol..." 
                value={customTicker} 
                onChange={e => setCustomTicker(e.target.value.toUpperCase())}
                className="bg-[#1B2B4B] border-gray-700 text-white"
                maxLength={5}
              />
              <Button
                onClick={handleCustomSearch}
                disabled={!customTicker || isGeneratingForecast}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Forecast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Stock Price Forecast</h2>
          <p className="text-gray-400 text-sm">Machine learning-based price predictions and trend analysis</p>
        </div>
      </div>
      
      {/* Search and Tabs */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <div className="flex gap-2 flex-wrap mb-4">
            {portfolioHoldings.map(holding => (
              <Button
                key={holding.ticker}
                onClick={() => handleSelectTicker(holding.ticker)}
                variant={selectedTicker === holding.ticker ? "default" : "outline"}
                className={`${selectedTicker === holding.ticker ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1B2B4B]/40 border-gray-700'}`}
                disabled={isGeneratingForecast}
              >
                {holding.ticker}
                {holding.weight > 0 && (
                  <span className="ml-1 text-xs opacity-70">{holding.weight.toFixed(1)}%</span>
                )}
                {holding.assetType && (
                  <span className="ml-2 text-xs opacity-70">{holding.assetType}</span>
                )}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2 mb-6">
            <Input 
              placeholder="Enter ticker symbol..." 
              value={customTicker} 
              onChange={e => setCustomTicker(e.target.value.toUpperCase())}
              className="bg-[#1B2B4B] border-gray-700 text-white"
              maxLength={5}
            />
            <Button
              onClick={handleCustomSearch}
              disabled={!customTicker || isGeneratingForecast}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Forecast
            </Button>
          </div>
        </div>
        
        <div className="w-full md:w-1/3 flex flex-col md:items-end">
          <div className="bg-[#1B2B4B]/60 rounded-lg p-3 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Symbol</span>
              <span className="font-medium">{forecastMetadata.ticker}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Sentiment</span>
              <Badge className={`${getSentimentColor(forecastMetadata.sentiment)} text-white text-xs`}>
                {forecastMetadata.sentiment}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Confidence</span>
              <span className="font-medium">{forecastMetadata.confidence}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Forecast Chart */}
      <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {forecastMetadata.name} ({forecastMetadata.ticker}) - {forecastMetadata.timeframe} Forecast
              </CardTitle>
              <CardDescription className="text-gray-400">
                AI prediction based on technical indicators, market sentiment, and historical patterns
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Predicted Target:</span>
                <span className={`font-medium text-lg ${priceDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${forecastMetadata.targetPrice}
                </span>
              </div>
              <span className={`text-sm ${priceDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceDifference >= 0 ? '+' : ''}{percentChange}%
              </span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isGeneratingForecast ? (
            <div className="flex justify-center items-center h-72">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">Generating forecast, please wait...</p>
              </div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={forecastData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#9CA3AF' }}
                    tickFormatter={formatDate}
                    minTickGap={30}
                  />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                    labelFormatter={(label) => formatDate(label)}
                  />
                  <Legend />
                  
                  {/* Divider between historical and forecast */}
                  <ReferenceLine 
                    x={forecastData.find(d => !d.isHistory)?.date} 
                    stroke="#FFFFFF" 
                    strokeDasharray="3 3" 
                    label={{ value: 'Today', position: 'top', fill: '#FFFFFF' }} 
                  />
                  
                  {/* Confidence bands - only for forecast section */}
                  <Area 
                    type="monotone" 
                    name="Confidence Range"
                    dataKey="upperBand" 
                    stroke="none"
                    fillOpacity={1}
                    fill="url(#colorBand)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lowerBand" 
                    stroke="none"
                    fillOpacity={0}
                  />
                  
                  {/* Price line */}
                  <Area
                    type="monotone"
                    name="Price"
                    dataKey="price"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Forecast factors - only show when forecast is ready */}
          {!isGeneratingForecast && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1B2B4B]/60 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Technical Factors</h3>
                <p className="text-xs text-gray-300">
                  {forecastMetadata.sentiment === 'Bullish' ? 
                    `${forecastMetadata.ticker} shows positive momentum with strong support levels and favorable moving averages.` : 
                    forecastMetadata.sentiment === 'Bearish' ?
                    `${forecastMetadata.ticker} exhibits declining momentum with resistance levels acting as price ceilings.` :
                    `${forecastMetadata.ticker} is trading in a range-bound pattern with mixed technical signals.`}
                </p>
              </div>
              
              <div className="bg-[#1B2B4B]/60 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Sentiment Analysis</h3>
                <p className="text-xs text-gray-300">
                  {forecastMetadata.sentiment === 'Bullish' ? 
                    `Market sentiment for ${forecastMetadata.ticker} is positive with increased institutional buying and favorable news coverage.` : 
                    forecastMetadata.sentiment === 'Bearish' ?
                    `${forecastMetadata.ticker} faces negative sentiment due to sector rotation and competitive pressures.` :
                    `Mixed sentiment indicators for ${forecastMetadata.ticker} with balanced positive and negative factors.`}
                </p>
              </div>
              
              <div className="bg-[#1B2B4B]/60 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Fundamental Outlook</h3>
                <p className="text-xs text-gray-300">
                  {forecastMetadata.sentiment === 'Bullish' ? 
                    `${forecastMetadata.ticker}'s valuation metrics are favorable compared to peers with strong growth potential.` : 
                    forecastMetadata.sentiment === 'Bearish' ?
                    `${forecastMetadata.ticker} shows concerning fundamental trends with pressure on margins and growth rates.` :
                    `${forecastMetadata.ticker} demonstrates stable fundamentals with moderate growth expectations.`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <p className="text-xs text-gray-400">
            AI forecasts are based on historical patterns and market data. Price targets represent potential outcomes 
            and should not be considered investment advice. Market conditions can change rapidly.
            <span className="block mt-1">Last updated: {new Date(forecastMetadata.lastUpdated).toLocaleString()}</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIStockForecast; 