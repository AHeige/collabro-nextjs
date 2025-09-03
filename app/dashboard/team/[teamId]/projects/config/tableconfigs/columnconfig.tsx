'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Task } from '@prisma/client'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateCell } from './datacell'
import { EditableCell } from './editablecell'
import { SortableHeader } from './sortableheader'
import { StatusCell } from './statuscell'
import { TitleHeader } from './titleheader'

export const columnconfig: ColumnDef<Partial<Task>>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label='Select all' />
    ),
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <TitleHeader column={column} />,
    cell: ({ getValue }) => <span>{getValue() as string}</span>,
  },
  {
    accessorKey: 'statusId',
    header: ({ column }) => (
      <div className='flex items-center gap-2'>
        <SortableHeader column={column} label='Status' />
        <Select value={(column.getFilterValue() as string) ?? 'all'} onValueChange={(val) => column.setFilterValue(val === 'all' ? undefined : val)}>
          <SelectTrigger className='h-8 w-[120px]'>
            <SelectValue placeholder='All' />
          </SelectTrigger>
          <SelectContent className='bg-background'>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='Todo'>Todo</SelectItem>
            <SelectItem value='In Progress'>In Progress</SelectItem>
            <SelectItem value='Done'>Done</SelectItem>
          </SelectContent>
        </Select>
      </div>
    ),
    cell: StatusCell,
    filterFn: 'equals',
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => <SortableHeader column={column} label='Start Date' />,
    cell: DateCell,
  },
  {
    accessorKey: 'endDate',
    header: ({ column }) => <SortableHeader column={column} label='End Date' />,
    cell: DateCell,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const task = row.original
      return (
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={() => alert(`Edit ${task.title}`)}>
            Edit
          </Button>
          <Button variant='destructive' size='sm' onClick={() => alert(`Delete ${task.title}`)}>
            Delete
          </Button>
        </div>
      )
    },
  },
]
