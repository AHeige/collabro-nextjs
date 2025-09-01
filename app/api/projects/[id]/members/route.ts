import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasPermission } from '@/lib/auth'

interface Params {
  params: { id: string }
}

// -------------------- POST /api/projects/:id/members --------------------
export async function POST(req: Request, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Project', 'canUpdate')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, roleName } = await req.json()
  if (!userId || !roleName) {
    return NextResponse.json({ error: 'userId and roleName required' }, { status: 400 })
  }

  // hämta role
  const role = await prisma.role.findFirst({
    where: { name: roleName, scope: 'PROJECT' },
  })
  if (!role) {
    return NextResponse.json({ error: 'Invalid project role' }, { status: 400 })
  }

  // lägg till i projekt
  const member = await prisma.projectMember.create({
    data: {
      projectId: params.id,
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

// -------------------- DELETE /api/projects/:id/members --------------------
export async function DELETE(req: Request, { params }: Params) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Project', 'canUpdate')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId: params.id,
        userId,
      },
    },
  })

  return NextResponse.json({ message: 'Member removed' })
}
