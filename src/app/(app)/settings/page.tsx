import {
  getAccounts,
  getConfluenceTags,
  getCoachPreferences,
  getUserProfile,
  getSecurityAuditLogs,
} from '@/lib/db';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SettingsDashboard } from '@/components/settings/SettingsDashboard';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [accounts, tags, coachPrefs, userProfile, securityLogs] = await Promise.all([
    getAccounts(supabase),
    getConfluenceTags(supabase),
    getCoachPreferences(supabase),
    getUserProfile(supabase),
    getSecurityAuditLogs(supabase),
  ]);

  return (
    <div className="px-3 py-4 sm:p-5 md:p-6 max-w-full">
      <SettingsDashboard
        user={user}
        accounts={accounts}
        tags={tags}
        initialCoachPrefs={coachPrefs}
        initialUserProfile={userProfile}
        initialSecurityLogs={securityLogs}
      />
    </div>
  );
}


