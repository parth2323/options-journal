import { getRoutine } from '@/lib/db';
import { RoutineDashboard } from '@/components/routine/RoutineDashboard';

export const dynamic = 'force-dynamic';

export default async function RoutinePage() {
  const routine = await getRoutine();

  return (
    <div className="p-6 max-w-full">
      <RoutineDashboard initialRoutine={routine} />
    </div>
  );
}
