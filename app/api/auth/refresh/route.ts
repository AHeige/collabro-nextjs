// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

import { signAccessJwt } from '@/lib/jwt'
import { sha256 } from '@/lib/tokens'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const cookieStore = await cookies()
  const rt = cookieStore.get('rt')?.value
  if (!rt) return NextResponse.json({ error: 'No refresh' }, { status: 401 })

  const token = await prisma.refreshToken.findUnique({ where: { hashedToken: sha256(rt) } })
  if (!token || token.revoked) {
    const res = NextResponse.json({ error: 'Invalid' }, { status: 401 })
    const clear = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge: 0 }
    res.cookies.set('auth_token', '', clear)
    res.cookies.set('rt', '', clear)
    return res
  }

  // (enkel variant) rotera inte refresh i första versionen
  const at = signAccessJwt(token.userId)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('auth_token', at, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 15 })
  res.headers.set('Cache-Control', 'no-store')
  return res
}
