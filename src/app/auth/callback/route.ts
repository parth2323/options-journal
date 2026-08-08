import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Auth callback handler for OAuth/magic-link flows.
 *
 * Security: The `next` query param is validated to be a relative path only.
 * An attacker cannot inject `next=//evil.com` or `next=https://evil.com`
 * to redirect victims to an external domain (open redirect prevention).
 */
function sanitizeRedirectPath(next: string | null): string {
  if (!next || next === '/') return '/dashboard';

  // Only allow relative paths — must start with exactly one slash and NOT be //domain or https://
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('://')) {
    return '/dashboard';
  }

  // Reject null bytes, backslashes, and other control chars
  if (/[\x00\\\r\n]/.test(next)) {
    return '/dashboard';
  }

  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirectPath(searchParams.get('next'));

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
