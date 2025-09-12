import { getAuthUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/dashboard
export async function GET() {
  const user = await getAuthUser() // hämtar current user

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const teams = await prisma.team.findMany({
    where: {
      users: { some: { userId: user.id } },
    },
    include: {
      projects: {
        include: {
          tasks: {
            where: { assigneeId: user.id },
          },
        },
      },
    },
  })

  const tasks = await prisma.task.findMany({
    where: { assigneeId: user.id },
    include: { project: true, status: true },
  })

  return NextResponse.json({ teams, tasks })
}
