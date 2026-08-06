import { createSupabaseServerClient } from './supabase/server';

/**
 * Extracts and verifies the authenticated user ID (auth.uid()) from the current request session cookies.
 * Returns null if the user is unauthenticated or session is invalid.
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch (err) {
    console.error('[auth] Error retrieving user:', err);
    return null;
  }
}
