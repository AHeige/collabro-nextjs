'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Task } from '@prisma/client'
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/datatable'
import { columnconfig } from '../config/tableconfigs/columnconfig'
import { QuickAddForm } from '@/components/tasks/QuickAddForm'

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

  const table = useReactTable<Partial<Task>>({
    data,
    columns: columnconfig as ColumnDef<Partial<Task>, any>[],
    state: {
      globalFilter: '',
    },
    onGlobalFilterChange: (val) => table.setGlobalFilter(val),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setData((old) => old.map((row, index) => (index === rowIndex ? { ...row, [columnId]: value } : row)))
      },
    },
  })

  return (
    <div className='p-6 space-y-6'>
      <h1 className='text-2xl font-semibold'>Tasks in Project {params.projectId}</h1>
      <QuickAddForm
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
      />
      <DataTable table={table} />
    </div>
  )
}
