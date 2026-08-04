import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse(
    'self.addEventListener("install", () => self.skipWaiting()); self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));',
    {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
