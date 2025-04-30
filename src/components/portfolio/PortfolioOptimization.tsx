'use client';

import React, { useState, useEffect } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// This would be replaced with a real library like d3 or recharts
// For now creating a placeholder component
const EfficientFrontierChart = ({ portfolios }: { portfolios: any[] }) => {
  return (
    <div className="h-80 bg-[#1a2032] rounded-lg p-4 relative border border-gray-800">
      <div className="absolute top-4 left-4 text-xs text-gray-400">Higher Return</div>
      <div className="absolute bottom-4 left-4 text-xs text-gray-400">Lower Return</div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">Risk (Standard Deviation)</div>
      <div className="absolute bottom-4 right-4 text-xs text-gray-400">Higher Risk</div>
      
      {/* Simulate an efficient frontier curve */}
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Axes */}
        <line x1="10" y1="90" x2="90" y2="90" stroke="#555" strokeWidth="1" />
        <line x1="10" y1="90" x2="10" y2="10" stroke="#555" strokeWidth="1" />
        
        {/* Efficient frontier curve */}
        <path 
          d="M10,80 Q30,50 50,30 T90,15" 
          fill="none" 
          stroke="#2563eb" 
          strokeWidth="2"
        />
        
        {/* Current portfolio marker */}
        <circle cx="40" cy="45" r="3" fill="#ef4444" />
        
        {/* Optimized portfolio marker */}
        <circle cx="50" cy="30" r="3" fill="#22c55e" />
        
        {/* Individual assets */}
        <circle cx="15" cy="65" r="2" fill="#f59e0b" />
        <circle cx="30" cy="70" r="2" fill="#f59e0b" />
        <circle cx="50" cy="60" r="2" fill="#f59e0b" />
        <circle cx="70" cy="40" r="2" fill="#f59e0b" />
        <circle cx="85" cy="20" r="2" fill="#f59e0b" />
      </svg>
      
      <div className="absolute top-4 right-4 flex space-x-4">
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-400">Current</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-400">Optimized</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="h-3 w-3 rounded-full bg-amber-500"></div>
          <span className="text-xs text-gray-400">Assets</span>
        </div>
      </div>
    </div>
  );
};

