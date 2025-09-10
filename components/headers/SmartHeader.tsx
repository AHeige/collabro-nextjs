// components/headers/SmartHeader.tsx
'use client'
import useSWR, { mutate } from 'swr'
import { LoggedInHeader } from '@/components/headers/LoggedInHeader'
import { LoggedOutHeader } from '@/components/headers/LoggedOutHeader'
import { HeaderUser } from '@/types/auth'

const fetcher = async (url: string) => {
  const r = await fetch(url, { credentials: 'include', cache: 'no-store' })
  if (r.status === 401) {
    // prova förnya
    const rr = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    if (!rr.ok) return { user: null }
    // hämta igen efter lyckad refresh
    const r2 = await fetch(url, { credentials: 'include', cache: 'no-store' })
    if (!r2.ok) return { user: null }
    return r2.json()
  }
  return r.json()
}

export default function SmartHeader({ initialUser }: { initialUser: HeaderUser | null }) {
  const { data } = useSWR('/api/me', fetcher, { fallbackData: { user: initialUser } })
  const u = data?.user
  return u ? <LoggedInHeader user={u} /> : <LoggedOutHeader />
}

// Anropa mutate('/api/me') efter login/logout om du vill uppdatera headern direkt.
export const refreshMe = () => mutate('/api/me')
