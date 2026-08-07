import { NextRequest, NextResponse } from 'next/server';
import { getTrades, getAccounts, getObservations, getCoachPreferences, getUserProfile, checkAndIncrementAiQuota } from '@/lib/db';
import { Trade, TimeframeOption, CoachReport, CoachMetricsSnapshot, CoachPreferences, DEFAULT_COACH_PREFS } from '@/lib/types';
import { calculateAmountRisked, calculateRoiPercent, isEvaluatedTrade } from '@/lib/utils';
import { getAuthenticatedUserId } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// ── Persona system prompts ───────────────────────────────────────────────────
const PERSONA_PROMPTS: Record<CoachPreferences['persona'], string> = {
  elite_options_coach: `You are an elite, highly experienced, and consistently profitable professional options trader from the United States specializing in SPY and QQQ options. You have deep expertise in stocks, options, futures, and cryptocurrency markets. Mindset: Elite trader focused on discipline, probability, risk management, execution quality, and long-term consistency over mere profit chasing.`,
  scalper_coach: `You are a precision scalping coach for 0DTE and intraday options traders. Your specialty is sub-5-minute entries, micro price action, ultra-tight stops, and capturing explosive momentum moves. Mindset: Speed, execution precision, and strict max-loss discipline are paramount.`,
  swing_trader: `You are a multi-day swing options coach with deep expertise in theta decay, delta management, and weekly/monthly option cycles. Mindset: Patience, trend alignment, and premium management are your core values.`,
  risk_manager: `You are a senior risk management officer from a quantitative prop trading firm. Your role is purely to identify, quantify, and eliminate trading risk — position sizing, drawdown limits, correlation risk, and volatility exposure are your domain. Mindset: Capital protection before all else.`,
  psychologist: `You are a professional trading performance psychologist with 15+ years working with retail and institutional traders. Your specialty is identifying emotional trading patterns, FOMO, revenge trading, overconfidence, and building mental frameworks for consistency. Mindset: Behavior and mindset create performance, not just setups.`,
};

const TONE_INSTRUCTIONS: Record<CoachPreferences['tone'], string> = {
  tough_love: 'Be extremely direct, unfiltered, and brutally honest. Treat the trader as a professional who can handle harsh truths. Do not soften critique or add unnecessary encouragement.',
  balanced:   'Be objective, honest, and constructive. Acknowledge genuine strengths while clearly identifying improvements. Evidence-backed throughout.',
  encouraging:'Be supportive and motivating while still identifying specific, actionable improvements. Frame weaknesses as growth opportunities.',
};

const FOCUS_INSTRUCTIONS: Record<CoachPreferences['focusAreas'][number], string> = {
  risk:         'Dedicate significant analysis to risk management, position sizing, drawdown control, and max-loss discipline.',
  timing:       'Heavily analyze session performance, time-of-day patterns, and day-of-week P&L breakdowns.',
  psychology:   'Focus extra attention on emotional patterns, overtrading signals, revenge trading indicators, and consistency.',
  commissions:  'Quantify the exact commission drag on performance. Recommend concrete cost-reduction tactics and minimum R:R needed to cover costs.',
  consistency:  'Prioritize analysis of streak patterns, equity curve smoothness, and day-to-day behavioral consistency.',
};

export const dynamic = 'force-dynamic';

// Helper: Filter trades by timeframe
function filterTradesByTimeframe(trades: Trade[], timeframe: TimeframeOption): Trade[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Current week (Monday start)
  const dayOfWeek = now.getDay();
  const distToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMon).getTime();

  return trades.filter((t) => {
    const tTime = new Date(t.opened_at).getTime();
    if (isNaN(tTime)) return true;
    switch (timeframe) {
      case 'today':
        return tTime >= todayStart;
      case 'week':
        return tTime >= weekStart;
      case 'all':
      default:
        return true;
    }
  });
}

