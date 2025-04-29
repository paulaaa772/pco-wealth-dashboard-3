"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FundingContent from '@/components/dashboard/FundingContent';

export default function FundingPage() {
  return (
    <div className="min-h-screen bg-[#1B2B4B] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Funding</h1>
        <FundingContent />
      </div>
    </div>
  );
} 