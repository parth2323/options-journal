import { getAccounts, getConfluenceTags } from '@/lib/db';
import { TradeForm } from '@/components/trades/TradeForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewTradePage() {
  const accounts = await getAccounts();
  const tags = await getConfluenceTags();

  return (
    <div className="px-5 py-5 max-w-5xl mx-auto space-y-4">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/trades"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:text-[#737373] dark:hover:text-indigo-400 font-semibold mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Trades
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-[#e8e8e8] tracking-tight">New Trade Log</h1>
          <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5">Record a new options trade with full precision metrics</p>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 dark:bg-[#0d0d0d] dark:border-[#2a2a2a] rounded-2xl p-8 text-center shadow-xs">
          <p className="text-sm text-slate-600 dark:text-[#4a4a4a]">Create an account first before adding trades.</p>
          <Link href="/settings" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block font-semibold">
            Go to Settings →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#0a0a0f] dark:border-[#1a1a28] rounded-2xl p-6">
          <TradeForm accounts={accounts} tags={tags} />
        </div>
      )}
    </div>
  );
}