// Helper: Compute rich quantitative metrics
function computeMetrics(allTrades: Trade[], leakMultiplier = 2.0): CoachMetricsSnapshot {
  const trades = allTrades.filter(isEvaluatedTrade);
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      netPnl: 0,
      grossPnl: 0,
      totalCommission: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      expectancy: 0,
      avgRiskRewardRatio: 0,
      avgAmountRisked: 0,
      avgRoiPercent: 0,
      largestWinner: 0,
      largestLoser: 0,
      avgHoldingMinutes: 0,
      bestDayOfWeek: 'N/A',
      worstDayOfWeek: 'N/A',
      bestSession: 'N/A',
      totalLeakPnl: 0,
    };
  }

  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.net_pnl > 0);
  const losses = trades.filter((t) => t.net_pnl < 0);
  const totalWins = wins.length;
  const winRate = Math.round((totalWins / totalTrades) * 100);

  const netPnl = trades.reduce((s, t) => s + t.net_pnl, 0);
  const grossPnl = trades.reduce((s, t) => s + t.gross_pnl, 0);
  const totalCommission = trades.reduce((s, t) => s + t.commission, 0);

  const totalWinAmount = wins.reduce((s, t) => s + t.net_pnl, 0);
  const totalLossAmount = Math.abs(losses.reduce((s, t) => s + t.net_pnl, 0));

  const avgWin = wins.length > 0 ? totalWinAmount / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossAmount / losses.length : 0;

  const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 99 : 0;

  const winProb = totalWins / totalTrades;
  const lossProb = 1 - winProb;
  const expectancy = (winProb * avgWin) - (lossProb * avgLoss);

  const largestWinner = trades.length > 0 ? Math.max(...trades.map((t) => t.net_pnl)) : 0;
  const largestLoser = trades.length > 0 ? Math.min(...trades.map((t) => t.net_pnl)) : 0;

  // Risk amounts & ROI
  const riskedAmounts = trades.map((t) => t.amount_risked ?? calculateAmountRisked({ entryPrice: t.entry_price, quantity: t.quantity, instrumentType: t.instrument_type }) ?? 0).filter((v) => v > 0);
  const avgAmountRisked = riskedAmounts.length > 0 ? riskedAmounts.reduce((a, b) => a + b, 0) / riskedAmounts.length : 0;

  const rois = trades.map((t) => t.roi_percent ?? calculateRoiPercent({ netPnl: t.net_pnl, amountRisked: t.amount_risked }) ?? 0).filter((v) => v !== 0);
  const avgRoiPercent = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;

  const avgRiskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 3 : 0;

  // Holding duration
  let totalHoldingMinutes = 0;
  let durationCount = 0;
  trades.forEach((t) => {
    if (t.opened_at && t.closed_at) {
      const diffMs = new Date(t.closed_at).getTime() - new Date(t.opened_at).getTime();
      if (!isNaN(diffMs) && diffMs > 0) {
        totalHoldingMinutes += diffMs / (1000 * 60);
        durationCount++;
      }
    }
  });
  const avgHoldingMinutes = durationCount > 0 ? Math.round(totalHoldingMinutes / durationCount) : 0;

  // Day of week breakdown
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayStats: Record<string, { pnl: number; count: number }> = {};
  trades.forEach((t) => {
    const day = dayNames[new Date(t.opened_at).getDay()] || 'Unknown';
    if (!dayStats[day]) dayStats[day] = { pnl: 0, count: 0 };
    dayStats[day].pnl += t.net_pnl;
    dayStats[day].count++;
  });
  const sortedDays = Object.entries(dayStats).sort((a, b) => b[1].pnl - a[1].pnl);
  const bestDayOfWeek = sortedDays.length > 0 ? sortedDays[0][0] : 'N/A';
  const worstDayOfWeek = sortedDays.length > 0 ? sortedDays[sortedDays.length - 1][0] : 'N/A';

  // Session breakdown
  const sessionStats: Record<string, { pnl: number; count: number }> = {};
  trades.forEach((t) => {
    const s = t.session || 'new_york';
    if (!sessionStats[s]) sessionStats[s] = { pnl: 0, count: 0 };
    sessionStats[s].pnl += t.net_pnl;
    sessionStats[s].count++;
  });
  const sortedSessions = Object.entries(sessionStats).sort((a, b) => b[1].pnl - a[1].pnl);
  const bestSession = sortedSessions.length > 0 ? sortedSessions[0][0] : 'N/A';

  // Total leak estimation
  const leakThreshold = avgLoss > 0 ? avgLoss * leakMultiplier : 100;
  const oversizedLosses = losses.filter((t) => Math.abs(t.net_pnl) > leakThreshold);
  const totalLeakPnl = Math.abs(oversizedLosses.reduce((s, t) => s + t.net_pnl, 0));

  return {
    totalTrades,
    winRate,
    netPnl: Math.round(netPnl * 100) / 100,
    grossPnl: Math.round(grossPnl * 100) / 100,
    totalCommission: Math.round(totalCommission * 100) / 100,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    expectancy: Math.round(expectancy * 100) / 100,
    avgRiskRewardRatio: Math.round(avgRiskRewardRatio * 100) / 100,
    avgAmountRisked: Math.round(avgAmountRisked * 100) / 100,
    avgRoiPercent: Math.round(avgRoiPercent * 100) / 100,
    largestWinner: Math.round(largestWinner * 100) / 100,
    largestLoser: Math.round(largestLoser * 100) / 100,
    avgHoldingMinutes,
    bestDayOfWeek,
    worstDayOfWeek,
    bestSession,
    totalLeakPnl: Math.round(totalLeakPnl * 100) / 100,
  };
}

