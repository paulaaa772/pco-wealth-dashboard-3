import Link from 'next/link';

export default function DashboardHeader() {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-light">
        Welcome, Paula
      </h1>
      <div className="flex gap-4">
        <Link 
          href="/investments"
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#2A3C61] hover:bg-[#344571] transition-colors"
        >
          <span className="material-icons">account_balance</span>
          INVESTMENTS
        </Link>
        <button
          className="px-6 py-2 rounded-lg bg-[#9DC4D4] hover:bg-[#8BB3C3] text-[#1B2B4B] transition-colors"
        >
          Move money
        </button>
      </div>
    </div>
  );
} 