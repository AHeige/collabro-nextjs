import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasPermission } from '@/lib/auth'

interface Params {
  params: { id: string }
}

// -------------------- POST /api/teams/:id/members --------------------
export async function POST(req: Request, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Team', 'canUpdate')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, roleName } = await req.json()
  if (!userId || !roleName) {
    return NextResponse.json({ error: 'userId and roleName required' }, { status: 400 })
  }

  // hämta role
  const role = await prisma.role.findFirst({
    where: { name: roleName, scope: 'TEAM' },
  })
  if (!role) {
    return NextResponse.json({ error: 'Invalid team role' }, { status: 400 })
  }

  const member = await prisma.teamMember.create({
    data: {
      teamId: params.id,
      userId,
      roleId: role.id,
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      role: true,
    },
  })

  return NextResponse.json(member)
}

// -------------------- DELETE /api/teams/:id/members --------------------
export async function DELETE(req: Request, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Team', 'canUpdate')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  await prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId: params.id,
        userId,
      },
    },
  })

  return NextResponse.json({ message: 'Member removed' })
}
