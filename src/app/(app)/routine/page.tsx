import { getRoutine } from '@/lib/db';
import { RoutineDashboard } from '@/components/routine/RoutineDashboard';

export const dynamic = 'force-dynamic';

export default async function RoutinePage() {
  const routine = await getRoutine();

  return (
    <div className="px-3 py-4 sm:p-6 max-w-full">
      <RoutineDashboard initialRoutine={routine} />
    </div>
  );
}
