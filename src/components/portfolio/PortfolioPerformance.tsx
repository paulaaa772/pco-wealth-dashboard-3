import React from 'react';

interface PerformanceMetric {
  label: string;
  value: string;
  change: number;
}

interface PortfolioPerformanceProps {
  metrics: PerformanceMetric[];
}

const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({
  metrics
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
          <div className="text-xl font-bold mb-1">{metric.value}</div>
          <div className={`text-sm flex items-center ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {metric.change >= 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9v9a1 1 0 01-2 0V8H5a1 1 0 010-2h8a1 1 0 011 1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 13a1 1 0 01-1 1H9v-9a1 1 0 00-2 0v9H5a1 1 0 010 2h8a1 1 0 010-2z" clipRule="evenodd" />
              </svg>
            )}
            {Math.abs(metric.change).toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioPerformance; 