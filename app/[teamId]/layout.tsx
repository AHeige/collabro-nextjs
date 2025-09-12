// app/[teamId]/layout.tsx
import { redirect, notFound } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { prisma } from '@/lib/prisma'
import { getAuthUserLite } from '@/lib/auth-server'
import { SWRConfig } from 'swr'

export default async function TeamLayout({ children, params }: { children: React.ReactNode; params: Promise<{ teamId: string }> }) {
  const { teamId } = await params

  const session = await getAuthUserLite()
  if (!session) redirect('/auth')

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      users: { select: { userId: true } },
      projects: { select: { id: true, name: true, color: true, tasks: true, owner: true } },
    },
  })
  if (!team) notFound()

  const isMember = team.users.some((m: { userId: string }) => m.userId === session.id)
  if (!isMember) redirect('/select-team')

  return (
    <SWRConfig
      value={{
        fallback: {
          [`/api/teams/${team.id}`]: team,
          [`/api/teams/${team.id}/projects`]: team.projects,
        },
      }}
    >
      <AppShell teamId={team.id} teamName={team.name}>
        {children}
      </AppShell>
    </SWRConfig>
  )
}
