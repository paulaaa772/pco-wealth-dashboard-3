import React from 'react';

interface AllocationItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface PortfolioAllocationProps {
  allocations: AllocationItem[];
  title?: string;
}

const PortfolioAllocation: React.FC<PortfolioAllocationProps> = ({
  allocations,
  title = 'Asset Allocation'
}) => {
  const totalValue = allocations.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {/* Allocation bar */}
      <div className="h-6 flex rounded-full overflow-hidden mb-4">
        {allocations.map((item, index) => (
          <div 
            key={index} 
            className="h-full" 
            style={{ 
              backgroundColor: item.color, 
              width: `${item.percentage}%`,
              minWidth: item.percentage > 0 ? '3px' : '0'
            }}
            title={`${item.name}: ${item.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Legend items */}
      <div className="space-y-2">
        {allocations.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-sm mr-2" 
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
            <div className="flex space-x-4">
              <span className="text-gray-500">${item.value.toLocaleString()}</span>
              <span className="w-12 text-right">{item.percentage.toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioAllocation; 