// Sample data - would come from API in real implementation
const mockAssets = [
  { id: 1, symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', allocation: 35, expectedReturn: 8.5, risk: 15.2, category: 'US Equity' },
  { id: 2, symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', allocation: 25, expectedReturn: 7.8, risk: 16.5, category: 'International Equity' },
  { id: 3, symbol: 'BND', name: 'Vanguard Total Bond Market ETF', allocation: 20, expectedReturn: 3.2, risk: 5.5, category: 'US Bond' },
  { id: 4, symbol: 'BNDX', name: 'Vanguard Total International Bond ETF', allocation: 10, expectedReturn: 2.8, risk: 4.8, category: 'International Bond' },
  { id: 5, symbol: 'VNQ', name: 'Vanguard Real Estate ETF', allocation: 5, expectedReturn: 6.5, risk: 18.2, category: 'Real Estate' },
  { id: 6, symbol: 'GLD', name: 'SPDR Gold Shares', allocation: 3, expectedReturn: 4.2, risk: 14.5, category: 'Commodities' },
  { id: 7, symbol: 'VTIP', name: 'Vanguard Short-Term Inflation-Protected Securities ETF', allocation: 2, expectedReturn: 2.5, risk: 3.2, category: 'Inflation Protection' },
];

const mockPortfolios = [
  { id: 'current', name: 'Current Portfolio', expectedReturn: 6.8, risk: 12.2, sharpeRatio: 0.41, maxDrawdown: 32.5 },
  { id: 'efficient_min_risk', name: 'Minimum Risk', expectedReturn: 5.2, risk: 8.1, sharpeRatio: 0.39, maxDrawdown: 22.3 },
  { id: 'efficient_max_return', name: 'Maximum Return', expectedReturn: 9.5, risk: 18.5, sharpeRatio: 0.43, maxDrawdown: 42.8 },
  { id: 'efficient_max_sharpe', name: 'Optimal (Max Sharpe)', expectedReturn: 7.9, risk: 10.5, sharpeRatio: 0.57, maxDrawdown: 28.4 },
];

// Define a type for the constraints
interface OptimizationConstraints {
  targetReturn?: number;
  maxRisk?: number;
  objective: 'max_return' | 'min_risk' | 'max_sharpe';
  includeInternational: boolean;
  includeBonds: boolean;
  includeAlternatives: boolean;
  maxPerAsset: number;
  minPerAsset: number;
}

const PortfolioOptimization: React.FC = () => {
  const { manualAccounts, holdings, isLoading } = useManualAccounts();
  const [assets, setAssets] = useState(mockAssets);
  const [portfolios, setPortfolios] = useState(mockPortfolios);
  const [selectedPortfolio, setSelectedPortfolio] = useState(mockPortfolios[0]);
  
  // State for optimization constraints
  const [constraints, setConstraints] = useState<OptimizationConstraints>({
    objective: 'max_sharpe',
    includeInternational: true,
    includeBonds: true,
    includeAlternatives: true,
    maxPerAsset: 40,
    minPerAsset: 2
  });

  // State for optimized allocation
  const [optimizedAllocation, setOptimizedAllocation] = useState<typeof assets>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Calculate current stats
  const [portfolioStats, setPortfolioStats] = useState({
    expectedReturn: 0,
    risk: 0,
    sharpeRatio: 0,
    maxDrawdown: 0
  });

  useEffect(() => {
    // In a real implementation, this would calculate stats from actual data
    setPortfolioStats({
      expectedReturn: 6.8,
      risk: 12.2,
      sharpeRatio: 0.41,
      maxDrawdown: 32.5
    });
  }, [holdings]);

  // Handler for constraint changes
  const handleConstraintChange = (key: keyof OptimizationConstraints, value: any) => {
    setConstraints(prev => ({ ...prev, [key]: value }));
  };

  // Run optimization
  const runOptimization = () => {
    setIsOptimizing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // In a real implementation, this would call an API endpoint
      // For the demo, we'll just modify the allocations slightly
      
      // Select the appropriate portfolio based on objective
      let targetPortfolio;
      if (constraints.objective === 'min_risk') {
        targetPortfolio = portfolios.find(p => p.id === 'efficient_min_risk');
      } else if (constraints.objective === 'max_return') {
        targetPortfolio = portfolios.find(p => p.id === 'efficient_max_return');
      } else {
        targetPortfolio = portfolios.find(p => p.id === 'efficient_max_sharpe');
      }

      setSelectedPortfolio(targetPortfolio || portfolios[0]);
      
      // Create optimized allocation
      const newAllocation = assets.map(asset => {
        // Apply some logic based on constraints
        let newAllocation = asset.allocation;
        
        // Redistribute based on objective
        if (constraints.objective === 'min_risk') {
          // Increase bonds, decrease equities
          if (asset.category.includes('Bond')) {
            newAllocation += 5;
          } else if (asset.category.includes('Equity')) {
            newAllocation -= 3;
          }
        } else if (constraints.objective === 'max_return') {
          // Increase equities, decrease bonds
          if (asset.category.includes('Bond')) {
            newAllocation -= 5;
          } else if (asset.category.includes('Equity')) {
            newAllocation += 3;
          }
        }
        
        // Apply min/max constraints
        newAllocation = Math.min(constraints.maxPerAsset, Math.max(constraints.minPerAsset, newAllocation));
        
        return { ...asset, allocation: newAllocation };
      });
      
      // Normalize to 100%
      const totalAllocation = newAllocation.reduce((sum, asset) => sum + asset.allocation, 0);
      const normalizedAllocation = newAllocation.map(asset => ({
        ...asset,
        allocation: Math.round((asset.allocation / totalAllocation) * 100)
      }));
      
      setOptimizedAllocation(normalizedAllocation);
      setIsOptimizing(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Portfolio Optimization</h2>
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold mb-2">Modern Portfolio Theory Optimizer</h2>
        <p className="text-gray-400">
          Optimize your portfolio allocation based on risk, return, and diversification using modern portfolio theory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Current portfolio & Efficient Frontier */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 bg-[#0f1525] border-gray-800">
            <h3 className="text-lg font-medium mb-4">Efficient Frontier Analysis</h3>
            <EfficientFrontierChart portfolios={portfolios} />
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-[#1a2032] p-3 rounded border border-gray-800">
                <p className="text-sm text-gray-400">Expected Return</p>
                <p className="text-xl font-semibold">{selectedPortfolio.expectedReturn}%</p>
              </div>
              <div className="bg-[#1a2032] p-3 rounded border border-gray-800">
                <p className="text-sm text-gray-400">Risk (Std Dev)</p>
                <p className="text-xl font-semibold">{selectedPortfolio.risk}%</p>
              </div>
              <div className="bg-[#1a2032] p-3 rounded border border-gray-800">
                <p className="text-sm text-gray-400">Sharpe Ratio</p>
                <p className="text-xl font-semibold">{selectedPortfolio.sharpeRatio}</p>
              </div>
              <div className="bg-[#1a2032] p-3 rounded border border-gray-800">
                <p className="text-sm text-gray-400">Max Drawdown</p>
                <p className="text-xl font-semibold">{selectedPortfolio.maxDrawdown}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#0f1525] border-gray-800">
            <h3 className="text-lg font-medium mb-4">Portfolio Comparison</h3>
            <Tabs defaultValue="allocation">
              <TabsList className="mb-4">
                <TabsTrigger value="allocation">Allocation</TabsTrigger>
                <TabsTrigger value="metrics">Risk Metrics</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              <TabsContent value="allocation">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Optimized</TableHead>
                      <TableHead>Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map(asset => {
                      const optimized = optimizedAllocation.find(a => a.id === asset.id);
                      const difference = optimized ? optimized.allocation - asset.allocation : 0;
                      return (
                        <TableRow key={asset.id}>
                          <TableCell className="font-medium">
                            {asset.symbol} <span className="text-xs text-gray-400">{asset.category}</span>
                          </TableCell>
                          <TableCell>{asset.allocation}%</TableCell>
                          <TableCell>{optimized ? optimized.allocation : '-'}%</TableCell>
                          <TableCell className={
                            difference > 0 ? 'text-green-500' : 
                            difference < 0 ? 'text-red-500' : 'text-gray-400'
                          }>
                            {optimized ? (difference > 0 ? '+' : '') + difference + '%' : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="metrics">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Current Portfolio</TableHead>
                      <TableHead>Optimized Portfolio</TableHead>
                      <TableHead>Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Expected Return</TableCell>
                      <TableCell>{portfolioStats.expectedReturn}%</TableCell>
                      <TableCell>{selectedPortfolio.expectedReturn}%</TableCell>
                      <TableCell className={selectedPortfolio.expectedReturn > portfolioStats.expectedReturn ? 'text-green-500' : 'text-red-500'}>
                        {(selectedPortfolio.expectedReturn > portfolioStats.expectedReturn ? '+' : '') + 
                        (selectedPortfolio.expectedReturn - portfolioStats.expectedReturn).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Risk (Std Dev)</TableCell>
                      <TableCell>{portfolioStats.risk}%</TableCell>
                      <TableCell>{selectedPortfolio.risk}%</TableCell>
                      <TableCell className={selectedPortfolio.risk < portfolioStats.risk ? 'text-green-500' : 'text-red-500'}>
                        {(selectedPortfolio.risk < portfolioStats.risk ? '' : '+') + 
                        (selectedPortfolio.risk - portfolioStats.risk).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Sharpe Ratio</TableCell>
                      <TableCell>{portfolioStats.sharpeRatio}</TableCell>
                      <TableCell>{selectedPortfolio.sharpeRatio}</TableCell>
                      <TableCell className={selectedPortfolio.sharpeRatio > portfolioStats.sharpeRatio ? 'text-green-500' : 'text-red-500'}>
                        {(selectedPortfolio.sharpeRatio > portfolioStats.sharpeRatio ? '+' : '') + 
                        (selectedPortfolio.sharpeRatio - portfolioStats.sharpeRatio).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Max Drawdown</TableCell>
                      <TableCell>{portfolioStats.maxDrawdown}%</TableCell>
                      <TableCell>{selectedPortfolio.maxDrawdown}%</TableCell>
                      <TableCell className={selectedPortfolio.maxDrawdown < portfolioStats.maxDrawdown ? 'text-green-500' : 'text-red-500'}>
                        {(selectedPortfolio.maxDrawdown < portfolioStats.maxDrawdown ? '' : '+') + 
                        (selectedPortfolio.maxDrawdown - portfolioStats.maxDrawdown).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="performance">
                <div className="h-60 bg-[#1a2032] rounded-lg p-4 flex items-center justify-center border border-gray-800">
                  <p className="text-gray-400">Performance comparison chart would be shown here</p>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right column - Optimization controls */}
        <div className="space-y-6">
          <Card className="p-4 bg-[#0f1525] border-gray-800">
            <h3 className="text-lg font-medium mb-4">Optimization Objectives</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="objective">Optimization Strategy</Label>
                <Select 
                  value={constraints.objective} 
                  onValueChange={(value) => handleConstraintChange('objective', value)}
                >
                  <SelectTrigger id="objective">
                    <SelectValue placeholder="Select an objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="max_sharpe">Maximum Sharpe Ratio (Optimal)</SelectItem>
                    <SelectItem value="min_risk">Minimize Risk</SelectItem>
                    <SelectItem value="max_return">Maximize Return</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">
                  {constraints.objective === 'max_sharpe' ? 
                    'Optimize for the best risk-adjusted return (recommended).' :
                    constraints.objective === 'min_risk' ? 
                    'Create the lowest volatility portfolio possible.' :
                    'Maximize expected return regardless of risk.'}
                </p>
              </div>

              {/* Risk tolerance slider */}
              <div>
                <Label htmlFor="maxRisk">Maximum Risk (%)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="maxRisk"
                    defaultValue={[constraints.maxRisk || 15]}
                    max={30}
                    min={5}
                    step={1}
                    onValueChange={(value) => handleConstraintChange('maxRisk', value[0])}
                    className="flex-grow"
                  />
                  <span className="w-12 text-center">{constraints.maxRisk || '-'}</span>
                </div>
              </div>

              {/* Target return slider */}
              <div>
                <Label htmlFor="targetReturn">Target Return (%)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="targetReturn"
                    defaultValue={[constraints.targetReturn || 7]}
                    max={15}
                    min={3}
                    step={0.5}
                    onValueChange={(value) => handleConstraintChange('targetReturn', value[0])}
                    className="flex-grow"
                  />
                  <span className="w-12 text-center">{constraints.targetReturn || '-'}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-[#0f1525] border-gray-800">
            <h3 className="text-lg font-medium mb-4">Diversification Constraints</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="includeInternational" className="cursor-pointer">Include International Assets</Label>
                <Switch
                  id="includeInternational"
                  checked={constraints.includeInternational}
                  onCheckedChange={(checked) => handleConstraintChange('includeInternational', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="includeBonds" className="cursor-pointer">Include Fixed Income</Label>
                <Switch
                  id="includeBonds"
                  checked={constraints.includeBonds}
                  onCheckedChange={(checked) => handleConstraintChange('includeBonds', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="includeAlternatives" className="cursor-pointer">Include Alternatives</Label>
                <Switch
                  id="includeAlternatives"
                  checked={constraints.includeAlternatives}
                  onCheckedChange={(checked) => handleConstraintChange('includeAlternatives', checked)}
                />
              </div>

              <div>
                <Label htmlFor="maxPerAsset">Maximum Per Asset (%)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="maxPerAsset"
                    defaultValue={[constraints.maxPerAsset]}
                    max={100}
                    min={5}
                    step={5}
                    onValueChange={(value) => handleConstraintChange('maxPerAsset', value[0])}
                    className="flex-grow"
                  />
                  <span className="w-12 text-center">{constraints.maxPerAsset}%</span>
                </div>
              </div>

              <div>
                <Label htmlFor="minPerAsset">Minimum Per Asset (%)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="minPerAsset"
                    defaultValue={[constraints.minPerAsset]}
                    max={20}
                    min={0}
                    step={1}
                    onValueChange={(value) => handleConstraintChange('minPerAsset', value[0])}
                    className="flex-grow"
                  />
                  <span className="w-12 text-center">{constraints.minPerAsset}%</span>
                </div>
              </div>
            </div>
          </Card>

          <Button 
            className="w-full" 
            size="lg"
            onClick={runOptimization}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Optimizing...
              </>
            ) : 'Run Optimization'}
          </Button>

          <div className="text-center text-xs text-gray-400 mt-2">
            Optimizations run using risk data from the past 10 years.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOptimization; 