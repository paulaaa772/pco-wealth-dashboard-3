import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ESGHolding {
  ticker: string;
  name: string;
  score: number;
  rating: string;
  value?: number;
  weight?: number;
}

interface ESGHoldingsListProps {
  title: string;
  holdings: ESGHolding[];
  isTop?: boolean; // Whether this is for top performers (changes colors)
  isLoading?: boolean;
}

const ESGHoldingsList: React.FC<ESGHoldingsListProps> = ({ 
  title, 
  holdings, 
  isTop = true, 
  isLoading = false 
}) => {
  const getRatingBadgeColor = (rating: string) => {
    if (['AAA', 'AA'].includes(rating)) return 'bg-green-600 hover:bg-green-700';
    if (['A', 'BBB'].includes(rating)) return 'bg-yellow-500 hover:bg-yellow-600';
    if (['BB', 'B'].includes(rating)) return 'bg-orange-500 hover:bg-orange-600';
    return 'bg-red-600 hover:bg-red-700'; // CCC, CC, C
  };

  return (
    <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-lg">
          {title}
          {isTop ? (
            <span className="ml-2 text-xs bg-green-700 text-white px-2 py-0.5 rounded-full">ESG Leaders</span>
          ) : (
            <span className="ml-2 text-xs bg-red-700 text-white px-2 py-0.5 rounded-full">ESG Laggards</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ul className="space-y-2">
            {holdings.length > 0 ? (
              holdings.map(item => (
                <li key={item.ticker} className="flex justify-between items-center text-sm p-2 bg-[#1B2B4B]/40 rounded hover:bg-[#1B2B4B]/60 transition-colors">
                  <div className="flex flex-col truncate w-3/4">
                    <span title={item.name} className="truncate font-medium">{item.name}</span>
                    <span className="text-xs text-gray-400">{item.ticker} {item.weight ? `• ${item.weight.toFixed(1)}%` : ''}</span>
                  </div>
                  <div className="flex items-center">
                    <Badge className={`${getRatingBadgeColor(item.rating)} text-white text-xs`}>
                      {item.rating}
                    </Badge>
                    <span className="ml-2 text-xs font-semibold">
                      {item.score}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-400 text-center py-4">
                No holdings with ESG data found.
              </li>
            )}
          </ul>
        )}
        {holdings.length > 0 && (
          <p className="text-xs text-gray-400 mt-4">
            {isTop ? 
              "These holdings demonstrate strong ESG practices." : 
              "Consider reducing exposure to these holdings for better ESG alignment."}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ESGHoldingsList; 