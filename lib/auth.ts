import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null
  if (!JWT_SECRET) {
    console.error('Missing env variable: JWT_SECRET')
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        teamMember: {
          include: {
            team: true, // ✅ teamets namn + id
            role: {
              include: { permissions: true }, // ✅ team-permissions
            },
          },
        },
        projectMember: {
          include: {
            project: true, // ✅ projektets namn + id
            role: {
              include: { permissions: true }, // ✅ projekt-permissions
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
  if (!user) return false

  const teamPermissions = user.teamMember.flatMap((tm) => tm.role?.permissions || [])
  const projectPermissions = user.projectMember.flatMap((pm) => pm.role?.permissions || [])

  return [...teamPermissions, ...projectPermissions].some((p) => p.entity === entity && p[action] === true)
}
