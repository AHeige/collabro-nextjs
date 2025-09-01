import { NextRequest, NextResponse } from 'next/server'
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

// -------------------- DELETE /api/teams/:id/members?userId=xxx --------------------
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Team', 'canUpdate')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params
  const searchParams = req.nextUrl.searchParams
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId query param required' }, { status: 400 })
  }

  // ta bort team member
  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId: id, userId } },
  })

  // ta bort user från alla projekt i teamet
  const projects = await prisma.project.findMany({
    where: { teamId: id },
    select: { id: true },
  })

  for (const project of projects) {
    await prisma.projectMember.deleteMany({
      where: { projectId: project.id, userId },
    })
  }

  return NextResponse.json({ message: 'Member removed from team and related projects' })
}
