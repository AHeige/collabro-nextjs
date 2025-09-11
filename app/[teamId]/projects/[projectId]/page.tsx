'use client'
import useSWR from 'swr'
import ProjectPageClient from './ProjectPageClient'
import { useParams } from 'next/navigation'

export default function ProjectPage() {
  const params = useParams<{ teamId: string; projectId: string }>()

  const { data: project } = useSWR(`/api/projects/${params.projectId}`)
  const { data: tasks } = useSWR(`/api/projects/${params.projectId}/tasks`)

  if (!project || !tasks) return <div>Loading...</div>

  return <ProjectPageClient teamName={project.name} project={{ id: project.id, name: project.name }} />
}
