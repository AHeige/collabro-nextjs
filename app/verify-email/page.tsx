'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Missing token')
      return
    }

    ;(async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await res.json().catch(() => ({}))

        if (res.ok) {
          setStatus('success')
          setMessage('Email verified! Redirecting…')
          const target = data?.redirectPath || '/auth'
          setTimeout(() => router.replace(target), 2000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch {
        setStatus('error')
        setMessage('Something went wrong')
      }
    })()
  }, [token, router])

  const renderIcon = () => {
    if (status === 'loading') return <Loader2 className='h-12 w-12 animate-spin text-primary' />
    if (status === 'success') return <CheckCircle2 className='h-12 w-12 text-green-500' />
    return <XCircle className='h-12 w-12 text-destructive' />
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4'>
      <Card className='w-full max-w-md overflow-hidden border-border/60 shadow-lg'>
        <div className='flex flex-col items-center gap-4 px-6 pb-6 pt-10 text-center'>
          {renderIcon()}
          <h1 className='text-xl font-semibold tracking-tight'>
            {status === 'loading' && 'Verifying your email…'}
            {status === 'success' && 'Email verified 🎉'}
            {status === 'error' && 'Verification failed'}
          </h1>
          <p className='text-sm text-muted-foreground'>{message}</p>
        </div>

        <Separator />

        <div className='px-6 py-5'>
          {status === 'error' && (
            <Button onClick={() => router.push('/auth')} className='w-full'>
              Back to login
            </Button>
          )}
          {status === 'success' && <p className='text-xs text-muted-foreground'>You will be redirected automatically. Sit tight ✨</p>}
        </div>
      </Card>
    </div>
  )
}
