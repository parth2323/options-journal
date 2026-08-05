'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Newspaper, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NewsArticle {
  id: number;
  category: string;
  datetime: number;
  headline: string;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

// Very basic sentiment detection for headline color accent
function getSentiment(headline: string): 'bullish' | 'bearish' | 'neutral' {
  const h = headline.toLowerCase();
  const bullishWords = ['surge', 'rally', 'gain', 'rise', 'jump', 'soar', 'beat', 'record', 'high', 'growth', 'profit', 'upgrade', 'bullish', 'boost'];
  const bearishWords = ['fall', 'drop', 'crash', 'decline', 'loss', 'miss', 'low', 'fear', 'risk', 'debt', 'layoff', 'cut', 'bearish', 'warning', 'recession'];
  if (bullishWords.some((w) => h.includes(w))) return 'bullish';
  if (bearishWords.some((w) => h.includes(w))) return 'bearish';
  return 'neutral';
}

const SENTIMENT_STYLES = {
  bullish: 'border-l-2 border-emerald-400 dark:border-emerald-500',
  bearish: 'border-l-2 border-red-400 dark:border-red-500',
  neutral: 'border-l-2 border-slate-200 dark:border-[#1e1e2d]',
};

export function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/market/news?category=general&limit=30')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setArticles(data);
        else setError(data.error ?? 'Failed to load news');
      })
      .catch(() => setError('Failed to load news'))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Market News
          </span>
          <span className="text-[10px] font-bold bg-slate-100 dark:bg-[#1e1e2d] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#2a2a3c] px-2 py-0.5 rounded-full">
            via Finnhub
          </span>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1e1e2d] border border-slate-200 dark:border-[#1e1e2d] transition-all"
          title="Refresh news"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Fetching latest news…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Articles */}
      {!loading && !error && (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          {articles.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400 dark:text-[#4a4a4a]">
              No news articles available.
            </div>
          ) : (
            articles.map((article) => {
              const sentiment = getSentiment(article.headline);
              const timeAgo = article.datetime
                ? formatDistanceToNow(new Date(article.datetime * 1000), { addSuffix: true })
                : '';

              return (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex gap-3 bg-white dark:bg-[#12121a] rounded-xl p-3 hover:shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all group border border-slate-200/80 dark:border-[#1e1e2d] ${SENTIMENT_STYLES[sentiment]}`}
                >
                  {/* Image thumbnail */}
                  {article.image ? (
                    <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-[#0f0f18] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg bg-slate-50 dark:bg-[#14141f] border border-slate-200/80 dark:border-[#1e1e2d] flex items-center justify-center flex-shrink-0">
                      <Newspaper className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Source + time */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wide text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-1.5 py-0.5 rounded-full">
                        {article.source}
                      </span>
                      {timeAgo && (
                        <span className="text-[10px] text-slate-400 dark:text-[#4a4a4a] font-mono">{timeAgo}</span>
                      )}
                      {sentiment !== 'neutral' && (
                        <span className={`text-[10px] font-black ${sentiment === 'bullish' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {sentiment === 'bullish' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>

                    {/* Headline */}
                    <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-0.5">
                      {article.headline}
                    </h3>

                    {/* Summary */}
                    {article.summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {article.summary}
                      </p>
                    )}
                  </div>

                  {/* External link icon */}
                  <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-0.5" />
                </a>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
