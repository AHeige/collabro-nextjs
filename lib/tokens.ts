// tokens.ts
import crypto from 'crypto'
import { cookies } from 'next/headers'

import { signAccessJwt } from './jwt'
import { prisma } from './prisma'

export function sha256(s: string) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex')
}

export async function issueTokens(userId: string) {
  const at = signAccessJwt(userId) // 15m
  const rawRt = crypto.randomBytes(32).toString('hex') // hög entropi
  const hashed = sha256(rawRt)

  await prisma.refreshToken.create({ data: { userId, hashedToken: hashed } })

  const cookieStore = await cookies()
  cookieStore.set('auth_token', at, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 15 })
  cookieStore.set('rt', rawRt, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
}
