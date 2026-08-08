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
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  CalendarDays,
  Clock,
  Check,
  X as XIcon,
  Zap,
  Lock,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

/* ─────────────────────────── Data Structures ─────────────────────────── */

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
    icon: ShieldCheck,
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
    name: 'Industry Axiom',
    title: 'Repeated across Trademetria, SMC Trade Online, ForTraders',
  },
];

const capabilities = [
  {
    icon: Brain,
    title: 'AI Trading Coach',
    badge: 'DeepSeek LLM',
    description:
      'Dual-intelligence mentor that reads your isolated trade history to surface behavioral leaks, score discipline, and answer options mechanics & sector questions.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics Engine',
    badge: 'FAANG-Grade',
    description:
      'Day-of-week heatmaps, session breakdowns, streak tracking, hold-time distribution, and symbol profit factor rankings built directly from your trade data.',
  },
  {
    icon: Activity,
    title: 'Live Market Terminal',
    badge: 'Real-Time Quotes',
    description:
      'Real-time Finnhub & Yahoo Finance quotes, HD price charts with date/price labels, 52-week sliders, YTD returns, and 1-click trade logging.',
  },
  {
    icon: BookOpen,
    title: 'Chart Setup Journal',
    badge: 'Visual Edge',
    description:
      'Screenshot uploads to Supabase Storage, mood tagging (confident, hesitant, FOMO), setup tracking, and win-rate expectancy calculations per pattern.',
  },
  {
    icon: CalendarDays,
    title: 'Economic Calendar',
    badge: 'ForexFactory',
    description:
      'Live macroeconomic releases with impact filters (High/Medium/Low), forecast vs actual data, and automatic local timezone conversion.',
  },
  {
    icon: Clock,
    title: 'Pre-Market Routine Builder',
    badge: 'Discipline',
    description:
      'Structured daily ritual with phase countdown timers, regime checks, and discipline rules to ensure you enter the market prepared.',
  },
];

const comparisonRows = [
  {
    feature: 'Options Contract Multiplier (100× auto-applied)',
    spreadsheet: false,
    genericLogger: 'Partial',
    tradeVault: true,
  },
  {
    feature: 'AI Behavioral Leak Coach (DeepSeek LLM)',
    spreadsheet: false,
    genericLogger: false,
    tradeVault: true,
  },
  {
    feature: 'Live Market Terminal & HD Price Charts',
    spreadsheet: false,
    genericLogger: false,
    tradeVault: true,
  },
  {
    feature: 'ForexFactory Economic Calendar Integration',
    spreadsheet: false,
    genericLogger: false,
    tradeVault: true,
  },
  {
    feature: 'Chart Setup Journal with Mood Tagging',
    spreadsheet: false,
    genericLogger: 'Basic',
    tradeVault: true,
  },
  {
    feature: 'Day-of-Week & Session Profit Factor Heatmaps',
    spreadsheet: 'Manual formula',
    genericLogger: true,
    tradeVault: true,
  },
  {
    feature: 'Row-Level Database Isolation (Supabase RLS)',
    spreadsheet: false,
    genericLogger: 'Shared db',
    tradeVault: true,
  },
];

