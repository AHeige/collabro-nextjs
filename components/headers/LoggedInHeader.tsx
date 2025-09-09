'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { User } from '@prisma/client'
import { HeaderUser } from '@/types/auth'

export function LoggedInHeader({ user }: { user: HeaderUser }) {
  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link href='/dashboard' className='text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
            Collabro
          </Link>
          <nav className='hidden md:flex items-center gap-3 text-sm'>
            <Link href='/dashboard' className='opacity-80 hover:opacity-100'>
              Home
            </Link>
            <Link href='/teams' className='opacity-80 hover:opacity-100'>
              Teams
            </Link>
            <Link href='/projects' className='opacity-80 hover:opacity-100'>
              Projects
            </Link>
            <Link href='/roadmap' className='opacity-80 hover:opacity-100'>
              Roadmap
            </Link>
          </nav>
        </div>

        <div className='flex items-center gap-2'>
          <Button asChild variant='outline' className='hidden sm:inline-flex'>
            <Link href='/projects/new'>New Project</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className='h-8 w-8 cursor-pointer'>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56 bg-background'>
              <div className='px-2 py-1.5 text-xs text-muted-foreground'>{user.name || user.email}</div>
              <DropdownMenuItem asChild>
                <Link href='/account'>Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/settings'>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/auth/signout'>Sign out</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
