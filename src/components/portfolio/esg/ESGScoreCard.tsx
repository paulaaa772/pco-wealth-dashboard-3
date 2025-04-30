import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ESGScoreCardProps {
  overallScore: number;
  isLoading?: boolean;
}

const ESGScoreCard: React.FC<ESGScoreCardProps> = ({ overallScore, isLoading = false }) => {
  const getScoreCategory = (score: number): string => {
    if (score >= 80) return "Leader";
    if (score >= 60) return "Average";
    if (score >= 40) return "Laggard";
    return "Poor";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-cyan-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (score: number): string => {
    if (score >= 80) return "[&>*]:bg-green-500";
    if (score >= 60) return "[&>*]:bg-cyan-500";
    if (score >= 40) return "[&>*]:bg-yellow-500";
    return "[&>*]:bg-red-500";
  };

  return (
    <Card className="bg-[#2A3C61]/30 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-lg">Overall Portfolio ESG Score</CardTitle>
        <CardDescription className="text-gray-400">
          Weighted average based on holdings value
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <p className={`text-5xl font-bold ${getScoreColor(overallScore)} mb-1`}>
              {overallScore.toFixed(1)}
            </p>
            <p className="text-sm text-gray-300 mb-2">
              {getScoreCategory(overallScore)}
            </p>
            <Progress 
              value={overallScore} 
              className={`w-full h-2 bg-gray-600 ${getProgressColor(overallScore)}`} 
            />
            <p className="text-xs text-gray-400 mt-2">
              Score out of 100 (Higher is better)
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ESGScoreCard; 