'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage('Email verified successfully! Redirecting to login...')
          setTimeout(() => router.push('/login'), 3000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch {
        setStatus('error')
        setMessage('Something went wrong')
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {status === 'loading' && <p>Verifying your email...</p>}
      {status !== 'loading' && <p>{message}</p>}
    </div>
  )
}
