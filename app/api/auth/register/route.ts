// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { mailjet } from '@/lib/mailjet/mailjet'

export async function POST(req: Request) {
  const { email, password, name } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // 1. Create user with emailVerified = false
  const user = await prisma.user.create({
    data: {
      email,
      name,
      emailVerified: false,
      password: {
        create: {
          hashedValue: hashedPassword,
        },
      },
    },
  })

  // 2. Generate verification token and store hashed SHA-256 version
  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.emailVerificationToken.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt,
    },
  })

  // 3. Send verification email via Mailjet
  const verifyUrl = `${process.env.APP_URL}/verify-email?token=${rawToken}`

  await mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'admin@collabro.app',
          Name: 'Collabro.app',
        },
        To: [{ Email: email, Name: name || '' }],
        Subject: 'Verify your email',
        HTMLPart: `
          <h3>Welcome, ${name || 'User'}!</h3>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verifyUrl}">Verify Email</a>
          <p>This link will expire in 1 hour.</p>
        `,
      },
    ],
  })

  return NextResponse.json({
    message: 'Registration successful. Please check your email to verify your account.',
  })
}
