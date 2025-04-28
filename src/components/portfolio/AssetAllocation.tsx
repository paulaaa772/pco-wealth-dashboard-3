import React from 'react';

interface AssetClass {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface AssetAllocationProps {
  assetClasses: AssetClass[];
  totalValue: number;
}

const AssetAllocation: React.FC<AssetAllocationProps> = ({ assetClasses, totalValue }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">Asset Allocation</h2>
        
        <div className="flex flex-col lg:flex-row">
          {/* Pie Chart (placeholder) */}
          <div className="w-full lg:w-1/2 mb-6 lg:mb-0 flex justify-center items-center">
            <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Chart Placeholder</span>
            </div>
          </div>
          
          {/* Asset Breakdown */}
          <div className="w-full lg:w-1/2">
            <div className="space-y-4">
              {assetClasses.map((asset, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-sm mr-3" style={{ backgroundColor: asset.color }}></div>
                    <span>{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <div>${asset.value.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{asset.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocation; 