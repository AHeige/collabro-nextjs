// Används i CLIENT components/hooks
export async function api(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, { ...init, credentials: 'include' })
  if (res.status !== 401) return res

  // Prova förnya access-token
  const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
  if (!r.ok) return res // fortfarande 401 → låt anroparen hantera utloggning

  // Försök igen
  return fetch(input, { ...init, credentials: 'include' })
}
