// app/api/me/route.ts
import { NextResponse } from 'next/server'
import { getAuthUserLite } from '@/lib/auth-server'
export async function GET() {
  const user = await getAuthUserLite()
  return NextResponse.json({ user }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
}
