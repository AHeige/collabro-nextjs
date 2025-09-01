import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function requireAuth(req: NextRequest) {
  const user = (req as any).user // beroende på hur du kopplar in auth
  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }
  return { user }
}

export async function requireProjectMember(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findFirst({
    where: { projectId, userId },
  })

  if (!membership) {
    return { error: 'Project not found', status: 404 }
  }

  return { membership }
}

export function requireProjectRole(membership: { role: string }, roles: string[]) {
  if (!membership || !roles.includes(membership.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return null
}
