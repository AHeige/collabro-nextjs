import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/auth'
import { getAuthUser } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

// POST /api/teams/:teamId/members
export async function POST(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(user, 'Team', 'canUpdate')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, roleName } = await req.json()
  if (!userId || !roleName) return NextResponse.json({ error: 'userId and roleName required' }, { status: 400 })

  const role = await prisma.role.findFirst({ where: { name: roleName, scope: 'TEAM' } })
  if (!role) return NextResponse.json({ error: 'Invalid team role' }, { status: 400 })

  const member = await prisma.teamMember.create({
    data: { teamId, userId, roleId: role.id },
    include: { user: { select: { id: true, email: true, name: true } }, role: true },
  })
  return NextResponse.json(member)
}

// DELETE /api/teams/:teamId/members?userId=xxx
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(user, 'Team', 'canUpdate')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId query param required' }, { status: 400 })

  // Remove from team
  await prisma.teamMember
    .delete({
      where: { teamId_userId: { teamId, userId } }, // assumes @@unique([teamId, userId])
    })
    .catch(() => {}) // ignore if already removed

  // Remove from all projects in that team (one query via relational filter)
  await prisma.projectMember.deleteMany({
    where: { userId, project: { teamId } },
  })

  return NextResponse.json({ message: 'Member removed from team and related projects' })
}
