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

  const normalizedEmail = email.toLowerCase()

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // token
  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1h

  // transaction: create user + verification token
  const [user] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        emailVerified: false,
        password: {
          create: { hashedValue: hashedPassword },
        },
      },
    }),
    prisma.emailVerificationToken.create({
      data: {
        token: hashedToken,
        user: { connect: { email: normalizedEmail } },
        expiresAt,
      },
    }),
  ])

  // mail
  const verifyUrl = `${process.env.APP_URL}/verify-email?token=${rawToken}`

  await mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: { Email: 'admin@collabro.app', Name: 'Collabro.app' },
        To: [{ Email: normalizedEmail, Name: name || '' }],
        Subject: 'Verify your email',
        HTMLPart: `
          <h3>Welcome, ${name || normalizedEmail.split('@')[0]}!</h3>
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
