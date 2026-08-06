import { getAccounts, getConfluenceTags } from '@/lib/db';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SettingsDashboard } from '@/components/settings/SettingsDashboard';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const accounts = await getAccounts(supabase);
  const tags = await getConfluenceTags(supabase);

  return (
    <div className="p-5 sm:p-6 max-w-full">
      <SettingsDashboard user={user} accounts={accounts} tags={tags} />
    </div>
  );
}
