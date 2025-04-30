import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CarbonFootprintProps {
  portfolioTonsCO2e: number;
  benchmarkTonsCO2e: number;
  isLoading?: boolean;
}

const CarbonFootprint: React.FC<CarbonFootprintProps> = ({ 
  portfolioTonsCO2e, 
  benchmarkTonsCO2e, 
  isLoading = false 
}) => {
  // Calculate percentage relative to benchmark
  const relativeToBenchmark = (portfolioTonsCO2e / benchmarkTonsCO2e) * 100;
  
  // Determine message based on performance
  const getMessage = () => {
    if (portfolioTonsCO2e <= benchmarkTonsCO2e * 0.8) {
      return "Your portfolio has lower carbon intensity than benchmark.";
    } else if (portfolioTonsCO2e <= benchmarkTonsCO2e * 1.1) {
      return "Your portfolio has similar carbon intensity to benchmark.";
    } else {
      return "Your portfolio has higher carbon intensity than benchmark.";
    }
  };
  
  // Get color for the carbon footprint value
  const getColor = () => {
    if (portfolioTonsCO2e <= benchmarkTonsCO2e * 0.8) {
      return "text-green-400";
    } else if (portfolioTonsCO2e <= benchmarkTonsCO2e * 1.1) {
      return "text-yellow-400";
    } else {
      return "text-red-400";
    }
  };

  return (
    <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-lg">Carbon Footprint</CardTitle>
        <CardDescription className="text-gray-400">
          Estimated carbon intensity of portfolio companies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-4">
              <p className={`text-3xl font-bold ${getColor()}`}>
                {portfolioTonsCO2e}
              </p>
              <p className="text-sm text-gray-400">
                vs Benchmark: {benchmarkTonsCO2e}
              </p>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>0</span>
                <span>Benchmark: {benchmarkTonsCO2e}</span>
                <span>{benchmarkTonsCO2e * 2}</span>
              </div>
              <div className="relative w-full h-2 bg-gray-700 rounded-full">
                {/* Benchmark marker */}
                <div 
                  className="absolute top-0 w-0.5 h-3 bg-white"
                  style={{ left: `${50}%`, marginTop: "-2px" }}
                ></div>
                {/* Portfolio value */}
                <div 
                  className={`absolute top-0 w-2 h-2 rounded-full ${getColor() === 'text-green-400' ? 'bg-green-400' : getColor() === 'text-yellow-400' ? 'bg-yellow-400' : 'bg-red-400'}`}
                  style={{ 
                    left: `${Math.min(100, (portfolioTonsCO2e / (benchmarkTonsCO2e * 2)) * 100)}%`,
                    marginTop: "0px",
                    transform: "translateX(-50%)"
                  }}
                ></div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Tons CO2e / $1M invested (Lower is better)
            </p>
            
            <p className="text-sm mt-4 text-gray-300">
              {getMessage()}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CarbonFootprint; 