'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  Brain,
  BarChart3,
  BookOpen,
  Activity,
  Shield,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

/* ─────────────────────────── Data ──────────────────────────────────── */

const features = [
  {
    icon: Brain,
    title: 'AI Trading Coach',
    description:
      'DeepSeek-powered coaching that reads your actual trade history — win rate, session patterns, behavioral leaks — and builds a concrete improvement plan from your data.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description:
      'Day-of-week heatmaps, session breakdowns, streak tracking, hold-time distribution, symbol P&L rankings. Institutional-grade statistics from your personal trade log.',
  },
  {
    icon: Activity,
    title: 'Live Market Terminal',
    description:
      "Real-time Finnhub & Yahoo Finance quotes, HD price charts, 52-week ranges, and one-click trade entry from any symbol you're watching.",
  },
  {
    icon: BookOpen,
    title: 'Chart Ideas Journal',
    description:
      'Annotated screenshot uploads, mood tags, setup tracking, and hypothesis logging. Build the visual library that shows you exactly which setups actually work for you.',
  },
];

const journalStats = [
  {
    figure: '68%',
    context: 'of active journalers achieve positive profit factor within 90 days',
    source: 'TraderSync internal cohort study, 5,000 accounts',
  },
  {
    figure: '3×',
    context: 'higher expectancy for traders who review sessions daily vs. weekly',
    source: 'ForTraders.com analysis, 2023',
  },
  {
    figure: '80%',
    context: 'of losing traders cite "no review process" as a primary contributing factor',
    source: 'Bookmap trader survey, 2023',
  },
  {
    figure: '90%',
    context: 'of retail options traders lose money — most never identify the pattern',
    source: 'CBOE, SEC retail investor studies',
  },
];

const consequences = [
  {
    icon: AlertTriangle,
    title: 'The Memory Trap',
    body: 'Human memory is systematically biased. You recall big wins vividly and compress repeated, costly mistakes into a blur. Without a written record, you are navigating by a distorted map.',
  },
  {
    icon: TrendingDown,
    title: 'Behavioral Loops Stay Invisible',
    body: 'Revenge trading, overtrading after a win, widening stops — these patterns repeat because there is no mirror. A journal converts invisible behavior into measurable data.',
  },
  {
    icon: Shield,
    title: 'No Quantified Edge',
    body: 'Without tagging setups, time-of-day, and market conditions, you cannot know which strategies actually carry positive expectancy for you. You are trading a guess, not a system.',
  },
];

const expertQuotes = [
  {
    quote:
      '"Successful traders know that a consistent and systematic review of their daily trading activities is the direct path to growing and improving."',
    name: 'Van K. Tharp, Ph.D.',
    title: 'Author, Trade Your Way to Financial Freedom',
  },
  {
    quote:
      '"A trading journal keeps you constructive, keeps you learning, and keeps you working on the things that are most important. It is not a tool for rehashing the day — it is a tool for self-development."',
    name: 'Dr. Brett Steenbarger',
    title: 'Clinical Psychologist, Forbes trading columnist',
  },
  {
    quote:
      '"Trading without a diary is like shaving without a mirror."',
    name: 'Industry axiom',
    title: 'Repeated across Trademetria, SMC Trade Online, ForTraders',
  },
];

/* ─────────────────────────── Skeleton bits ─────────────────────────── */

function PulseBar({ w, opacity = 'opacity-100' }: { w: string; opacity?: string }) {
  return (
    <div
      className={`${w} h-[7px] rounded-full bg-zinc-700/60 animate-pulse ${opacity}`}
    />
  );
}

function TradeRow({ green }: { green: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-zinc-800/60 last:border-0">
      <div
        className={`w-1.5 h-4 rounded-full flex-shrink-0 ${green ? 'bg-emerald-500' : 'bg-red-500'}`}
      />
      <PulseBar w="w-10" />
      <PulseBar w="w-16" />
      <div className="flex-1" />
      <span
        className={`text-xs font-mono font-bold tabular-nums ${green ? 'text-emerald-400' : 'text-red-400'}`}
      >
        {green ? '+$312' : '−$84'}
      </span>
    </div>
  );
}

