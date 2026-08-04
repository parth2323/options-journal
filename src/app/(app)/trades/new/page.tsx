import { getAccounts, getConfluenceTags } from '@/lib/db';
import { TradeForm } from '@/components/trades/TradeForm';

export const dynamic = 'force-dynamic';

export default async function NewTradePage() {
  const accounts = await getAccounts();
  const tags = await getConfluenceTags();

  return (
    <div className="px-5 py-5 max-w-5xl mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[#e8e8e8] tracking-tight">New Trade</h1>
        <p className="text-[12px] text-[#3a3a3a] mt-0.5">Log a new options trade</p>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-[#0d0d0d] border border-dashed border-[#2a2a2a] rounded-2xl p-8 text-center">
          <p className="text-sm text-[#4a4a4a]">Create an account first before adding trades.</p>
          <a href="/settings" className="text-xs text-indigo-400 hover:underline mt-1 inline-block">
            Go to Settings →
          </a>
        </div>
      ) : (
        <div className="bg-[#0a0a0f] border border-[#1a1a28] rounded-2xl p-5 shadow-2xl shadow-black/60">
          <TradeForm accounts={accounts} tags={tags} />
        </div>
      )}
    </div>
  );
}
