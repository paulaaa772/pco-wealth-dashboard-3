'use client';

import React, { useState, useMemo } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaxLotOptimizer from './TaxLotOptimizer';
import TaxAnalyticsDashboard from './TaxAnalyticsDashboard';

const TaxCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'tax-lots' | 'documents' | 'settings'>('overview');
  const { manualAccounts, isLoading } = useManualAccounts();
  
  // Mock data for the overview page
  const taxYear = new Date().getFullYear() - 1;
  
  const documents = [
    { name: '1099-B', status: 'Available', date: 'Feb 15, 2024' },
    { name: '1099-DIV', status: 'Available', date: 'Feb 15, 2024' },
    { name: '1099-INT', status: 'Available', date: 'Feb 15, 2024' },
    { name: 'Cost Basis', status: 'Available', date: 'Feb 15, 2024' },
  ];

  const taxLotMethods = [
    { name: 'FIFO', description: 'First In, First Out' },
    { name: 'LIFO', description: 'Last In, First Out' },
    { name: 'Specific Lot', description: 'Choose specific lots when selling' },
  ];

  // Sample tax data for overview
  const realizedGainsYTD = 1250.75;
  const potentialTaxSavings = 12355;
  const unrealizedGains = -4772;
  const realizedGainsAmount = 38100;
  const estimatedTaxesYTD = 7313;

  // Sample tax lots data 
  const mockTaxLots = [
    {
      id: 'lot1', symbol: 'AAPL', quantity: 50, acquisitionDate: '2023-01-15',
      costBasis: 7500, currentValue: 9384, unrealizedGain: 1884, holdingPeriod: 'Long-Term'
    },
    {
      id: 'lot2', symbol: 'NVDA', quantity: 10, acquisitionDate: '2024-02-10',
      costBasis: 7000, currentValue: 9335, unrealizedGain: 2335, holdingPeriod: 'Short-Term'
    },
    {
      id: 'lot3', symbol: 'MSFT', quantity: 30, acquisitionDate: '2023-07-20',
      costBasis: 8722, currentValue: 12492, unrealizedGain: 3770, holdingPeriod: 'Short-Term'
    },
    {
      id: 'lot4', symbol: 'JNJ', quantity: 25, acquisitionDate: '2022-11-01',
      costBasis: 4053, currentValue: 3812, unrealizedGain: -241, holdingPeriod: 'Long-Term'
    },
  ];

  // Sample tax loss harvesting opportunities
  const mockHarvestOpportunities = [
    { symbol: 'JNJ', potentialLoss: 241, washSaleWarning: false },
    { symbol: 'BND', potentialLoss: 185, washSaleWarning: true },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1B2B4B] text-white p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B2B4B] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Tax Center</h1>
        
        {/* Main navigation using tabs */}
        <Tabs defaultValue="overview" className="w-full" value={activeTab} onValueChange={(value: string) => setActiveTab(value as any)}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Tax Analytics</TabsTrigger>
            <TabsTrigger value="tax-lots">Tax Lot Optimizer</TabsTrigger>
            <TabsTrigger value="documents">Tax Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-[#2A3C61] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Potential Tax Savings</h3>
                <p className="text-2xl font-semibold">${potentialTaxSavings.toLocaleString()}</p>
              </div>
              <div className="bg-[#2A3C61] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Unrealized Gains</h3>
                <p className={`text-2xl font-semibold ${unrealizedGains >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${unrealizedGains.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#2A3C61] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Realized Gains (YTD)</h3>
                <p className={`text-2xl font-semibold text-green-500`}>
                  ${realizedGainsAmount.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#2A3C61] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Estimated Tax (YTD)</h3>
                <p className="text-2xl font-semibold text-red-500">${estimatedTaxesYTD.toLocaleString()}</p>
              </div>
              <div className="bg-[#2A3C61] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-1">Tax Lot Method</h3>
                <p className="text-xl font-semibold">FIFO</p>
                <p className="text-xs text-gray-400 mt-1">Can be changed in Settings</p>
              </div>
            </div>

            {/* Tax Lots Quick View */}
            <div className="bg-[#2A3C61] rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tax Lots</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setActiveTab('tax-lots')}
                >
                  Open Tax Lot Optimizer
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-[#1E2D4E]">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Symbol</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acquired</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Cost Basis</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Market Value</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Unrealized G/L</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Term</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {mockTaxLots.map((lot, index) => (
                      <tr key={lot.id} className={`${index % 2 === 0 ? 'bg-[#2A3C61]' : 'bg-[#233150]'}`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{lot.symbol}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{lot.quantity}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{lot.acquisitionDate}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">${lot.costBasis.toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">${lot.currentValue.toLocaleString()}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${lot.unrealizedGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${lot.unrealizedGain.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{lot.holdingPeriod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Tax Loss Harvesting Quick View */}
            <div className="bg-[#2A3C61] rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tax Loss Harvesting Opportunities</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('analytics')}
                >
                  View Analytics
                </Button>
              </div>
              {mockHarvestOpportunities.length > 0 ? (
                <div className="space-y-3">
                  {mockHarvestOpportunities.map(opp => (
                    <div key={opp.symbol} className="flex justify-between items-center p-3 bg-[#1E2D4E] rounded">
                      <div>
                        <span className="font-medium">{opp.symbol}</span>
                        <span className="ml-2 text-red-400">(-${opp.potentialLoss.toLocaleString()})</span>
                        {opp.washSaleWarning && <span className="ml-2 text-xs text-yellow-400 bg-yellow-900/30 px-1.5 py-0.5 rounded">Wash Sale Risk</span>}
                      </div>
                      <button className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">Harvest</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No significant loss harvesting opportunities detected.</p>
              )}
            </div>
            
            {/* Wash Sale Rule Reminder */}
            <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-500 mb-2">Wash Sale Rule</h3>
              <p className="text-sm text-gray-300">
                Remember that the IRS wash sale rule prohibits selling an investment for a loss and replacing it with the same or a "substantially identical" investment within 30 days before or after the sale. Consider replacing harvested positions with similar but not identical investments.
              </p>
            </div>
          </TabsContent>
          
          {/* Tax Analytics Tab */}
          <TabsContent value="analytics">
            <TaxAnalyticsDashboard />
          </TabsContent>
          
          {/* Tax Lot Optimizer Tab */}
          <TabsContent value="tax-lots">
            <TaxLotOptimizer />
          </TabsContent>
          
          {/* Tax Documents Tab */}
          <TabsContent value="documents">
            <div className="bg-[#2A3C61] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Tax Documents</h2>
              
              {documents.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-[#1E2D4E] p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-medium mb-3">Tax Year {taxYear}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc) => (
                        <div key={doc.name} className="bg-[#2A3C61] p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{doc.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">Available since {doc.date}</p>
                          </div>
                          <Button size="sm" variant="outline">Download</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-[#1E2D4E] p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Tax Year {taxYear - 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc) => (
                        <div key={`${doc.name}-prev`} className="bg-[#2A3C61] p-3 rounded-lg flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{doc.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">Available since Feb 15, 2023</p>
                          </div>
                          <Button size="sm" variant="outline">Download</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Your tax documents (e.g., 1099-B, 1099-DIV) will appear here when available.</p>
              )}
            </div>
          </TabsContent>
          
          {/* Tax Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-[#2A3C61] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Tax Settings</h2>
              
              <div className="space-y-6">
                <div className="bg-[#1E2D4E] p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Default Tax Lot Method</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    This method will be used when selling securities unless you choose specific lots during the transaction.
                  </p>
                  <div className="space-y-3">
                    {taxLotMethods.map((method) => (
                      <div key={method.name} className="flex items-center">
                        <input
                          type="radio"
                          id={method.name}
                          name="taxLotMethod"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-800"
                          defaultChecked={method.name === 'FIFO'}
                        />
                        <label htmlFor={method.name} className="ml-2 block">
                          <span className="font-medium">{method.name}</span>
                          <p className="text-xs text-gray-400 mt-0.5">{method.description}</p>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#1E2D4E] p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Tax Filing Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Filing Status</label>
                      <select className="w-full px-3 py-2 bg-[#2A3C61] border border-gray-600 rounded-md text-white">
                        <option>Single</option>
                        <option>Married Filing Jointly</option>
                        <option>Married Filing Separately</option>
                        <option>Head of Household</option>
                        <option>Qualifying Widow(er)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">Tax Bracket</label>
                      <select className="w-full px-3 py-2 bg-[#2A3C61] border border-gray-600 rounded-md text-white">
                        <option>10%</option>
                        <option>12%</option>
                        <option>22%</option>
                        <option>24%</option>
                        <option selected>32%</option>
                        <option>35%</option>
                        <option>37%</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">State</label>
                      <select className="w-full px-3 py-2 bg-[#2A3C61] border border-gray-600 rounded-md text-white">
                        <option>California</option>
                        <option>New York</option>
                        <option>Texas</option>
                        <option>Florida</option>
                        {/* Additional states would be listed here */}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-300">State Tax Rate</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 bg-[#2A3C61] border border-gray-600 rounded-md text-white"
                        defaultValue="9.3%"
                      />
                    </div>
                  </div>
                  
                  <Button className="mt-4">Save Settings</Button>
                </div>
                
                <div className="bg-[#1E2D4E] p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Tax Loss Harvesting Settings</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-medium">Enable Tax Loss Harvesting Alerts</label>
                        <p className="text-xs text-gray-400 mt-0.5">Receive notifications when tax loss harvesting opportunities are identified</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-800 rounded"
                        defaultChecked={true}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-medium">Wash Sale Prevention</label>
                        <p className="text-xs text-gray-400 mt-0.5">Block trades that would trigger a wash sale</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 bg-gray-800 rounded"
                        defaultChecked={true}
                      />
                    </div>
                  </div>
                  
                  <Button className="mt-4">Save Settings</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TaxCenter; 