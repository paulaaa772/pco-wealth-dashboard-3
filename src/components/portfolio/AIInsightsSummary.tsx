'use client';

import React, { useMemo } from 'react';
import { useManualAccounts, ManualAccount } from '@/context/ManualAccountsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb } from 'lucide-react'; // Icon

// --- Helper functions & Data (Copied/adapted from other components) ---

// Target Allocation (from RebalancingEngine)
const targetAllocation: Record<string, number> = {
  'Stocks/Funds': 60, 'Cash': 10, 'Alternatives': 5,
  'Bonds': 20, 'Real Estate': 5, 'Other': 0,
};

// Sector Mapping (from DiversificationAnalysis)
const mockSymbolToSector: Record<string, string> = {
  'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology',
  'AMZN': 'Consumer Discretionary', 'TSLA': 'Consumer Discretionary',
  'JNJ': 'Healthcare', 'PFE': 'Healthcare', 'MRK': 'Healthcare',
  'JPM': 'Financials', 'BAC': 'Financials', 'WFC': 'Financials',
  'XOM': 'Energy', 'CVX': 'Energy',
  'NVDA': 'Technology', 'ASML': 'Technology', 'TSM': 'Technology',
  'VTI': 'Broad Market', 'VOO': 'Broad Market', 'QQQ': 'Broad Market',
  'BRK.B': 'Financials',
  'MELI': 'Consumer Discretionary',
  'CAT': 'Industrials',
  'VNQ': 'Real Estate',
  'KTOS': 'Industrials',
  'VST': 'Utilities',
  'LRCX': 'Technology',
  'SRVR': 'Real Estate', // Assuming data center REIT
  'NVO': 'Healthcare',
  'INTC': 'Technology',
  'XLV': 'Healthcare', // Sector ETF
  'COST': 'Consumer Staples',
  'AGFY': 'Industrials', // Agrify - Vertical Farming
  'BTC': 'Crypto',
  'ETH': 'Crypto',
};

// Benchmark Sector Weights (from DiversificationAnalysis)
const benchmarkSectorWeights: Record<string, number> = {
    'Technology': 28, 'Healthcare': 14, 'Financials': 13,
    'Consumer Discretionary': 10, 'Communication Services': 9, 'Industrials': 8,
    'Consumer Staples': 6, 'Energy': 4, 'Utilities': 3,
    'Real Estate': 3, 'Materials': 2, 'Broad Market': 0, 'Crypto': 0,
};

// Account Type Mapping (from RebalancingEngine/RiskBasedAllocation)
const mapAccountTypeToAssetClass = (accountType: string): string => {
   switch (accountType) {
    case 'Brokerage': case '401k': case 'IRA': return 'Stocks/Funds';
    case 'Bank Account': case 'Savings': return 'Cash';
    case 'Crypto Wallet': return 'Alternatives';
    case 'Real Estate': return 'Real Estate';
    default: return 'Other';
  }
};

// --- Component Logic ---

interface AIInsightsSummaryProps {
    // Pass accounts directly to avoid prop drilling from multiple sources
    manualAccounts: ManualAccount[]; 
    // We might pass other calculated data later (e.g., performance, ESG)
}

const AIInsightsSummary: React.FC<AIInsightsSummaryProps> = ({ manualAccounts }) => {

    const insights = useMemo(() => {
        const generatedInsights: string[] = [];
        let currentTotalValue = 0;
        const allocationMap: Record<string, number> = {};
        const sectorMap: Record<string, number> = {};

        // 1. Calculate current allocations and total value
        manualAccounts.forEach(account => {
            const assetClass = mapAccountTypeToAssetClass(account.accountType);
            allocationMap[assetClass] = (allocationMap[assetClass] || 0) + account.totalValue;
            currentTotalValue += account.totalValue;
            
            account.assets.forEach(asset => {
                const sector = mockSymbolToSector[asset.symbol] || 'Unknown Sector';
                sectorMap[sector] = (sectorMap[sector] || 0) + asset.value;
            });
        });

        if (currentTotalValue === 0) {
            return ["Add accounts to generate portfolio insights."];
        }

        // 2. Generate Allocation Drift Insights
        let maxDrift = 0;
        let driftInsight = '';
        const allAssetClasses = new Set([...Object.keys(allocationMap), ...Object.keys(targetAllocation)]);
        allAssetClasses.forEach(assetClass => {
            if (assetClass === 'Other' && !(assetClass in allocationMap)) return;
            const currentValue = allocationMap[assetClass] || 0;
            const currentPercent = parseFloat(((currentValue / currentTotalValue) * 100).toFixed(1));
            const targetPercent = targetAllocation[assetClass] || 0;
            const driftPercent = currentPercent - targetPercent;
            const threshold = Math.max(5, targetPercent * 0.25);

            if (Math.abs(driftPercent) > Math.abs(maxDrift)) {
                maxDrift = driftPercent;
                 if (driftPercent > threshold) {
                    driftInsight = `Your largest allocation drift is in ${assetClass}, which is overweight by ${driftPercent.toFixed(1)}%. Consider rebalancing.`;
                 } else if (driftPercent < -threshold) {
                    driftInsight = `Your largest allocation drift is in ${assetClass}, which is underweight by ${Math.abs(driftPercent).toFixed(1)}%. Consider rebalancing.`;
                 } else {
                     driftInsight = ''; // Reset if largest drift is within threshold
                 }
            }
        });
        if (driftInsight) generatedInsights.push(driftInsight);
        else generatedInsights.push("Your portfolio allocation is generally aligned with the target.");

        // 3. Generate Sector Concentration Insights
        let maxConcentration = 0;
        let concentrationInsight = '';
        Object.entries(sectorMap).forEach(([sector, value]) => {
            const weight = parseFloat(((value / currentTotalValue) * 100).toFixed(1));
            const benchmark = benchmarkSectorWeights[sector] || 0;
            const isConcentrated = weight > Math.max(benchmark + 5, 20);
            if (isConcentrated && weight > maxConcentration) {
                 maxConcentration = weight;
                 concentrationInsight = `High concentration detected in ${sector} (${weight.toFixed(1)}%). Consider diversifying this position.`;
            }
        });
         if (concentrationInsight) generatedInsights.push(concentrationInsight);
         else generatedInsights.push("No significant sector concentration risks detected.");

        // 4. Placeholder for Performance Insights
        // generatedInsights.push("Performance insight placeholder: Needs performance data.");

        // 5. Placeholder for ESG Insights
        // generatedInsights.push("ESG insight placeholder: Needs ESG data.");
        
        // 6. Simple Cash Insight
        const cashPercent = (allocationMap['Cash'] / currentTotalValue) * 100 || 0;
        if (cashPercent > 20) {
             generatedInsights.push(`Your cash allocation (${cashPercent.toFixed(1)}%) seems high. Consider investing excess cash based on your goals.`);
        }

        return generatedInsights;

    }, [manualAccounts]);

    return (
        <Card className="bg-[#1B2B4B]/60 border-gray-700 text-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb size={20} className="text-yellow-400"/>
                    AI-Powered Insights (Simulated)
                </CardTitle>
                 <CardDescription className="text-gray-400 pt-1">
                     Key observations based on your portfolio data.
                 </CardDescription>
            </CardHeader>
            <CardContent>
                {manualAccounts.length > 0 ? (
                    <ul className="space-y-3 list-disc pl-5">
                        {insights.map((insight, index) => (
                            <li key={index} className="text-sm text-gray-200">
                                {insight}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400">Please add accounts with holdings to generate insights.</p>
                )}
            </CardContent>
        </Card>
    );
};

export default AIInsightsSummary; 