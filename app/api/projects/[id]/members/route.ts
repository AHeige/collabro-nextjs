import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/auth'
import { getAuthUser } from '@/lib/auth-server'

// -------------------- POST /api/projects/:id/members --------------------
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Project', 'canUpdate')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params
  const { userId, roleName } = await req.json()

  if (!userId || !roleName) {
    return NextResponse.json({ error: 'userId and roleName required' }, { status: 400 })
  }

  // hämta role för projektet
  const projectRole = await prisma.role.findFirst({
    where: { name: roleName, scope: 'PROJECT' },
  })
  if (!projectRole) {
    return NextResponse.json({ error: 'Invalid project role' }, { status: 400 })
  }

  // hämta projekt + team
  const project = await prisma.project.findUnique({
    where: { id },
    include: { team: { include: { users: true } } },
  })
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // kolla om user redan är med i teamet
  const isTeamMember = project.team.users.some((tm) => tm.userId === userId)

  if (!isTeamMember) {
    // hämta TeamMember role
    const teamRole = await prisma.role.findFirst({
      where: { name: 'TeamMember', scope: 'TEAM' },
    })
    if (!teamRole) {
      return NextResponse.json({ error: 'TeamMember role not found' }, { status: 500 })
    }

    // lägg till user i teamet
    await prisma.teamMember.create({
      data: {
        teamId: project.team.id,
        userId,
        roleId: teamRole.id,
      },
    })
  }

  // lägg till user i projektet
  const member = await prisma.projectMember.create({
    data: {
      projectId: id,
      userId,
      roleId: projectRole.id,
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      role: true,
    },
  })

  return NextResponse.json(member)
}
