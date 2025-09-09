import { getAuthUserLite } from '@/lib/auth-server'
import AuthShell from './AuthShell'
import { redirect } from 'next/navigation'

export default async function AuthPage() {
  const user = await getAuthUserLite()

  if (user) {
    redirect('/')
  }

  return <AuthShell />
}
