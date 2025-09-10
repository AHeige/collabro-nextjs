'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Team, Project } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Plus, ChevronRight, Users, FolderKanban, Activity, TrendingUp, Clock, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Collabro — Team Dashboard page
 *
 * Features:
 * - Loads Team + Projects from /api/teams/[teamId]
 * - Polished empty, loading, and error states
 * - Mock fallback to let you iterate on UI without backend ready
 * - Project grid with quick stats + CTA to create a project
 * - Team stats cards
 * - Recent activity feed (mocked if missing)
 * - "Create Team" CTA (routes to /teams/new by default — adjust as needed)
 *
 * Drop-in path idea:
 *   app/(app)/teams/[teamId]/page.tsx
 */

// ------------- Types -------------

type ProjectWithExtras = Project & {
  status?: 'active' | 'paused' | 'completed'
  openTasks?: number
  progressPct?: number
  updatedAt?: Date | string
}

export type TeamWithExtras = Team & {
  description?: string | null
  membersCount?: number
  ownerId: string
  projects?: ProjectWithExtras[]
  stats?: {
    activeProjects: number
    openTasks: number
    doneThisWeek: number
  }
  activity?: Array<{
    id: string
    type: 'task_updated' | 'task_created' | 'project_created' | 'member_joined'
    title: string
    description?: string
    at: string // ISO
    actor?: { id: string; name: string }
  }>
}

// ------------- Mock data -------------

const mockTeam: TeamWithExtras = {
  id: 'mock-team-1',
  name: 'Product Operations',
  description: 'Cross-functional team driving Collabro MVP.',
  ownerId: 'owner-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  membersCount: 7,
  projects: [
    {
      id: 'p1',
      teamId: 'mock-team-1',
      name: 'Collabro — MVP',
      description: 'Core features: auth, projects, tasks, Gantt.',
      color: '#3B82F6',
      ownerId: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      openTasks: 18,
      progressPct: 42,
    } as ProjectWithExtras,
    {
      id: 'p2',
      teamId: 'mock-team-1',
      name: 'Marketing Site',
      description: 'Landing, pricing, blog, signup flow.',
      color: '#10B981',
      ownerId: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'paused',
      openTasks: 6,
      progressPct: 23,
    } as ProjectWithExtras,
    {
      id: 'p3',
      teamId: 'mock-team-1',
      name: 'Research: Local-first sync',
      description: 'Explore CRDTs, optimistic UI, and conflict resolution.',
      color: '#F59E0B',
      ownerId: 'owner-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
      openTasks: 12,
      progressPct: 10,
    } as ProjectWithExtras,
  ],
  stats: {
    activeProjects: 2,
    openTasks: 36,
    doneThisWeek: 21,
  },
  activity: [
    {
      id: 'a1',
      type: 'task_updated',
      title: 'Task “Email verification flow” moved to In Review',
      at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      actor: { id: 'u1', name: 'Alex' },
    },
    {
      id: 'a2',
      type: 'project_created',
      title: 'Created project “Marketing Site”',
      at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      actor: { id: 'u2', name: 'Thomas' },
    },
    {
      id: 'a3',
      type: 'member_joined',
      title: 'Emma joined the team',
      at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      actor: { id: 'u3', name: 'Emma' },
    },
  ],
}

// ------------- Helpers -------------

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function getInitials(name?: string) {
  if (!name) return 'TM'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ------------- Skeletons -------------

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />
}

function LoadingState() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='h-9 w-28' />
          <Skeleton className='h-9 w-36' />
        </div>
      </div>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Skeleton className='h-28' />
        <Skeleton className='h-28' />
        <Skeleton className='h-28' />
        <Skeleton className='h-28' />
      </div>
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-4'>
          <Skeleton className='h-10' />
          <Skeleton className='h-40' />
          <Skeleton className='h-40' />
        </div>
        <div className='space-y-4'>
          <Skeleton className='h-10' />
          <Skeleton className='h-72' />
        </div>
      </div>
    </div>
  )
}

