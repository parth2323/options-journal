'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  BarChart3,
  TrendingUp,
  CalendarDays,
  Lightbulb,
  Clock,
  Shield,
  Zap,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Activity,
} from 'lucide-react';

/* ─── Feature Cards Data ──────────────────────────────────────────── */
const features = [
  {
    icon: Sparkles,
    gradient: 'from-indigo-500 to-purple-600',
    glow: 'shadow-indigo-500/25',
    title: 'AI Trading Coach',
    description:
      'DeepSeek-powered dual-intelligence mentor analyzes your personal trade history — win rate, behavioral leaks, drawdown patterns — and answers sector/options questions in real time.',
    badge: 'Powered by AI',
  },
  {
    icon: BarChart3,
    gradient: 'from-cyan-500 to-indigo-600',
    glow: 'shadow-cyan-500/25',
    title: 'Performance Analytics Engine',
    description:
      'Day-of-week heatmaps, session breakdowns, streak tracking, hold-time distribution, symbol profit factor rankings, and commissions analysis — all built from your own trade data.',
    badge: 'FAANG-Grade',
  },
  {
    icon: Activity,
    gradient: 'from-emerald-500 to-cyan-600',
    glow: 'shadow-emerald-500/25',
    title: 'Live Market Terminal',
    description:
      'Real-time Finnhub & Yahoo Finance quotes with an HD SVG price chart, 52-week range slider, YTD return, volume, and 1-click "Log Trade" or "Add Observation" CTAs.',
    badge: 'Real-Time',
  },
  {
    icon: CalendarDays,
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/25',
    title: 'Economic Calendar',
    description:
      'ForexFactory economic releases with impact filters (High/Medium/Low), forecast vs actual data, and automatic timezone conversion so you never miss a catalyst.',
    badge: 'ForexFactory',
  },
  {
    icon: Lightbulb,
    gradient: 'from-pink-500 to-rose-600',
    glow: 'shadow-pink-500/25',
    title: 'Chart Ideas Journal',
    description:
      'Screenshot uploads to Supabase Storage, mood tagging (confident, uncertain, regret), hypothetical outcome tracking, and setup tags — your visual edge library.',
    badge: 'Setup Tracking',
  },
  {
    icon: Clock,
    gradient: 'from-violet-500 to-purple-700',
    glow: 'shadow-violet-500/25',
    title: 'Pre-Market Routine Builder',
    description:
      'Structured daily ritual with phase countdown timers, regime rules, and journal prompts. Build the disciplined habits that separate consistent traders from gamblers.',
    badge: 'Discipline',
  },
];

const stats = [
  { value: '100×', label: 'Options multiplier auto-applied' },
  { value: '<30ms', label: 'P&L computation speed' },
  { value: 'RLS', label: 'Row-level security on all data' },
  { value: 'DeepSeek', label: 'AI model powering coaching' },
];

const instruments = ['Options', 'Futures', 'Stocks', 'Crypto', 'Spreads', 'Multi-leg'];

/* ─── Skeleton Components ─────────────────────────────────────────── */
function SkeletonLine({ w = 'w-full', h = 'h-2.5' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-white/8 rounded-full animate-pulse`} />;
}

function KpiCard({ label, value, up }: { label: string; value: string; up: boolean }) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-2xl p-3.5 flex flex-col gap-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`text-xl font-black ${up ? 'text-emerald-400' : 'text-slate-200'}`}>{value}</p>
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${up ? 'bg-emerald-500' : 'bg-slate-600'}`} />
        <SkeletonLine w="w-16" h="h-2" />
      </div>
    </div>
  );
}

