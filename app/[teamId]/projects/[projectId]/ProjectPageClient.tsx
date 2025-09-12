'use client'
import { useMemo, useState } from 'react'
import { Status, Task } from '@prisma/client'
import { useSWRConfig } from 'swr'
import useSWR from 'swr'
import {
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { DataTable } from '@/components/ui/datatable'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Loader2, Settings2, Plus } from 'lucide-react'
import { columnconfig } from '../config/tableconfigs/columnconfig'
import { toast } from 'sonner'

type Lite = { id: string; name: string }

export default function ProjectPageClient({ teamName, project }: { teamName: string; project: Lite }) {
  const { mutate } = useSWRConfig()

  // Läs tasks ur SWR-cache (fallback satt i layout.tsx)
  const { data: tasks, isLoading } = useSWR<Partial<Task>[]>(`/api/projects/${project.id}/tasks`)
  const { data: statuses } = useSWR<Pick<Status, 'id' | 'name'>[]>(`/api/projects/${project.id}/statuses`)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(() => columnconfig, [])

  const key = `/api/projects/${project.id}/tasks`

  const table = useReactTable<Partial<Task>>({
    data: tasks ?? [],
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 100 },
    },
    meta: {
      updateData: async (rowIndex, columnId, value) => {
        const targetId = tasks?.[rowIndex].id
        if (!targetId) return

        // Optimistic update
        mutate(key, (old: Partial<Task>[] | undefined) => (old ? old.map((row, idx) => (idx === rowIndex ? { ...row, [columnId]: value } : row)) : old), {
          revalidate: false,
        })

        try {
          const res = await fetch(`/api/tasks/${targetId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [columnId]: value }),
          })
          await mutate(key)
          if (!res.ok) throw new Error()
        } catch {
          toast.error('Update failed, reverting…')
        }
      },

      addRow: async ({ title }) => {
        const tempId = `tmp_${crypto.randomUUID()}`
        const optimistic: Partial<Task> = {
          id: tempId,
          title,
          statusId: 'Todo', // fallback
          projectId: project.id,
        }

        // Optimistic append
        mutate(key, (old: Partial<Task>[] | undefined) => [...(old ?? []), optimistic], {
          revalidate: false,
        })

        try {
          const res = await fetch(`/api/projects/${project.id}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
          })
          if (!res.ok) throw new Error()
          const { task } = await res.json()

          // Replace temp task with server task
          mutate(key, (old: Partial<Task>[] | undefined) => (old ?? []).map((t) => (t.id === tempId ? task : t)), { revalidate: false })
        } catch {
          toast.error(`Could not save task "${title}", reverting…`)
          await mutate(key) // rollback
        } finally {
          await mutate(key) // final sync
        }
      },
      mutate,
      statuses: statuses ?? [],
    },
  })

  return (
    <div className='flex flex-col h-screen'>
      {/* Toolbar */}
      <div className='flex items-center justify-between border-b bg-background px-4 py-2'>
        <div>
          <div className='text-xs text-muted-foreground'>
            {teamName} / <span className='text-foreground'>{project.name}</span>
          </div>
          <h1 className='text-lg font-semibold'>{project.name}</h1>
        </div>
        <div className='flex gap-2 items-center'>
          {isLoading && <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <Settings2 className='h-4 w-4' /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='bg-background'>
              {table.getAllLeafColumns().map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className='capitalize'
                  checked={column.getIsVisible()}
                  onCheckedChange={(val) => column.toggleVisibility(!!val)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size='sm' onClick={() => table.options.meta?.addRow({ title: 'New Task' })}>
            <Plus className='h-4 w-4 mr-1' /> Add
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className='flex-1 overflow-x-auto overflow-y-auto bg-muted/30 px-4'>
        <div className='min-w-[1000px]'>
          <DataTable table={table} />
        </div>
      </div>
    </div>
  )
}
