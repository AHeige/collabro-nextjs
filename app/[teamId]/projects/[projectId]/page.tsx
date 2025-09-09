import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { getAuthUserLite } from '@/lib/auth-server'
import ProjectPageClient from './ProjectPageClient'

export default async function Page({ params }: { params: Promise<{ teamId: string; projectId: string }> }) {
  noStore()
  const user = await getAuthUserLite()
  if (!user) notFound() // eller redirect('/auth')

  const { teamId, projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      team: { select: { id: true, name: true } },
      tasks: {
        select: { id: true, title: true, statusId: true, startDate: true, endDate: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!project) notFound()

  return (
    <ProjectPageClient initialTasks={project.tasks} team={{ id: project.team.id, name: project.team.name }} project={{ id: project.id, name: project.name }} />
  )
}
