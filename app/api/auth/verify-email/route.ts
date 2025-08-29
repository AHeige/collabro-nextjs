// app/api/auth/verify-email/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  // Fetch all tokens (since bcrypt hashes can't be queried directly)
  const allTokens = await prisma.emailVerificationToken.findMany({
    include: { user: true },
  })

  const record = allTokens.find((r) => bcrypt.compareSync(token, r.token))

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }

  if (record.user.emailVerified) {
    return NextResponse.json({ message: 'Email already verified' })
  }

  // Update user as verified
  await prisma.user.update({
    where: { id: record.user.id },
    data: { emailVerified: true },
  })

  // Delete token record
  await prisma.emailVerificationToken.delete({
    where: { id: record.id },
  })

  // Auto-login after verification
  const authToken = jwt.sign({ userId: record.user.id }, JWT_SECRET, { expiresIn: '7d' })

  const response = NextResponse.json({ message: 'Email verified successfully' })
  response.cookies.set('auth_token', authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
