import React from 'react';

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  dayChange: {
    amount: number;
    percentage: number;
  };
  totalReturn: {
    amount: number;
    percentage: number;
  };
  weight: number;
}

interface PortfolioHoldingsProps {
  holdings: Holding[];
}

const PortfolioHoldings: React.FC<PortfolioHoldingsProps> = ({ holdings }) => {
  return (
    <div className="bg-white rounded-lg shadow mt-6">
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-4">Holdings</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Day Change</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Return</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holdings.map((holding) => (
                <tr key={holding.symbol} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{holding.symbol}</div>
                    <div className="text-xs text-gray-500">{holding.name}</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {holding.shares.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    ${holding.averagePrice.toFixed(2)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${holding.currentPrice.toFixed(2)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    ${holding.marketValue.toLocaleString()}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right">
                    <div className={`${holding.dayChange.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${Math.abs(holding.dayChange.amount).toLocaleString()} ({holding.dayChange.percentage.toFixed(2)}%)
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right">
                    <div className={`${holding.totalReturn.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${Math.abs(holding.totalReturn.amount).toLocaleString()} ({holding.totalReturn.percentage.toFixed(2)}%)
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    {holding.weight.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHoldings; 