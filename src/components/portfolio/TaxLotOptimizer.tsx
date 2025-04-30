'use client';

import React, { useState, useEffect } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';

// Types
interface SecurityLot {
  id: string;
  symbol: string;
  name: string;
  purchaseDate: string;
  quantity: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  holdingPeriod: number; // Days
  isSelected: boolean;
}

interface TaxLotOptimizerProps {
  // If needed for customization
}

interface TaxSettings {
  shortTermRate: number;
  longTermRate: number;
  stateRate: number;
  filingStatus: 'single' | 'married' | 'head';
  annualIncome: number;
}

// Sample data
const mockSecurities = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    lots: [
      { id: 'lot-1-1', purchaseDate: '2022-01-15', quantity: 10, costBasis: 142.5, currentPrice: 173.75 },
      { id: 'lot-1-2', purchaseDate: '2022-06-20', quantity: 5, costBasis: 135.87, currentPrice: 173.75 },
      { id: 'lot-1-3', purchaseDate: '2023-02-10', quantity: 8, costBasis: 151.03, currentPrice: 173.75 },
    ]
  },
  {
    id: '2',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    lots: [
      { id: 'lot-2-1', purchaseDate: '2021-11-05', quantity: 12, costBasis: 337.91, currentPrice: 415.5 },
      { id: 'lot-2-2', purchaseDate: '2022-10-15', quantity: 3, costBasis: 228.56, currentPrice: 415.5 },
    ]
  },
  {
    id: '3',
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    lots: [
      { id: 'lot-3-1', purchaseDate: '2021-07-12', quantity: 15, costBasis: 177.67, currentPrice: 184.38 },
      { id: 'lot-3-2', purchaseDate: '2022-12-05', quantity: 10, costBasis: 94.13, currentPrice: 184.38 },
      { id: 'lot-3-3', purchaseDate: '2023-05-22', quantity: 8, costBasis: 116.25, currentPrice: 184.38 },
    ]
  },
];

// Helper functions
const calculateHoldingPeriod = (purchaseDate: string): number => {
  const purchase = new Date(purchaseDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - purchase.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isLongTerm = (days: number): boolean => {
  return days >= 365;
};

const calculateTax = (gainLoss: number, isLongTerm: boolean, taxSettings: TaxSettings): number => {
  if (gainLoss <= 0) return 0;
  
  const federalRate = isLongTerm ? taxSettings.longTermRate : taxSettings.shortTermRate;
  return gainLoss * (federalRate + taxSettings.stateRate) / 100;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2
  }).format(value / 100);
};

