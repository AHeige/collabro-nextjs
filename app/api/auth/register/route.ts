import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { mailjet } from '@/lib/mailjet/mailjet'
import { getBaseUrl } from '@/lib/base-url'

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

  // generate token
  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1h

  // fetch TeamOwner role
  const teamOwnerRole = await prisma.role.findFirst({
    where: { name: 'TeamOwner', scope: 'TEAM' },
  })
  if (!teamOwnerRole) {
    return NextResponse.json({ error: 'TeamOwner role not found' }, { status: 500 })
  }

  // transaction: user + verification token + default team
  const [user] = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        emailVerified: false,
        password: { create: { hashedValue: hashedPassword } },
      },
    })

    if (!createdUser) {
      throw new Error('Error on creating user')
    }

    await tx.emailVerificationToken.create({
      data: {
        token: hashedToken,
        userId: createdUser.id,
        expiresAt,
      },
    })

    await tx.team.create({
      data: {
        name: `${createdUser.name || 'User'}'s Team`,
        users: {
          create: {
            userId: createdUser.id,
            roleId: teamOwnerRole.id,
          },
        },
        projects: {
          create: {
            name: `${createdUser.name || 'User'}'s Project`,
            ownerId: createdUser.id,
          },
        },
      },
    })

    return [createdUser]
  })

  // send mail
  const baseUrl = getBaseUrl()
  const verifyUrl = `${baseUrl}/verify-email?token=${rawToken}`

  await mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: { Email: 'admin@collabro.app', Name: 'Collabro.app' },
        To: [{ Email: normalizedEmail, Name: name || '' }],
        Subject: 'Verify your email',
        HTMLPart: `
          <h3>Welcome, ${name || normalizedEmail.split('@')[0]}!</h3>
          <p>Your default team has been created automatically.</p>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verifyUrl}">Verify Email</a>
          <p>This link will expire in 1 hour.</p>
        `,
      },
    ],
  })

  return NextResponse.json({
    message: 'Registration successful. A default team has been created for you. Please check your email to verify your account.',
  })
}
