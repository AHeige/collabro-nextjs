import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasPermission } from '@/lib/auth'

interface Params {
  params: { id: string }
}

// -------------------- GET /api/teams/:id --------------------
export async function GET(req: Request, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Team', 'canRead')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const team = await prisma.team.findUnique({
    where: { id: params.id },
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

  // Extra säkerhet: kolla att user faktiskt är medlem i teamet
  const isMember = team?.users.some((tm) => tm.userId === user.id)
  if (!isMember) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(team)
}
