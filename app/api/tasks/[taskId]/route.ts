import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserLite } from '@/lib/auth-server'
import { hasPermission } from '@/lib/auth'
import { updateTaskSchema } from '@/lib/validators/task'

export async function PATCH(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const user = await getAuthUserLite()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(user, 'Task', 'canUpdate')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { taskId } = await params
  console.log(`patchin task: ${taskId}`)
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true },
  })
  if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  // ✅ validate input
  const body = await req.json().catch(() => null)
  const parsed = updateTaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  // ✅ check statusId belongs to this project
  if (data.statusId) {
    const valid = await prisma.status.findFirst({
      where: { id: data.statusId, projectId: existing.projectId },
      select: { id: true },
    })
    if (!valid) {
      return NextResponse.json({ error: 'Invalid status for this project' }, { status: 400 })
    }
  }

  // ✅ check date range
  const startDate = data.startDate ? new Date(data.startDate) : undefined
  const endDate = data.endDate ? new Date(data.endDate) : undefined
  const dueDate = data.dueDate ? new Date(data.dueDate) : undefined

  if (startDate && endDate && startDate > endDate) {
    return NextResponse.json({ error: 'startDate cannot be after endDate' }, { status: 400 })
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title?.trim(),
      description: data.description ?? undefined,
      statusId: data.statusId ?? undefined,
      assigneeId: data.assigneeId ?? undefined,
      startDate,
      endDate,
      dueDate, // ✅ nu sparas det i DB
      priority: data.priority ?? undefined,
    },
    select: {
      id: true,
      title: true,
      description: true,
      statusId: true,
      assigneeId: true,
      startDate: true,
      endDate: true,
      dueDate: true,
      updatedAt: true,
      priority: true,
    },
  })

  return NextResponse.json({ task: updated })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const user = await getAuthUserLite()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasPermission(user, 'Task', 'canDelete')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { taskId } = await params
  if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  await prisma.task.delete({ where: { id: taskId } })

  return NextResponse.json({ ok: true })
}
