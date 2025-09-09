'use client'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useState } from 'react'
import { Loader } from 'lucide-react'
import Spinner from '@/components/ui/spinner'
import { toast } from 'sonner'
import Registered from './registered/page'

export default function AuthPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [registered, setRegistered] = useState<{ name: string; email: string }>()

  const login = async (formValues: FormData) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formValues.get('email'),
          password: formValues.get('password'),
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()
      if (!res.ok) {
        // alert(data.error || 'Login failed')
        toast.error(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // ✅ login success
      if (data.teams.length === 0) window.location.href = '/onboarding'
      else if (data.teams.length === 1) window.location.href = `/${data.teams[0].id}`
      else window.location.href = '/select-team'
    } catch (err) {
      setLoading(false)
      console.error('Login error:', err)
      alert('Unexpected error, please try again')
    }
  }

  const register = async (formValues: FormData) => {
    const name = formValues.get('name') as string
    const email = formValues.get('email') as string

    if (!name) {
      setLoading(false)
      toast.warning('Please enter a name to register.')
      return
    }

    if (!name || !email) {
      setLoading(false)
      toast.warning('Please enter an email to register.')
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: formValues.get('email'),
          password: formValues.get('password'),
          name: formValues.get('name'),
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      toast.success('Account created! Please verify your account through email.')
      setRegistered({ name: name, email: email })
      // window.location.href = '/'
    } catch (err) {
      setLoading(false)
      console.error('Register error:', err)
      alert('Unexpected error, please try again')
    }
  }

  return !registered ? (
    <div className='flex h-screen items-center justify-center bg-gray-50'>
      <Card className='w-[380px] p-6 shadow-md'>
        <Tabs defaultValue='login' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='login'>Login</TabsTrigger>
            <TabsTrigger value='register'>Register</TabsTrigger>
          </TabsList>

          {/* Login */}
          <TabsContent value='login'>
            <form
              className='space-y-4'
              onSubmit={async (e) => {
                setLoading(true)
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

              <Button disabled={loading} type='submit' className='w-full'>
                {loading ? <Spinner /> : 'Sign in'}
              </Button>
            </form>
          </TabsContent>

          {/* Register */}
          <TabsContent value='register'>
            <form
              className='space-y-4'
              onSubmit={async (e) => {
                setLoading(true)
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                await register(formData)
              }}
            >
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input required id='name' type='text' name='name' placeholder='Your name' />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input required id='email' type='email' name='email' placeholder='you@example.com' />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input required id='password' type='password' name='password' placeholder='••••••••' />
              </div>

              <Button disabled={loading} type='submit' className='w-full'>
                {loading ? <Spinner /> : 'Create account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  ) : (
    <Registered email={registered.email} name={registered.name} />
  )
}
