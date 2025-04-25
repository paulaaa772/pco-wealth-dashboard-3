"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FundingContent from '@/components/dashboard/FundingContent';

export default function FundingPage() {
  return (
    <div className="w-full h-full min-h-screen bg-[#172033] text-white">
      <FundingContent />
    </div>
  );
} 