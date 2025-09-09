// app/api/auth/signout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { sha256 } from '@/lib/tokens'

export async function POST() {
  const cookieStore = await cookies()
  const rt = cookieStore.get('rt')?.value

  if (rt) {
    await prisma.refreshToken
      .updateMany({
        where: { hashedToken: sha256(rt), revoked: false },
        data: { revoked: true },
      })
      .catch(() => {})
  }

  const res = NextResponse.json({ ok: true })
  const clear = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge: 0 }
  res.cookies.set('auth_token', '', clear)
  res.cookies.set('rt', '', clear)
  res.headers.set('Cache-Control', 'no-store')
  return res
}
