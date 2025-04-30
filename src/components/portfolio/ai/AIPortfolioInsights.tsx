import React, { useState, useEffect } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Mock data - would be replaced with actual AI service calls
const mockInsights = [
  {
    id: 'sector-overweight',
    category: 'allocation',
    title: 'Technology Sector Overweight',
    description: 'Your portfolio has a 35% allocation to technology stocks, compared to 28% in the S&P 500 benchmark.',
    recommendation: 'Consider rebalancing to reduce technology exposure by 5-7% to decrease concentration risk.',
    impact: 'high',
    createdAt: '2023-11-10T10:30:00Z'
  },
  {
    id: 'tax-loss-harvest',
    category: 'tax',
    title: 'Tax Loss Harvesting Opportunity',
    description: 'Several holdings are showing unrealized losses that could be harvested for tax benefits.',
    recommendation: 'Consider selling XYZ and ABC to realize losses of approximately $2,400.',
    impact: 'medium',
    createdAt: '2023-11-09T14:15:00Z'
  },
  {
    id: 'diversification-international',
    category: 'allocation',
    title: 'International Exposure Below Target',
    description: 'Your portfolio has only 15% international exposure, below your target allocation of 25%.',
    recommendation: 'Consider increasing international stocks or adding a broad international ETF like VXUS.',
    impact: 'medium',
    createdAt: '2023-11-08T09:45:00Z'
  },
  {
    id: 'interest-rate-risk',
    category: 'risk',
    title: 'Interest Rate Sensitivity',
    description: 'Your bond holdings have an average duration of 8.5 years, making them sensitive to interest rate changes.',
    recommendation: 'Consider adding shorter-duration bonds to reduce interest rate risk if you believe rates will rise.',
    impact: 'medium',
    createdAt: '2023-11-07T16:20:00Z'
  },
  {
    id: 'dividend-growth',
    category: 'income',
    title: 'Dividend Growth Potential',
    description: 'Your portfolio\'s dividend yield is 2.1%, but several holdings have strong dividend growth histories.',
    recommendation: 'Focus on total return including dividend growth rather than solely on current yield.',
    impact: 'low',
    createdAt: '2023-11-06T11:50:00Z'
  },
  {
    id: 'volatility-reduction',
    category: 'risk',
    title: 'Portfolio Volatility Reduction',
    description: 'Portfolio volatility (19.5%) exceeds the S&P 500 (17.2%). This may lead to larger drawdowns in market corrections.',
    recommendation: 'Consider adding low-correlation assets like value stocks or consumer staples to reduce overall volatility.',
    impact: 'high',
    createdAt: '2023-11-05T13:40:00Z'
  }
];

// Mock market forecasts
const mockMarketForecasts = [
  {
    period: 'Q4 2023',
    prediction: 'Moderate growth expected in major indices with continued volatility due to interest rate uncertainty.',
    sectors: [
      { name: 'Technology', outlook: 'Neutral', rationale: 'Valuation concerns offset by strong earnings' },
      { name: 'Healthcare', outlook: 'Bullish', rationale: 'Defensive characteristics and innovation pipeline' },
      { name: 'Energy', outlook: 'Bearish', rationale: 'Demand concerns amid economic slowdown' }
    ]
  },
  {
    period: 'H1 2024',
    prediction: 'Economic data suggests slowing growth but avoiding deep recession. Markets likely to favor quality companies with strong balance sheets.',
    sectors: [
      { name: 'Financials', outlook: 'Bullish', rationale: 'Beneficiary of stable interest rate environment' },
      { name: 'Consumer Discretionary', outlook: 'Bearish', rationale: 'Pressure from reduced consumer spending' },
      { name: 'Utilities', outlook: 'Neutral', rationale: 'Attractive yields but rate sensitivity remains a concern' }
    ]
  }
];

// Mock AI-generated trend data
const mockTrendData = Array.from({ length: 12 }, (_, i) => ({
  month: `${i + 1}/23`,
  marketSentiment: 40 + Math.random() * 35,
  portfolioAlignment: 35 + Math.random() * 40,
}));

// Mock AI scoring for portfolio
const mockPortfolioScores = {
  growth: 72,
  risk: 65,
  quality: 81,
  value: 58,
  momentum: 69,
  stability: 77
};

interface AIPortfolioInsightsProps {
  // Add props if needed
}

