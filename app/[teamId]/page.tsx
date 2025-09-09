'use client'

import { Team } from '@prisma/client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const params = useParams<{ teamId: string }>()
  const [team, setTeam] = useState<Team>()
  const [loading, setLoading] = useState<boolean>()

  useEffect(() => {
    async function fetchTeam() {
      try {
        setLoading(true)
        const res = await fetch(`/api/teams/${params.teamId}`, { credentials: 'include' })
        const json = await res.json()
        if (!json) {
          return
        }
        setTeam(json)
        console.log(json)
        setLoading(false)
      } catch (e) {
        console.error(e)
      }
    }
    fetchTeam()
  }, [params.teamId])

  return loading ? (
    <>
      <p>Loading</p>
    </>
  ) : (
    <div>{team?.name}</div>
  )
}
