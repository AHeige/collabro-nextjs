'use client'

import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Prisma } from '@prisma/client'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type DashboardTeam = Prisma.TeamGetPayload<{
  include: {
    projects: {
      include: {
        tasks: true
      }
    }
  }
}>

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<{ teams: DashboardTeam[]; tasks: Prisma.TaskGetPayload<{ include: { project: true; status: true } }>[] }>(
    '/api/dashboard',
    fetcher
  )

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='animate-spin h-6 w-6 text-muted-foreground' />
      </div>
    )
  }

  if (error) {
    return <div className='text-red-500'>Failed to load dashboard</div>
  }

  const teams = data?.teams ?? []
  const tasks = data?.tasks ?? []

  return (
    <div className='space-y-8 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Dashboard</h1>
        <Button asChild>
          <Link href='/teams/new'>+ New Team</Link>
        </Button>
      </div>

      {/* Teams */}
      <section>
        <h2 className='text-xl font-semibold mb-4'>My Teams</h2>
        {teams.length === 0 ? (
          <p className='text-muted-foreground'>You’re not in any teams yet.</p>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {teams.map((team) => (
              <Card key={team.id} className='hover:shadow-lg transition'>
                <CardHeader>
                  <CardTitle className='flex justify-between items-center'>
                    <span>{team.name}</span>
                    <Button variant='outline' size='sm' asChild>
                      <Link href={`/${team.id}/`}>Open</Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground mb-3'>
                    {team.projects.length} {team.projects.length === 1 ? 'project' : 'projects'}
                  </p>

                  {team.projects.length > 0 && (
                    <div className='grid gap-3 grid-cols-1 sm:grid-cols-2'>
                      {team.projects.map((project) => (
                        <Link key={project.id} href={`/${team.id}/projects/${project.id}`} className='block'>
                          <Card className='group transition hover:shadow-md'>
                            <CardContent className='p-4'>
                              <p className='font-medium group-hover:text-primary'>{project.name}</p>
                              <p className='text-xs text-muted-foreground'>Project details</p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Tasks */}
      <section>
        <h2 className='text-xl font-semibold mb-4'>My Tasks</h2>
        {tasks.length === 0 ? (
          <p className='text-muted-foreground'>No tasks assigned to you.</p>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {tasks.map((task) => (
              <Card key={task.id} className='hover:shadow-md transition'>
                <CardHeader>
                  <CardTitle>{task.title}</CardTitle>
                </CardHeader>
                <CardContent className='text-sm text-muted-foreground space-y-1'>
                  <p>
                    Project:{' '}
                    <Link href={`/teams/${task.project.teamId}/projects/${task.project.id}`} className='underline hover:text-primary'>
                      {task.project.name}
                    </Link>
                  </p>
                  {task.endDate && <p>Due: {new Date(task.endDate).toLocaleDateString()}</p>}
                  <p>Status: {task.status?.name ?? '—'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
