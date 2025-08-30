import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma'

const JWT_SECRET = process.env.JWT_SECRET

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null
  if (!JWT_SECRET) {
    console.error('Missing env variabl')
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        projectMember: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    })

    return user
  } catch (err) {
    console.error('Invalid token:', err)
    return null
  }
}

export function hasPermission(
  user: Awaited<ReturnType<typeof getAuthUser>>,
  entity: string,
  action: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete'
): boolean {
  const permissions = user?.projectMember.flatMap((pm) => pm.role?.permissions || [])
  return permissions?.some((p) => p.entity === entity && p[action]) ?? false
}
