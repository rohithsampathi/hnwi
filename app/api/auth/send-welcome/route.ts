import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Not implemented in local build' }, { status: 501 });
}
