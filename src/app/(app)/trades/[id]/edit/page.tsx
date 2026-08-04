import { getTrade, getAccounts, getConfluenceTags } from '@/lib/db';
import { TradeForm } from '@/components/trades/TradeForm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditTradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = await getTrade(id);
  if (!trade) notFound();

  const accounts = await getAccounts();
  const tags = await getConfluenceTags();

  return (
    <div className="px-5 py-5 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/trades"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:text-[#737373] dark:hover:text-indigo-400 font-semibold mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Trades
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-[#e8e8e8] tracking-tight">Edit Trade</h1>
          <p className="text-xs text-slate-500 dark:text-[#737373] mt-0.5">{trade.symbol} {trade.contract_label}</p>
        </div>
      </div>
      <div className="bg-white border border-slate-200/80 shadow-sm dark:bg-[#0a0a0f] dark:border-[#1a1a28] rounded-2xl p-6">
        <TradeForm accounts={accounts} tags={tags} existing={trade} />
      </div>
    </div>
  );
}
