import { NextRequest, NextResponse } from 'next/server';
import yahooFinanceDefault from 'yahoo-finance2';
import { getOrSetCache } from '@/lib/redis';

// Compatibility handler for yahoo-finance2 v3 ESM default export
const yahooFinance: any =
  typeof (yahooFinanceDefault as any) === 'function'
    ? new (yahooFinanceDefault as any)()
    : (yahooFinanceDefault as any)?.default && typeof (yahooFinanceDefault as any).default === 'function'
    ? new (yahooFinanceDefault as any).default()
    : yahooFinanceDefault;

export const dynamic = 'force-dynamic';

export interface MarketQuoteItem {
  symbol: string;
  displaySymbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  previousClose: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekChangePercent: number;
  ytdReturn?: number;
  volume: number;
  avgVolume?: number;
  marketCap?: number;
  marketState: string;
  lastUpdated: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbolsParam = searchParams.get('symbols') || 'SPY,QQQ,VIX,IWM';
    const requestedSymbols = symbolsParam
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((s) => /^[A-Z0-9.\^-]{1,10}$/.test(s))
      .slice(0, 10);

    if (requestedSymbols.length === 0) {
      return NextResponse.json({ success: true, quotes: [] });
    }

    const cacheKey = `market_quotes:${requestedSymbols.join('_')}`;

    const quotes = await getOrSetCache<MarketQuoteItem[]>(
      cacheKey,
      async () => {
        const yahooSymbols = requestedSymbols.map((s) => (s === 'VIX' ? '^VIX' : s));
        const items: MarketQuoteItem[] = [];

        const results = await Promise.allSettled(
          yahooSymbols.map((sym) => yahooFinance.quote(sym))
        );

        results.forEach((res, idx) => {
          const originalSym = requestedSymbols[idx];
          if (res.status === 'fulfilled' && res.value) {
            const q: any = res.value;
            items.push({
              symbol: originalSym,
              displaySymbol: originalSym,
              name: q.shortName || q.longName || originalSym,
              price: q.regularMarketPrice ?? 0,
              change: q.regularMarketChange ?? 0,
              changePercent: q.regularMarketChangePercent ?? 0,
              dayHigh: q.regularMarketDayHigh ?? q.regularMarketPrice ?? 0,
              dayLow: q.regularMarketDayLow ?? q.regularMarketPrice ?? 0,
              open: q.regularMarketOpen ?? q.regularMarketPrice ?? 0,
              previousClose: q.regularMarketPreviousClose ?? q.regularMarketPrice ?? 0,
              fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? q.regularMarketDayHigh ?? 0,
              fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? q.regularMarketDayLow ?? 0,
              fiftyTwoWeekChangePercent: q.fiftyTwoWeekChangePercent ?? q.ytdReturn ?? 0,
              ytdReturn: q.ytdReturn ?? q.fiftyTwoWeekChangePercent ?? 0,
              volume: q.regularMarketVolume ?? 0,
              avgVolume: q.averageDailyVolume10Day ?? q.averageDailyVolume3Month ?? 0,
              marketCap: q.marketCap ?? undefined,
              marketState: q.marketState || 'REGULAR',
              lastUpdated: new Date().toISOString(),
            });
          }
        });

        return items;
      },
      15 // Cache for 15s
    );

    return NextResponse.json({
      success: true,
      quotes,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[GET /api/market/quotes] Error:', err);
    return NextResponse.json({ success: false, quotes: [] }, { status: 500 });
  }
}
