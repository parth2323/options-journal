import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ── In-memory cache (15 min TTL) ─────────────────────────────────────────────
interface NewsArticle {
  id: number;
  category: string;
  datetime: number;   // Unix timestamp
  headline: string;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

let newsCache: { data: NewsArticle[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCategory = searchParams.get('category') ?? 'general';
  const validCategories = ['general', 'forex', 'crypto', 'merger'];
  const category = validCategories.includes(rawCategory) ? rawCategory : 'general';
  const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') ?? '30') || 30), 50);

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Finnhub API key not configured' }, { status: 500 });
  }

  const now = Date.now();
  const isCacheValid = newsCache && now - newsCache.fetchedAt < CACHE_TTL_MS;

  if (!isCacheValid) {
    try {
      const url = `https://finnhub.io/api/v1/news?category=${category}&minId=0&token=${apiKey}`;
      const res = await fetch(url, {
        headers: { 'X-Finnhub-Token': apiKey },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error('[market/news] Finnhub error:', res.status, body);
        return NextResponse.json({ error: `Finnhub API error: ${res.status}` }, { status: 502 });
      }

      const data = await res.json() as NewsArticle[];
      newsCache = { data: Array.isArray(data) ? data : [], fetchedAt: now };
    } catch (err) {
      console.error('[market/news] fetch error:', err);
      // Return stale cache if available
      if (newsCache) {
        return NextResponse.json(newsCache.data.slice(0, limit), {
          headers: { 'X-Cache': 'STALE' },
        });
      }
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 502 });
    }
  }

  const articles = (newsCache?.data ?? [])
    .filter((a) => a.headline && a.url) // Remove empty entries
    .slice(0, limit);

  return NextResponse.json(articles, {
    headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60' },
  });
}