/* ─────────────────────────── Main page ─────────────────────────────── */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { font-family: 'Inter', system-ui, sans-serif; }

        h1, h2, h3 { text-wrap: balance; }
        p { text-wrap: pretty; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawEquity {
          from { stroke-dashoffset: 700; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: .12; }
          50%       { opacity: .18; }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .fade-up { animation: fadeUp .65s ease both; }
        .du-100 { animation-delay: .10s; }
        .du-200 { animation-delay: .20s; }
        .du-300 { animation-delay: .35s; }
        .du-450 { animation-delay: .45s; }

        .equity-path {
          stroke-dasharray: 700;
          animation: drawEquity 2.4s .6s ease forwards;
        }
        .ticker-inner { animation: ticker 30s linear infinite; }

        .section-divider {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, #27272a 50%, transparent);
        }

        /* Subtle hero glow — single colour, barely visible */
        .hero-glow {
          background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(79,70,229,.12) 0%, transparent 70%);
          animation: pulse-slow 8s ease-in-out infinite;
        }

        /* Stat card accent bar */
        .stat-bar {
          background: linear-gradient(90deg, #4f46e5, #6366f1);
        }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80'
            : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-700/60 flex-shrink-0">
              <img src="/logo.png" alt="TradeVault" className="w-full h-full object-cover" />
            </div>
            <span className="text-[15px] font-bold text-white font-mono tracking-tight">TradeVault</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Get access
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* single muted glow */}
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-2xl mb-14">
            {/* Headline */}
            <h1 className="fade-up du-100 text-5xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight text-white mb-5">
              Stop trading blind.
              <br />
              <span className="text-zinc-400 font-medium">Build your edge with data.</span>
            </h1>

            <p className="fade-up du-200 text-base sm:text-lg text-zinc-400 leading-relaxed mb-8 max-w-xl">
              TradeVault is an AI-powered trading journal designed for options traders who are serious about improving. Log trades, surface behavioral patterns, and get personalized coaching — all from your own data.
            </p>

            <div className="fade-up du-300 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-semibold rounded-lg transition-colors"
              >
                Sign in
              </Link>
            </div>

            <div className="fade-up du-450 flex flex-wrap items-center gap-4 mt-6">
              {['Commission-aware P&L', 'Row-level data isolation', 'DeepSeek AI coaching'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── App Preview Card ─────────────────────────────────── */}
          <div className="fade-up du-450 relative">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Titlebar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 mx-4 h-5 bg-zinc-800 rounded px-3 flex items-center">
                  <span className="text-[10px] text-zinc-500 font-mono">app.tradevault.io/dashboard</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-5 gap-0">
                {/* Left panel */}
                <div className="sm:col-span-3 p-5 border-r border-zinc-800 space-y-4">
                  {/* Ticker */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 flex-shrink-0 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                    <div className="overflow-hidden flex-1">
                      <div className="ticker-inner flex gap-6 w-max">
                        {[['SPY','+0.61%',true],['QQQ','+1.17%',true],['VIX','−1.65%',false],['IWM','+1.11%',true],['NVDA','+2.34%',true],['AAPL','−0.42%',false],['SPY','+ 0.61%',true],['QQQ','+1.17%',true],['VIX','−1.65%',false]].map(([s,c,up],i)=>(
                          <span key={i} className="flex items-center gap-1.5 text-[10px] flex-shrink-0">
                            <span className="font-bold text-zinc-300">{s}</span>
                            <span className={`font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>{c as string}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { label: 'Balance', value: '$24,830', sub: '+15.2%', green: true },
                      { label: 'Net P&L', value: '+$3,240', sub: '42 trades', green: true },
                      { label: 'Win Rate', value: '68.4%', sub: '27W · 12L', green: true },
                      { label: 'Today', value: '+$480', sub: '3 trades', green: true },
                    ].map(({ label, value, sub, green }) => (
                      <div key={label} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">{label}</p>
                        <p className={`text-sm font-black font-mono tabular-nums ${green ? 'text-white' : 'text-zinc-200'}`}>{value}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Equity chart */}
                  <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-zinc-300">Equity Curve</p>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">+15.2% MTD</span>
                    </div>
                    <svg viewBox="0 0 380 70" className="w-full h-14" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="equGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" stopOpacity=".3" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,62 C25,59 50,54 75,48 C100,42 115,47 140,38 C165,29 180,34 210,24 C240,14 255,20 285,12 C315,4 345,8 380,3"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="equity-path"
                      />
                      <path
                        d="M0,62 C25,59 50,54 75,48 C100,42 115,47 140,38 C165,29 180,34 210,24 C240,14 255,20 285,12 C315,4 345,8 380,3 L380,70 L0,70 Z"
                        fill="url(#equGrad)"
                        opacity=".7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Right panel — trade log */}
                <div className="sm:col-span-2 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">Recent Trades</p>
                  <div className="space-y-0">
                    <TradeRow green={true} />
                    <TradeRow green={true} />
                    <TradeRow green={false} />
                    <TradeRow green={true} />
                    <TradeRow green={true} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">AI Coach Score</p>
                    {[['Discipline', 81], ['Risk Mgmt', 68], ['Execution', 77]].map(([label, score]) => (
                      <div key={label as string} className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-zinc-400 w-16 flex-shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 animate-pulse"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-zinc-300 w-6 text-right">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── Why journaling matters — the research ─────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section label */}
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">The Research</p>
          <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Most traders fail for a reason that has nothing to do with strategy.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed pt-1">
              The SEC, CBOE, and independent researchers consistently find that 70–90% of retail options traders lose money. The primary culprit is not market knowledge — it is the absence of a disciplined feedback loop. Without reviewing your own trades in detail, behavioral patterns compound silently until the account is gone.
            </p>
          </div>

          {/* Statistics grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {journalStats.map(({ figure, context, source }) => (
              <div key={figure} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col">
                <div className="stat-bar w-8 h-0.5 rounded-full mb-4" />
                <p className="text-4xl font-black text-white mb-2 tabular-nums font-mono">{figure}</p>
                <p className="text-sm text-zinc-300 leading-snug flex-1">{context}</p>
                <p className="text-[10px] text-zinc-600 mt-3 font-medium leading-tight">{source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── What happens without a journal ─────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">Without a Journal</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 max-w-xl">
            The patterns that cost you the most stay invisible.
          </h2>
          <p className="text-zinc-400 text-base mb-12 max-w-xl leading-relaxed">
            Research from behavioral finance and trading psychology identifies three mechanisms that silently erode profitability when traders operate without a structured review process.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {consequences.map(({ icon: Icon, title, body }) => (
              <div key={title} className="border-l-2 border-zinc-800 pl-5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
                  <Icon className="w-4 h-4 text-zinc-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Expert quotes */}
          <div className="grid sm:grid-cols-3 gap-4">
            {expertQuotes.map(({ quote, name, title }) => (
              <blockquote
                key={name}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex flex-col"
              >
                <p className="text-sm text-zinc-300 leading-relaxed flex-1 italic mb-4">{quote}</p>
                <footer>
                  <p className="text-xs font-bold text-white">{name}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{title}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── What TradeVault gives you ───────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">The Platform</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 max-w-xl">
            Everything you need to turn trading activity into measurable improvement.
          </h2>
          <p className="text-zinc-400 text-base mb-12 max-w-xl leading-relaxed">
            Built by options traders, not generalists. Every feature exists because a specific class of mistake kept showing up in trade logs.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional tools list */}
          <div className="mt-8 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Also included</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                'Live economic calendar (ForexFactory)',
                'Pre-market routine builder with timers',
                'Commission-aware P&L calculation',
                'Multi-account support (paper + live)',
                'CSV export of full trade history',
                'Options 100× multiplier auto-applied',
                'Implied volatility & Greeks context',
                'Session & day-of-week heatmaps',
                'Security logs & row-level isolation',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── How journals improve performance ──────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-4">The Method</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12 max-w-xl">
            A review process that professionals use. Now accessible to any trader.
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Log every trade with context',
                body: 'Entry, exit, contract details, and the rationale. Tags for setup type, emotional state, and market regime. Options-specific fields: IV at entry, adjustment logs, Greeks.',
              },
              {
                step: '02',
                title: 'Surface patterns automatically',
                body: 'The analytics engine groups your data by time-of-day, day-of-week, setup tag, account, and symbol. You see which conditions produce positive expectancy — and which do not.',
              },
              {
                step: '03',
                title: 'Get coaching from your own data',
                body: 'The AI Coach reads your complete history — not generic advice. It scores discipline, risk management, and execution quality, then gives you a concrete action plan with measurable targets.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="relative">
                <p className="text-5xl font-black text-zinc-800 mb-4 font-mono tabular-nums">{step}</p>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── Instruments supported ──────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-x-10 gap-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Supports</p>
          {['Options', 'Futures', 'Stocks', 'Spreads', 'Multi-leg', 'Crypto'].map((inst) => (
            <span key={inst} className="text-sm font-semibold text-zinc-400">{inst}</span>
          ))}
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Build your edge.<br />One trade at a time.
          </h2>
          <p className="text-zinc-400 text-base mb-10 leading-relaxed">
            Join traders who have stopped guessing and started measuring. TradeVault gives you the infrastructure to find your edge and hold onto it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-900 font-bold rounded-lg text-sm transition-colors"
            >
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-lg text-sm transition-colors"
            >
              Sign in
            </Link>
          </div>
          <p className="text-xs text-zinc-600 mt-6">No credit card required. No commitment.</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/80 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md overflow-hidden border border-zinc-700">
              <img src="/logo.png" alt="TradeVault" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-bold text-zinc-500 font-mono">TradeVault</span>
          </div>
          <p className="text-xs text-zinc-700 text-center leading-snug max-w-sm">
            For journaling and educational purposes only. Not financial advice. Not a broker-dealer or registered investment advisor.
          </p>
          <div className="flex items-center gap-5 text-xs text-zinc-600 font-medium">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <span>© 2026 TradeVault</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
