import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/auth'
import { getAuthUser } from '@/lib/auth-server'

// -------------------- GET /api/projects --------------------
export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Project', 'canRead')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const projects = await prisma.project.findMany({
    where: {
      members: { some: { userId: user.id } },
    },
    include: {
      team: true,
      members: {
        include: {
          user: { select: { id: true, email: true, name: true } },
          role: true,
        },
      },
    },
  })

  return NextResponse.json(projects)
}

// -------------------- POST /api/projects --------------------
export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Project', 'canCreate')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await req.json()

  // Kontrollera att user är TeamOwner/Admin i teamet
  const isInTeam = user.teamMember.some((tm) => tm.teamId === data.teamId && ['TeamOwner', 'TeamAdmin'].includes(tm.role.name))
  if (!isInTeam) {
    return NextResponse.json({ error: 'You are not allowed to create projects in this team' }, { status: 403 })
  }

  // Hämta ProjectOwner role
  const ownerRole = await prisma.role.findFirst({
    where: { name: 'ProjectOwner', scope: 'PROJECT' },
  })
  if (!ownerRole) {
    return NextResponse.json({ error: 'ProjectOwner role not found' }, { status: 500 })
  }

  const project = await prisma.project.create({
    data: {
      teamId: data.teamId,
      name: data.name,
      description: data.description,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          roleId: ownerRole.id,
        },
      },
      statuses: {
        create: [{ name: 'Todo' }, { name: 'In Progress' }, { name: 'Done' }],
      },
    },
    include: {
      team: true,
      members: {
        include: {
          user: { select: { id: true, email: true, name: true } },
          role: true,
        },
      },
      statuses: true,
    },
  })

  return NextResponse.json(project)
}
