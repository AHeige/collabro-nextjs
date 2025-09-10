import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hasPermission } from '@/lib/auth'
import { getAuthUserLite } from '@/lib/auth-server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserLite()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!hasPermission(user, 'Project', 'canRead')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Missing ID from project' }, { status: 401 })
  }

  const project = await prisma.project.findUnique({
    where: { id: id },
    select: {
      id: true,
      name: true,
      team: { select: { id: true, name: true } },
      tasks: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          statusId: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  })

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(
    {
      project: { id: project.id, name: project.name },
      team: { id: project.team.id, name: project.team.name },
      tasks: project.tasks,
    },
    { headers: { 'Cache-Control': 'no-store', Vary: 'Cookie' } }
  )
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUserLite()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(user, 'Task', 'canCreate')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing project id' }, { status: 400 })

  interface TaskPayload {
    title?: string
    statusId?: string
    startDate?: string
    endDate?: string
  }

  let body: TaskPayload
  try {
    body = (await req.json()) as TaskPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const title = (body.title ?? '').toString().trim()
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  // säkerställ att projektet finns
  const project = await prisma.project.findUnique({ where: { id }, select: { id: true } })
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  // ---- Resolve a guaranteed string statusId ----
  let statusId: string
  if (typeof body.statusId === 'string') {
    const s = await prisma.status.findFirst({
      where: { id: body.statusId, projectId: id },
      select: { id: true },
    })
    if (!s) return NextResponse.json({ error: 'Invalid status for this project' }, { status: 400 })
    statusId = s.id
  } else {
    // välj första statusen eller skapa "Todo" om inga finns
    let s = await prisma.status.findFirst({
      where: { projectId: id },
      orderBy: { createdAt: 'asc' }, // byt till sortOrder om du har
      select: { id: true },
    })
    if (!s) {
      s = await prisma.status.create({
        data: { projectId: id, name: 'Todo' }, // lägg ev. sortOrder
        select: { id: true },
      })
    }
    statusId = s.id
  }

  // datum (valfritt)
  const startDate = body.startDate ? new Date(body.startDate) : null
  const endDate = body.endDate ? new Date(body.endDate) : null
  if (startDate && endDate && startDate > endDate) {
    return NextResponse.json({ error: 'startDate cannot be after endDate' }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: { projectId: id, title, statusId, startDate, endDate, createdBy: user.id },
    select: {
      id: true,
      title: true,
      statusId: true,
      startDate: true,
      endDate: true,
      projectId: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return NextResponse.json({ task }, { status: 201, headers: { 'Cache-Control': 'no-store', Vary: 'Cookie' } })
}
