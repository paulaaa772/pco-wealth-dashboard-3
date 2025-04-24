import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler
);

const timeRanges = ['1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'] as const;

export default function PortfolioChart() {
  const data = {
    labels: ['Sep 24', 'Nov 24', 'Jan 25', 'Mar 25'],
    datasets: [
      {
        fill: true,
        label: 'Portfolio Value',
        data: [2000, 0, 1000, 9035.41],
        borderColor: '#9DC4D4',
        backgroundColor: 'rgba(157, 196, 212, 0.1)',
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9CA3AF',
          callback: (value: number) => `$${value.toLocaleString()}`,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => `$${context.raw.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {timeRanges.map((range) => (
          <button
            key={range}
            className={`px-3 py-1 rounded-md transition-colors ${
              range === '1W'
                ? 'bg-white text-[#1B2B4B]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {range}
          </button>
        ))}
        <button className="text-gray-400 hover:text-white">
          <span className="material-icons">more_horiz</span>
        </button>
      </div>
      <div className="h-[400px]">
        <Line options={options} data={data} />
      </div>
    </div>
  );
} 