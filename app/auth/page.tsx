'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const login = async (formValues: FormData) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formValues.get('email'),
        password: formValues.get('password'),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const error = await res.json()
      alert(error.error || 'Login failed')
      return
    }

    // ✅ login success
    alert('Login successful!')
    window.location.href = '/' // redirect till dashboard eller startsida
  } catch (err) {
    console.error('Login error:', err)
    alert('Unexpected error, please try again')
  }
}

export default function AuthPage() {
  return (
    <div className='flex h-screen items-center justify-center bg-gray-50'>
      <Card className='w-[360px] p-6 space-y-6 shadow-md'>
        <div className='text-center space-y-1'>
          <h1 className='text-2xl font-bold'>Login</h1>
          <p className='text-sm text-gray-500'>Sign in to your Collabro account</p>
        </div>

        <form
          className='space-y-4'
          onSubmit={async (e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            await login(formData)
          }}
        >
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' name='email' placeholder='you@example.com' />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' type='password' name='password' placeholder='••••••••' />
          </div>

          <Button type='submit' className='w-full'>
            Sign in
          </Button>
        </form>

        <p className='text-center text-sm text-gray-500'>
          Don’t have an account?{' '}
          <a href='/register' className='underline hover:text-gray-700'>
            Sign up
          </a>
        </p>
      </Card>
    </div>
  )
}
