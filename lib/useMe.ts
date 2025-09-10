// lib/useMe.ts
'use client'
import useSWR from 'swr'
import type { HeaderUser } from '@/types/auth'
const fetcher = (u: string) => fetch(u, { credentials: 'include' }).then((r) => r.json())
export function useMe(initialUser?: HeaderUser | null) {
  const { data, error, isLoading, mutate } = useSWR('/api/me', fetcher, {
    fallbackData: initialUser ? { user: initialUser } : undefined,
    revalidateOnFocus: false,
  })
  return { user: (data?.user as HeaderUser) ?? null, isLoading, error, refresh: mutate }
}