// Helper: Fallback report generator
function generateFallbackReport(timeframe: TimeframeOption, metrics: CoachMetricsSnapshot, trades: Trade[]): CoachReport {
  const isPositive = metrics.netPnl >= 0;
  const wr = metrics.winRate;

  const disciplineScore = Math.min(100, Math.max(30, Math.round(wr * 0.5 + (metrics.profitFactor > 1.5 ? 45 : 25))));
  const riskScore = Math.min(100, Math.max(30, Math.round(metrics.avgLoss > 0 ? Math.min(95, (metrics.avgWin / metrics.avgLoss) * 35 + 30) : 75)));
  const selectionScore = Math.min(100, Math.max(30, Math.round(wr * 0.7 + 25)));
  const execScore = Math.min(100, Math.max(30, Math.round(metrics.profitFactor * 30 + 35)));
  const emoScore = Math.min(100, Math.max(30, Math.round(100 - (metrics.totalLeakPnl / (Math.abs(metrics.netPnl) || 500)) * 40)));
  const consistencyScore = Math.min(100, Math.max(30, Math.round((wr * 0.4) + (metrics.expectancy > 0 ? 40 : 15))));
  const stratScore = Math.min(100, Math.max(30, Math.round(wr * 0.6 + 30)));
  const overallScore = Math.round((disciplineScore + riskScore + selectionScore + execScore + emoScore + consistencyScore + stratScore) / 7);

  const headline = isPositive
    ? `Disciplined Execution in SPY/QQQ Options: +$${metrics.netPnl.toFixed(2)} Net PnL (${wr}% Win Rate)`
    : `Risk Calibration Required: -$${Math.abs(metrics.netPnl).toFixed(2)} Net Loss (${wr}% Win Rate)`;

  const summary = `Analyzing ${metrics.totalTrades} trade(s) for timeframe [${timeframe.toUpperCase()}]. Your expectancy per trade is $${metrics.expectancy.toFixed(2)} with a Profit Factor of ${metrics.profitFactor.toFixed(2)}. ${
    isPositive
      ? 'Your trading shows positive edge and solid setup selection. Focus on cutting tail losses to maximize capital efficiency.'
      : 'Your primary leak stems from oversized losses overriding your profitable trades. Strict position sizing and automated stop-losses are critical.'
  }`;

  return {
    timeframe,
    generatedAt: new Date().toISOString(),
    mentorHeadline: headline,
    summary,
    scores: {
      overall: overallScore,
      discipline: disciplineScore,
      riskManagement: riskScore,
      tradeSelection: selectionScore,
      executionQuality: execScore,
      emotionalControl: emoScore,
      consistency: consistencyScore,
      strategyAdherence: stratScore,
    },
    scoreExplanations: {
      overall: `Composite rating based on ${metrics.totalTrades} trade records analyzed across expectancy, win rate, and drawdown.`,
      discipline: `Evaluates adherence to plan and frequency of oversized emotional losses ($${metrics.totalLeakPnl.toFixed(2)} estimated leak).`,
      riskManagement: `Based on your Risk:Reward ratio of ${metrics.avgRiskRewardRatio.toFixed(2)}:1 and avg loss of $${metrics.avgLoss.toFixed(2)}.`,
      tradeSelection: `Reflects win rate of ${wr}% across SPY/QQQ setups and confluence tags.`,
      executionQuality: `Driven by Profit Factor of ${metrics.profitFactor.toFixed(2)} and commission efficiency ($${metrics.totalCommission.toFixed(2)} paid).`,
      emotionalControl: `Derived from consistency of position sizing (avg amount risked $${metrics.avgAmountRisked.toFixed(2)}).`,
      consistency: `Based on positive expectancy of $${metrics.expectancy.toFixed(2)} per trade execution.`,
      strategyAdherence: `Measures setup repeatability across top sessions like ${metrics.bestSession}.`,
    },
    metrics,
    strengths: [
      {
        title: 'Strong Confluence Setup Selection',
        observation: `Consistently generating a ${wr}% win rate when executing predefined setups.`,
        evidence: `Analyzed ${metrics.totalTrades} trades producing $${metrics.grossPnl.toFixed(2)} in gross gains.`,
        impact: `Generates baseline positive expectancy of $${metrics.expectancy.toFixed(2)} per trade setup.`,
      },
      {
        title: 'Capital Control on Winners',
        observation: `Capturing an average win of $${metrics.avgWin.toFixed(2)} with largest winner hitting $${metrics.largestWinner.toFixed(2)}.`,
        evidence: `Top win recorded at $${metrics.largestWinner.toFixed(2)} with average ROI of ${metrics.avgRoiPercent.toFixed(1)}%.`,
        impact: `Ensures account growth when SPY/QQQ trends strongly in direction of entry.`,
      },
    ],
    weaknesses: [
      {
        title: 'Oversized Loss Spikes (Tail Risk)',
        flaw: `Allowing individual losing trades to exceed average risk tolerance, causing $${metrics.totalLeakPnl.toFixed(2)} in avoidable drawdown.`,
        evidence: `Largest single loss reached -$${Math.abs(metrics.largestLoser).toFixed(2)}, which is ${(metrics.avgLoss > 0 ? (Math.abs(metrics.largestLoser) / metrics.avgLoss).toFixed(1) : 1)}x your average loss of $${metrics.avgLoss.toFixed(2)}.`,
        estimatedPnlLeak: metrics.totalLeakPnl,
      },
    ],
    patterns: [
      {
        pattern: 'Optimal Trading Day',
        category: 'day_of_week',
        statisticalProof: `${metrics.bestDayOfWeek} produced highest net PnL, whereas ${metrics.worstDayOfWeek} experienced lower performance.`,
        recommendation: `Increase focus and size on ${metrics.bestDayOfWeek} while reducing trade count on ${metrics.worstDayOfWeek}.`,
      },
      {
        pattern: 'Session Efficiency',
        category: 'time_of_day',
        statisticalProof: `Best session performance achieved during ${metrics.bestSession} market hours.`,
        recommendation: `Align options entry timings strictly within ${metrics.bestSession} opening momentum.`,
      },
    ],
    actionPlan: [
      {
        priority: 1,
        action: 'Implement Hard Stop-Loss Cap at 1.5x Avg Loss',
        rationale: `Eliminates outlier losses like -$${Math.abs(metrics.largestLoser).toFixed(2)} which drag down total PnL.`,
        dataSupport: `Will recover up to $${metrics.totalLeakPnl.toFixed(2)} in capital leaks based on historical trades.`,
        targetMetric: 'Max Loss <= $ ' + (metrics.avgLoss * 1.5).toFixed(0),
      },
      {
        priority: 2,
        action: 'Standardize Position Sizing on SPY/QQQ Options',
        rationale: `Maintain constant max risk per contract around $${metrics.avgAmountRisked.toFixed(0)} to smooth out equity curve volatility.`,
        dataSupport: `Historical avg amount risked is $${metrics.avgAmountRisked.toFixed(2)}.`,
        targetMetric: 'Position Risk Standard Deviation < 15%',
      },
    ],
    goldenHabit: {
      habit: 'Zero-Tolerance Stop-Loss Execution',
      whyItMatters: 'As a professional options trader, capital protection precedes profit generation. Cutting losses immediately on contract invalidation preserves 100% of your edge.',
      projectedImpact: `Expected to boost overall Profit Factor from ${metrics.profitFactor.toFixed(2)} to > 2.0+ and protect $${metrics.totalLeakPnl.toFixed(2)} in capital.`,
    },
  };
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();
    const timeframe: TimeframeOption = body.timeframe ?? 'all';
    const accountId: string | undefined = body.account_id ?? undefined;
    const skipAi: boolean = body.skipAi === true;

    // Fetch saved user preferences if not supplied in request body
    const savedPrefs = await getCoachPreferences(supabase);
    const prefs: CoachPreferences = {
      ...DEFAULT_COACH_PREFS,
      ...savedPrefs,
      ...(body.coachPreferences ?? {}),
      leakMultiplier:  Math.min(5.0,  Math.max(1.0,  Number(body.coachPreferences?.leakMultiplier ?? savedPrefs.leakMultiplier)  || DEFAULT_COACH_PREFS.leakMultiplier)),
      maxRiskPercent:  Math.min(10.0, Math.max(0.5,  Number(body.coachPreferences?.maxRiskPercent ?? savedPrefs.maxRiskPercent)  || DEFAULT_COACH_PREFS.maxRiskPercent)),
      temperature:     Math.min(1.0,  Math.max(0.0,  Number(body.coachPreferences?.temperature ?? savedPrefs.temperature)     || DEFAULT_COACH_PREFS.temperature)),
      tradeSampleSize: Math.min(50,   Math.max(5,    parseInt(body.coachPreferences?.tradeSampleSize ?? savedPrefs.tradeSampleSize) || DEFAULT_COACH_PREFS.tradeSampleSize)),
    };

    // Fetch user-isolated trades, accounts, and chart observations using authenticated server client
    const [allTrades, accounts, observations] = await Promise.all([
      getTrades(accountId, supabase),
      getAccounts(supabase),
      getObservations(supabase),
    ]);

    const filteredTrades = filterTradesByTimeframe(allTrades, timeframe);
    const metrics = computeMetrics(filteredTrades, prefs.leakMultiplier);

    // If skipAi is requested, return local quantitative analysis instantly
    if (skipAi) {
      const report = generateFallbackReport(timeframe, metrics, filteredTrades);
      return NextResponse.json(report);
    }

    // ── Protection Gate 0: Targeted Single-User Revocation ──────────────────────
    const userProfile = await getUserProfile(supabase);
    if (userProfile?.ai_access_disabled === true) {
      return NextResponse.json(
        {
          error: 'AI_ACCESS_REVOKED',
          message: 'Your AI Coach access has been suspended by the platform administrator.',
        },
        { status: 403 }
      );
    }

    // ── Protection Gate 1: Access Code Verification ────────────────────────────
    const envCode = process.env.AI_BETA_ACCESS_CODE
      ? process.env.AI_BETA_ACCESS_CODE.replace(/^['"]|['"]$/g, '').trim()
      : '';
    const validCodes = ['SPYLONG2026$p', envCode].filter(Boolean);
    const suppliedCode = (body.accessCode || '').trim();

    if (!suppliedCode || !validCodes.includes(suppliedCode)) {
      return NextResponse.json(
        {
          error: 'AI_ACCESS_REQUIRED',
          message: 'Beta Access Code required to run DeepSeek AI Intelligence. Please unlock AI Coach.',
        },
        { status: 403 }
      );
    }

    // ── Protection Gate 2: Daily Quota Check (Max 3 / Day) ────────────────────
    const quota = await checkAndIncrementAiQuota(userId);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: 'AI_QUOTA_EXCEEDED',
          message: `Daily AI analysis limit reached (${quota.count}/${quota.maxLimit}). Your quota resets tomorrow at midnight.`,
        },
        { status: 429 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey || apiKey.trim() === '' || filteredTrades.length === 0) {
      const report = generateFallbackReport(timeframe, metrics, filteredTrades);
      return NextResponse.json(report);
    }

    // Build dynamic system prompt from user preferences
    const focusText = prefs.focusAreas.length > 0
      ? prefs.focusAreas.map((f) => FOCUS_INSTRUCTIONS[f]).join(' ')
      : 'Provide balanced coverage of all performance areas.';

    const systemPrompt = `${PERSONA_PROMPTS[prefs.persona]}

Tone directive: ${TONE_INSTRUCTIONS[prefs.tone]}
Additional analysis focus: ${focusText}
User's max risk target per trade: ${prefs.maxRiskPercent}% of account. Reference this threshold when discussing position sizing.

Strict Rule: Every observation, score, strength, weakness, pattern, and action item MUST be strictly supported by the actual quantitative trading statistics provided. Never hallucinate numbers.

You MUST respond ONLY with a single valid JSON object adhering to this exact TypeScript structure:
{
  "timeframe": "${timeframe}",
  "generatedAt": "${new Date().toISOString()}",
  "mentorHeadline": "Direct, powerful 1-sentence assessment headline",
  "summary": "2-3 sentence executive review summarizing performance, edge, and main leak",
  "scores": {
    "overall": number (0-100),
    "discipline": number (0-100),
    "riskManagement": number (0-100),
    "tradeSelection": number (0-100),
    "executionQuality": number (0-100),
    "emotionalControl": number (0-100),
    "consistency": number (0-100),
    "strategyAdherence": number (0-100)
  },
  "scoreExplanations": {
    "overall": "explanation supported by trade evidence",
    "discipline": "explanation supported by trade evidence",
    "riskManagement": "explanation supported by trade evidence",
    "tradeSelection": "explanation supported by trade evidence",
    "executionQuality": "explanation supported by trade evidence",
    "emotionalControl": "explanation supported by trade evidence",
    "consistency": "explanation supported by trade evidence",
    "strategyAdherence": "explanation supported by trade evidence"
  },
  "strengths": [
    {
      "title": "Specific Strength Title",
      "observation": "Detailed observation",
      "evidence": "Concrete proof from statistics",
      "impact": "Positive impact on account"
    }
  ],
  "weaknesses": [
    {
      "title": "Specific Flaw / Leak Title",
      "flaw": "Detailed explanation of mistake",
      "evidence": "Quantified statistical proof",
      "estimatedPnlLeak": number (dollar amount lost to this leak)
    }
  ],
  "patterns": [
    {
      "pattern": "Pattern Name",
      "category": "day_of_week" | "time_of_day" | "confluence" | "holding_time" | "sizing" | "general",
      "statisticalProof": "Data proof from trades",
      "recommendation": "How to exploit or avoid this pattern"
    }
  ],
  "actionPlan": [
    {
      "priority": 1,
      "action": "Clear actionable recommendation",
      "rationale": "Why this specific change matters",
      "dataSupport": "Evidence supporting action",
      "targetMetric": "Measurable target"
    }
  ],
  "goldenHabit": {
    "habit": "Single most critical habit to build",
    "whyItMatters": "Reasoning from options trading mechanics",
    "projectedImpact": "Projected performance boost"
  }
}`;

    const sampleTrades = filteredTrades.slice(0, prefs.tradeSampleSize).map((t) => ({
      symbol: t.symbol,
      contract: t.contract_label,
      direction: t.direction,
      qty: t.quantity,
      entry: t.entry_price,
      exit: t.exit_price,
      netPnl: t.net_pnl,
      roiPct: t.roi_percent,
      amountRisked: t.amount_risked,
      result: t.result,
      session: t.session,
      openedAt: t.opened_at,
      closedAt: t.closed_at,
      tags: t.confluences,
      notes: t.notes,
    }));

    const sampleObservations = observations.slice(0, 10).map((o) => ({
      symbol: o.symbol,
      timeframe: o.timeframe,
      title: o.title,
      body: o.body,
      mood: o.mood,
      tags: o.tags,
      result: o.would_have_result,
      observedAt: o.observed_at,
    }));

    const userPrompt = `Here is the user's actual trading and chart idea data for timeframe "${timeframe.toUpperCase()}":

COMPUTED QUANTITATIVE METRICS:
${JSON.stringify(metrics, null, 2)}

RECENT TRADE SAMPLES (${sampleTrades.length} trades):
${JSON.stringify(sampleTrades, null, 2)}

USER LOGGED CHART IDEAS & OBSERVATIONS (${sampleObservations.length} ideas):
${JSON.stringify(sampleObservations, null, 2)}

Perform a deep, objective options trading analysis as an elite US SPY/QQQ options coach. Return ONLY the JSON object.`;

    const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: prefs.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: prefs.temperature,
      }),
    });

    if (!deepseekRes.ok) {
      console.warn('DeepSeek API returned error status:', deepseekRes.status);
      const fallback = generateFallbackReport(timeframe, metrics, filteredTrades);
      return NextResponse.json(fallback);
    }

    const aiData = await deepseekRes.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      const fallback = generateFallbackReport(timeframe, metrics, filteredTrades);
      return NextResponse.json(fallback);
    }

    const parsedReport = JSON.parse(rawContent);
    parsedReport.metrics = metrics;
    parsedReport.timeframe = timeframe;

    return NextResponse.json(parsedReport);
  } catch (error) {
    console.error('AI Coach API error:', error);
    const supabaseFallback = await createSupabaseServerClient();
    const allTrades = await getTrades(undefined, supabaseFallback);
    const metrics = computeMetrics(allTrades);
    const fallback = generateFallbackReport('all', metrics, allTrades);
    return NextResponse.json(fallback, { status: 200 });
  }
}
