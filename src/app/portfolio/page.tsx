'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tab } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic' // Import dynamic
import {
  ChartPieIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CogIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import {
  PlusCircle,
  CheckSquare,
  Flag,
  LineChart,
  RefreshCw,
  Download,
  Plus,
  MinusCircle,
  Edit,
  Share2
} from 'lucide-react'

// Import our custom components
import NetWorthChart from '@/components/dashboard/NetWorthChart';
import DonutChart from '@/components/dashboard/DonutChart';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import AiAssistantPanel from '@/components/dashboard/AiAssistantPanel';
import ActivityContentComponent from '@/components/dashboard/ActivityContent';
import FundingContentComponent from '@/components/dashboard/FundingContent';
import ResponsiveDataTable from '@/components/dashboard/ResponsiveDataTable';
import ErrorBoundaryComponent from '@/components/ErrorBoundary';

// Import custom hooks
import { useNetWorthChartData, useAllocationData, useHoldingsData } from '@/hooks/usePortfolioData';

// Import the new components and mock data
import { PortfolioPerformanceReport } from '@/components/portfolio/PortfolioPerformanceReport';
import { 
  generateMockPerformanceData, 
  generateMockRiskMetrics, 
  generateMockSectorAllocations,
  calculateReturns 
} from '@/lib/portfolio/mockPerformanceData';

// Dynamically import tab content components
const ActivityContentComponentDynamic = dynamic(() => import('@/components/dashboard/ActivityContent'), { ssr: false, loading: () => <LoadingSpinner /> }); // Keep this
const FundingContentComponentDynamic = dynamic(() => import('@/components/dashboard/FundingContent'), { ssr: false, loading: () => <LoadingSpinner /> }); // Keep this
const HoldingsTabDynamic = dynamic(() => import('@/components/portfolio/HoldingsTab'), { ssr: false, loading: () => <LoadingSpinner /> });
const TaxAndProfitTabDynamic = dynamic(() => import('@/components/portfolio/TaxAndProfitTab'), { ssr: false, loading: () => <LoadingSpinner /> });
const TransfersTabDynamic = dynamic(() => import('@/components/portfolio/TransfersTab'), { ssr: false, loading: () => <LoadingSpinner /> });

// Add dynamic import for the new GoalsTab component
const GoalsTabDynamic = dynamic(() => import('@/components/portfolio/GoalsTab'), { ssr: false, loading: () => <LoadingSpinner /> });

// Updated chart data points for the line graph with more detailed data
interface DataPoint {
  date: Date;
  value: number;
}

const chartData: DataPoint[] = [
  { date: new Date('2024-06-01'), value: 1000 },
  { date: new Date('2024-06-15'), value: 1500 },
  { date: new Date('2024-07-01'), value: 2000 },
  { date: new Date('2024-07-15'), value: 1800 },
  { date: new Date('2024-08-01'), value: 2200 },
  { date: new Date('2024-08-15'), value: 2100 },
  { date: new Date('2024-09-01'), value: 2500 },
  { date: new Date('2024-09-15'), value: 3000 },
  { date: new Date('2024-10-01'), value: 3200 },
  { date: new Date('2024-10-15'), value: 4000 },
  { date: new Date('2024-11-01'), value: 4500 },
  { date: new Date('2024-11-15'), value: 5000 },
  { date: new Date('2024-12-01'), value: 5500 },
  { date: new Date('2024-12-15'), value: 6000 },
  { date: new Date('2025-01-01'), value: 6500 },
  { date: new Date('2025-01-15'), value: 7000 },
  { date: new Date('2025-02-01'), value: 7200 },
  { date: new Date('2025-02-15'), value: 7100 },
  { date: new Date('2025-03-01'), value: 7300 },
  { date: new Date('2025-03-15'), value: 7400 },
  { date: new Date('2025-04-01'), value: 7500 },
  { date: new Date('2025-04-15'), value: 7516.61 }
];

// Define a type for holdings with sector information
interface Holding {
  name: string;
  symbol: string;
  quantity: number;
  value: number;
  sector?: string;
  accountType?: 'taxable' | 'retirement' | 'crypto' | 'cash';
}

// Add the holdings data with sector information
let holdingsData: Holding[] = [
  // Taxable account investments
  { name: "Tencent", symbol: "TCEHY", quantity: 2, value: 111.84, sector: "Communication Services", accountType: "taxable" },
  { name: "Taiwan Semiconductor", symbol: "TSM", quantity: 2.17, value: 323.89, sector: "Technology", accountType: "taxable" },
  { name: "ASML Holding NV", symbol: "ASML", quantity: 1.04, value: 667.48, sector: "Technology", accountType: "taxable" },
  { name: "Morgan Stanley CD (4.2%)", symbol: "CD", quantity: 1, value: 2000.00, sector: "Fixed Income", accountType: "taxable" },
  { name: "BlackRock Technology Opportuni", symbol: "BGSAX", quantity: 1, value: 57.38, sector: "Technology", accountType: "taxable" },
  { name: "Berkshire Hathaway B", symbol: "BRK.B", quantity: 2, value: 584.65, sector: "Financials", accountType: "taxable" },
  { name: "Caterpillar", symbol: "CAT", quantity: 2, value: 378.74, sector: "Industrials", accountType: "taxable" },
  { name: "iShares Gold Trust", symbol: "IAU", quantity: 1, value: 59.66, sector: "Commodities", accountType: "taxable" },
  { name: "Northrop Grumman", symbol: "NOC", quantity: 1, value: 507.62, sector: "Industrials", accountType: "taxable" },
  { name: "Novo Nordisk ADR", symbol: "NVO", quantity: 1, value: 252.87, sector: "Healthcare", accountType: "taxable" },
  { name: "SPDR S&P 500 ETF", symbol: "SPY", quantity: 2, value: 310.10, sector: "Broad Market", accountType: "taxable" },
  { name: "Vanguard Dividend Appreciation", symbol: "VIG", quantity: 1, value: 192.36, sector: "Broad Market", accountType: "taxable" },
  { name: "Vanguard Total Stock Market ET", symbol: "VTI", quantity: 3, value: 465.21, sector: "Broad Market", accountType: "taxable" },
  { name: "Vanguard Growth ETF", symbol: "VUG", quantity: 2, value: 313.00, sector: "Broad Market", accountType: "taxable" },
  { name: "Consumer Discretionary SPDR", symbol: "XLY", quantity: 1, value: 155.05, sector: "Consumer Discretionary", accountType: "taxable" },
  { name: "Vistra Corp", symbol: "VST", quantity: 1, value: 50.00, sector: "Utilities", accountType: "taxable" },
  { name: "Vanguard Real Estate ETF", symbol: "VNQ", quantity: 2, value: 180.00, sector: "Real Estate", accountType: "taxable" },
  { name: "Health Care Select Sector SPDR", symbol: "XLV", quantity: 1, value: 100.00, sector: "Healthcare", accountType: "taxable" },
  { name: "Pacer Data & Infra REIT ETF", symbol: "SRVR", quantity: 5, value: 120.00, sector: "Real Estate", accountType: "taxable" },
  { name: "NVIDIA", symbol: "NVDA", quantity: 14, value: 1260.00, sector: "Technology", accountType: "taxable" },
  { name: "Lam Research", symbol: "LRCX", quantity: 1, value: 900.00, sector: "Technology", accountType: "taxable" },
  { name: "Kratos Defense", symbol: "KTOS", quantity: 8, value: 120.00, sector: "Industrials", accountType: "taxable" },
  { name: "Intel Corp", symbol: "INTC", quantity: 5, value: 185.00, sector: "Technology", accountType: "taxable" },
  { name: "Agrify Corp", symbol: "AGFY", quantity: 3, value: 5.00, sector: "Consumer Discretionary", accountType: "taxable" },
  { name: "MicroStrategy", symbol: "MSTR", quantity: 0, value: 0.00, sector: "Technology", accountType: "taxable" },
  { name: "Fundrise Portfolio", symbol: "Fundrise", quantity: 1, value: 1117.70, sector: "Real Estate", accountType: "taxable" },
  { name: "Bitcoin", symbol: "BTC", quantity: 0.05, value: 3000.00, sector: "Crypto", accountType: "crypto" },
  { name: "High-Yield Savings", symbol: "HYSA", quantity: 1, value: 12000.00, sector: "Cash", accountType: "cash" },
  
  // Retirement account investments
  { name: "BlackRock Equity Index Fund GG", symbol: "BEIFGG", quantity: 1, value: 16962.49, sector: "Broad Market", accountType: "retirement" },
  { name: "Large Cap Growth III Fund (AmerCentury)", symbol: "LCGFAC", quantity: 1, value: 16011.20, sector: "Large Cap Growth", accountType: "retirement" },
  { name: "American Funds Growth Fund of Amer R6", symbol: "RGAGX", quantity: 1, value: 10972.12, sector: "Large Cap Growth", accountType: "retirement" },
  { name: "Great-West Life Stock", symbol: "GWO", quantity: 1, value: 5478.62, sector: "Financials", accountType: "retirement" },
  { name: "BlackRock US Debt Index Fund L", symbol: "BRDIX", quantity: 1, value: 3137.62, sector: "Fixed Income", accountType: "retirement" },
  { name: "American Funds Capital World G/I R6", symbol: "RWIGX", quantity: 1, value: 3000.52, sector: "Global Equity", accountType: "retirement" },
  { name: "BlackRock Mid Capitalization Eqy Index J", symbol: "BMCIX", quantity: 1, value: 2681.10, sector: "Mid Cap", accountType: "retirement" },
  { name: "BlackRock Russell 2000 Index J", symbol: "BR2KX", quantity: 1, value: 2626.73, sector: "Small Cap", accountType: "retirement" },
  { name: "BlackRock MSCI EAFE Equity Index Fund M", symbol: "BEIFM", quantity: 1, value: 113.19, sector: "International", accountType: "retirement" },
  { name: "Mid Cap Growth / Artisan Partners Fund", symbol: "ARTMX", quantity: 1, value: 81.43, sector: "Mid Cap", accountType: "retirement" },
  { name: "Allspring Small Company Growth Inst", symbol: "WSCGX", quantity: 1, value: 40.15, sector: "Small Cap", accountType: "retirement" },
  { name: "American Beacon Small Cap Value Cl I CIT", symbol: "ABSCI", quantity: 1, value: 39.45, sector: "Small Cap", accountType: "retirement" },
  { name: "Allspring Special Mid Cap Value CIT E2", symbol: "ASMCE", quantity: 1, value: 39.10, sector: "Mid Cap", accountType: "retirement" },
  { name: "Capital Group EuroPacific Growth SA", symbol: "CEUSX", quantity: 1, value: 32.18, sector: "International", accountType: "retirement" },
  { name: "Empower Multi-Sector Bond Inst", symbol: "EMPBX", quantity: 1, value: 29.97, sector: "Fixed Income", accountType: "retirement" }
];

// Calculate total portfolio value from holdings
const calculateTotalPortfolioValue = () => {
  return holdingsData.reduce((total, holding) => total + holding.value, 0);
};

// Calculate sector allocations for the donut chart
const calculateSectorAllocations = () => {
  const sectors: { [key: string]: number } = {};
  
  // Sum values by sector
  holdingsData.forEach(holding => {
    const sector = holding.sector || 'Other';
    sectors[sector] = (sectors[sector] || 0) + holding.value;
  });
  
  // Convert to array and calculate percentages
  const totalValue = calculateTotalPortfolioValue();
  const allocations = Object.entries(sectors).map(([name, value]) => {
    return { name, value: Math.round((value / totalValue) * 100) };
  });
  
  // Sort by percentage (descending)
  return allocations.sort((a, b) => b.value - a.value);
};

// Generate color for each sector
const getSectorColors = () => {
  const colors = [
    '#4169E1', // Royal Blue
    '#9370DB', // Medium Purple
    '#20B2AA', // Light Sea Green
    '#3CB371', // Medium Sea Green
    '#FF6347', // Tomato
    '#6495ED', // Cornflower Blue
    '#A9A9A9', // Dark Gray
    '#FFD700', // Gold
    '#8A2BE2', // Blue Violet
    '#32CD32', // Lime Green
    '#FF4500', // Orange Red
    '#4682B4', // Steel Blue
    '#7B68EE', // Medium Slate Blue
    '#2E8B57', // Sea Green
    '#CD5C5C'  // Indian Red
  ];
  
  const sectorAllocations = calculateSectorAllocations();
  
  // Assign colors to sectors
  return sectorAllocations.map((sector, index) => ({
    ...sector,
    color: colors[index % colors.length]
  }));
};

// Updated portfolio data with calculations from holdings
const getPortfolioData = () => {
  const totalValue = calculateTotalPortfolioValue();
  const cash = holdingsData
    .filter(holding => holding.sector === 'Cash')
    .reduce((sum, holding) => sum + holding.value, 0);
  
  return {
    totalValue,
    cash,
    buyingPower: cash * 2, // Assume 2x leverage for buying power
    margin: cash,
    startValue: totalValue * 0.9, // Assume 10% growth from start
    endValue: totalValue,
    netCashFlow: totalValue * 0.7, // Assume 70% of value is from contributions
    returnRate: 13.92, // Using static value for now
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    startDate: 'Jan 1, 2024',
    endDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  };
};

// Get allocations for donut chart
const getAllocationData = () => {
  return getSectorColors();
};

// Tax & Profit data calculations based on holdings
// --- REMOVE const calculateTaxData = () => { ... }; ---

// Content component for Tax & Profit tab
// --- REMOVE const TaxAndProfitContent = () => { ... }; (it was exported before, ensure it's fully removed) ---

// Data and helper functions for Transfer content
// --- REMOVE getTransferData = () => { ... }; ---
// ... (Remove other component definitions as planned)

// Data for investment goals
// --- REMOVE getGoalsData = () => { ... }; ---
// ... (Remove other component definitions as planned)

// Goals Content component
// --- REMOVE const GoalSystemContent = () => { ... }; ---

// --- REMOVE OTHER DEFINITIONS AS BEFORE ---
// const getSimulationData = () => { ... };
// const PortfolioSimulationContent = () => { ... };

// Main Portfolio component
export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Add state for holdings filtering and sorting
  const [holdingsFilter, setHoldingsFilter] = useState('');
  const [holdingsSortField, setHoldingsSortField] = useState<'name' | 'value'>('value');
  const [holdingsSortDirection, setHoldingsSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Use SWR hooks for data fetching
  const { chartData: netWorthData, isLoading: isChartLoading, error: chartError } = useNetWorthChartData();
  const { allocationData, isLoading: isAllocationLoading, error: allocationError } = useAllocationData();
  const { holdings, isLoading: isHoldingsLoading, error: holdingsError } = useHoldingsData();
  
  // Fall back to mock data if API fails or data is not available
  const finalNetWorthData = (netWorthData && netWorthData.length > 0) ? netWorthData : chartData;
  const finalAllocationData = (allocationData && allocationData.length > 0) ? allocationData : getAllocationData();
  
  // Use API holdings data if available, otherwise use mock holdings
  useEffect(() => {
    if (holdings && holdings.length > 0) {
      // Replace holdingsData with the API data
      holdingsData = [...holdings];
    }
  }, [holdings]);
  
  // Calculate portfolio stats from holdings data
  const portfolioData = getPortfolioData();
  
  // Set overall loading state 
  useEffect(() => {
    setIsLoading(isChartLoading || isAllocationLoading || isHoldingsLoading);
  }, [isChartLoading, isAllocationLoading, isHoldingsLoading]);
  
  // Handle any errors in data loading
  useEffect(() => {
    if (chartError) {
      console.error('Error loading chart data:', chartError);
    }
    
    if (allocationError) {
      console.error('Error loading allocation data:', allocationError);
    }
    
    if (holdingsError) {
      console.error('Error loading holdings data:', holdingsError);
    }
  }, [chartError, allocationError, holdingsError]);
  
  const timeframes = [
    { id: '1D', label: '1D' },
    { id: '1W', label: '1W' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: '6M', label: '6M' },
    { id: 'YTD', label: 'YTD' },
    { id: '1Y', label: '1Y' },
    { id: 'ALL', label: 'ALL' }
  ];
  
  // Add new state for performance data
  const [performanceData, setPerformanceData] = useState(generateMockPerformanceData());
  const [riskMetrics, setRiskMetrics] = useState(generateMockRiskMetrics());
  const [sectorAllocations, setSectorAllocations] = useState(generateMockSectorAllocations());
  const returns = calculateReturns(performanceData);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#172033]">
        <LoadingSpinner size="large" color="#fff" />
      </div>
    );
  }
  
  const renderContent = () => {
    switch(activeTab) {
      case 'holdings': 
        return <HoldingsTabDynamic 
                  holdingsData={holdingsData} // Pass holdingsData 
                  holdingsFilter={holdingsFilter}
                  setHoldingsFilter={setHoldingsFilter}
                  holdingsSortField={holdingsSortField}
                  setHoldingsSortField={setHoldingsSortField}
                  holdingsSortDirection={holdingsSortDirection}
                  setHoldingsSortDirection={setHoldingsSortDirection}
                />; 
      case 'tax':
        return <TaxAndProfitTabDynamic />; // Use the new dynamic import
      case 'transfers':
        return <TransfersTabDynamic />; // Use the new dynamic import
      case 'goals': 
        return <GoalsTabDynamic />; // Use the new dynamic import
      case 'simulation':
        return <div>Simulation Tab Content (To be implemented)</div>; // Placeholder
      case 'activity':
        return <ActivityContentComponentDynamic />; // Use dynamic import (renamed)
      case 'funding':
        return <FundingContentComponentDynamic />; // Use dynamic import (renamed)
      case 'portfolio':
      default:
        return (
          <div className="space-y-8">
            {/* Portfolio Overview Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Portfolio Overview</h2>
                
                {/* Net Worth Chart - Using our NetWorthChart component */}
                <div className="mb-8">
                  <NetWorthChart 
                    data={finalNetWorthData}
                    title="Net Worth History"
                    height={300}
                    timeframes={['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL']}
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={setSelectedTimeframe}
                  />
                </div>
                
                {/* Portfolio Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Total Portfolio Value</div>
                    <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">as of {portfolioData.date}</div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Cash Balance</div>
                    <div className="text-2xl font-bold">${portfolioData.cash.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Available for trading</div>
      </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Buying Power</div>
                    <div className="text-2xl font-bold">${portfolioData.buyingPower.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">Including ${portfolioData.margin.toLocaleString()} margin</div>
            </div>
          </div>

                {/* Performance Metrics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Start Value</div>
                      <div className="font-medium">${portfolioData.startValue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{portfolioData.startDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Current Value</div>
                      <div className="font-medium">${portfolioData.endValue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{portfolioData.endDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Net Deposits</div>
                      <div className="font-medium">${portfolioData.netCashFlow.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Total contributions</div>
                    </div>
              <div>
                      <div className="text-sm text-gray-500">Net Return</div>
                      <div className={`font-medium ${portfolioData.returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioData.returnRate >= 0 ? '+' : ''}{portfolioData.returnRate}%
                      </div>
                      <div className="text-xs text-gray-500">Since inception</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Allocation and Holdings Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Sector Allocation</h2>
                <DonutChart data={finalAllocationData} />
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Top Holdings</h2>
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-800">View All</Link>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        A
                      </div>
                      <div>
                        <div className="font-medium">AAPL</div>
                        <div className="text-sm text-gray-500">Apple Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$2,504.25</div>
                      <div className="text-sm text-green-600">+15.2%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        M
                      </div>
                      <div>
                        <div className="font-medium">MSFT</div>
                        <div className="text-sm text-gray-500">Microsoft Corp.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$1,982.00</div>
                      <div className="text-sm text-green-600">+8.7%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        G
                      </div>
                      <div>
                        <div className="font-medium">GOOGL</div>
                        <div className="text-sm text-gray-500">Alphabet Inc.</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">$1,653.75</div>
                      <div className="text-sm text-red-600">-2.3%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        A
                      </div>
                      <div>
                        <div className="font-medium">AMZN</div>
                        <div className="text-sm text-gray-500">Amazon.com Inc.</div>
                </div>
              </div>
              <div className="text-right">
                      <div className="font-medium">$1,376.61</div>
                      <div className="text-sm text-green-600">+5.1%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <div className="flex space-x-3 items-center">
                  <div className="text-sm text-gray-500">Filter:</div>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>All Activity</option>
                    <option>Trades</option>
                    <option>Dividends</option>
                    <option>Transfers</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 24, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Buy</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Bought 5 shares of NVDA @ $85.31
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">-$426.55</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 20, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Dividend</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Dividend payment from AAPL
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$6.25</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 15, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Deposit</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Bank transfer deposit
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$1,000.00</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Apr 12, 2025</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Sell</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Sold 10 shares of MSFT @ $378.12
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">+$3,781.20</td>
                    </tr>
                  </tbody>
                </table>
        </div>

              <div className="flex justify-center mt-4">
                <button className="text-sm text-blue-600 px-3 py-1 hover:bg-blue-50 rounded">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <ErrorBoundaryComponent>
      <div className="bg-[#172033] min-h-screen text-white">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          {/* Mobile Navigation Dropdown */}
          <div className="block md:hidden mb-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Portfolio</h1>
              <button 
                className="p-2 rounded-md bg-[#1D2939] text-white"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
            
            {showMobileMenu && (
              <div className="mt-2 bg-[#1D2939] rounded-md p-2 shadow-lg">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab('portfolio');
                      setShowMobileMenu(false);
                    }}
                    className={`py-2 px-3 rounded ${
                      activeTab === 'portfolio'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Portfolio
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('activity');
                      setShowMobileMenu(false);
                    }}
                    className={`py-2 px-3 rounded ${
                      activeTab === 'activity'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Activity
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('holdings');
                      setShowMobileMenu(false);
                    }}
                    className={`py-2 px-3 rounded ${
                      activeTab === 'holdings'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Holdings
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('tax');
                      setShowMobileMenu(false);
                    }}
                    className={`py-2 px-3 rounded ${
                      activeTab === 'tax'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Tax & Profit
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('transfers');
                      setShowMobileMenu(false);
                    }}
                    className={`py-2 px-3 rounded ${
                      activeTab === 'transfers'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Transfers
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('goals');
                      setShowMobileMenu(false);
                    }}
                    className={`py-2 px-3 rounded ${
                      activeTab === 'goals'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Goals
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('simulation');
                      setShowMobileMenu(false);
                    }}
                    className={`py-2 px-3 rounded ${
                      activeTab === 'simulation'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Simulation
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop Navigation Tabs */}
          <div className="hidden md:block mb-8">
            <nav className="flex space-x-1 md:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide border-b border-gray-700">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`pb-4 px-1 whitespace-nowrap ${
                  activeTab === 'portfolio'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-4 px-1 whitespace-nowrap ${
                  activeTab === 'activity'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('holdings')}
                className={`pb-4 px-1 whitespace-nowrap ${
                  activeTab === 'holdings'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Holdings
              </button>
              <button
                onClick={() => setActiveTab('tax')}
                className={`pb-4 px-1 whitespace-nowrap ${
                  activeTab === 'tax'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Tax & Profit
              </button>
              <button
                onClick={() => setActiveTab('transfers')}
                className={`pb-4 px-1 whitespace-nowrap ${
                  activeTab === 'transfers'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Transfers
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`pb-4 px-1 whitespace-nowrap ${
                  activeTab === 'goals'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Goals
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className={`pb-4 px-1 whitespace-nowrap ${
                  activeTab === 'simulation'
                    ? 'border-b-2 border-blue-500 text-blue-400 font-medium'
                    : 'border-b-2 border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Simulation
              </button>
            </nav>
          </div>
          
          {/* Main Content */}
          <div>
            {renderContent()}
          </div>
        </div>
        
        {/* AI Assistant */}
        <AiAssistantPanel />
      </div>
    </ErrorBoundaryComponent>
  );
}


