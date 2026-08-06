import { NextRequest, NextResponse } from 'next/server';
import { getTrades, getAccounts, getObservations } from '@/lib/db';
import { getAuthenticatedUserId } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { calculateAmountRisked, calculateRoiPercent, isEvaluatedTrade } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createSupabaseServerClient();

  try {
    const body = await req.json();
    const messages = body.messages || [];
    const lastUserMessage = messages[messages.length - 1]?.content || '';

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
      const systemPrompt = `You are an elite, highly experienced US SPY/QQQ options trading coach. You give direct, quantitative, actionable, and encouraging feedback to traders.
Strict Rule: Base your answers ONLY on the user's actual trading data provided below. Do not invent trades.

LOGGED-IN USER'S EXCLUSIVE TRADING DATA:
${JSON.stringify(metricsContext, null, 2)}`;

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
          temperature: 0.3,
          max_tokens: 600,
        }),
      });

      if (deepseekRes.ok) {
        const aiData = await deepseekRes.json();
        const responseText = aiData.choices?.[0]?.message?.content;
        if (responseText) {
          return NextResponse.json({ response: responseText });
        }
      }
    }

    // Smart algorithmic fallback if API key is not configured
    let fallbackText = `Based on your authenticated trading record (${metricsContext.totalTrades} trade(s), ${metricsContext.winRate} win rate, Net PnL ${metricsContext.netPnl}): `;

    const qLower = lastUserMessage.toLowerCase();
    if (qLower.includes('loss') || qLower.includes('leak') || qLower.includes('worst')) {
      fallbackText += `Your largest single loss reached ${metricsContext.largestLoss}. Your average loss is ${metricsContext.avgLoss}. The key action is setting a hard stop-loss cap at 1.5x average loss ($${(avgLoss * 1.5).toFixed(0)}) to protect your equity curve.`;
    } else if (qLower.includes('win') || qLower.includes('best') || qLower.includes('edge')) {
      fallbackText += `Your average winning trade produces ${metricsContext.avgWin}, with your best win hitting ${metricsContext.largestWin}. You have strong execution when adhering to your pre-defined confluence tags!`;
    } else if (qLower.includes('idea') || qLower.includes('chart') || qLower.includes('observation')) {
      fallbackText += `You have logged ${metricsContext.chartObservationsCount} chart observation(s). Reviewing chart setups before placing live orders reduces impulse trades by up to 40%.`;
    } else {
      fallbackText += `To maximize your edge, maintain consistent contract position sizing (average win: ${metricsContext.avgWin}, average loss: ${metricsContext.avgLoss}). What specific setup or trade would you like to break down next?`;
    }

    return NextResponse.json({ response: fallbackText });
  } catch (err) {
    console.error('[Coach Chat Error]:', err);
    return NextResponse.json({ response: "I'm reviewing your trading history right now. Ask me any question about your risk, win rate, or SPY/QQQ setup selection!" }, { status: 200 });
  }
}
