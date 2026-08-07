import { getTrades, getObservations } from '@/lib/db';
import { CalendarView } from '@/components/trades/CalendarView';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const [trades, observations] = await Promise.all([getTrades(), getObservations()]);
  return (
    <div className="px-3 py-4 sm:p-6 max-w-full">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-black text-slate-900 dark:text-[#e8e8e8]">Calendar</h1>
        <p className="text-sm text-slate-500 dark:text-[#4a4a4a] mt-0.5">
          Trade history and chart observations by day
        </p>
      </div>
      <CalendarView trades={trades} observations={observations} />
    </div>
  );
}
