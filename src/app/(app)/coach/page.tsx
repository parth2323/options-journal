import { getAccounts } from '@/lib/db';
import { CoachDashboard } from '@/components/coach/CoachDashboard';

export const dynamic = 'force-dynamic';

export default async function CoachPage() {
  const accounts = await getAccounts();

  return (
    <div className="p-6 max-w-full">
      <CoachDashboard accounts={accounts} />
    </div>
  );
}
