// app/api/auth/session/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth-actions'  // Import your verify function

export async function GET() {
  try {
    const sessionCookie = cookies().get('session')
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null })
    }

    const user = await verifyToken(sessionCookie.value)
    
    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ user: null })
  }
}