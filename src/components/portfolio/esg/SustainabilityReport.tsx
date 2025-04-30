import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SustainabilityMetric {
  name: string;
  value: string | number;
  change?: number;
  description: string;
}

interface SustainabilityReportProps {
  lastUpdated: string;
  metrics: SustainabilityMetric[];
  isLoading?: boolean;
}

const SustainabilityReport: React.FC<SustainabilityReportProps> = ({
  lastUpdated,
  metrics,
  isLoading = false
}) => {
  const [generating, setGenerating] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);

  const handleGenerateReport = () => {
    setGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false);
      setShowFullReport(true);
    }, 1500);
  };

  return (
    <Card className="bg-[#2A3C61]/30 border-gray-700 text-white col-span-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Sustainability Report</CardTitle>
            <CardDescription className="text-gray-400">
              Portfolio sustainability analysis and reporting
            </CardDescription>
          </div>
          <Badge className="bg-gray-600 text-white text-xs">
            Last Updated: {lastUpdated}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {metrics.slice(0, 3).map((metric, index) => (
                <div key={index} className="bg-[#1B2B4B]/40 rounded-lg p-3">
                  <p className="text-sm text-gray-400">{metric.name}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-semibold text-white">{metric.value}</p>
                    {metric.change !== undefined && (
                      <span className={`text-xs ${metric.change > 0 ? 'text-green-400' : metric.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{metric.description}</p>
                </div>
              ))}
            </div>

            {showFullReport && (
              <div className="mt-6">
                <h4 className="text-md font-medium mb-3 text-gray-200">Full Sustainability Report</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metrics.slice(3).map((metric, index) => (
                    <div key={index} className="bg-[#1B2B4B]/40 rounded-lg p-3">
                      <p className="text-sm text-gray-400">{metric.name}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-lg font-semibold text-white">{metric.value}</p>
                        {metric.change !== undefined && (
                          <span className={`text-xs ${metric.change > 0 ? 'text-green-400' : metric.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 mt-1">{metric.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-[#1B2B4B]/60 rounded-lg">
                  <h5 className="font-medium text-gray-200 mb-2">Sustainability Summary</h5>
                  <p className="text-sm text-gray-300">
                    Your portfolio demonstrates moderate ESG performance with particular strengths in governance practices and carbon efficiency. 
                    There are opportunities to improve social impact and increase exposure to companies leading sustainability transitions. 
                    This report provides a baseline for setting sustainability goals and tracking progress over time.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleGenerateReport}
          disabled={generating || showFullReport}
        >
          {generating ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Generating Report...
            </>
          ) : showFullReport ? (
            'Report Generated'
          ) : (
            'Generate Full Report'
          )}
        </Button>
        {showFullReport && (
          <Button variant="outline" className="border-gray-600 hover:bg-[#1B2B4B]">
            Export PDF
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SustainabilityReport; 