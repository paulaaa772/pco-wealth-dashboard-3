import React, { useMemo } from 'react';
import { useManualAccounts } from '@/context/ManualAccountsContext';

// Import sub-components
import ESGScoreCard from './ESGScoreCard';
import ESGPillarBreakdown, { PillarScore } from './ESGPillarBreakdown';
import ESGHoldingsList, { ESGHolding } from './ESGHoldingsList';
import CarbonFootprint from './CarbonFootprint';
import Controversies, { Controversy } from './Controversies';
import ImpactRecommendations, { ImpactTheme, ImpactRecommendation } from './ImpactRecommendations';
import SustainabilityReport from './SustainabilityReport';

// Import types if needed
import { ManualAccount } from '@/context/ManualAccountsContext';

// Mock ESG data (would typically come from an API)
const mockSymbolESGData: Record<string, { name: string; score: number; rating: string }> = {
  'AAPL': { name: 'Apple Inc.', score: 75, rating: 'AA' },
  'MSFT': { name: 'Microsoft Corp.', score: 85, rating: 'AAA' },
  'GOOGL': { name: 'Alphabet Inc.', score: 79, rating: 'AA' },
  'AMZN': { name: 'Amazon.com, Inc.', score: 60, rating: 'A' },
  'TSLA': { name: 'Tesla, Inc.', score: 55, rating: 'BBB' },
  'JNJ': { name: 'Johnson & Johnson', score: 70, rating: 'A' },
  'PFE': { name: 'Pfizer Inc.', score: 68, rating: 'A' },
  'MRK': { name: 'Merck & Co., Inc.', score: 72, rating: 'AA' },
  'JPM': { name: 'JPMorgan Chase & Co.', score: 65, rating: 'A' },
  'BAC': { name: 'Bank of America Corp', score: 63, rating: 'A' },
  'WFC': { name: 'Wells Fargo & Company', score: 58, rating: 'BBB' },
  'XOM': { name: 'Exxon Mobil Corp.', score: 45, rating: 'BB' },
  'CVX': { name: 'Chevron Corp.', score: 48, rating: 'BB' },
  'NVDA': { name: 'NVIDIA Corp.', score: 80, rating: 'AA' },
  'ASML': { name: 'ASML Holding N.V.', score: 82, rating: 'AAA' },
  'TSM': { name: 'Taiwan Semiconductor Manufacturing Co.', score: 77, rating: 'AA' },
  'VTI': { name: 'Vanguard Total Stock Market ETF', score: 70, rating: 'A' },
  'VOO': { name: 'Vanguard S&P 500 ETF', score: 71, rating: 'A' },
  'QQQ': { name: 'Invesco QQQ Trust', score: 73, rating: 'AA' },
  'BRK.B': { name: 'Berkshire Hathaway Inc.', score: 66, rating: 'A' },
  'MELI': { name: 'MercadoLibre, Inc.', score: 69, rating: 'A' },
  'CAT': { name: 'Caterpillar Inc.', score: 62, rating: 'A' },
  'VNQ': { name: 'Vanguard Real Estate ETF', score: 64, rating: 'A' },
  'KTOS': { name: 'Kratos Defense & Security Solutions', score: 50, rating: 'BB' },
  'VST': { name: 'Vistra Corp.', score: 59, rating: 'BBB' },
  'LRCX': { name: 'Lam Research Corp.', score: 78, rating: 'AA' },
  'SRVR': { name: 'PIMCO Access Income Fund', score: 65, rating: 'A' },
  'NVO': { name: 'Novo Nordisk A/S', score: 88, rating: 'AAA' },
  'INTC': { name: 'Intel Corp.', score: 74, rating: 'AA' },
  'XLV': { name: 'Health Care Select Sector SPDR Fund', score: 71, rating: 'A' },
  'COST': { name: 'Costco Wholesale Corp.', score: 76, rating: 'AA' },
  'AGFY': { name: 'Agrify Corp.', score: 40, rating: 'B' },
  'BTC': { name: 'Bitcoin', score: 30, rating: 'CCC' },
  'ETH': { name: 'Ethereum', score: 35, rating: 'CCC' },
};

