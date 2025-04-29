'use client'; // Mark as client component to use hooks

import React, { useState, useEffect } from 'react';
import { NewspaperIcon } from '@heroicons/react/24/outline';
import { FormattedNewsArticle } from '@/app/api/news/route'; // Import the type

// Helper to format date strings
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString(); // Adjust format as needed
};

export default function NewsPage() {
  const [news, setNews] = useState<FormattedNewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FormattedNewsArticle[] = await response.json();
        setNews(data || []);
      } catch (e: any) {
        console.error('Failed to fetch news:', e);
        setError('Failed to load news articles. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []); // Fetch news on component mount

  return (
    <div className="min-h-screen bg-[#1B2B4B] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">News & Analysis</h1>
          <p className="mt-2 text-sm text-gray-400">Latest financial news</p>
        </div>

        {/* News Feed Section */}
        <div className="rounded-lg bg-[#2A3C61] shadow p-6">
          <h2 className="text-xl font-medium mb-6">Latest News</h2>
          
          {isLoading && (
            <div className="text-center py-10 text-gray-400">Loading news...</div>
          )}
          
          {error && (
            <div className="text-center py-10 text-red-400 bg-red-900/20 p-4 rounded">{error}</div>
          )}
          
          {!isLoading && !error && news.length === 0 && (
             <div className="text-center py-10 text-gray-400">No news articles found.</div>
          )}
          
          {!isLoading && !error && news.length > 0 && (
            <div className="flow-root">
              <ul role="list" className="divide-y divide-gray-700">
                {news.map((item) => (
                  <li key={item.id} className="py-5">
                    <div className="flex gap-4">
                      {item.imageUrl && (
                        <div className="flex-shrink-0">
                           <img 
                             className="h-24 w-24 rounded object-cover" 
                             src={item.imageUrl} 
                             alt="" 
                             onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails
                            />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-indigo-400 mb-1">
                          {item.source}
                        </div>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="block hover:underline">
                           <h3 className="text-lg font-semibold text-white mb-1">
                             {item.title}
                           </h3>
                        </a>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {item.description || 'No description available.'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDate(item.published)}</span>
                          <div className="flex items-center space-x-1 flex-wrap gap-1">
                            {item.tickers?.map((symbol) => (
                              <span
                                key={symbol}
                                className="inline-flex items-center rounded px-1.5 py-0.5 font-medium bg-gray-700 text-gray-300"
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
          )}
        </div>

        {/* Removed Market Sentiment and Upcoming Events sections */}
        
      </div>
    </div>
  );
} 