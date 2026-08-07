import { NextRequest, NextResponse } from 'next/server';
import { getTrades, getAccounts, getObservations, getUserProfile } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { calculateAmountRisked, calculateRoiPercent, isEvaluatedTrade } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createSupabaseServerClient();

  try {
    // Protection Gate 0: Targeted Single-User Revocation
    const userProfile = await getUserProfile(supabase);
    if (userProfile?.ai_access_disabled === true) {
      return NextResponse.json(
        { error: 'AI_ACCESS_REVOKED', message: 'Your AI Coach access has been suspended by the platform administrator.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const messages = body.messages || [];
    const lastUserMessage = messages[messages.length - 1]?.content || '';

    // Verify Beta Access Code
    const envCode = process.env.AI_BETA_ACCESS_CODE
      ? process.env.AI_BETA_ACCESS_CODE.replace(/^['"]|['"]$/g, '').trim()
      : '';
    const suppliedCode = (body.accessCode || '').trim();

    if (!envCode || !suppliedCode || suppliedCode !== envCode) {
      return NextResponse.json(
        { error: 'AI_ACCESS_REQUIRED', message: 'Beta Access Code required to chat with AI Coach.' },
        { status: 403 }
      );
    }

    // Fetch user-isolated trades and observations
    const [allTrades, observations] = await Promise.all([
      getTrades(undefined, supabase),
      getObservations(supabase),
    ]);

    const evaluatedTrades = allTrades.filter(isEvaluatedTrade);
    const totalTrades = evaluatedTrades.length;
    const wins = evaluatedTrades.filter((t) => t.net_pnl > 0);
    const losses = evaluatedTrades.filter((t) => t.net_pnl < 0);
    const netPnl = evaluatedTrades.reduce((s, t) => s + t.net_pnl, 0);
    const winRate = totalTrades > 0 ? Math.round((wins.length / totalTrades) * 100) : 0;
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.net_pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.net_pnl, 0)) / losses.length : 0;
    const largestWin = evaluatedTrades.length > 0 ? Math.max(...evaluatedTrades.map((t) => t.net_pnl)) : 0;
    const largestLoss = evaluatedTrades.length > 0 ? Math.min(...evaluatedTrades.map((t) => t.net_pnl)) : 0;

    const metricsContext = {
      totalTrades,
      winRate: `${winRate}%`,
      netPnl: `$${netPnl.toFixed(2)}`,
      avgWin: `$${avgWin.toFixed(2)}`,
      avgLoss: `$${avgLoss.toFixed(2)}`,
      largestWin: `$${largestWin.toFixed(2)}`,
      largestLoss: `$${largestLoss.toFixed(2)}`,
      chartObservationsCount: observations.length,
      recentTrades: evaluatedTrades.slice(0, 10).map((t) => ({
        symbol: t.symbol,
        contract: t.contract_label,
        netPnl: t.net_pnl,
        openedAt: t.opened_at,
        tags: t.confluences,
      })),
      recentChartIdeas: observations.slice(0, 5).map((o) => ({
        symbol: o.symbol,
        title: o.title,
        mood: o.mood,
        result: o.would_have_result,
      })),
    };

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      const systemPrompt = `You are an elite, highly experienced Wall Street Options & Stock Trading Coach, Journal Analyst, and Educational Trading Mentor.
You provide direct, professional, educational, and actionable statistical guidance to traders.

STRICT COMPLIANCE & LEGAL FENCING MANDATE:
1. EDUCATIONAL JOURNALING ONLY: You are an analytical journaling reflection assistant. You are NOT a licensed financial advisor, broker-dealer, or investment analyst.
2. NO INDIVIDUAL FINANCIAL ADVICE: NEVER provide buy/sell recommendations, price targets, or specific investment advice.
3. RISK WARNING: Always remind traders that options and equities carry substantial risk of capital loss. Never guarantee profits, win rates, or future performance.
4. MANDATORY DISCLAIMER: Append a brief disclaimer to market or strategy responses confirming content is strictly for educational journaling.

CAPABILITIES:
1. USER PERFORMANCE ANALYSIS: You have access to the user's live authenticated trading journal data (metrics, win rate, PnL, recent trades). When the user asks about their performance, trades, win rate, or risk, reference their real data accurately.
2. GENERAL MARKET & SECTOR ANALYSIS: When the user asks general market questions (such as sector picks like Energy, Tech, Healthcare, macro outlooks, options strategies like credit spreads, IV crush, delta/gamma risk), provide high-level educational breakdowns with risk disclosure.

USER'S AUTHENTICATED JOURNAL METRICS:
${JSON.stringify(metricsContext, null, 2)}`;

      try {
        const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.slice(-8), // Keep last 8 messages for context
            ],
            temperature: 0.5,
            max_tokens: 800,
          }),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (deepseekRes.ok) {
          const aiData = await deepseekRes.json();
          const responseText = aiData.choices?.[0]?.message?.content;
          if (responseText) {
            return NextResponse.json({ response: responseText });
          }
        } else {
          const errBody = await deepseekRes.text();
          console.error('[DeepSeek API Error]:', deepseekRes.status, errBody);
        }
      } catch (apiErr) {
        console.error('[DeepSeek Fetch Error]:', apiErr);
      }
    }

    // ── Smart Algorithmic Fallback Engine ─────────────────────────────────────
    const qLower = lastUserMessage.toLowerCase();
    let fallbackText = '';

    if (
      qLower.includes('energy') ||
      qLower.includes('sector') ||
      qLower.includes('buy') ||
      qLower.includes('stock') ||
      qLower.includes('share') ||
      qLower.includes('etf')
    ) {
      fallbackText = `In the Energy Sector (XLE), top market leaders include **ExxonMobil (XOM)** and **Chevron (CVX)** for large-cap stability, alongside high-beta E&P leaders like **ConocoPhillips (COP)** and **Devon Energy (DVN)**.

When trading energy equities or options:
1. **Watch Crude Oil (WTI / BRENT)**: Energy stocks move closely with crude futures and OPEC geopolitical catalysts.
2. **Options Volatility**: Implied Volatility (IV) spikes during earnings and OPEC inventory releases.
3. **Journal Context**: Based on your journal record (${metricsContext.totalTrades} trade(s), ${metricsContext.winRate} win rate, Net PnL ${metricsContext.netPnl}), ensure you test your setup on your Chart Observations board before opening live contracts!

*⚠️ Disclaimer: TradeVault is an educational journaling tool. Insights are for informational purposes only and do not constitute financial advice or trade recommendations. Options trading involves high risk.*`;
    } else if (
      qLower.includes('option') ||
      qLower.includes('call') ||
      qLower.includes('put') ||
      qLower.includes('spread') ||
      qLower.includes('iv') ||
      qLower.includes('delta')
    ) {
      fallbackText = `Options trading requires strict risk control and delta alignment:
1. **Calls vs Puts**: Buy calls when expecting upward momentum above key resistance; buy puts when breaking support.
2. **Implied Volatility (IV)**: Avoid buying high-IV contracts right before earnings to prevent IV crush.
3. **Your Risk Standard**: Your current record shows an average win of ${metricsContext.avgWin} and average loss of ${metricsContext.avgLoss}. Keep position sizing capped at 2% of total capital per trade.

*⚠️ Disclaimer: Educational journal breakdown only; not investment advice.*`;
    } else if (qLower.includes('loss') || qLower.includes('leak') || qLower.includes('worst')) {
      fallbackText = `Based on your authenticated trading record:
- **Total Trades**: ${metricsContext.totalTrades}
- **Win Rate**: ${metricsContext.winRate}
- **Largest Single Loss**: ${metricsContext.largestLoss}
- **Average Loss**: ${metricsContext.avgLoss}

To eliminate profit leaks, enforce a hard stop-loss cap at 1.5x average loss ($${(avgLoss * 1.5).toFixed(0)}) to protect your equity curve.`;
    } else if (qLower.includes('win') || qLower.includes('best') || qLower.includes('edge')) {
      fallbackText = `Your performance snapshot:
- **Win Rate**: ${metricsContext.winRate} (${wins.length}W / ${losses.length}L)
- **Net PnL**: ${metricsContext.netPnl}
- **Average Win**: ${metricsContext.avgWin}
- **Largest Win**: ${metricsContext.largestWin}

Your best executions occur when you strictly follow your confluence rules before entering trades!`;
    } else if (qLower.includes('idea') || qLower.includes('chart') || qLower.includes('observation')) {
      fallbackText = `You currently have **${metricsContext.chartObservationsCount} chart observation(s)** logged. Pre-planning setups on your Chart Ideas board before opening live options orders reduces impulse trades by up to 40%.`;
    } else {
      fallbackText = `Based on your authenticated trading record (${metricsContext.totalTrades} trade(s), ${metricsContext.winRate} win rate, Net PnL ${metricsContext.netPnl}):

To maximize your edge:
- **Position Sizing**: Maintain consistent contract sizing (Average win: ${metricsContext.avgWin}, Average loss: ${metricsContext.avgLoss}).
- **Setup Execution**: Log all setup confluences before entry.

What specific ticker, sector, or options setup would you like to break down next?`;
    }

    return NextResponse.json({ response: fallbackText });
  } catch (err) {
    console.error('[Coach Chat Error]:', err);
    return NextResponse.json({ response: "I'm reviewing your trading history and market data right now. Ask me any question about market sectors, options strategies, or your risk management!" }, { status: 200 });
  }
}
