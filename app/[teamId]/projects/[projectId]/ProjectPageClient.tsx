'use client'
import { useEffect, useMemo, useState } from 'react'
import { Task } from '@prisma/client'
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
export default function ProjectPageClient({ initialTasks, team, project }: { initialTasks: Partial<Task>[]; team: Lite; project: Lite }) {
  const [data, setData] = useState<Partial<Task>[]>(initialTasks)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Valfri “tyst” revalidering i bakgrunden (utan att blocka första render)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setIsRefreshing(true)
        const res = await fetch(`/api/projects/${project.id}/tasks`, { credentials: 'include', cache: 'no-store' })
        const json = await res.json().catch(() => ({}))
        if (!alive) return
        if (res.ok && Array.isArray(json.tasks)) setData(json.tasks)
      } finally {
        if (alive) setIsRefreshing(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [project.id])

  // Memoisera kolumnkonfig så tabellen inte re-renderar i onödan
  const columns = useMemo(() => columnconfig, [])

  const table = useReactTable<Partial<Task>>({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((old) => old.map((row, idx) => (idx === rowIndex ? { ...row, [columnId]: value } : row)))
        // TODO: background PATCH (optimistisk uppd.)
      },
      addRow: async ({ title }: { title: string }) => {
        // Optimistisk add
        const tempId = `tmp_${crypto.randomUUID()}`
        const optimistic: Partial<Task> = { id: tempId, title, statusId: 'Todo' as any, startDate: null, endDate: null, projectId: project.id }
        setData((old) => [...old, optimistic])

        try {
          const res = await fetch(`/api/projects/${project.id}/tasks`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
          })
          if (!res.ok) {
            toast.error(`Could not save task "${title}", reverting...`)
            throw new Error()
          }
          const { task } = await res.json()
          // toast.success(`Added new task "${title}"`)
          setData((old) => old.map((t) => (t.id === tempId ? task : t)))
        } catch {
          toast.error(`Could not save task "${title}", reverting...`)
          // Rollback
          setData((old) => old.filter((t) => t.id !== tempId))
        }
      },
    },
  })

  return (
    <div className='flex flex-col h-screen'>
      {/* Toolbar */}
      <div className='flex items-center justify-between border-b bg-background px-4 py-2'>
        <div>
          <div className='text-xs text-muted-foreground'>
            {team.name} / <span className='text-foreground'>{project.name}</span>
          </div>
          <h1 className='text-lg font-semibold'>{project.name}</h1>
        </div>
        <div className='flex gap-2 items-center'>
          {isRefreshing && <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />}
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
                  style={{ cursor: 'pointer' }}
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
