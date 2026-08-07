import { NextRequest, NextResponse } from 'next/server';
import yahooFinanceDefault from 'yahoo-finance2';

// Compatibility handler for yahoo-finance2 v3 ESM default export
const yahooFinance: any =
  typeof (yahooFinanceDefault as any) === 'function'
    ? new (yahooFinanceDefault as any)()
    : (yahooFinanceDefault as any)?.default && typeof (yahooFinanceDefault as any).default === 'function'
    ? new (yahooFinanceDefault as any).default()
    : yahooFinanceDefault;

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get('symbol') || 'SPY';
    const symbol = rawSymbol.trim().toUpperCase() === 'VIX' ? '^VIX' : rawSymbol.trim().toUpperCase();
    const timeframe = searchParams.get('timeframe') || '5d'; // '1d', '5d', '1m', '6m', 'ytd', '1y'

    const now = new Date();
    let startDate = new Date();
    let interval: '1m' | '5m' | '15m' | '1d' = '5m';

    switch (timeframe) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        interval = '5m';
        break;
      case '5d':
        startDate.setDate(now.getDate() - 5);
        interval = '15m';
        break;
      case '1m':
        startDate.setDate(now.getDate() - 30);
        interval = '1d';
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        interval = '1d';
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        interval = '1d';
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        interval = '1d';
        break;
      default:
        startDate.setDate(now.getDate() - 5);
        interval = '15m';
        break;
    }

    const queryOptions = {
      period1: startDate.toISOString().split('T')[0],
      interval,
    };

    const result: any = await yahooFinance.chart(symbol, queryOptions);

    const quotes = result?.quotes || [];
    const formattedCandles = quotes
      .filter((q: any) => q.close !== null && q.close !== undefined)
      .map((q: any) => ({
        timestamp: q.date ? new Date(q.date).toISOString() : new Date().toISOString(),
        open: Math.round((q.open ?? q.close ?? 0) * 100) / 100,
        high: Math.round((q.high ?? q.close ?? 0) * 100) / 100,
        low: Math.round((q.low ?? q.close ?? 0) * 100) / 100,
        close: Math.round((q.close ?? 0) * 100) / 100,
        volume: q.volume ?? 0,
      }));

    return NextResponse.json({
      success: true,
      symbol: rawSymbol,
      timeframe,
      candles: formattedCandles,
      meta: result?.meta || {},
    });
  } catch (err) {
    console.error('[GET /api/market/chart] Error:', err);
    return NextResponse.json({ success: false, symbol: 'SPY', candles: [] }, { status: 500 });
  }
}
