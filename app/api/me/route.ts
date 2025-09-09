// app/api/me/route.ts
import { NextResponse } from 'next/server'
import { getAuthUserLite } from '@/lib/auth-server'

export const dynamic = 'force-dynamic' // extra bälte och hängslen

export async function GET() {
  const user = await getAuthUserLite()

  const headers = {
    'Cache-Control': 'no-store',
    Vary: 'Cookie', // svar beror på cookies
  }

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401, headers })
  }

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { headers })
}
