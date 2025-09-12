// app/[teamId]/projects/[projectId]/layout.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SWRConfig } from 'swr'

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ teamId: string; projectId: string }> }) {
  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: { select: { id: true, name: true } },
      tasks: {
        select: {
          id: true,
          title: true,
          statusId: true,
          startDate: true,
          endDate: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
          status: true,
          priority: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      milestones: true,
      statuses: {
        select: { id: true, name: true },
      },
    },
  })

  console.log('Statuses for project', project)

  if (!project) notFound()

  return (
    <SWRConfig
      value={{
        fallback: {
          [`/api/projects/${project.id}`]: project,
          [`/api/projects/${project.id}/tasks`]: project.tasks,
          [`/api/projects/${project.id}/milestones`]: project.milestones,
          [`/api/projects/${project.id}/statuses`]: project.statuses,
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
