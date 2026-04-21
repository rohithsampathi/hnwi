import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ exists: false }, { status: 200 });
}
