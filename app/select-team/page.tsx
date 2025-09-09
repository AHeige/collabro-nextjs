'use client'

import Link from 'next/link'

export default function SelectTeamPage({ teams }: { teams: { id: string; name: string }[] }) {
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2xl font-bold mb-4'>Select a Team</h1>
      <ul className='space-y-2'>
        {teams.map((team) => (
          <li key={team.id}>
            <Link href={`/teams/${team.id}/projects`} className='underline text-blue-600'>
              {team.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
