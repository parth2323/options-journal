import { getAccounts, getAccountStats } from '@/lib/db';
import { AccountCard } from '@/components/dashboard/AccountCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const accounts = await getAccounts();
  const stats = await getAccountStats(undefined, accounts);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#e8e8e8]">Accounts</h1>
          <p className="text-sm text-[#4a4a4a] mt-0.5">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/settings" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          Manage in Settings →
        </Link>
      </div>

      {stats.length === 0 ? (
        <div className="bg-[#202020] border border-dashed border-[#2a2a2a] rounded-xl p-12 text-center">
          <p className="text-sm text-[#4a4a4a]">No accounts yet.</p>
          <Link href="/settings" className="text-xs text-indigo-400 hover:underline mt-1 inline-block">
            Create your first account →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((s) => (
            <AccountCard key={s.account_id} stats={s} />
          ))}
        </div>
      )}
    </div>
  );
}
