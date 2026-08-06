import { getAccounts } from '@/lib/db';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { CoachDashboard } from '@/components/coach/CoachDashboard';

export const dynamic = 'force-dynamic';

export default async function CoachPage() {
  const supabase = await createSupabaseServerClient();
  const accounts = await getAccounts(supabase);

  return (
    <div className="p-6 max-w-full">
      <CoachDashboard accounts={accounts} />
    </div>
  );
}