function TradeRow({ win, ghost = false }: { win: boolean; ghost?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${ghost ? 'opacity-30' : ''} border-white/5 bg-white/2`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${win ? 'bg-emerald-400' : 'bg-red-400'}`} />
      <SkeletonLine w="w-12" h="h-2.5" />
      <SkeletonLine w="w-20" h="h-2.5" />
      <div className="flex-1" />
      <span className={`text-xs font-black ${win ? 'text-emerald-400' : 'text-red-400'}`}>
        {win ? '+$247' : '-$89'}
      </span>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#06060c] text-white overflow-x-hidden">

      {/* ── Global CSS Animations ─────────────────────────────────── */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -40px) scale(1.05); }
          66%       { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40%       { transform: translate(-35px, 25px) scale(1.08); }
          70%       { transform: translate(15px, -30px) scale(0.95); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(20px, 35px) scale(1.04); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 600; }
          to   { stroke-dashoffset: 0; }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.35s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.5s ease both; }
        .orb1 { animation: float1 12s ease-in-out infinite; }
        .orb2 { animation: float2 15s ease-in-out infinite; }
        .orb3 { animation: float3 10s ease-in-out infinite; }
        .ticker-inner { animation: ticker 28s linear infinite; }
        .equity-line { stroke-dasharray: 600; animation: drawLine 2.5s 0.5s ease forwards; }
      `}</style>

      {/* ── Sticky Navbar ─────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#06060c]/90 backdrop-blur-xl border-b border-white/8 shadow-2xl' : ''}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 shadow-md flex-shrink-0">
              <img src="/logo.png" alt="TradeVault" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-black text-white font-mono tracking-tight">TradeVault</span>
          </Link>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:flex items-center px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95"
            >
              Get Early Access
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-5 sm:px-8 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb1 absolute top-20 left-[15%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="orb2 absolute top-40 right-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[120px]" />
          <div className="orb3 absolute bottom-0 left-[40%] w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-[90px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            {/* Badge */}
            <div className="fade-up-1 inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-black uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3 text-indigo-400" />
              AI-Powered Options Journal — Beta
            </div>

            {/* Headline */}
            <h1 className="fade-up-2 text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Master Your Edge.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Vault Your Trades.
              </span>
            </h1>

            {/* Sub */}
            <p className="fade-up-3 text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
              The institutional-grade trading journal built for serious options traders. AI coaching, live market data, performance analytics, and behavioral edge tracking — all in one platform.
            </p>

            {/* CTAs */}
            <div className="fade-up-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group flex items-center gap-2 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 text-sm"
              >
                Start Free — No Credit Card
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl border border-white/10 hover:border-white/20 transition-all text-sm"
              >
                Sign In
              </Link>
            </div>

            {/* Trust pills */}
            <div className="fade-up-4 flex flex-wrap items-center justify-center gap-3 mt-8">
              {['Commission-aware P&L', 'Row-level security', 'Real-time market data', 'DeepSeek AI'].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* ── App Preview Card ────────────────────────────────── */}
          <div className="fade-up-4 relative max-w-5xl mx-auto">
            {/* Glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent rounded-3xl blur-2xl" />

            <div className="relative bg-[#0e0e18]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
              {/* Fake window bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8 bg-white/2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                <div className="flex-1 mx-4 h-5 bg-white/5 rounded-md px-3 flex items-center">
                  <span className="text-[10px] text-slate-500 font-mono">app.tradevault.io/dashboard</span>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {/* Market ticker bar skeleton */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-white/3 border border-white/8 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    MARKET
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="ticker-inner flex gap-8 w-max">
                      {[['SPY', '+0.61%', true], ['QQQ', '+1.17%', true], ['VIX', '-1.65%', false], ['IWM', '+1.11%', true], ['NVDA', '+2.34%', true], ['AAPL', '-0.42%', false], ['SPY', '+0.61%', true], ['QQQ', '+1.17%', true], ['VIX', '-1.65%', false]].map(([sym, chg, up], i) => (
                        <div key={i} className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-black text-slate-300">{sym}</span>
                          <span className={`text-[10px] font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>{chg as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <KpiCard label="Balance" value="$24,830" up={true} />
                  <KpiCard label="Net P&L" value="+$3,240" up={true} />
                  <KpiCard label="Win Rate" value="68.4%" up={true} />
                  <KpiCard label="Today" value="+$480" up={true} />
                </div>

                {/* Equity chart + trade list */}
                <div className="grid sm:grid-cols-5 gap-3">
                  {/* Chart */}
                  <div className="sm:col-span-3 bg-white/3 border border-white/8 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Equity Curve</p>
                        <p className="text-lg font-black text-white mt-0.5">$24,830</p>
                      </div>
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">+15.2%</span>
                    </div>
                    <svg viewBox="0 0 300 80" className="w-full h-16" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="eqGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,65 C20,62 40,58 60,52 C80,46 95,50 115,42 C135,34 150,38 170,28 C190,18 205,22 225,15 C245,8 265,12 300,5"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="equity-line"
                      />
                      <path
                        d="M0,65 C20,62 40,58 60,52 C80,46 95,50 115,42 C135,34 150,38 170,28 C190,18 205,22 225,15 C245,8 265,12 300,5 L300,80 L0,80 Z"
                        fill="url(#eqGrad)"
                        opacity="0.6"
                      />
                    </svg>
                  </div>

                  {/* Trade list */}
                  <div className="sm:col-span-2 bg-white/3 border border-white/8 rounded-2xl p-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1 mb-3">Recent Trades</p>
                    <TradeRow win={true} />
                    <TradeRow win={true} />
                    <TradeRow win={false} />
                    <TradeRow win={true} />
                    <TradeRow win={true} ghost={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Instruments Bar ───────────────────────────────────────── */}
      <section className="border-y border-white/8 bg-white/2 py-5 px-5 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-4">Built for</span>
          {instruments.map((inst) => (
            <div key={inst} className="flex items-center gap-2 text-sm font-black text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              {inst}
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats Row ─────────────────────────────────────────────── */}
      <section className="py-16 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl sm:text-4xl font-black text-white mb-1">{value}</p>
              <p className="text-xs text-slate-500 font-semibold leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Everything serious traders need.{' '}
              <span className="text-slate-400">Nothing they don't.</span>
            </h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              Designed with an experienced options trader and a team of backend & frontend engineers to give you institutional-grade tooling in a clean, fast interface.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, gradient, glow, title, description, badge }) => (
              <div
                key={title}
                className={`group relative bg-[#0e0e18] border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${glow}`}
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Badge */}
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{badge}</span>

                <h3 className="text-base font-black text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${gradient} blur-2xl -z-10 scale-110`} style={{ opacity: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Coach Preview ──────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-black uppercase tracking-widest mb-6">
                <Sparkles className="w-3 h-3" />
                AI Trading Mentor
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-5 leading-tight">
                Your personal trading coach,{' '}
                <span className="text-indigo-400">available 24/7.</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                The AI Coach reads your actual trade history — not generic advice. It scores your discipline, risk management, execution quality, and emotional control. Then gives you a concrete action plan backed by your own statistics.
              </p>
              <ul className="space-y-3">
                {[
                  'Win rate & behavioral leak analysis',
                  'Session & day-of-week performance patterns',
                  'Concrete action plan with measurable targets',
                  'General options mechanics Q&A (IV crush, spreads, Greeks)',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Coach UI Skeleton */}
            <div className="bg-[#0e0e18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-white/2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">AI Trading Coach</p>
                  <p className="text-[10px] text-slate-500">Powered by DeepSeek · Educational only</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Score cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Overall', score: 74, color: 'text-indigo-400' },
                    { label: 'Discipline', score: 81, color: 'text-emerald-400' },
                    { label: 'Risk Mgmt', score: 68, color: 'text-amber-400' },
                    { label: 'Execution', score: 77, color: 'text-cyan-400' },
                  ].map(({ label, score, color }) => (
                    <div key={label} className="bg-white/4 border border-white/8 rounded-xl p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
                      <p className={`text-xl font-black ${color}`}>{score}</p>
                      <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse`} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat bubble */}
                <div className="bg-indigo-600/15 border border-indigo-500/20 rounded-2xl rounded-tl-sm p-4">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <span className="font-black text-indigo-300">Coach analysis: </span>
                    Your Tuesday sessions show 82% win rate vs 54% on Fridays. Consider reducing Friday position sizes until you identify the behavioral driver. Your average hold time on winners is 2.3× longer than on losers — this is a strength to systematize.
                  </p>
                </div>

                {/* Legal strip */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium border border-white/5 rounded-xl px-3 py-2">
                  <Shield className="w-3 h-3 flex-shrink-0" />
                  Educational journaling tool only. Not financial advice or trade signals.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Band ──────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-indigo-600/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            Start vaulting your trades today.
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Join traders who are already building their edge with AI coaching, real-time market data, and a journal that actually helps them improve.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-2xl hover:scale-105 active:scale-95 text-base"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-8 py-4 bg-white/8 hover:bg-white/12 text-white font-black rounded-2xl border border-white/15 transition-all text-base"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-10 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10">
              <img src="/logo.png" alt="TradeVault" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-black text-slate-400 font-mono">TradeVault</span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            For educational & journaling purposes only. Not financial advice.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500 font-semibold">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>© 2026 TradeVault</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
