import { getObservations } from '@/lib/db';
import { IdeasPage } from '@/components/observations/IdeasPage';

export const dynamic = 'force-dynamic';

export default async function IdeasRoute() {
  const observations = await getObservations();
  return <IdeasPage initialObservations={observations} />;
}
