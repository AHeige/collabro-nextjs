// components/layout/AppShell.tsx
'use client'

import { Calendar, Folder, Home, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

type AppShellProps = {
  teamId: string
  teamName?: string
  children: React.ReactNode
}

export default function AppShell({ teamId, teamName, children }: AppShellProps) {
  const base = `/${teamId}`

  const items = [
    { title: 'Översikt', url: `${base}/dashboard`, icon: Home },
    { title: 'Mina team', url: `/select-team`, icon: Users }, // global sida
    { title: 'Projekt', url: `${base}/projects`, icon: Folder },
    { title: 'Kalender', url: `${base}/calendar`, icon: Calendar },
    { title: 'Inställningar', url: `${base}/settings`, icon: Settings },
  ]

  return (
    <div className='min-h-screen'>
      <SidebarProvider>
        <Sidebar style={{ top: '65px' }}>
          <SidebarHeader>
            <SidebarGroupLabel>{teamName ?? 'Collabro'}</SidebarGroupLabel>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter />
        </Sidebar>

        <main className='p-4'>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  )
}
