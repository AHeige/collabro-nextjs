// app/api/teams/[teamId]/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasPermission } from '@/lib/auth'

export async function GET(_req: Request, context: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await context.params

  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Team', 'canRead')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!teamId) {
    return NextResponse.json({ error: 'Missing teamId' }, { status: 400 })
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      users: {
        include: {
          user: { select: { id: true, email: true, name: true } },
          role: true,
        },
      },
      projects: {
        include: {
          members: {
            include: {
              user: { select: { id: true, email: true, name: true } },
              role: true,
            },
          },
        },
      },
    },
  })

  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  const isMember = team.users.some((tm) => tm.userId === user.id)
  if (!isMember) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(team, { status: 200 })
}
