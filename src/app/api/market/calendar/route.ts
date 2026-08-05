import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ── In-memory cache (1 hour TTL) ─────────────────────────────────────────────
interface CalendarEvent {
  title: string;
  country: string;
  date: string;       // "08-05-2026"
  time: string;       // "8:30am"
  impact: 'High' | 'Medium' | 'Low' | 'Holiday' | string;
  forecast: string;
  previous: string;
  actual: string;
  url: string;
}

let calendarCache: { data: CalendarEvent[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function parseXml(xml: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const eventBlocks = xml.match(/<event>([\s\S]*?)<\/event>/g) ?? [];

  for (const block of eventBlocks) {
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's'));
      return m ? m[1].trim() : '';
    };
    events.push({
      title:    get('title'),
      country:  get('country'),
      date:     get('date'),
      time:     get('time'),
      impact:   get('impact'),
      forecast: get('forecast'),
      previous: get('previous'),
      actual:   get('actual'),
      url:      get('url'),
    });
  }

  return events;
}

async function fetchWeek(slug: 'thisweek' | 'nextweek'): Promise<CalendarEvent[]> {
  const url = `https://nfs.faireconomy.media/ff_calendar_${slug}.xml`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OptionsJournal/1.0)' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const text = await res.text();
  return parseXml(text);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const week = (searchParams.get('week') ?? 'this') as 'this' | 'next';
  const currency = searchParams.get('currency') ?? 'USD'; // 'USD' | 'ALL'

  const now = Date.now();
  if (!calendarCache || now - calendarCache.fetchedAt > CACHE_TTL_MS) {
    try {
      const [thisWeek, nextWeek] = await Promise.allSettled([
        fetchWeek('thisweek'),
        fetchWeek('nextweek'),
      ]);
      const combined = [
        ...(thisWeek.status === 'fulfilled' ? thisWeek.value : []),
        ...(nextWeek.status === 'fulfilled' ? nextWeek.value : []),
      ];
      calendarCache = { data: combined, fetchedAt: now };
    } catch (err) {
      console.error('[market/calendar] fetch error:', err);
      return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 502 });
    }
  }

  let events = calendarCache.data;

  // Filter by week
  const today = new Date();
  if (week === 'this') {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay()); // Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Saturday

    events = events.filter((e) => {
      const [m, d, y] = e.date.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt >= start && dt <= end;
    });
  } else {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() + 7); // next Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    events = events.filter((e) => {
      const [m, d, y] = e.date.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt >= start && dt <= end;
    });
  }

  // Filter by currency
  if (currency !== 'ALL') {
    events = events.filter((e) => e.country === currency);
  }

  return NextResponse.json(events, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' },
  });
}
