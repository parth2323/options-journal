import { getTrades, getAccounts } from '@/lib/db';
import { TradesTable } from '@/components/trades/TradesTable';
import Link from 'next/link';
import { Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TradesPage() {
  const trades = await getTrades();
  const accounts = await getAccounts();

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#e8e8e8]">Trade Journal</h1>
          <p className="text-sm text-[#4a4a4a] mt-0.5">{trades.length} total trades</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/export"
            className="flex items-center gap-2 bg-[#202020] hover:bg-[#252525] border border-[#2a2a2a] text-[#a0a0a0] hover:text-[#e8e8e8] text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
          <Link
            href="/trades/new"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
          >
            + New Trade
          </Link>
        </div>
      </div>

      <TradesTable trades={trades} accounts={accounts} />
    </div>
  );
}