// Mock pillar scores
const mockESGPillarScores: PillarScore[] = [
  { 
    name: 'Environmental', 
    score: 65,
    description: 'Measures environmental impact, resource usage, and climate policies.' 
  },
  { 
    name: 'Social', 
    score: 78,
    description: 'Evaluates human rights, labor practices, community engagement, and diversity.' 
  },
  { 
    name: 'Governance', 
    score: 70,
    description: 'Assesses board structure, executive compensation, ethics, and transparency.' 
  },
  { 
    name: 'Climate Change', 
    score: 62,
    description: 'Specific focus on climate change adaptation and mitigation efforts.' 
  },
  { 
    name: 'Resource Use', 
    score: 68,
    description: 'Evaluates efficient use of natural resources and reduction of waste.' 
  },
];

// Mock controversies
const mockControversies: Controversy[] = [
  { 
    ticker: 'META', 
    company: 'Meta Platforms', 
    issue: 'Data Privacy Concerns', 
    severity: 'High',
    date: '2023-08-15',
    details: 'Ongoing regulatory investigations related to user data privacy practices.'
  },
  { 
    ticker: 'AMZN', 
    company: 'Amazon', 
    issue: 'Labor Practices', 
    severity: 'Moderate',
    date: '2023-05-22',
    details: 'Concerns regarding working conditions in fulfillment centers and delivery operations.'
  },
];

// Mock impact investing themes
const mockImpactThemes: ImpactTheme[] = [
  {
    id: 'climate',
    name: 'Climate Action',
    description: 'Companies focused on climate change mitigation, adaptation, and renewable energy transition.',
    sdgGoals: ['SDG 7', 'SDG 13']
  },
  {
    id: 'water',
    name: 'Clean Water',
    description: 'Organizations developing solutions for water conservation, sanitation, and accessibility.',
    sdgGoals: ['SDG 6']
  },
  {
    id: 'healthcare',
    name: 'Healthcare Access',
    description: 'Businesses improving healthcare accessibility, affordability, and medical innovation.',
    sdgGoals: ['SDG 3']
  },
  {
    id: 'inclusion',
    name: 'Financial Inclusion',
    description: 'Companies promoting financial accessibility for underserved communities.',
    sdgGoals: ['SDG 1', 'SDG 10']
  },
  {
    id: 'circular',
    name: 'Circular Economy',
    description: 'Organizations focused on waste reduction, recycling, and sustainable production.',
    sdgGoals: ['SDG 12']
  }
];

// Mock impact recommendations
const mockImpactRecommendations: ImpactRecommendation[] = [
  {
    ticker: 'ENPH',
    name: 'Enphase Energy',
    description: 'Solar energy technology company developing microinverter systems for residential and commercial use.',
    themes: ['climate'],
    rating: 'AA',
    esgScore: 82
  },
  {
    ticker: 'SEDG',
    name: 'SolarEdge Technologies',
    description: 'Provider of power optimizer, solar inverter and monitoring systems for photovoltaic arrays.',
    themes: ['climate'],
    rating: 'A',
    esgScore: 76
  },
  {
    ticker: 'XYL',
    name: 'Xylem Inc.',
    description: 'Water technology provider addressing critical water issues including conservation and accessibility.',
    themes: ['water'],
    rating: 'AAA',
    esgScore: 88
  },
  {
    ticker: 'VEEV',
    name: 'Veeva Systems',
    description: 'Cloud computing company focused on pharmaceutical and life sciences applications.',
    themes: ['healthcare'],
    rating: 'AA',
    esgScore: 81
  },
  {
    ticker: 'PYPL',
    name: 'PayPal Holdings',
    description: 'Digital payment platform expanding financial services to underbanked populations.',
    themes: ['inclusion'],
    rating: 'A',
    esgScore: 73
  },
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    description: 'Electric vehicle and clean energy company accelerating sustainable transportation.',
    themes: ['climate', 'circular'],
    rating: 'BBB',
    esgScore: 67
  },
  {
    ticker: 'TRMB',
    name: 'Trimble Inc.',
    description: 'Precision agriculture technology reducing water usage and improving farm efficiency.',
    themes: ['water', 'climate'],
    rating: 'A',
    esgScore: 75
  },
  {
    ticker: 'WM',
    name: 'Waste Management',
    description: 'Provider of waste management and environmental services focusing on recycling and sustainability.',
    themes: ['circular'],
    rating: 'AA',
    esgScore: 79
  }
];

