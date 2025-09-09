// lib/useMe.ts
'use client'
import useSWR from 'swr'
const fetcher = (u: string) => fetch(u, { credentials: 'include' }).then((r) => r.json())
export function useMe(initialUser?: any) {
  const { data, error, isLoading, mutate } = useSWR('/api/me', fetcher, {
    fallbackData: initialUser ? { user: initialUser } : undefined,
    revalidateOnFocus: false,
  })
  return { user: data?.user ?? null, isLoading, error, refresh: mutate }
}
