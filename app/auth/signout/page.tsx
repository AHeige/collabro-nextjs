'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { refreshMe } from '@/components/headers/SmartHeader'

type Phase = 'loading' | 'success' | 'error'

export default function SignOutPage() {
  const [status, setStatus] = useState<Phase>('loading')
  const [message, setMessage] = useState('Signing you out…')
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/auth/signout', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
        })
        const data = await res.json().catch(() => ({}))

        if (!res.ok) {
          setStatus('error')
          setMessage(data?.error || 'Could not sign out.')
          return
        }

        // (Valfritt) rensa klient-skräp
        try {
          localStorage.removeItem('collabro:ui')
          sessionStorage.clear()
        } catch (e) {
          console.error(e)
        }

        setStatus('success')
        setMessage('Signed out successfully.')
        // kort paus för UX, sen redirect
        setTimeout(() => {
          router.push('/auth')
          refreshMe()
        }, 1200)
      } catch {
        setStatus('error')
        setMessage('Network error while signing out.')
      }
    })()
  }, [router])

  const Icon = () => {
    if (status === 'loading') return <Loader2 className='h-12 w-12 animate-spin text-primary' />
    if (status === 'success') return <CheckCircle2 className='h-12 w-12 text-green-500' />
    return <XCircle className='h-12 w-12 text-destructive' />
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4'>
      <Card className='w-full max-w-md overflow-hidden border-border/60 shadow-lg'>
        <div className='flex flex-col items-center gap-4 px-6 pb-6 pt-10 text-center'>
          <Icon />
          <h1 className='text-xl font-semibold tracking-tight'>
            {status === 'loading' && 'Signing out…'}
            {status === 'success' && 'Signed out ✅'}
            {status === 'error' && 'Sign out failed'}
          </h1>
          <p className='text-sm text-muted-foreground'>{message}</p>
        </div>

        <Separator />

        <div className='px-6 py-5'>
          {status === 'error' ? (
            <div className='flex gap-2'>
              <Button variant='secondary' className='w-1/2' onClick={() => router.push('/auth')}>
                Back to login
              </Button>
              <Button className='w-1/2' onClick={() => router.refresh()}>
                Try again
              </Button>
            </div>
          ) : (
            <p className='text-xs text-muted-foreground'>{status === 'loading' ? 'Processing your sign out…' : 'Redirecting…'}</p>
          )}
        </div>
      </Card>
    </div>
  )
}