// ------------- Main Page -------------

export default function TeamDashboardPage() {
  const params = useParams<{ teamId: string }>()
  const router = useRouter()

  const [team, setTeam] = useState<TeamWithExtras | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchTeam() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/teams/${params.teamId}`, { credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as TeamWithExtras
        if (!mounted) return
        setTeam(json)
      } catch (e: unknown) {
        console.warn('Using mocked team due to fetch error:', e instanceof Error ? e.message : String(e))
        if (!mounted) return
        // — Fallback to mock so you can iterate on UI immediately
        setTeam(mockTeam)
        setError('Displaying mocked data (API unavailable).')
      } finally {
        mounted = false
        setLoading(false)
      }
    }
    fetchTeam()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.teamId])

  const initials = useMemo(() => getInitials(team?.name || 'Team'), [team?.name])

  if (loading) return <LoadingState />

  if (!team) {
    return (
      <div className='flex h-[60vh] flex-col items-center justify-center text-center'>
        <h2 className='mb-2 text-2xl font-semibold'>Team not found</h2>
        <p className='mb-6 text-muted-foreground'>We couldn’t locate this team. It may have been deleted or you lack access.</p>
        <div className='flex gap-2'>
          <Button onClick={() => router.push('/teams/new')}>
            <Plus className='mr-2 h-4 w-4' /> Create Team
          </Button>
          <Button variant='outline' onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <Avatar className='h-12 w-12'>
            <AvatarFallback className='text-base'>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>{team.name}</h1>
            <p className='text-sm text-muted-foreground'>{team.description || 'Collaborate on projects, tasks and timelines.'}</p>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' onClick={() => router.refresh()}>
            <RefreshCcw className='mr-2 h-4 w-4' /> Refresh
          </Button>
          <Button variant='outline' onClick={() => router.push('/teams/new')}>
            <Users className='mr-2 h-4 w-4' /> New Team
          </Button>
          <Button onClick={() => router.push(`/projects/new?teamId=${team.id}`)}>
            <Plus className='mr-2 h-4 w-4' /> New Project
          </Button>
        </div>
      </div>

      {error && <div className='text-sm text-amber-500'>{error}</div>}

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Active Projects'
          value={team.stats?.activeProjects ?? team.projects?.filter((p) => p.status !== 'completed').length ?? 0}
          icon={<FolderKanban className='h-5 w-5' />}
        />
        <StatCard
          title='Open Tasks'
          value={team.stats?.openTasks ?? team.projects?.reduce((sum, p) => sum + (p.openTasks || 0), 0) ?? 0}
          icon={<Activity className='h-5 w-5' />}
        />
        <StatCard title='Done this week' value={team.stats?.doneThisWeek ?? 0} icon={<TrendingUp className='h-5 w-5' />} />
        <StatCard title='Members' value={team.membersCount ?? 1} icon={<Users className='h-5 w-5' />} />
      </div>

      {/* Content */}
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Projects column */}
        <div className='lg:col-span-2 space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-medium'>Projects</h2>
            <div className='flex gap-2'>
              <Input placeholder='Filter projects…' className='h-9 w-56' />
              <Button variant='outline' onClick={() => router.push(`/projects/new?teamId=${team.id}`)}>
                <Plus className='mr-2 h-4 w-4' /> New Project
              </Button>
            </div>
          </div>

          {team.projects && team.projects.length > 0 ? (
            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
              {team.projects.map((p) => (
                <ProjectCard key={p.id} project={p} onOpen={() => router.push(`${team.id}/projects/${p.id}`)} />
              ))}
              {/* Create card CTA */}
              <Card
                className='border-dashed hover:border-primary/60 hover:shadow-sm'
                role='button'
                onClick={async () => {
                  const randomName = `Project ${Math.floor(Math.random() * 100)}`
                  try {
                    await fetch(`/api/projects/`, {
                      method: 'POST',
                      body: JSON.stringify({ teamId: team.id, name: randomName, description: 'Just a new project' }),
                    })
                    toast.success('New team created', {
                      description: `A new team just got created with then name ${randomName}`,
                    })
                  } catch (e) {
                    toast.error('Could not create a project')
                    console.error(e)
                  }
                }}
              >
                <CardHeader>
                  <CardTitle className='flex items-center justify-between text-base'>
                    <span>Create a project</span>
                    <Plus className='h-4 w-4' />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground'>Kick off a new initiative and track work across tasks, Kanban, and Gantt.</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyProjects onCreate={() => router.push(`/projects/new?teamId=${team.id}`)} />
          )}
        </div>

        {/* Activity column */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-medium'>Recent activity</h2>
            <Badge variant='secondary' className='font-normal'>
              Last 7 days
            </Badge>
          </div>
          <Card>
            <CardContent className='p-0'>
              <ul className='divide-y'>
                {(team.activity?.length ? team.activity : mockTeam.activity)?.map((a) => (
                  <li key={a.id} className='px-4 py-3'>
                    <div className='flex items-start gap-3'>
                      <div className='mt-0.5 rounded-full border p-1 text-muted-foreground'>
                        <Clock className='h-4 w-4' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='truncate text-sm font-medium'>{a.title}</div>
                        <div className='text-xs text-muted-foreground'>
                          {a.actor?.name ? `${a.actor.name} • ` : ''}
                          {timeAgo(a.at)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Team actions / settings */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Team actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button className='w-full' variant='outline' onClick={() => router.push(`/teams/${team.id}/settings`)}>
                Team Settings
              </Button>
              <Button className='w-full' variant='outline' onClick={() => router.push(`/teams/${team.id}/members`)}>
                Manage Members
              </Button>
              <Separator />
              <Button className='w-full' onClick={() => router.push('/teams/new')}>
                <Users className='mr-2 h-4 w-4' /> Create another Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ------------- Subcomponents -------------

function StatCard({ title, value, icon }: { title: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
      </CardContent>
    </Card>
  )
}

function ProjectCard({ project, onOpen }: { project: ProjectWithExtras; onOpen: () => void }) {
  const badge =
    project.status === 'completed' ? (
      <Badge variant='secondary'>Completed</Badge>
    ) : project.status === 'paused' ? (
      <Badge variant='outline'>Paused</Badge>
    ) : (
      <Badge>Active</Badge>
    )

  const pct = Math.max(0, Math.min(100, project.progressPct ?? 0))

  return (
    <Card className='group transition hover:shadow-sm'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between text-base'>
          <span className='truncate'>{project.name}</span>
          {badge}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='mb-4 line-clamp-2 h-10 text-sm text-muted-foreground'>{project.description}</p>

        {/* Progress bar */}
        <div className='mb-2 h-2 w-full overflow-hidden rounded-full bg-muted'>
          <div
            className='h-full rounded-full bg-primary transition-all'
            style={{ width: `${pct}%` }}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            role='progressbar'
          />
        </div>
        <div className='mb-3 flex items-center justify-between text-xs text-muted-foreground'>
          <span>Progress</span>
          <span>{pct}%</span>
        </div>

        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Activity className='h-4 w-4' /> {project.openTasks ?? 0} open tasks
          </div>
          <Button size='sm' variant='ghost' onClick={onOpen}>
            Open <ChevronRight className='ml-1 h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyProjects({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className='border-dashed'>
      <CardHeader>
        <CardTitle className='text-base'>No projects yet</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-muted-foreground'>Spin up your first project to start planning work with Kanban and Gantt.</p>
        <Button onClick={onCreate}>
          <Plus className='mr-2 h-4 w-4' /> Create Project
        </Button>
      </CardContent>
    </Card>
  )
}
