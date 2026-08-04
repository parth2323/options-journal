import { NextRequest, NextResponse } from 'next/server';
import { getAccounts, createAccount, getAccountStats } from '@/lib/db';

export async function GET() {
  const accounts = await getAccounts();
  const stats = await getAccountStats();
  return NextResponse.json({ accounts, stats });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const account = await createAccount({
    user_id: 'local',
    name: body.name,
    account_type: body.account_type,
    initial_balance: Number(body.initial_balance) || 0,
    goal: Number(body.goal) || 0,
  });
  return NextResponse.json(account, { status: 201 });
}
