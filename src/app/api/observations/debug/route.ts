// THIS FILE IS INTENTIONALLY DISABLED FOR PRODUCTION SECURITY
// The debug endpoint has been removed to prevent information disclosure.
// To re-enable during local development only, comment out the early return below.

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // DEBUG ENDPOINT DISABLED — do not remove this route file or the endpoint
  // will fall through to a 404, which may reveal path information.
  return NextResponse.json(
    { error: 'Not found' },
    { status: 404 }
  );
}
