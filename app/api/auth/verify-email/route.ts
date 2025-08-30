// app/api/auth/verify-email/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET

export async function GET(req: Request) {
  if (!JWT_SECRET) return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 })
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const hashed = crypto.createHash('sha256').update(token).digest('hex')
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token: hashed },
    include: { user: true },
  })

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
