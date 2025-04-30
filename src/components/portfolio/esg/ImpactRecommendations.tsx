import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ImpactTheme {
  id: string;
  name: string;
  description: string;
  sdgGoals?: string[];
  imageUrl?: string;
}

export interface ImpactRecommendation {
  ticker: string;
  name: string;
  description: string;
  themes: string[];
  rating: string;
  esgScore: number;
}

interface ImpactRecommendationsProps {
  impactThemes: ImpactTheme[];
  recommendations: ImpactRecommendation[];
  isLoading?: boolean;
}

const ImpactRecommendations: React.FC<ImpactRecommendationsProps> = ({
  impactThemes,
  recommendations,
  isLoading = false
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('all');

  const filteredRecommendations = selectedTheme === 'all'
    ? recommendations
    : recommendations.filter(rec => rec.themes.includes(selectedTheme));

  const getRatingColor = (rating: string) => {
    if (['AAA', 'AA'].includes(rating)) return 'bg-green-600 hover:bg-green-700';
    if (['A', 'BBB'].includes(rating)) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-orange-500 hover:bg-orange-600';
  };

  return (
    <Card className="bg-[#2A3C61]/30 border-gray-700 text-white col-span-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              Impact Investing Opportunities
              <Badge className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                ESG Alpha
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Investments aligned with sustainability themes and UN Sustainable Development Goals
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Theme selector */}
            <div className="mb-4 flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedTheme('all')}
                size="sm"
                variant={selectedTheme === 'all' ? 'default' : 'outline'}
                className={`text-xs py-1 px-3 ${selectedTheme === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1B2B4B]/40'}`}
              >
                All Themes
              </Button>
              {impactThemes.map(theme => (
                <Button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  size="sm"
                  variant={selectedTheme === theme.id ? 'default' : 'outline'}
                  className={`text-xs py-1 px-3 ${selectedTheme === theme.id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1B2B4B]/40'}`}
                >
                  {theme.name}
                </Button>
              ))}
            </div>

            {/* Selected theme description */}
            {selectedTheme !== 'all' && (
              <div className="mb-4 p-3 bg-[#1B2B4B]/60 rounded-lg">
                <p className="text-sm text-gray-300">
                  {impactThemes.find(t => t.id === selectedTheme)?.description}
                </p>
                {impactThemes.find(t => t.id === selectedTheme)?.sdgGoals && (
                  <div className="flex gap-1 mt-2">
                    {impactThemes.find(t => t.id === selectedTheme)?.sdgGoals?.map(goal => (
                      <Badge key={goal} variant="outline" className="text-xs border-blue-500 text-blue-300">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRecommendations.length > 0 ? (
                filteredRecommendations.map(rec => (
                  <div key={rec.ticker} className="bg-[#1B2B4B]/40 rounded-lg p-3 hover:bg-[#1B2B4B]/60 transition-colors">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium">{rec.name} ({rec.ticker})</h4>
                      <Badge className={`${getRatingColor(rec.rating)} text-white text-xs`}>
                        {rec.rating} ({rec.esgScore})
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">{rec.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {rec.themes.map(theme => {
                        const themeName = impactThemes.find(t => t.id === theme)?.name || theme;
                        return (
                          <span
                            key={theme}
                            className="text-xs bg-[#2A3C61] text-gray-300 px-2 py-0.5 rounded"
                          >
                            {themeName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-2 text-center p-6 bg-[#1B2B4B]/30 rounded-lg">
                  <p className="text-sm text-gray-400">
                    No impact investing opportunities found for the selected theme.
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 mt-6">
              These recommendations highlight companies with strong ESG practices that align with specific impact themes and the UN Sustainable Development Goals.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ImpactRecommendations; 