/* ─────────────────────────── Main Landing Page Component ─────────────────────────── */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'coach' | 'analytics' | 'market' | 'ideas'>('dashboard');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* ── Global Styles & Keyframe Animations ─────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; }

        h1, h2, h3 { text-wrap: balance; }
        p { text-wrap: pretty; }

        @keyframes drawLine {
          from { stroke-dashoffset: 700; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .equity-line {
          stroke-dasharray: 700;
          animation: drawLine 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .ticker-inner { animation: ticker 32s linear infinite; }

        .hero-glow {
          background: radial-gradient(ellipse 70% 45% at 50% 0%, rgba(79, 70, 229, 0.14) 0%, transparent 70%);
        }

        .section-divider {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, #27272a 50%, transparent);
        }
      `}</style>

      {/* ── Fixed Navbar ───────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#08080a]/90 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl shadow-black/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-zinc-700/70 flex-shrink-0 bg-zinc-900 p-0.5">
              <img src="/logo.png" alt="TradeVault" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-white font-mono tracking-tight leading-none">TradeVault</span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-tight mt-0.5">Options Journal</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#research" className="hover:text-white transition-colors">Research</a>
            <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
            <a href="#coach" className="hover:text-white transition-colors">AI Coach</a>
            <a href="#comparison" className="hover:text-white transition-colors">Comparison</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors rounded-xl hover:bg-zinc-800/60"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
            >
              Get access
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-5 sm:px-8 overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold tracking-wider uppercase mb-6 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Institutional-Grade Options Journal & AI Mentor
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08] mb-6">
              Stop trading blind.{' '}
              <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Turn your data into your edge.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-9">
              TradeVault automatically surfaces your behavioral leaks, tracks profit factors across strategies, and gives you personalized AI coaching — built exclusively for options and active traders.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 text-sm"
              >
                Start Free Journal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#interactive-showcase"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold rounded-2xl transition-all text-sm"
              >
                Explore Live Interactive Preview
              </a>
            </div>

            {/* Key Assurance Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-5 mt-9 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Commission-aware P&L
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Row-level privacy isolation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> DeepSeek AI coaching
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Options 100× multiplier
              </span>
            </div>
          </div>

          {/* ── Interactive App Preview Container ────────────────────────────── */}
          <div id="interactive-showcase" className="relative max-w-5xl mx-auto">
            {/* Outer Frame */}
            <div className="bg-[#0e0e14] border border-zinc-800/90 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
              
              {/* Window Header / Navigation Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-3 gap-3">
                {/* Window Dots */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="text-[11px] font-mono text-zinc-500 ml-2 hidden sm:inline">app.tradevault.io/dashboard</span>
                </div>

                {/* Interactive Product Tabs */}
                <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: Layers },
                    { id: 'coach', label: 'AI Coach', icon: Brain },
                    { id: 'analytics', label: 'Analytics Engine', icon: BarChart3 },
                    { id: 'market', label: 'Market Terminal', icon: Activity },
                    { id: 'ideas', label: 'Setup Journal', icon: BookOpen },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as typeof activeTab)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        activeTab === id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Tab Body */}
              <div className="p-4 sm:p-6 bg-zinc-950/40">
                {activeTab === 'dashboard' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Market Ticker */}
                    <div className="flex items-center gap-3 px-3.5 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
                      <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Markets
                      </span>
                      <div className="overflow-hidden flex-1">
                        <div className="ticker-inner flex gap-8 w-max">
                          {[
                            ['SPY', '$584.20', '+0.61%', true],
                            ['QQQ', '$489.10', '+1.17%', true],
                            ['VIX', '14.82', '-1.65%', false],
                            ['IWM', '$221.40', '+1.11%', true],
                            ['NVDA', '$128.50', '+2.34%', true],
                            ['AAPL', '$224.30', '-0.42%', false],
                            ['SPY', '$584.20', '+0.61%', true],
                            ['QQQ', '$489.10', '+1.17%', true],
                          ].map(([s, p, c, up], i) => (
                            <div key={i} className="flex items-center gap-2 text-xs flex-shrink-0">
                              <span className="font-extrabold text-zinc-200 font-mono">{s}</span>
                              <span className="text-zinc-400 font-mono">{p}</span>
                              <span className={`font-mono font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>{c}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* KPI Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Balance', value: '$24,830.00', sub: '+15.2% MTD', green: true },
                        { label: 'Net P&L', value: '+$3,240.50', sub: '42 closed trades', green: true },
                        { label: 'Win Rate', value: '68.4%', sub: '27W · 12L · 3BE', green: true },
                        { label: 'Today', value: '+$480.00', sub: '3 trades logged', green: true },
                      ].map(({ label, value, sub, green }) => (
                        <div key={label} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">{label}</p>
                          <p className={`text-xl font-black font-mono tracking-tight ${green ? 'text-white' : 'text-zinc-300'}`}>{value}</p>
                          <p className="text-[11px] text-zinc-500 mt-1 font-mono">{sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Main Equity Chart & Recent Trade Rows */}
                    <div className="grid sm:grid-cols-5 gap-3">
                      {/* SVG Equity Curve */}
                      <div className="sm:col-span-3 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Cumulative Equity Curve</p>
                            <p className="text-lg font-black text-white font-mono mt-0.5">$24,830.00</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono">+15.2%</span>
                        </div>
                        <svg viewBox="0 0 380 75" className="w-full h-20" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="eqGradMain" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,65 C25,60 50,52 75,46 C100,40 115,45 140,36 C165,27 180,32 210,22 C240,12 255,18 285,10 C315,4 345,7 380,2"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="equity-line"
                          />
                          <path
                            d="M0,65 C25,60 50,52 75,46 C100,40 115,45 140,36 C165,27 180,32 210,22 C240,12 255,18 285,10 C315,4 345,7 380,2 L380,75 L0,75 Z"
                            fill="url(#eqGradMain)"
                          />
                        </svg>
                      </div>

                      {/* Recent Trade List */}
                      <div className="sm:col-span-2 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-2">Live Trade History</p>
                        {[
                          { sym: 'SPY 580C', pnl: '+$312.50', win: true },
                          { sym: 'QQQ 490C', pnl: '+$245.00', win: true },
                          { sym: 'NVDA 125P', pnl: '-$84.00', win: false },
                          { sym: 'IWM 220C', pnl: '+$190.00', win: true },
                        ].map((t, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 last:border-0 text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${t.win ? 'bg-emerald-400' : 'bg-red-400'}`} />
                              <span className="font-bold text-zinc-200">{t.sym}</span>
                            </div>
                            <span className={`font-bold ${t.win ? 'text-emerald-400' : 'text-red-400'}`}>{t.pnl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'coach' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid sm:grid-cols-3 gap-3">
                      {/* Coach Score Card */}
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold text-white">Execution Scores</span>
                        </div>
                        {[
                          { label: 'Overall Discipline', score: 81, color: 'text-indigo-400' },
                          { label: 'Risk Management', score: 68, color: 'text-amber-400' },
                          { label: 'Execution Quality', score: 77, color: 'text-emerald-400' },
                        ].map(({ label, score, color }) => (
                          <div key={label} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-zinc-400">{label}</span>
                              <span className={`font-mono font-bold ${color}`}>{score}/100</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${score}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Coach Live Response Bubble */}
                      <div className="sm:col-span-2 bg-indigo-950/30 border border-indigo-500/25 rounded-2xl p-4.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-300">DeepSeek AI Mentor Analysis</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">Educational Context</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          &ldquo;Analysis of your last 42 options trades shows an 82% win rate on Tuesdays versus 54% on Fridays. Your average hold time on winning trades is 2.3× longer than on losing trades. Consider capping Friday risk per trade at 1% of account equity until setup selection improves.&rdquo;
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono pt-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" /> Isolated to your personal trade history · Not investment advice
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {/* Profit Factor Leaderboard */}
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Profit Factor by Ticker</p>
                        {[
                          { sym: 'SPY', pf: '2.84', winRate: '72%', status: 'Primary Edge' },
                          { sym: 'QQQ', pf: '2.12', winRate: '68%', status: 'Consistent' },
                          { sym: 'NVDA', pf: '1.95', winRate: '64%', status: 'Profitable' },
                          { sym: 'AAPL', pf: '0.74', winRate: '38%', status: 'Leaking Capital' },
                        ].map((row) => (
                          <div key={row.sym} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/60 last:border-0 font-mono">
                            <span className="font-bold text-white w-12">{row.sym}</span>
                            <span className="text-zinc-400">PF: <strong className={Number(row.pf) >= 1.5 ? 'text-emerald-400' : 'text-red-400'}>{row.pf}</strong></span>
                            <span className="text-zinc-400">Win: {row.winRate}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-sans font-bold ${Number(row.pf) >= 1.5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                              {row.status}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Day of Week Heatmap Breakdown */}
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Day-of-Week Expectancy</p>
                        {[
                          { day: 'Mon', pnl: '+$640.00', pct: 80, green: true },
                          { day: 'Tue', pnl: '+$1,420.00', pct: 95, green: true },
                          { day: 'Wed', pnl: '+$890.00', pct: 70, green: true },
                          { day: 'Thu', pnl: '+$510.00', pct: 60, green: true },
                          { day: 'Fri', pnl: '-$220.00', pct: 30, green: false },
                        ].map((d) => (
                          <div key={d.day} className="flex items-center gap-3 text-xs font-mono">
                            <span className="w-8 font-bold text-zinc-300">{d.day}</span>
                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${d.green ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${d.pct}%` }} />
                            </div>
                            <span className={`w-20 text-right font-bold ${d.green ? 'text-emerald-400' : 'text-red-400'}`}>{d.pnl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'market' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4.5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-extrabold text-white font-mono">SPY</span>
                            <span className="text-xs text-zinc-400">S&P 500 ETF Trust</span>
                          </div>
                          <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">$584.20 <span className="text-xs font-bold">+1.12%</span></p>
                        </div>
                        <div className="flex gap-2">
                          <Link href="/trades/new" className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all">
                            Log Trade
                          </Link>
                        </div>
                      </div>

                      {/* 52-Week Range Slider */}
                      <div className="space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-zinc-400 text-[11px]">
                          <span>52W Low: $410.15</span>
                          <span>Current: $584.20</span>
                          <span>52W High: $585.50</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full" style={{ width: '98%' }} />
                        </div>
                      </div>

                      {/* Market stats grid */}
                      <div className="grid grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-zinc-800">
                        <div><span className="text-zinc-500 text-[10px] block">Open</span><span className="text-zinc-200 font-bold">$581.10</span></div>
                        <div><span className="text-zinc-500 text-[10px] block">Prev Close</span><span className="text-zinc-200 font-bold">$577.72</span></div>
                        <div><span className="text-zinc-500 text-[10px] block">Volume</span><span className="text-zinc-200 font-bold">64.2M</span></div>
                        <div><span className="text-zinc-500 text-[10px] block">YTD Return</span><span className="text-emerald-400 font-bold">+21.4%</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ideas' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid sm:grid-cols-3 gap-3">
                      {[
                        { title: 'Morning Breakout', winRate: '78% Win Rate', mood: 'Confident', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
                        { title: 'VIX Spike Reversal', winRate: '64% Win Rate', mood: 'Disciplined', color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' },
                        { title: 'FOMO Chase Pattern', winRate: '22% Win Rate', mood: 'Regret', color: 'text-red-400 border-red-500/20 bg-red-500/10' },
                      ].map(({ title, winRate, mood, color }) => (
                        <div key={title} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{title}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${color}`}>{mood}</span>
                          </div>
                          <p className="text-xs font-mono font-bold text-zinc-300">{winRate}</p>
                          <div className="h-20 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-600 font-mono">
                            [ Chart Screenshot ]
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key System Metrics Strip ──────────────────────────────────────── */}
      <section className="border-y border-zinc-800/80 bg-zinc-900/30 py-6 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '100×', label: 'Options contract multiplier auto-applied' },
            { value: '<30ms', label: 'P&L calculation & commission engine' },
            { value: 'DeepSeek', label: 'AI LLM dual-intelligence model' },
            { value: 'RLS Isolated', label: 'PostgreSQL row-level data privacy' },
          ].map(({ value, label }) => (
            <div key={label} className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">{value}</p>
              <p className="text-xs text-zinc-500 font-medium leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 1: The Research & Behavioral Finance ──────────────────── */}
      <section id="research" className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">
            <ShieldCheck className="w-4 h-4" />
            Behavioral Research & Market Reality
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-start mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Most traders fail for a reason that has nothing to do with strategy.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Research by the SEC, CBOE, and independent trading analytics cohorts consistently reveals that 70–90% of retail options traders lose money. The root cause is rarely technical analysis — it is the absence of a disciplined, quantitative review loop.
            </p>
          </div>

          {/* Research Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {journalStats.map(({ figure, context, source }) => (
              <div key={figure} className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                <div>
                  <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-4" />
                  <p className="text-4xl font-black text-white font-mono tabular-nums mb-2">{figure}</p>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">{context}</p>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium mt-4 pt-3 border-t border-zinc-800/60">{source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── Section 2: Costs of Not Journaling ────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">The Costs of Trading Unmeasured</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 max-w-xl">
            The patterns that cost you the most stay invisible.
          </h2>
          <p className="text-zinc-400 text-base mb-12 max-w-xl leading-relaxed">
            Without a structured review process, three psychological mechanisms silently erode trader equity over time.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {consequences.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Expert Quotes */}
          <div className="grid sm:grid-cols-3 gap-4">
            {expertQuotes.map(({ quote, name, title }) => (
              <blockquote key={name} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 flex flex-col justify-between">
                <p className="text-xs text-zinc-300 italic leading-relaxed mb-4">{quote}</p>
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

      {/* ── Section 3: Core Platform Capabilities ──────────────────────────── */}
      <section id="features" className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Platform Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 max-w-xl">
            Everything you need to turn trade logs into measurable edge.
          </h2>
          <p className="text-zinc-400 text-base mb-12 max-w-xl leading-relaxed">
            Built specifically for options and active traders. Every tool solves a specific class of mistake that shows up in trading records.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map(({ icon: Icon, title, badge, description }) => (
              <div key={title} className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700/90 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-indigo-500/40 transition-colors">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
                    {badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── Section 4: 4-Step Master Workflow ──────────────────────────────── */}
      <section id="analytics" className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">The Discipline Workflow</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12 max-w-xl">
            A systematic review process used by top-tier traders.
          </h2>

          <div className="grid sm:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Log Every Trade',
                body: 'Capture contract labels, entry/exit prices, commissions, IV context, setup type, and emotional state.',
              },
              {
                step: '02',
                title: 'Auto-Group Patterns',
                body: 'The analytics engine groups data by session, day of week, setup tag, account, and symbol profit factor.',
              },
              {
                step: '03',
                title: 'AI Leak Detection',
                body: 'DeepSeek LLM analyzes your history to pinpoint behavioral leaks, scoring discipline and risk execution.',
              },
              {
                step: '04',
                title: 'Systematize Your Edge',
                body: 'Double down on high-expectancy setups and cut out patterns that leak capital from your portfolio.',
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl p-5 space-y-3">
                <span className="text-3xl font-black text-indigo-500 font-mono tracking-tight">{step}</span>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── Section 5: Comparison Matrix ───────────────────────────────────── */}
      <section id="comparison" className="py-24 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Why TradeVault</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 max-w-xl">
            Built for options traders, not generalists.
          </h2>
          <p className="text-zinc-400 text-base mb-12 max-w-xl leading-relaxed">
            See how TradeVault compares against manual spreadsheets and generic trade logging software.
          </p>

          {/* Table */}
          <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400 uppercase text-[10px] tracking-wider">
                    <th className="py-4 px-5 font-bold">Feature / Capability</th>
                    <th className="py-4 px-4 font-bold text-center">Spreadsheets</th>
                    <th className="py-4 px-4 font-bold text-center">Generic Loggers</th>
                    <th className="py-4 px-5 font-bold text-center text-indigo-400 bg-indigo-500/10">TradeVault</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium text-zinc-300">
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-white">{row.feature}</td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.spreadsheet === 'boolean' ? (
                          row.spreadsheet ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XIcon className="w-4 h-4 text-zinc-600 mx-auto" />
                        ) : (
                          <span className="text-zinc-500 font-mono text-[11px]">{row.spreadsheet}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.genericLogger === 'boolean' ? (
                          row.genericLogger ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XIcon className="w-4 h-4 text-zinc-600 mx-auto" />
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px]">{row.genericLogger}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-center bg-indigo-500/5 font-bold text-emerald-400">
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* ── Section 6: Final High-Conversion CTA ─────────────────────────────── */}
      <section className="py-28 px-5 sm:px-8 relative overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-5">
            Build your edge.<br />One trade at a time.
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Join traders who have stopped guessing and started measuring. TradeVault gives you the infrastructure to find your edge and hold onto it.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 text-base"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-2xl border border-zinc-800 transition-colors text-base"
            >
              Sign In
            </Link>
          </div>
          <p className="text-xs text-zinc-500 mt-6 font-medium">No credit card required · Free tier available</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/80 py-12 px-5 sm:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0 bg-zinc-900 p-0.5">
              <img src="/logo.png" alt="TradeVault" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-zinc-300 font-mono tracking-tight leading-none">TradeVault</span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-tight mt-0.5">Options Journal</span>
            </div>
          </div>

          <p className="text-xs text-zinc-600 text-center leading-relaxed max-w-md">
            For educational and journaling purposes only. Not financial advice. TradeVault is not a registered broker-dealer or investment advisor.
          </p>

          <div className="flex items-center gap-6 text-xs text-zinc-500 font-semibold">
            <Link href="/terms" className="hover:text-zinc-200 transition-colors">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-zinc-200 transition-colors">Privacy Policy</Link>
            <span className="text-zinc-600 font-mono">© 2026 TradeVault</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
