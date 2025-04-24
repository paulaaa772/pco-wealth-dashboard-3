import { NewspaperIcon, ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

const news = [
  {
    id: 1,
    title: 'NVIDIA Surges on AI Chip Demand',
    source: 'Bloomberg',
    category: 'Technology',
    sentiment: 'positive',
    summary: 'NVIDIA shares hit new all-time high as demand for AI chips continues to outpace supply. The company announced expanded manufacturing partnerships.',
    timestamp: '2024-03-01T14:30:00Z',
    relatedSymbols: ['NVDA', 'AMD', 'INTC'],
    impact: 'High'
  },
  {
    id: 2,
    title: 'Fed Signals Potential Rate Cuts',
    source: 'Reuters',
    category: 'Economy',
    sentiment: 'positive',
    summary: 'Federal Reserve officials indicated openness to rate cuts later this year as inflation shows signs of cooling.',
    timestamp: '2024-03-01T13:15:00Z',
    relatedSymbols: ['SPY', 'QQQ', 'IWM'],
    impact: 'High'
  },
  {
    id: 3,
    title: 'Apple&#39;s Mixed Reality Headset Faces Delays',
    source: 'Wall Street Journal',
    category: 'Technology',
    sentiment: 'negative',
    summary: 'Production issues could push back the launch of Apple&#39;s Vision Pro headset in international markets.',
    timestamp: '2024-03-01T12:00:00Z',
    relatedSymbols: ['AAPL', 'META', 'MSFT'],
    impact: 'Medium'
  },
  {
    id: 4,
    title: 'Oil Prices Rise on Supply Concerns',
    source: 'Financial Times',
    category: 'Commodities',
    sentiment: 'neutral',
    summary: 'Crude oil prices increased following reports of production disruptions in key oil-producing regions.',
    timestamp: '2024-03-01T11:30:00Z',
    relatedSymbols: ['XOM', 'CVX', 'USO'],
    impact: 'Medium'
  },
]

const marketSentiment = [
  { category: 'Technology', sentiment: 75, change: '+5.2', trending: 'up' },
  { category: 'Finance', sentiment: 62, change: '-2.1', trending: 'down' },
  { category: 'Healthcare', sentiment: 58, change: '+1.8', trending: 'up' },
  { category: 'Energy', sentiment: 45, change: '-3.5', trending: 'down' },
]

const upcomingEvents = [
  { date: '2024-03-05', event: 'FOMC Meeting Minutes', impact: 'High' },
  { date: '2024-03-08', event: 'Non-Farm Payrolls', impact: 'High' },
  { date: '2024-03-12', event: 'CPI Data Release', impact: 'High' },
  { date: '2024-03-15', event: 'Options Expiration', impact: 'Medium' },
]

export default function News() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">News & Analysis</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Market news, sentiment analysis, and upcoming events
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* News Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg bg-white dark:bg-zinc-800 shadow">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Latest News</h2>
              <div className="mt-6 flow-root">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-zinc-700">
                  {news.map((item) => (
                    <li key={item.id} className="py-5">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`flex-shrink-0 rounded-full p-1 ${
                                item.sentiment === 'positive' ? 'bg-green-100 dark:bg-green-900/20' :
                                item.sentiment === 'negative' ? 'bg-red-100 dark:bg-red-900/20' :
                                'bg-gray-100 dark:bg-zinc-700'
                              }`}>
                                <NewspaperIcon className={`h-5 w-5 ${
                                  item.sentiment === 'positive' ? 'text-green-600 dark:text-green-400' :
                                  item.sentiment === 'negative' ? 'text-red-600 dark:text-red-400' :
                                  'text-gray-500 dark:text-gray-400'
                                }`} />
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.source}</p>
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-gray-200">
                                {item.category}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {item.summary}
                          </p>
                          <div className="mt-3 flex items-center space-x-3">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <span className="mr-1">Impact:</span>
                              <span className={`font-medium ${
                                item.impact === 'High' ? 'text-red-600 dark:text-red-400' :
                                item.impact === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-green-600 dark:text-green-400'
                              }`}>{item.impact}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {item.relatedSymbols.map((symbol) => (
                                <span
                                  key={symbol}
                                  className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                                >
                                  {symbol}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Market Sentiment */}
          <div className="rounded-lg bg-white dark:bg-zinc-800 shadow">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Market Sentiment</h2>
              <div className="mt-6 space-y-4">
                {marketSentiment.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.category}</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          item.trending === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {item.sentiment}%
                        </span>
                        <span className="ml-2 flex items-center text-sm">
                          {item.trending === 'up' ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 dark:text-green-400" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
                          )}
                          {item.change}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="relative h-2 rounded-full bg-gray-200 dark:bg-zinc-700">
                        <div
                          className="absolute h-2 rounded-full bg-indigo-500"
                          style={{ width: `${item.sentiment}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="rounded-lg bg-white dark:bg-zinc-800 shadow">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Events</h2>
              <div className="mt-6 flow-root">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-zinc-700">
                  {upcomingEvents.map((event, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{event.event}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{event.date}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          event.impact === 'High'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {event.impact} Impact
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 