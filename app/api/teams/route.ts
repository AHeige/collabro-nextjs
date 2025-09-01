import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasPermission } from '@/lib/auth'

// -------------------- GET /api/teams --------------------
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Team', 'canRead')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const teams = await prisma.team.findMany({
    where: {
      users: { some: { userId: user.id } },
    },
    include: {
      users: {
        include: {
          user: { select: { id: true, email: true, name: true } },
          role: true,
        },
      },
      projects: {
        select: { id: true, name: true, description: true },
      },
    },
  })

  return NextResponse.json(teams)
}

// -------------------- POST /api/teams --------------------
export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Team', 'canCreate')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await req.json()

  // Hämta TeamOwner role
  const ownerRole = await prisma.role.findFirst({
    where: { name: 'TeamOwner', scope: 'TEAM' },
  })
  if (!ownerRole) {
    return NextResponse.json({ error: 'TeamOwner role not found' }, { status: 500 })
  }

  const team = await prisma.team.create({
    data: {
      name: data.name || `${user.name || 'User'}'s Team`,
      users: {
        create: {
          userId: user.id,
          roleId: ownerRole.id,
        },
      },
    },
    include: {
      users: {
        include: {
          user: { select: { id: true, email: true, name: true } },
          role: true,
        },
      },
    },
  })

  return NextResponse.json(team)
}
