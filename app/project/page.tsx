'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from '@/components/ui/breadcrumb'
import { Task } from '@prisma/client'
import { TaskCard } from '@/components/tasks/TaskCard'

const mockTasks: Partial<Task>[] = [
  { id: '1', title: 'Design UI theme', statusId: 'In Progress' },
  { id: '2', title: 'Implement TaskCard', statusId: 'Todo' },
  { id: '3', title: 'Set up DB schema', statusId: 'Done' },
]

export default function ProjectPage() {
  const [tasks] = useState<Partial<Task>[]>(mockTasks)

  return (
    <div className='flex h-screen' role='application' aria-label='Project management workspace'>
      {/* Sidebar */}
      {/* <Sidebar /> */}

      {/* Main content */}
      <div className='flex flex-col flex-1'>
        {/* Topbar */}
        <header className='flex items-center justify-between border-b px-6 py-3 bg-background' role='banner'>
          <Breadcrumb aria-label='Breadcrumb'>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href='/projects'>Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink href='#' aria-current='page'>
                  Collabro MVP
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className='flex items-center gap-2'>
            <label htmlFor='search-tasks' className='sr-only'>
              Search tasks
            </label>
            <Input id='search-tasks' type='search' placeholder='Search tasks...' className='w-64' />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' aria-haspopup='menu' aria-label='Open user menu'>
                  User
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <button type='button'>Profile</button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button type='button'>Settings</button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button type='button'>Logout</button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content area */}
        <main className='flex-1 p-6 overflow-y-auto' role='main'>
          <Tabs defaultValue='list' className='space-y-4' aria-label='View tasks'>
            <TabsList aria-label='Task view options'>
              <TabsTrigger value='list' aria-controls='task-list'>
                List
              </TabsTrigger>
              <TabsTrigger value='kanban' aria-controls='task-kanban'>
                Kanban
              </TabsTrigger>
              <TabsTrigger value='gantt' aria-controls='task-gantt'>
                Gantt
              </TabsTrigger>
            </TabsList>

            <TabsContent value='list' id='task-list' role='region' aria-label='List view of tasks' className='space-y-2'>
              {tasks.map((t) => (
                <TaskCard key={t.id} task={t} variant='list' />
              ))}
            </TabsContent>

            <TabsContent value='kanban' id='task-kanban' role='region' aria-label='Kanban board of tasks' className='grid grid-cols-3 gap-4'>
              {tasks.map((t) => (
                <TaskCard key={t.id} task={t} variant='kanban' />
              ))}
            </TabsContent>

            <TabsContent value='gantt' id='task-gantt' role='region' aria-label='Gantt chart of tasks'>
              <Card className='p-4'>
                {/* Här kommer SVG Gantt in */}
                <svg role='img' aria-label='Task timeline'>
                  {tasks.map((t) => (
                    <TaskCard key={t.id} task={t} variant='gantt' />
                  ))}
                </svg>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
