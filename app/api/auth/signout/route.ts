// app/api/auth/signout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function sha256(s: string) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex')
}

export async function POST() {
  const jar = await cookies()
  const rt = jar.get('rt')?.value

  if (rt) {
    await prisma.refreshToken
      .updateMany({
        where: { hashedToken: sha256(rt), revoked: false },
        data: { revoked: true },
      })
      .catch(() => {})
  }

  const clear = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge: 0 }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('auth_token', '', clear)
  res.cookies.set('rt', '', clear)
  res.headers.set('Cache-Control', 'no-store')
  return res
}
