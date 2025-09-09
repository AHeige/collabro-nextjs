import 'server-only'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { UserLite } from '@/types/auth'

const JWT_SECRET = process.env.JWT_SECRET

async function readToken() {
  const token = (await cookies()).get('auth_token')?.value
  if (!token || !JWT_SECRET) return null
  try {
    const { userId } = jwt.verify(token, JWT_SECRET) as { userId: string }
    return userId
  } catch {
    return null
  }
}

export async function getAuthUserLite(): Promise<UserLite | null> {
  const userId = await readToken()
  if (!userId) return null
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      teamMember: {
        select: {
          team: { select: { id: true, name: true } },
          role: {
            select: {
              permissions: {
                select: {
                  entity: true,
                  canRead: true,
                  canCreate: true,
                  canUpdate: true,
                  canDelete: true,
                },
              },
            },
          },
        },
      },
      projectMember: {
        select: {
          project: { select: { id: true, name: true } },
          role: {
            select: {
              permissions: {
                select: {
                  entity: true,
                  canRead: true,
                  canCreate: true,
                  canUpdate: true,
                  canDelete: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function getAuthUser() {
  const userId = await readToken()
  if (!userId) return null
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      teamMember: { include: { team: true, role: { include: { permissions: true } } } },
      projectMember: { include: { project: true, role: { include: { permissions: true } } } },
    },
  })
}