const TaxLotOptimizer: React.FC<TaxLotOptimizerProps> = () => {
  const { manualAccounts, isLoading } = useManualAccounts();
  const [securities, setSecurities] = useState(mockSecurities);
  const [selectedSecurity, setSelectedSecurity] = useState<string | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(0);
  const [availableLots, setAvailableLots] = useState<SecurityLot[]>([]);
  const [selectedLots, setSelectedLots] = useState<SecurityLot[]>([]);
  const [optimizationMethod, setOptimizationMethod] = useState<string>('minimize_tax');
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  
  // Tax settings
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    shortTermRate: 35,
    longTermRate: 15,
    stateRate: 6,
    filingStatus: 'single',
    annualIncome: 120000
  });

  // Format lots with calculated fields when a security is selected
  useEffect(() => {
    if (!selectedSecurity) {
      setAvailableLots([]);
      return;
    }
    
    const security = securities.find(s => s.id === selectedSecurity);
    if (!security) return;
    
    const lots = security.lots.map(lot => {
      const holdingPeriod = calculateHoldingPeriod(lot.purchaseDate);
      const currentValue = lot.quantity * lot.currentPrice;
      const gainLoss = currentValue - (lot.quantity * lot.costBasis);
      const gainLossPercent = (gainLoss / (lot.quantity * lot.costBasis)) * 100;
      
      return {
        ...lot,
        symbol: security.symbol,
        name: security.name,
        currentValue,
        gainLoss,
        gainLossPercent,
        holdingPeriod,
        isSelected: false
      };
    });
    
    setAvailableLots(lots);
    setSellQuantity(0);
    setSelectedLots([]);
  }, [selectedSecurity, securities]);

  // Handle lot selection
  const handleLotSelection = (lotId: string, isSelected: boolean) => {
    setAvailableLots(prev => 
      prev.map(lot => lot.id === lotId ? { ...lot, isSelected } : lot)
    );
    
    // Update selected lots
    if (isSelected) {
      const lotToAdd = availableLots.find(lot => lot.id === lotId);
      if (lotToAdd) {
        setSelectedLots(prev => [...prev, { ...lotToAdd, isSelected: true }]);
      }
    } else {
      setSelectedLots(prev => prev.filter(lot => lot.id !== lotId));
    }
  };

  // Run optimization
  const runOptimization = () => {
    if (!selectedSecurity || sellQuantity <= 0) return;
    
    // Filter available lots
    const lots = availableLots.map(lot => ({ ...lot, isSelected: false }));
    let remainingSellQuantity = sellQuantity;
    let optimizedLots: SecurityLot[] = [];
    let totalTax = 0;
    let totalGainLoss = 0;
    
    // Different optimization methods
    switch(optimizationMethod) {
      case 'fifo': // First In, First Out
        // Sort lots by purchase date (oldest first)
        lots.sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
        break;
        
      case 'lifo': // Last In, First Out
        // Sort lots by purchase date (newest first)
        lots.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
        break;
        
      case 'minimize_tax': // Minimize Tax Impact
        // Sort by tax impact (lowest first)
        lots.sort((a, b) => {
          const aTax = calculateTax(a.gainLoss, isLongTerm(a.holdingPeriod), taxSettings);
          const bTax = calculateTax(b.gainLoss, isLongTerm(b.holdingPeriod), taxSettings);
          return (aTax / a.quantity) - (bTax / b.quantity);
        });
        break;
        
      case 'highest_cost': // Highest Cost Basis First
        // Sort by cost basis (highest first)
        lots.sort((a, b) => (b.costBasis) - (a.costBasis));
        break;
        
      case 'maximize_loss': // Maximum Tax Loss Harvesting
        // Sort by gain/loss (lowest/most negative first)
        lots.sort((a, b) => (a.gainLoss / a.quantity) - (b.gainLoss / b.quantity));
        break;
    }
    
    // Select lots until we've reached the desired quantity
    for (const lot of lots) {
      if (remainingSellQuantity <= 0) break;
      
      const quantityToSell = Math.min(lot.quantity, remainingSellQuantity);
      remainingSellQuantity -= quantityToSell;
      
      // If we're selling the full lot
      if (quantityToSell === lot.quantity) {
        lot.isSelected = true;
        optimizedLots.push(lot);
        
        // Calculate tax
        const lotTax = calculateTax(lot.gainLoss, isLongTerm(lot.holdingPeriod), taxSettings);
        totalTax += lotTax;
        totalGainLoss += lot.gainLoss;
      } 
      // If we're selling a partial lot
      else if (quantityToSell > 0) {
        // Create a partial lot
        const partialLot = {
          ...lot,
          quantity: quantityToSell,
          currentValue: lot.currentPrice * quantityToSell,
          costBasis: lot.costBasis,
          gainLoss: (lot.currentPrice - lot.costBasis) * quantityToSell,
          gainLossPercent: lot.gainLossPercent,
          isSelected: true
        };
        
        optimizedLots.push(partialLot);
        
        // Calculate tax for partial lot
        const lotTax = calculateTax(partialLot.gainLoss, isLongTerm(lot.holdingPeriod), taxSettings);
        totalTax += lotTax;
        totalGainLoss += partialLot.gainLoss;
      }
    }
    
    // Update selected lots
    setSelectedLots(optimizedLots);
    
    // Update available lots selection state
    setAvailableLots(prev => 
      prev.map(lot => {
        const selectedLot = optimizedLots.find(sl => sl.id === lot.id);
        return selectedLot ? { ...lot, isSelected: true } : { ...lot, isSelected: false };
      })
    );
    
    // Set optimization results
    setOptimizationResults({
      totalShares: sellQuantity,
      totalProceeds: optimizedLots.reduce((sum, lot) => sum + lot.currentValue, 0),
      totalCostBasis: optimizedLots.reduce((sum, lot) => sum + (lot.costBasis * lot.quantity), 0),
      totalGainLoss,
      totalTax,
      afterTaxProceeds: optimizedLots.reduce((sum, lot) => sum + lot.currentValue, 0) - totalTax,
      effectiveTaxRate: totalGainLoss > 0 ? (totalTax / totalGainLoss) * 100 : 0
    });
  };

  // Update tax settings
  const handleTaxSettingChange = (field: keyof TaxSettings, value: any) => {
    setTaxSettings(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Tax Lot Optimizer</h2>
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold mb-2">Tax Lot Optimizer</h2>
        <p className="text-gray-400">
          Optimize which tax lots to sell to minimize tax impact, harvest losses, or match your preferred method.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Selection and configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4 bg-[#0f1525] border-gray-800">
            <h3 className="text-lg font-medium mb-4">Select Security & Strategy</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="security-select">Security</Label>
                <Select
                  value={selectedSecurity || ''}
                  onValueChange={(value) => setSelectedSecurity(value)}
                >
                  <SelectTrigger id="security-select">
                    <SelectValue placeholder="Select a security" />
                  </SelectTrigger>
                  <SelectContent>
                    {securities.map(security => (
                      <SelectItem key={security.id} value={security.id}>
                        {security.symbol} - {security.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sell-quantity">Shares to Sell</Label>
                <Input
                  id="sell-quantity"
                  type="number"
                  min={0}
                  max={availableLots.reduce((sum, lot) => sum + lot.quantity, 0)}
                  value={sellQuantity || ''}
                  onChange={(e) => setSellQuantity(Number(e.target.value))}
                  className="bg-[#1a2032] border-gray-700"
                />
              </div>
              
              <div>
                <Label htmlFor="optimization-method">Optimization Method</Label>
                <Select
                  value={optimizationMethod}
                  onValueChange={(value) => setOptimizationMethod(value)}
                >
                  <SelectTrigger id="optimization-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimize_tax">Minimize Tax Impact</SelectItem>
                    <SelectItem value="fifo">First In, First Out (FIFO)</SelectItem>
                    <SelectItem value="lifo">Last In, First Out (LIFO)</SelectItem>
                    <SelectItem value="highest_cost">Highest Cost Basis First</SelectItem>
                    <SelectItem value="maximize_loss">Maximum Tax Loss Harvesting</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">
                  {optimizationMethod === 'minimize_tax' ? 
                    'Sell lots that result in the lowest overall tax burden.' :
                    optimizationMethod === 'fifo' ? 
                    'Sell oldest lots first (default IRS method).' :
                    optimizationMethod === 'lifo' ? 
                    'Sell newest lots first.' :
                    optimizationMethod === 'highest_cost' ? 
                    'Sell lots with the highest cost basis first to minimize gains.' :
                    'Prioritize selling lots with losses to offset other capital gains.'}
                </p>
              </div>
              
              <Button
                className="w-full mt-4"
                onClick={runOptimization}
                disabled={!selectedSecurity || sellQuantity <= 0}
              >
                Run Optimization
              </Button>
            </div>
          </Card>
          
          <Card className="p-4 bg-[#0f1525] border-gray-800">
            <h3 className="text-lg font-medium mb-4">Tax Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="filing-status">Filing Status</Label>
                <Select
                  value={taxSettings.filingStatus}
                  onValueChange={(value: any) => handleTaxSettingChange('filingStatus', value)}
                >
                  <SelectTrigger id="filing-status">
                    <SelectValue placeholder="Select filing status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married Filing Jointly</SelectItem>
                    <SelectItem value="head">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="annual-income">Annual Income</Label>
                <Input
                  id="annual-income"
                  type="number"
                  min={0}
                  value={taxSettings.annualIncome}
                  onChange={(e) => handleTaxSettingChange('annualIncome', Number(e.target.value))}
                  className="bg-[#1a2032] border-gray-700"
                />
              </div>
              
              <div>
                <Label htmlFor="short-term-rate">Short-Term Capital Gains Rate (%)</Label>
                <Input
                  id="short-term-rate"
                  type="number"
                  min={0}
                  max={50}
                  value={taxSettings.shortTermRate}
                  onChange={(e) => handleTaxSettingChange('shortTermRate', Number(e.target.value))}
                  className="bg-[#1a2032] border-gray-700"
                />
              </div>
              
              <div>
                <Label htmlFor="long-term-rate">Long-Term Capital Gains Rate (%)</Label>
                <Input
                  id="long-term-rate"
                  type="number"
                  min={0}
                  max={30}
                  value={taxSettings.longTermRate}
                  onChange={(e) => handleTaxSettingChange('longTermRate', Number(e.target.value))}
                  className="bg-[#1a2032] border-gray-700"
                />
              </div>
              
              <div>
                <Label htmlFor="state-rate">State Tax Rate (%)</Label>
                <Input
                  id="state-rate"
                  type="number"
                  min={0}
                  max={15}
                  value={taxSettings.stateRate}
                  onChange={(e) => handleTaxSettingChange('stateRate', Number(e.target.value))}
                  className="bg-[#1a2032] border-gray-700"
                />
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right columns - Available lots and results */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSecurity && (
            <Card className="p-4 bg-[#0f1525] border-gray-800">
              <h3 className="text-lg font-medium mb-4">
                Available Lots for {securities.find(s => s.id === selectedSecurity)?.symbol}
              </h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Cost Basis</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Gain/Loss</TableHead>
                    <TableHead>Term</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableLots.map(lot => (
                    <TableRow key={lot.id}>
                      <TableCell>
                        <Checkbox
                          checked={lot.isSelected}
                          onCheckedChange={(checked) => handleLotSelection(lot.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>{new Date(lot.purchaseDate).toLocaleDateString()}</TableCell>
                      <TableCell>{lot.quantity}</TableCell>
                      <TableCell>{formatCurrency(lot.costBasis)}</TableCell>
                      <TableCell>{formatCurrency(lot.currentPrice)}</TableCell>
                      <TableCell className={lot.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatCurrency(lot.gainLoss)} ({formatPercent(lot.gainLossPercent)})
                      </TableCell>
                      <TableCell>
                        <Badge variant={isLongTerm(lot.holdingPeriod) ? 'outline' : 'secondary'}>
                          {isLongTerm(lot.holdingPeriod) ? 'Long-term' : 'Short-term'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
          
          {selectedLots.length > 0 && (
            <Card className="p-4 bg-[#0f1525] border-gray-800">
              <h3 className="text-lg font-medium mb-4">Selected Lots</h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Cost Basis</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Gain/Loss</TableHead>
                    <TableHead>Est. Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedLots.map(lot => {
                    const lotTax = calculateTax(
                      lot.gainLoss, 
                      isLongTerm(lot.holdingPeriod), 
                      taxSettings
                    );
                    
                    return (
                      <TableRow key={lot.id}>
                        <TableCell>{new Date(lot.purchaseDate).toLocaleDateString()}</TableCell>
                        <TableCell>{lot.quantity}</TableCell>
                        <TableCell>{formatCurrency(lot.costBasis * lot.quantity)}</TableCell>
                        <TableCell>{formatCurrency(lot.currentValue)}</TableCell>
                        <TableCell className={lot.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatCurrency(lot.gainLoss)} ({formatPercent(lot.gainLossPercent)})
                        </TableCell>
                        <TableCell className={lotTax > 0 ? 'text-red-500' : 'text-green-500'}>
                          {formatCurrency(lotTax)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
          
          {optimizationResults && (
            <Card className="p-4 bg-[#0f1525] border-gray-800">
              <h3 className="text-lg font-medium mb-4">Optimization Results</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1a2032] p-3 rounded border border-gray-800">
                  <p className="text-sm text-gray-400">Total Shares</p>
                  <p className="text-xl font-semibold">{optimizationResults.totalShares}</p>
                </div>
                <div className="bg-[#1a2032] p-3 rounded border border-gray-800">
                  <p className="text-sm text-gray-400">Total Proceeds</p>
                  <p className="text-xl font-semibold">{formatCurrency(optimizationResults.totalProceeds)}</p>
                </div>
                <div className="bg-[#1a2032] p-3 rounded border border-gray-800">
                  <p className="text-sm text-gray-400">Total Gain/Loss</p>
                  <p className={`text-xl font-semibold ${optimizationResults.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(optimizationResults.totalGainLoss)}
                  </p>
                </div>
                <div className="bg-[#1a2032] p-3 rounded border border-gray-800">
                  <p className="text-sm text-gray-400">Estimated Tax</p>
                  <p className="text-xl font-semibold text-red-500">
                    {formatCurrency(optimizationResults.totalTax)}
                  </p>
                </div>
              </div>
              
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Tax Summary Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Sale Proceeds:</span>
                        <span>{formatCurrency(optimizationResults.totalProceeds)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Cost Basis:</span>
                        <span>{formatCurrency(optimizationResults.totalCostBasis)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Capital Gain/Loss:</span>
                        <span className={optimizationResults.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {formatCurrency(optimizationResults.totalGainLoss)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Estimated Tax:</span>
                        <span className="text-red-500">{formatCurrency(optimizationResults.totalTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Effective Tax Rate on Gains:</span>
                        <span>{formatPercent(optimizationResults.effectiveTaxRate)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-gray-700 pt-2 mt-2">
                        <span>After-Tax Proceeds:</span>
                        <span>{formatCurrency(optimizationResults.afterTaxProceeds)}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Tax Planning Notes</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">
                        {optimizationResults.totalGainLoss > 0 ? 
                          `You have a capital gain of ${formatCurrency(optimizationResults.totalGainLoss)}. Consider offsetting this with capital losses if available.` :
                          `You have a capital loss of ${formatCurrency(Math.abs(optimizationResults.totalGainLoss))}. This can be used to offset capital gains, and up to $3,000 of ordinary income.`
                        }
                      </p>
                      
                      {optimizationMethod !== 'minimize_tax' && (
                        <p className="text-sm text-gray-300 mt-2">
                          You could potentially save more in taxes by using the 'Minimize Tax Impact' optimization method.
                        </p>
                      )}
                      
                      {optimizationResults.totalGainLoss > 5000 && taxSettings.shortTermRate > 24 && (
                        <p className="text-sm text-gray-300 mt-2">
                          If you can wait until your short-term holdings become long-term, you could potentially save up to {formatCurrency((taxSettings.shortTermRate - taxSettings.longTermRate) * optimizationResults.totalGainLoss / 100)} in taxes.
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxLotOptimizer; 