const AIPortfolioInsights: React.FC<AIPortfolioInsightsProps> = () => {
  const { manualAccounts, isLoading } = useManualAccounts();
  const [activeTab, setActiveTab] = useState<string>('insights');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showMockInsights, setShowMockInsights] = useState<boolean>(false);
  const [generateStartTime, setGenerateStartTime] = useState<number | null>(null);
  const [customInsights, setCustomInsights] = useState<typeof mockInsights>([]);
  
  // Process portfolio data when manualAccounts changes or insights are generated
  useEffect(() => {
    if (!isLoading && manualAccounts.length > 0 && showMockInsights) {
      generatePortfolioInsights();
    }
  }, [isLoading, manualAccounts, showMockInsights]);
  
  // Generate insights based on actual portfolio data
  const generatePortfolioInsights = () => {
    // Get total portfolio value
    const totalValue = manualAccounts.reduce((sum, account) => sum + account.totalValue, 0);
    
    // Get portfolio sector allocation
    const sectors: Record<string, number> = {};
    manualAccounts.forEach(account => {
      account.assets.forEach(asset => {
        // Assign mock sectors based on symbol patterns
        let sector = 'Other';
        if (/^(AAPL|MSFT|GOOGL|NVDA|AMD|INTC)$/.test(asset.symbol)) sector = 'Technology';
        else if (/^(JPM|BAC|WFC|C|GS)$/.test(asset.symbol)) sector = 'Financials';
        else if (/^(JNJ|PFE|MRK|ABBV|LLY)$/.test(asset.symbol)) sector = 'Healthcare';
        else if (/^(XOM|CVX|COP|BP|SLB)$/.test(asset.symbol)) sector = 'Energy';
        else if (/^(AMZN|TSLA|HD|MCD|NKE)$/.test(asset.symbol)) sector = 'Consumer';
        
        sectors[sector] = (sectors[sector] || 0) + asset.value;
      });
    });
    
    // Calculate sector percentages
    const sectorPercents: Record<string, number> = {};
    Object.entries(sectors).forEach(([sector, value]) => {
      sectorPercents[sector] = (value / totalValue) * 100;
    });
    
    // Calculate asset type distribution
    const assetTypes: Record<string, number> = {};
    manualAccounts.forEach(account => {
      account.assets.forEach(asset => {
        const type = asset.assetType || 'Unspecified';
        assetTypes[type] = (assetTypes[type] || 0) + asset.value;
      });
    });
    
    // Calculate asset type percentages
    const assetTypePercents: Record<string, number> = {};
    Object.entries(assetTypes).forEach(([type, value]) => {
      assetTypePercents[type] = (value / totalValue) * 100;
    });
    
    // Create custom insights based on portfolio analysis
    const newInsights = [];
    
    // 1. Sector overweight/underweight insight
    const techPercent = sectorPercents['Technology'] || 0;
    if (techPercent > 30) {
      newInsights.push({
        id: 'sector-overweight',
        category: 'allocation',
        title: 'Technology Sector Overweight',
        description: `Your portfolio has a ${techPercent.toFixed(1)}% allocation to technology stocks, compared to 28% in the S&P 500 benchmark.`,
        recommendation: 'Consider rebalancing to reduce technology exposure by 5-7% to decrease concentration risk.',
        impact: 'high',
        createdAt: new Date().toISOString()
      });
    } else if (techPercent < 15 && techPercent > 0) {
      newInsights.push({
        id: 'sector-underweight',
        category: 'allocation',
        title: 'Technology Sector Underweight',
        description: `Your portfolio has only a ${techPercent.toFixed(1)}% allocation to technology stocks, compared to 28% in the S&P 500 benchmark.`,
        recommendation: 'Consider increasing exposure to quality technology companies to enhance long-term growth potential.',
        impact: 'medium',
        createdAt: new Date().toISOString()
      });
    }
    
    // 2. Asset type diversification insight
    const stockPercent = assetTypePercents['Stock'] || 0;
    const bondPercent = assetTypePercents['Bond'] || 0;
    
    if (stockPercent > 80) {
      newInsights.push({
        id: 'stock-heavy',
        category: 'risk',
        title: 'Stock-Heavy Portfolio',
        description: `Your portfolio is ${stockPercent.toFixed(1)}% allocated to stocks, which may increase volatility during market downturns.`,
        recommendation: 'Consider adding some bond exposure for better diversification and downside protection.',
        impact: 'high',
        createdAt: new Date().toISOString()
      });
    } else if (bondPercent > 80) {
      newInsights.push({
        id: 'bond-heavy',
        category: 'growth',
        title: 'Bond-Heavy Portfolio',
        description: `Your portfolio is ${bondPercent.toFixed(1)}% allocated to bonds, which may limit long-term growth potential.`,
        recommendation: 'Consider adding some equity exposure to increase long-term growth potential.',
        impact: 'medium',
        createdAt: new Date().toISOString()
      });
    }
    
    // 3. Asset type balance insight
    if (stockPercent > 0 && bondPercent > 0) {
      const stockToBondRatio = stockPercent / bondPercent;
      if (stockToBondRatio > 3 && stockToBondRatio < 5) {
        newInsights.push({
          id: 'balanced-portfolio',
          category: 'allocation',
          title: 'Well-Balanced Portfolio',
          description: `Your stock-to-bond ratio of ${stockToBondRatio.toFixed(1)}:1 provides a good balance between growth and stability.`,
          recommendation: 'Maintain this allocation and rebalance periodically to keep these proportions steady.',
          impact: 'low',
          createdAt: new Date().toISOString()
        });
      }
    }
    
    // 3. Portfolio size insight
    const assetCount = manualAccounts.reduce((count, account) => count + account.assets.length, 0);
    if (assetCount > 30) {
      newInsights.push({
        id: 'portfolio-complexity',
        category: 'management',
        title: 'Portfolio Complexity',
        description: `Your portfolio contains ${assetCount} individual positions, which may be challenging to monitor effectively.`,
        recommendation: 'Consider consolidating smaller positions and using ETFs for broad market exposure to simplify management.',
        impact: 'medium',
        createdAt: new Date().toISOString()
      });
    } else if (assetCount < 10 && assetCount > 0) {
      newInsights.push({
        id: 'concentration-risk',
        category: 'risk',
        title: 'Position Concentration Risk',
        description: `Your portfolio consists of only ${assetCount} positions, potentially increasing company-specific risk.`,
        recommendation: 'Consider adding more diversified positions or ETFs to reduce individual company risk.',
        impact: 'high',
        createdAt: new Date().toISOString()
      });
    }
    
    // 4. Add a tax insight
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 9) { // October through December
      newInsights.push({
        id: 'tax-loss-harvest',
        category: 'tax',
        title: 'Tax Loss Harvesting Opportunity',
        description: 'Year-end tax planning could benefit your portfolio with strategic loss harvesting.',
        recommendation: 'Review your positions for unrealized losses that could offset gains and reduce your tax liability.',
        impact: 'medium',
        createdAt: new Date().toISOString()
      });
    }
    
    // Add more portfolio-specific insights
    // Use mockInsights as fallback if needed
    if (newInsights.length < 3) {
      // Add some generic insights from mock data
      newInsights.push(...mockInsights.slice(0, 4 - newInsights.length));
    }
    
    setCustomInsights(newInsights);
  };
  
  const handleGenerateInsights = () => {
    setIsGenerating(true);
    setGenerateStartTime(Date.now());
    
    // Simulate AI analysis time
    setTimeout(() => {
      setIsGenerating(false);
      setShowMockInsights(true);
    }, 3500);
  };
  
  // For the progress bar during generation
  const [progress, setProgress] = useState<number>(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isGenerating && generateStartTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - generateStartTime;
        const newProgress = Math.min(Math.floor((elapsed / 3500) * 100), 99);
        setProgress(newProgress);
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, generateStartTime]);
  
  // Filter insights by category for the selected tab
  const getFilteredInsights = (category?: string) => {
    const insightsToUse = customInsights.length > 0 ? customInsights : mockInsights;
    if (!category) return insightsToUse;
    return insightsToUse.filter(insight => insight.category === category);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Get badge color based on impact level
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-600 hover:bg-red-700';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };
  
  const getSectorOutlookColor = (outlook: string) => {
    switch (outlook.toLowerCase()) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Portfolio Insights</h2>
          <p className="text-gray-400 text-sm">Intelligent analysis and recommendations for your portfolio</p>
        </div>
        
        <Button
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Analyzing... {progress}%
            </>
          ) : (
            'Generate New Insights'
          )}
        </Button>
      </div>
      
      {/* Main content area */}
      <Tabs defaultValue="insights" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-[#1B2B4B] border-b border-gray-700 w-full justify-start">
          <TabsTrigger 
            value="insights" 
            className="data-[state=active]:bg-[#2A3C61] data-[state=active]:text-white"
          >
            Insights
          </TabsTrigger>
          <TabsTrigger 
            value="market" 
            className="data-[state=active]:bg-[#2A3C61] data-[state=active]:text-white"
          >
            Market Outlook
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="data-[state=active]:bg-[#2A3C61] data-[state=active]:text-white"
          >
            Trends & Patterns
          </TabsTrigger>
          <TabsTrigger 
            value="scoring" 
            className="data-[state=active]:bg-[#2A3C61] data-[state=active]:text-white"
          >
            Portfolio Scoring
          </TabsTrigger>
        </TabsList>
        
        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-4">
          {isLoading || isGenerating ? (
            <div className="flex justify-center items-center h-60 bg-[#1B2B4B]/40 rounded-lg">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">
                  {isGenerating ? 'Analyzing your portfolio data...' : 'Loading...'}
                </p>
              </div>
            </div>
          ) : showMockInsights ? (
            <div className="space-y-4">
              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('insights')}
                  className={`text-xs py-1 px-3 ${!activeTab.includes('-') ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-[#1B2B4B]/40 border-gray-700'}`}
                >
                  All Insights
                </Button>
                
                {Array.from(new Set(mockInsights.map(i => i.category))).map(category => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab(`insights-${category}`)}
                    className={`text-xs py-1 px-3 ${activeTab === `insights-${category}` ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-[#1B2B4B]/40 border-gray-700'}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
              
              {/* Insights list */}
              <div className="space-y-4">
                {getFilteredInsights(activeTab.includes('-') ? activeTab.split('-')[1] : undefined).map(insight => (
                  <Card key={insight.id} className="bg-[#2A3C61]/30 border-gray-700 text-white">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getImpactColor(insight.impact)} text-white text-xs`}>
                            {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                          </Badge>
                          <span className="text-xs text-gray-400">{formatDate(insight.createdAt)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                      <div className="bg-[#1B2B4B]/60 p-3 rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm font-medium text-white">Recommendation:</p>
                        <p className="text-sm text-gray-300">{insight.recommendation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-[#1B2B4B]/40 rounded-lg">
              <p className="text-gray-400 mb-4">No insights generated yet.</p>
              <Button
                onClick={handleGenerateInsights}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Generate Insights
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Market Outlook Tab */}
        <TabsContent value="market" className="mt-4">
          <div className="space-y-6">
            <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Market Forecast</CardTitle>
                <CardDescription className="text-gray-400">
                  AI-generated market outlook based on economic indicators and technical analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockMarketForecasts.map((forecast, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="text-md font-medium text-white">{forecast.period} Outlook</h3>
                    <p className="text-sm text-gray-300">{forecast.prediction}</p>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Sector Analysis:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {forecast.sectors.map((sector, i) => (
                          <div key={i} className="bg-[#1B2B4B]/40 p-3 rounded-lg">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{sector.name}</span>
                              <span className={`text-sm font-medium ${getSectorOutlookColor(sector.outlook)}`}>
                                {sector.outlook}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">{sector.rationale}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {index < mockMarketForecasts.length - 1 && (
                      <div className="border-b border-gray-700 my-4"></div>
                    )}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <p className="text-xs text-gray-400">
                  Forecasts are for informational purposes only and should not be considered investment advice.
                  Market conditions can change rapidly and predictions may not be accurate.
                </p>
              </CardFooter>
            </Card>
            
            <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Portfolio Impact Analysis</CardTitle>
                <CardDescription className="text-gray-400">
                  How current market conditions may affect your specific holdings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-[#1B2B4B]/60 p-3 rounded-lg">
                    <p className="text-sm text-white mb-1">Interest Rate Environment</p>
                    <p className="text-sm text-gray-300">
                      Your portfolio has a mixed sensitivity to interest rates. While your bond holdings (15% of portfolio) 
                      may face headwinds, your banking sector investments (12%) could benefit from stable or rising rates.
                    </p>
                  </div>
                  
                  <div className="bg-[#1B2B4B]/60 p-3 rounded-lg">
                    <p className="text-sm text-white mb-1">Inflation Outlook</p>
                    <p className="text-sm text-gray-300">
                      With inflation trending downward, your growth-oriented holdings (45% of portfolio) may see tailwinds, 
                      while your commodity-related investments (8%) could experience reduced performance.
                    </p>
                  </div>
                  
                  <div className="bg-[#1B2B4B]/60 p-3 rounded-lg">
                    <p className="text-sm text-white mb-1">Economic Growth</p>
                    <p className="text-sm text-gray-300">
                      Current economic indicators suggest moderate growth ahead. Your cyclical consumer discretionary 
                      holdings (18% of portfolio) may benefit, but consider monitoring for signs of economic deceleration.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Trends & Patterns Tab */}
        <TabsContent value="trends" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Market Sentiment & Portfolio Alignment</CardTitle>
                <CardDescription className="text-gray-400">
                  AI-derived trends showing market sentiment and your portfolio's alignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockTrendData}
                      margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                    >
                      <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
                      <YAxis tick={{ fill: '#9CA3AF' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563', color: '#E5E7EB' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="marketSentiment" 
                        stroke="#3B82F6" 
                        strokeWidth={2} 
                        dot={false}
                        name="Market Sentiment"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="portfolioAlignment" 
                        stroke="#10B981" 
                        strokeWidth={2} 
                        dot={false}
                        name="Portfolio Alignment"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  This analysis compares overall market sentiment with how well your portfolio is positioned 
                  for current and anticipated market conditions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="text-lg">Performance Attribution</CardTitle>
                <CardDescription className="text-gray-400">
                  AI analysis of your portfolio's performance drivers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">Performance Factors (Last 12 Months)</p>
                    
                    <div className="bg-[#1B2B4B]/40 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Sector Allocation</span>
                        <span className="text-sm text-green-400">+3.2%</span>
                      </div>
                      <p className="text-xs text-gray-400">Your overweight to technology and healthcare contributed positively.</p>
                    </div>
                    
                    <div className="bg-[#1B2B4B]/40 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Security Selection</span>
                        <span className="text-sm text-red-400">-1.5%</span>
                      </div>
                      <p className="text-xs text-gray-400">Individual stock picks in consumer discretionary underperformed sector benchmark.</p>
                    </div>
                    
                    <div className="bg-[#1B2B4B]/40 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Market Timing</span>
                        <span className="text-sm text-gray-400">+0.3%</span>
                      </div>
                      <p className="text-xs text-gray-400">Cash deployment timing had minimal positive impact.</p>
                    </div>
                    
                    <div className="bg-[#1B2B4B]/40 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Total Active Return</span>
                        <span className="text-sm text-green-400">+2.0%</span>
                      </div>
                      <p className="text-xs text-gray-400">Overall outperformance versus benchmark.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Portfolio Scoring Tab */}
        <TabsContent value="scoring" className="mt-4">
          <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-lg">AI Portfolio Score</CardTitle>
              <CardDescription className="text-gray-400">
                Multi-factor evaluation of your portfolio across key investment dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    {Object.entries(mockPortfolioScores).map(([factor, score]) => (
                      <div key={factor} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium capitalize">{factor}</span>
                          <span className="text-sm font-medium">{score}/100</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {factor === 'growth' && 'Measures exposure to companies with strong earnings growth potential'}
                          {factor === 'risk' && 'Evaluates overall portfolio volatility and downside protection'}
                          {factor === 'quality' && 'Assesses financial strength and stability of underlying holdings'}
                          {factor === 'value' && 'Measures exposure to undervalued assets relative to fundamentals'}
                          {factor === 'momentum' && 'Evaluates alignment with positive price trends and market sentiment'}
                          {factor === 'stability' && 'Measures consistency of returns and dividend reliability'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="bg-[#1B2B4B]/60 p-4 rounded-lg mb-4">
                    <h3 className="text-md font-medium mb-2">Portfolio Strengths</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Strong quality metrics with solid balance sheets and stable earnings</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Good stability score indicating reliable performance in various market conditions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Above-average growth potential aligned with long-term market trends</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#1B2B4B]/60 p-4 rounded-lg">
                    <h3 className="text-md font-medium mb-2">Improvement Opportunities</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">△</span>
                        <span>Value score indicates potential overexposure to relatively expensive assets</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">△</span>
                        <span>Risk metrics suggest vulnerability to market volatility and corrections</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-red-400 mr-2">△</span>
                        <span>Moderate momentum score indicates some holdings may face near-term headwinds</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-400">
                Scores are calculated using a proprietary algorithm that evaluates multiple factors
                within each category, including both fundamental and technical indicators.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPortfolioInsights; 