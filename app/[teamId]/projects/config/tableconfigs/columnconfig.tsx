import { ColumnDef } from '@tanstack/react-table'
import { Task, Priority } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { TitleCell, StatusCell, PriorityCell, DateCell } from './cells'

function TitleHeader({ title }: { title: string }) {
  return <span className='font-semibold'>{title}</span>
}

export const columnconfig: ColumnDef<Partial<Task>>[] = [
  {
    accessorKey: 'title',
    header: () => <TitleHeader title='Title' />,
    cell: (ctx) => <TitleCell {...ctx} initialValue={(ctx.getValue() as unknown as string) ?? ''} />,
  },
  {
    accessorKey: 'statusId',
    header: () => <TitleHeader title='Status' />,
    cell: (ctx) => <StatusCell {...ctx} value={ctx.getValue() as unknown as string | null} statuses={ctx.table.options.meta?.statuses ?? []} />,
  },
  {
    accessorKey: 'priority',
    header: () => <TitleHeader title='Priority' />,
    cell: (ctx) => <PriorityCell {...ctx} value={(ctx.getValue() as unknown as Priority) ?? 'MEDIUM'} />,
  },
  {
    accessorKey: 'startDate',
    header: () => <TitleHeader title='Start Date' />,
    cell: (ctx) => <DateCell {...ctx} value={ctx.getValue() as unknown as string | null} />,
  },
  {
    accessorKey: 'dueDate',
    header: () => <TitleHeader title='Due Date' />,
    cell: (ctx) => <DateCell {...ctx} value={ctx.getValue() as unknown as string | null} />,
  },
  {
    id: 'actions',
    header: () => <span>Actions</span>,
    cell: ({ row, table }) => {
      const task = row.original
      return (
        <Button
          variant='destructive'
          size='sm'
          onClick={async () => {
            if (!task.id) return
            const key = `/api/projects/${task.projectId}/tasks`
            table.options.meta?.mutate(key, (old) => (old ?? []).filter((t) => t.id !== task.id), { revalidate: false })
            await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
            await table.options.meta?.mutate(key)
          }}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      )
    },
  },
]
