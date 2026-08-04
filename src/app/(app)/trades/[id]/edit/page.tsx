import { getTrade, getAccounts, getConfluenceTags } from '@/lib/db';
import { TradeForm } from '@/components/trades/TradeForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditTradePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = await getTrade(id);
  if (!trade) notFound();

  const accounts = await getAccounts();
  const tags = await getConfluenceTags();

  return (
    <div className="px-5 py-5 max-w-5xl mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[#e8e8e8] tracking-tight">Edit Trade</h1>
        <p className="text-[12px] text-[#3a3a3a] mt-0.5">{trade.symbol} {trade.contract_label}</p>
      </div>
      <div className="bg-[#0a0a0f] border border-[#1a1a28] rounded-2xl p-5 shadow-2xl shadow-black/60">
        <TradeForm accounts={accounts} tags={tags} existing={trade} />
      </div>
    </div>
  );
}
