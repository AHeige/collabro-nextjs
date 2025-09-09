// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { signAccessJwt } from '@/lib/jwt'

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(req: Request) {
  if (!JWT_SECRET) return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 })

  const { email, password } = await req.json()

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { password: true, teamMember: { include: { team: true } } },
  })

  if (!user || !user.password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const isValid = await bcrypt.compare(password, user.password.hashedValue)
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // ✅ Block login if email is not verified
  if (!user.emailVerified) {
    return NextResponse.json({ error: 'Please verify your email before logging in.' }, { status: 403 })
  }

  const token = signAccessJwt(user.id)

  const teams = user.teamMember.map((tm) => ({
    id: tm.team.id,
    name: tm.team.name,
  }))

  const response = NextResponse.json({ message: 'Login successful', teams })
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}
