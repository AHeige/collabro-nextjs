'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
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
import { columnconfig } from '../config/tableconfigs/columnconfig'
import { QuickAddForm } from '@/components/tasks/QuickAddForm'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-react'

// Mock data
const mockTasks: Partial<Task>[] = [
  {
    id: '1',
    title: 'Design UI theme',
    statusId: 'In Progress',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-09-05'),
  },
  {
    id: '2',
    title: 'Implement TaskCard',
    statusId: 'Todo',
    startDate: new Date('2025-09-06'),
    endDate: new Date('2025-09-08'),
  },
  {
    id: '3',
    title: 'Set up DB schema',
    statusId: 'Done',
    startDate: new Date('2025-08-28'),
    endDate: new Date('2025-08-30'),
  },
]

export default function ProjectPage() {
  const params = useParams<{ teamId: string; projectId: string }>()
  const [data, setData] = useState<Partial<Task>[]>(mockTasks)

  // Sorting + Filters
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable<Partial<Task>>({
    data,
    columns: columnconfig,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((old) => old.map((row, index) => (index === rowIndex ? { ...row, [columnId]: value } : row)))
      },
      addRow: ({ title }: { title: string }) => {
        setData((old) => [
          ...old,
          {
            id: crypto.randomUUID(),
            title,
            statusId: 'Todo',
            startDate: null,
            endDate: null,
          },
        ])
      },
    },
  })

  return (
    <div className='flex flex-col h-screen'>
      {/* 🔹 Toolbar */}
      <div className='flex items-center justify-between border-b bg-background px-4 py-2'>
        <h1 className='text-lg font-semibold'>Project {params.projectId}</h1>

        <div className='flex gap-2 items-center'>
          {/* <QuickAddForm
            onAdd={(task) => {
              setData((old) => [
                ...old,
                {
                  id: crypto.randomUUID(),
                  title: task.title,
                  statusId: task.statusId,
                  startDate: null,
                  endDate: null,
                },
              ])
            }}
          /> */}

          {/* ⚙️ Column toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <Settings2 className='h-4 w-4' />
                Columns
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
        </div>
      </div>

      {/* 🔹 Fullscreen table area */}
      <div className='flex-1 overflow-x-auto overflow-y-auto bg-muted/30 px-4'>
        <div className='min-w-[1000px]'>
          <DataTable table={table} />
        </div>
      </div>
    </div>
  )
}
