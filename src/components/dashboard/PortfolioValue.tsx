'use client';

export default function PortfolioValue() {
  return (
    <div className="space-y-2">
      <h2 className="text-lg text-gray-300">M1 net worth</h2>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-light">$9,035.41</span>
        <button className="text-gray-400 hover:text-white transition-colors">
          <span className="material-icons">info</span>
        </button>
      </div>
      <p className="text-gray-400">Since Jul 19, 2024</p>
    </div>
  );
} 