import { getTrades } from '@/lib/db';
import { CalendarView } from '@/components/trades/CalendarView';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const trades = await getTrades();
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#e8e8e8]">Calendar</h1>
        <p className="text-sm text-[#4a4a4a] mt-0.5">Trade history by day</p>
      </div>
      <CalendarView trades={trades} />
    </div>
  );
}
