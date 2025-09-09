'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LoggedOutHeader() {
  const brand = { name: 'Collabro' }
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between'>
        <h1 className='text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>{brand.name}</h1>
        <div className='flex items-center gap-3'>
          <Button asChild variant='ghost'>
            <Link href='/auth'>Sign In</Link>
          </Button>
          <Button asChild>
            <Link href='/auth?tab=signup'>Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
