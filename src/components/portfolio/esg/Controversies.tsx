import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Controversy {
  ticker: string;
  company: string;
  issue: string;
  severity: 'High' | 'Moderate' | 'Low';
  date?: string;
  details?: string;
}

interface ControversiesProps {
  controversies: Controversy[];
  isLoading?: boolean;
}

const Controversies: React.FC<ControversiesProps> = ({ 
  controversies, 
  isLoading = false 
}) => {
  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-600 hover:bg-red-700';
      case 'Moderate': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Low': return 'bg-green-600 hover:bg-green-700';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-lg">ESG Controversies</CardTitle>
        <CardDescription className="text-gray-400">
          Significant ESG issues affecting portfolio companies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {controversies.length > 0 ? (
              <ul className="space-y-2">
                {controversies.map((item, index) => (
                  <li key={index} className="text-sm p-2 bg-[#1B2B4B]/40 rounded hover:bg-[#1B2B4B]/60 transition-colors cursor-pointer" title={item.details || 'No additional details'}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{item.company} ({item.ticker})</span>
                      <Badge className={`${getSeverityBadgeColor(item.severity)} text-white text-xs`}>
                        {item.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-300">{item.issue}</p>
                    {item.date && <p className="text-xs text-gray-400 mt-1">Reported: {item.date}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-[#1B2B4B]/30 rounded-lg">
                <span className="material-icons-outlined text-green-500 text-2xl">check_circle</span>
                <p className="text-sm text-gray-400 mt-2">No significant controversies detected in your portfolio companies.</p>
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-4">
              Controversy data helps identify companies with ESG risks that may not be reflected in their overall ratings.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Controversies; 