import React from 'react';
import NetWorthChart from '@/components/dashboard/NetWorthChart';

interface PortfolioOverviewProps {
  portfolioData: {
    totalValue: number;
    cash: number;
    buyingPower: number;
    margin: number;
    startValue: number;
    endValue: number;
    netCashFlow: number;
    returnRate: number;
    date: string;
    startDate: string;
    endDate: string;
  };
  netWorthData: any[];
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  portfolioData,
  netWorthData,
  selectedTimeframe,
  setSelectedTimeframe
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Portfolio Overview</h2>
        
        {/* Net Worth Chart */}
        <div className="mb-8">
          <NetWorthChart 
            data={netWorthData}
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
  );
};

export default PortfolioOverview; 