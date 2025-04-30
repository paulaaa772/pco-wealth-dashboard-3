'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    score: number;
  }[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "What is your primary investment goal?",
    options: [
      { text: "Capital preservation (minimal risk)", score: 1 },
      { text: "Income generation with some growth", score: 2 },
      { text: "Balanced growth and income", score: 3 },
      { text: "Primarily growth", score: 4 },
      { text: "Aggressive growth (high risk)", score: 5 },
    ],
  },
  {
    id: 2,
    text: "What is your investment time horizon?",
    options: [
      { text: "Less than 3 years", score: 1 },
      { text: "3-5 years", score: 2 },
      { text: "6-10 years", score: 3 },
      { text: "11-20 years", score: 4 },
      { text: "More than 20 years", score: 5 },
    ],
  },
  {
    id: 3,
    text: "How comfortable are you with investment fluctuations (volatility)?",
    options: [
      { text: "Very uncomfortable; I prefer stability.", score: 1 },
      { text: "Somewhat uncomfortable; I tolerate small losses.", score: 2 },
      { text: "Neutral; I accept moderate fluctuations for potential growth.", score: 3 },
      { text: "Somewhat comfortable; I understand risk is necessary for higher returns.", score: 4 },
      { text: "Very comfortable; I can handle significant short-term losses for long-term gains.", score: 5 },
    ],
  },
  {
    id: 4,
    text: "If your portfolio lost 20% in a year, how would you react?",
    options: [
      { text: "Sell all investments to prevent further losses.", score: 1 },
      { text: "Sell some investments.", score: 2 },
      { text: "Hold existing investments but stop adding new money.", score: 3 },
      { text: "Hold existing investments and continue investing as planned.", score: 4 },
      { text: "Invest more, seeing it as a buying opportunity.", score: 5 },
    ],
  },
    {
    id: 5,
    text: "How would you describe your knowledge of investments?",
    options: [
      { text: "None", score: 2 }, // Lower knowledge might slightly increase conservative bias
      { text: "Limited", score: 3 },
      { text: "Good", score: 4 },
      { text: "Extensive", score: 5 },
    ],
  },
];

export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive';

interface RiskQuestionnaireProps {
  onProfileDetermined: (profile: RiskProfile) => void;
}

const RiskQuestionnaire: React.FC<RiskQuestionnaireProps> = ({ onProfileDetermined }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({}); // Store { questionId: score }
  const [calculatedProfile, setCalculatedProfile] = useState<RiskProfile | null>(null);

  const handleAnswerChange = (questionId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const allQuestionsAnswered = Object.keys(answers).length === questions.length;

  const calculateProfile = () => {
    if (!allQuestionsAnswered) return;

    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.score)), 0);
    const minPossibleScore = questions.reduce((sum, q) => sum + Math.min(...q.options.map(o => o.score)), 0);

    // Define score ranges for profiles (adjust as needed)
    const moderateThresholdLow = minPossibleScore + (maxPossibleScore - minPossibleScore) * 0.33;
    const aggressiveThresholdLow = minPossibleScore + (maxPossibleScore - minPossibleScore) * 0.66;

    let profile: RiskProfile;
    if (totalScore < moderateThresholdLow) {
      profile = 'Conservative';
    } else if (totalScore < aggressiveThresholdLow) {
      profile = 'Moderate';
    } else {
      profile = 'Aggressive';
    }
    setCalculatedProfile(profile);
    onProfileDetermined(profile);
  };

  // Reset profile if answers change
  useEffect(() => {
     setCalculatedProfile(null);
  }, [answers]);

  return (
    <Card className="bg-[#1B2B4B]/60 border-gray-700 text-white w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Risk Tolerance Questionnaire</CardTitle>
        <CardDescription className="text-gray-400">Help us understand your investment style.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="border-b border-gray-700 pb-4">
            <Label className="font-medium text-gray-200 block mb-3">{q.id}. {q.text}</Label>
            <RadioGroup 
                value={answers[q.id]?.toString()} // Need string for value
                onValueChange={(value) => handleAnswerChange(q.id, parseInt(value))} // Pass score directly
            >
              {q.options.map((option) => (
                <div key={option.score} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem 
                    value={option.score.toString()} // Need string for value
                    id={`q${q.id}-o${option.score}`} 
                    className="border-gray-600 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-600"
                   />
                  <Label htmlFor={`q${q.id}-o${option.score}`} className="text-sm text-gray-300 font-normal cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
        
        <div className="flex flex-col items-center pt-4">
           <Button 
            onClick={calculateProfile} 
            disabled={!allQuestionsAnswered}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-70"
           >
            Calculate My Risk Profile
           </Button>
            {calculatedProfile && (
               <p className="mt-4 text-lg font-semibold text-cyan-400">
                 Your calculated risk profile: {calculatedProfile}
               </p>
           )}
            {!allQuestionsAnswered && calculatedProfile === null && (
                <p className="mt-2 text-xs text-yellow-400">Please answer all questions.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskQuestionnaire; 