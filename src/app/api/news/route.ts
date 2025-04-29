import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const POLYGON_API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;

// Interface for the expected news article structure from Polygon
interface PolygonNewsArticle {
  id: string;
  publisher: { name: string; logo_url?: string; homepage_url?: string };
  title: string;
  author?: string;
  published_utc: string;
  article_url: string;
  tickers: string[];
  image_url?: string;
  description?: string;
  keywords?: string[];
}

// Interface for the formatted news article we'll send to the client
export interface FormattedNewsArticle {
  id: string;
  source: string;
  title: string;
  url: string;
  published: string;
  description?: string;
  imageUrl?: string;
  tickers: string[];
}

export async function GET(req: NextRequest) {
  if (!POLYGON_API_KEY) {
    console.error('[API /news] Polygon API key not configured on server.');
    return NextResponse.json({ error: 'API key not configured on server' }, { status: 500 });
  }

  try {
    console.log('[API /news] Fetching news from Polygon...');
    const newsUrl = `https://api.polygon.io/v2/reference/news`;
    const response = await axios.get(newsUrl, {
      params: {
        apiKey: POLYGON_API_KEY,
        limit: 20, // Fetch 20 latest articles
        order: 'desc', // Get the most recent first
        sort: 'published_utc',
        // We could add ticker filtering later, e.g., ticker: 'AAPL,MSFT'
      }
    });

    if (response.data && response.data.results) {
      console.log(`[API /news] Received ${response.data.results.length} articles from Polygon.`);
      // Format the results for the frontend
      const formattedNews: FormattedNewsArticle[] = response.data.results.map((article: PolygonNewsArticle) => ({
        id: article.id,
        source: article.publisher.name,
        title: article.title,
        url: article.article_url,
        published: article.published_utc,
        description: article.description,
        imageUrl: article.image_url,
        tickers: article.tickers || [],
      }));
      return NextResponse.json(formattedNews);
    } else {
      console.log('[API /news] No news results found from Polygon.');
      return NextResponse.json([]); // Return empty array if no results
    }

  } catch (error: any) {
    console.error('[API /news] Error fetching news from Polygon:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch news data' }, { status: 500 });
  }
} 