// Mock sustainability metrics
const mockSustainabilityMetrics = [
  {
    name: 'ESG Score',
    value: 72,
    change: 3.5,
    description: 'Overall portfolio ESG rating'
  },
  {
    name: 'Carbon Intensity',
    value: '150 tCO2e/$1M',
    change: -8.2,
    description: 'Carbon emissions per million invested'
  },
  {
    name: 'Green Revenue',
    value: '18%',
    change: 2.1,
    description: 'Revenue from sustainable activities'
  },
  {
    name: 'Renewable Energy',
    value: '26%',
    change: 5.3,
    description: 'Portfolio companies\' renewable energy usage'
  },
  {
    name: 'Diversity Score',
    value: 64,
    change: 1.7,
    description: 'Gender and ethnic diversity metrics'
  },
  {
    name: 'Water Intensity',
    value: '1850 m³/$1M',
    change: -3.2,
    description: 'Water usage per million invested'
  },
  {
    name: 'Waste Generation',
    value: '8.7 tons/$1M',
    change: -1.5,
    description: 'Waste produced per million invested'
  }
];

interface ESGDashboardProps {
  // If needed, add props here
}

const ESGDashboard: React.FC<ESGDashboardProps> = () => {
  const { manualAccounts, isLoading } = useManualAccounts();
  
  // Calculate ESG data from holdings
  const {
    overallScore,
    topPerformers,
    bottomPerformers
  } = useMemo(() => {
    if (isLoading || manualAccounts.length === 0) {
      return { overallScore: 0, topPerformers: [], bottomPerformers: [] };
    }
    
    let totalValue = 0;
    const holdingsWithESG: ESGHolding[] = [];

    manualAccounts.forEach(account => {
      account.assets.forEach(asset => {
        const esgInfo = mockSymbolESGData[asset.symbol];
        if (esgInfo) {
          holdingsWithESG.push({
            ticker: asset.symbol,
            name: esgInfo.name,
            value: asset.value,
            weight: 0, // Will calculate later
            score: esgInfo.score,
            rating: esgInfo.rating,
          });
          totalValue += asset.value;
        }
      });
    });

    // Calculate weights and overall score
    let weightedScoreSum = 0;
    holdingsWithESG.forEach(h => {
      // Check if value is defined and handle it safely
      const assetValue = h.value || 0;
      h.weight = (assetValue / totalValue) * 100;
      weightedScoreSum += h.score * (h.weight / 100);
    });

    const calculatedOverallScore = parseFloat(weightedScoreSum.toFixed(1)) || 0;

    // Sort and get top/bottom performers
    holdingsWithESG.sort((a, b) => b.score - a.score); // Sort descending by score
    const topPerformers = holdingsWithESG.slice(0, 5);
    const bottomPerformers = holdingsWithESG.slice(-5).reverse(); // Take last 5, reverse to show worst first

    return { 
      overallScore: calculatedOverallScore, 
      topPerformers, 
      bottomPerformers 
    };
  }, [manualAccounts, isLoading]);

  return (
    <div className="space-y-8 py-6">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
        ESG & Sustainability Metrics
      </h2>
      
      {/* Top level summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ESGScoreCard 
          overallScore={overallScore} 
          isLoading={isLoading} 
        />
        
        <ESGPillarBreakdown 
          pillarScores={mockESGPillarScores} 
          isLoading={isLoading} 
        />
      </div>
      
      {/* Sustainability Report */}
      <SustainabilityReport
        lastUpdated="2023-11-15"
        metrics={mockSustainabilityMetrics}
        isLoading={isLoading}
      />
      
      {/* Holdings analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ESGHoldingsList 
          title="Top ESG Performers"
          holdings={topPerformers} 
          isTop={true}
          isLoading={isLoading} 
        />
        
        <ESGHoldingsList 
          title="Bottom ESG Performers"
          holdings={bottomPerformers} 
          isTop={false}
          isLoading={isLoading} 
        />
      </div>
      
      {/* Environmental metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CarbonFootprint
          portfolioTonsCO2e={150}
          benchmarkTonsCO2e={180}
          isLoading={isLoading}
        />
        
        <Controversies
          controversies={mockControversies}
          isLoading={isLoading}
        />
      </div>
      
      {/* Impact investing recommendations */}
      <ImpactRecommendations
        impactThemes={mockImpactThemes}
        recommendations={mockImpactRecommendations}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ESGDashboard; 