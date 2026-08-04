import { getAccounts, getConfluenceTags } from '@/lib/db';
import { SettingsClient } from '@/components/dashboard/SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const accounts = await getAccounts();
  const tags = await getConfluenceTags();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#e8e8e8]">Settings</h1>
        <p className="text-sm text-[#4a4a4a] mt-0.5">Manage accounts, tags, and data</p>
      </div>
      <SettingsClient accounts={accounts} tags={tags} />
    </div>
  );
}
