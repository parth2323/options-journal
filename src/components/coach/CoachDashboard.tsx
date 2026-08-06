'use client';

import { useState, useEffect, useCallback } from 'react';
import { Account, TimeframeOption, CoachReport } from '@/lib/types';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import {
  Sparkles,
  Bot,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Target,
  Award,
  Zap,
  Flame,
  BrainCircuit,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { CoachChatBox } from './CoachChatBox';

interface CoachDashboardProps {
  accounts: Account[];
}

function RadialScoreGauge({ score }: { score: number }) {
  const radius = 42;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80 ? '#10b981' : score >= 65 ? '#6366f1' : score >= 50 ? '#f59e0b' : '#ef4444';

  const label =
    score >= 85 ? 'Elite Trader' : score >= 75 ? 'Consistent Edge' : score >= 60 ? 'Disciplined' : score >= 45 ? 'Needs Calibration' : 'High Risk Leak';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg width="112" height="112" className="-rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="7"
            className="text-slate-200 dark:text-[#1c1c2b]"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black font-mono tracking-tight" style={{ color }}>
            {score}
          </span>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>
      <span
        className="mt-2 text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border shadow-xs"
        style={{
          color,
          backgroundColor: `${color}15`,
          borderColor: `${color}35`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function SubScoreBar({ title, score, explanation }: { title: string; score: number; explanation?: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const color =
    score >= 80 ? '#10b981' : score >= 65 ? '#6366f1' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div
      className="relative bg-slate-50/90 border border-slate-200/90 dark:bg-[#161622] dark:border-[#222234] rounded-xl p-2.5 transition-all hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center justify-between text-[11px] font-extrabold mb-1.5">
        <span className="text-slate-800 dark:text-slate-200 truncate pr-1">{title}</span>
        <span className="font-mono font-black text-xs" style={{ color }}>
          {score}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 dark:bg-[#202032] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      {showTooltip && explanation && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2.5 bg-slate-900 text-white dark:bg-black dark:text-slate-200 text-[10px] font-medium rounded-xl shadow-xl border border-slate-700 z-50 pointer-events-none leading-relaxed">
          {explanation}
        </div>
      )}
    </div>
  );
}

export function CoachDashboard({ accounts }: CoachDashboardProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [report, setReport] = useState<CoachReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths' | 'weaknesses' | 'patterns' | 'actionPlan'>('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const fetchReport = useCallback(
    async (tf: TimeframeOption, accId?: string, runAi = false) => {
      if (runAi) {
        setAiAnalyzing(true);
      } else {
        setLoading(true);
      }
      try {
        const res = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeframe: tf,
            account_id: accId || undefined,
            skipAi: !runAi,
          }),
        });
        if (!res.ok) throw new Error('Failed to fetch coach feedback');
        const data: CoachReport = await res.json();
        setReport(data);
        if (runAi) {
          setIsAiGenerated(true);
          toast.success('DeepSeek AI analysis completed on Supabase trade history!');
        }
      } catch (err) {
        console.error('Error fetching AI Coach analysis:', err);
        toast.error('Failed to run AI analysis');
      } finally {
        setLoading(false);
        setAiAnalyzing(false);
      }
    },
    []
  );

  useEffect(() => {
    setIsAiGenerated(false);
    fetchReport(timeframe, selectedAccountId, false);
  }, [timeframe, selectedAccountId, fetchReport]);

  const timeframeLabels: Record<TimeframeOption, string> = {
    today: "Today's Trades",
    week: "This Week",
    all: "Complete History",
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header Controls ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-[#12121a] border border-gray-200 dark:border-[#1e1e2d] rounded-2xl p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm">
              <Sparkles className="w-3 h-3" />
              DeepSeek AI Coach
            </span>
            <span className="text-[11px] text-gray-500 dark:text-[#737373] font-medium flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
              SPY / QQQ Options Mentor
            </span>
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            AI Trading Feedback & Performance Coach
          </h1>
          <p className="text-xs text-gray-600 dark:text-[#a0a0a0] mt-0.5">
            Personalized, data-driven analysis based on your actual Supabase trading history.
          </p>
        </div>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Account Filter */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="text-xs bg-white dark:bg-[#191924] border border-gray-300 dark:border-[#2a2a3c] rounded-xl px-3 py-2 text-gray-800 dark:text-[#e8e8e8] font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.account_type.toUpperCase()})
              </option>
            ))}
          </select>

          {/* Dedicated "Analyze Trades with AI Coach" Button */}
          <button
            onClick={() => fetchReport(timeframe, selectedAccountId, true)}
            disabled={aiAnalyzing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Sparkles className={cn('w-3.5 h-3.5', aiAnalyzing && 'animate-spin')} />
            {aiAnalyzing ? 'Analyzing Supabase History…' : 'Analyze Trades with AI Coach'}
          </button>
        </div>
      </div>

      {/* ── Timeframe Selector Bar ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-[#151520] border border-gray-200 dark:border-[#202030] rounded-xl">
        {(['today', 'week', 'all'] as TimeframeOption[]).map((tf) => {
          const isSelected = timeframe === tf;
          return (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                'flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 text-center',
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-600 dark:text-[#888899] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-[#1e1e2d]'
              )}
            >
              {timeframeLabels[tf]}
            </button>
          );
        })}
      </div>

      {/* ── Loading Skeleton / Content ──────────────────────────────────────── */}
      {loading && !report ? (
        <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-[#1a1a28] rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center animate-bounce">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Analyzing Trading History via DeepSeek AI…
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#737373] mt-1 max-w-md mx-auto">
              Scanning Supabase trade logs, risk-to-reward metrics, holding times, and setup win rates for [{timeframeLabels[timeframe]}].
            </p>
          </div>
        </div>
      ) : report ? (
        <div className="space-y-6">

          {/* ── TOKEN SAVER BANNER NOTICE ──────────────────────────────────── */}
          {!isAiGenerated && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-white dark:from-indigo-950/40 dark:via-[#131322] dark:to-[#18182b] border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                    DeepSeek AI Standby Mode (0 Tokens Used)
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Live Supabase Stats Loaded
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-[#a0a0a0]">
                    Quantitative metrics are fetched live from Supabase. Click <strong>Analyze Trades with AI Coach</strong> to trigger DeepSeek's AI options mentor analysis.
                  </p>
                </div>
              </div>
              <button
                onClick={() => fetchReport(timeframe, selectedAccountId, true)}
                disabled={aiAnalyzing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black whitespace-nowrap shadow-sm shadow-indigo-600/30 flex-shrink-0"
              >
                Run AI Analysis →
              </button>
            </div>
          )}

          {/* ── HERO BANNER: Overall Score + Mentor Headline ─────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/30 via-gray-900 to-purple-950/40 dark:from-[#0d0d18] dark:via-[#11111d] dark:to-[#181126] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

              {/* Score Ring Gauge */}
              <div className="lg:col-span-3 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-indigo-500/20 pb-6 lg:pb-0 lg:pr-6">
                <RadialScoreGauge score={report.scores.overall} />
              </div>

              {/* Mentor Headline & Executive Summary */}
              <div className="lg:col-span-9 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Coach Assessment · {timeframeLabels[timeframe]}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white leading-snug">
                  "{report.mentorHeadline}"
                </h2>
                <p className="text-xs md:text-sm text-gray-300 dark:text-[#b0b0c0] leading-relaxed">
                  {report.summary}
                </p>

                {/* Sub-Scores Grid */}
                <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <SubScoreBar title="Discipline" score={report.scores.discipline} explanation={report.scoreExplanations?.discipline} />
                  <SubScoreBar title="Risk Management" score={report.scores.riskManagement} explanation={report.scoreExplanations?.riskManagement} />
                  <SubScoreBar title="Selection" score={report.scores.tradeSelection} explanation={report.scoreExplanations?.tradeSelection} />
                  <SubScoreBar title="Execution" score={report.scores.executionQuality} explanation={report.scoreExplanations?.executionQuality} />
                  <SubScoreBar title="Emotional Control" score={report.scores.emotionalControl} explanation={report.scoreExplanations?.emotionalControl} />
                  <SubScoreBar title="Consistency" score={report.scores.consistency} explanation={report.scoreExplanations?.consistency} />
                  <SubScoreBar title="Strategy Adherence" score={report.scores.strategyAdherence} explanation={report.scoreExplanations?.strategyAdherence} />
                  <SubScoreBar title="Overall Edge" score={report.scores.overall} explanation={report.scoreExplanations?.overall} />
                </div>
              </div>

            </div>
          </div>

          {/* ── #1 GOLDEN HABIT HIGHLIGHT BOX ─────────────────────────────────── */}
          {report.goldenHabit && (
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/40 rounded-2xl p-5 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      The #1 Highest Leverage Habit
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-amber-200">
                    {report.goldenHabit.habit}
                  </h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {report.goldenHabit.whyItMatters}
                  </p>
                  <p className="text-xs font-mono text-amber-500 dark:text-amber-400 pt-1 font-semibold">
                    ⚡ Projected Impact: {report.goldenHabit.projectedImpact}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── QUANTITATIVE METRICS SNAPSHOT ──────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-[#11111a] border border-gray-200 dark:border-[#1e1e2d] rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider">
                Expectancy / Trade
              </p>
              <p className={cn('text-base font-black font-mono mt-1', report.metrics.expectancy >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                {formatCurrency(report.metrics.expectancy, true)}
              </p>
            </div>

            <div className="bg-white dark:bg-[#11111a] border border-gray-200 dark:border-[#1e1e2d] rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider">
                Win Rate
              </p>
              <p className="text-base font-black font-mono text-gray-900 dark:text-white mt-1">
                {report.metrics.winRate}%
              </p>
            </div>

            <div className="bg-white dark:bg-[#11111a] border border-gray-200 dark:border-[#1e1e2d] rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider">
                Profit Factor
              </p>
              <p className="text-base font-black font-mono text-indigo-400 mt-1">
                {report.metrics.profitFactor.toFixed(2)}
              </p>
            </div>

            <div className="bg-white dark:bg-[#11111a] border border-gray-200 dark:border-[#1e1e2d] rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider">
                Avg Risk Multiple
              </p>
              <p className="text-base font-black font-mono text-purple-400 mt-1">
                {report.metrics.avgRiskRewardRatio.toFixed(2)}:1
              </p>
            </div>

            <div className="bg-white dark:bg-[#11111a] border border-gray-200 dark:border-[#1e1e2d] rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider">
                Avg Amount Risked
              </p>
              <p className="text-base font-black font-mono text-orange-400 mt-1">
                {formatCurrency(report.metrics.avgAmountRisked)}
              </p>
            </div>

            <div className="bg-white dark:bg-[#11111a] border border-gray-200 dark:border-[#1e1e2d] rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-500 dark:text-[#737373] uppercase tracking-wider">
                Total PnL Leak
              </p>
              <p className="text-base font-black font-mono text-red-400 mt-1">
                -${report.metrics.totalLeakPnl.toFixed(0)}
              </p>
            </div>
          </div>

          {/* ── TABBED NAVIGATION ──────────────────────────────────────────────── */}
          <div className="flex border-b border-gray-200 dark:border-[#202030] overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-[#737373] hover:text-gray-900 dark:hover:text-white'
              )}
            >
              🛡️ Strengths & Flaws Overview
            </button>
            <button
              onClick={() => setActiveTab('strengths')}
              className={cn(
                'px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
                activeTab === 'strengths'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-[#737373] hover:text-gray-900 dark:hover:text-white'
              )}
            >
              🟢 Positive Behaviors ({report.strengths.length})
            </button>
            <button
              onClick={() => setActiveTab('weaknesses')}
              className={cn(
                'px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
                activeTab === 'weaknesses'
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 dark:text-[#737373] hover:text-gray-900 dark:hover:text-white'
              )}
            >
              🔴 Leaks & Flaws ({report.weaknesses.length})
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={cn(
                'px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
                activeTab === 'patterns'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-[#737373] hover:text-gray-900 dark:hover:text-white'
              )}
            >
              🧠 Advanced Pattern Recognition
            </button>
            <button
              onClick={() => setActiveTab('actionPlan')}
              className={cn(
                'px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap',
                activeTab === 'actionPlan'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-gray-500 dark:text-[#737373] hover:text-gray-900 dark:hover:text-white'
              )}
            >
              🎯 3-5 High-Impact Actions ({report.actionPlan.length})
            </button>
          </div>

          {/* ── TAB CONTENT: OVERVIEW ────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Positive Behaviors Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Trading Strengths</span>
                </div>
                {report.strengths.map((s, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#101713] border border-emerald-500/30 rounded-2xl p-4 shadow-sm"
                  >
                    <h4 className="text-sm font-bold text-gray-900 dark:text-emerald-300 mb-1">
                      {s.title}
                    </h4>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                      {s.observation}
                    </p>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 space-y-1 text-[11px]">
                      <p className="text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                        📌 Evidence: {s.evidence}
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-300 font-semibold">
                        📈 Impact: {s.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weaknesses & Leaks Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-500 font-extrabold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Capital Leaks & Execution Flaws</span>
                </div>
                {report.weaknesses.map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#1a1113] border border-red-500/30 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-red-300 mb-1">
                        {w.title}
                      </h4>
                      {w.estimatedPnlLeak > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-mono">
                          -${w.estimatedPnlLeak.toFixed(0)} Leak
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                      {w.flaw}
                    </p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-[11px] font-mono text-red-700 dark:text-red-400">
                      📌 Evidence: {w.evidence}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ── TAB CONTENT: STRENGTHS ──────────────────────────────────────── */}
          {activeTab === 'strengths' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.strengths.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#101713] border border-emerald-500/30 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-emerald-200">
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {s.observation}
                  </p>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1.5 text-xs">
                    <p className="text-emerald-700 dark:text-emerald-400 font-mono">
                      <strong>Statistical Proof:</strong> {s.evidence}
                    </p>
                    <p className="text-emerald-600 dark:text-emerald-300 font-semibold">
                      <strong>Performance Boost:</strong> {s.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB CONTENT: WEAKNESSES ─────────────────────────────────────── */}
          {activeTab === 'weaknesses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.weaknesses.map((w, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1a1113] border border-red-500/30 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-red-200">
                        {w.title}
                      </h3>
                    </div>
                    {w.estimatedPnlLeak > 0 && (
                      <span className="text-xs font-black px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full font-mono">
                        -${w.estimatedPnlLeak.toFixed(0)} Leak
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {w.flaw}
                  </p>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs font-mono text-red-700 dark:text-red-400">
                    <strong>Quantified Proof:</strong> {w.evidence}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TAB CONTENT: PATTERNS ───────────────────────────────────────── */}
          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.patterns.map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#12121e] border border-purple-500/30 rounded-2xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                        {p.category.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {p.pattern}
                    </h3>
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-mono bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                      📊 {p.statisticalProof}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-300 font-medium">
                      💡 <strong>Recommendation:</strong> {p.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB CONTENT: ACTION PLAN ────────────────────────────────────── */}
          {activeTab === 'actionPlan' && (
            <div className="space-y-4">
              {report.actionPlan.map((action) => (
                <div
                  key={action.priority}
                  className="bg-white dark:bg-[#12121d] border border-amber-500/30 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 font-black flex items-center justify-center flex-shrink-0 text-base">
                      #{action.priority}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {action.action}
                      </h3>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {action.rationale}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-mono pt-1">
                        📌 Evidence: {action.dataSupport}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 text-center">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                      Target Metric
                    </p>
                    <p className="text-xs font-mono font-bold text-gray-900 dark:text-white mt-0.5">
                      {action.targetMetric}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      ) : null}

      {/* ── INTERACTIVE AI COACH CHATBOX ─────────────────────────────────────── */}
      <div className="pt-4">
        <CoachChatBox />
      </div>
    </div>
  );
}
