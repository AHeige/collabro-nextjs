'use client'

import { Column } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>
  label: string
}

export function SortableHeader<TData>({ column, label }: SortableHeaderProps<TData>) {
  const isSorted = column.getIsSorted() as false | 'asc' | 'desc'

  const ariaSort = isSorted === 'asc' ? 'ascending' : isSorted === 'desc' ? 'descending' : 'none'

  return (
    <Button
      variant='ghost'
      onClick={() => column.toggleSorting(isSorted === 'asc')}
      aria-sort={ariaSort}
      aria-label={
        isSorted === 'asc'
          ? `${label}, sorted ascending. Click to sort descending`
          : isSorted === 'desc'
          ? `${label}, sorted descending. Click to clear sort`
          : `${label}, not sorted. Click to sort ascending`
      }
      className='flex items-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
    >
      {label}
      {isSorted === 'asc' && <ArrowUp className='ml-2 h-4 w-4 text-foreground' />}
      {isSorted === 'desc' && <ArrowDown className='ml-2 h-4 w-4 text-foreground' />}
      {!isSorted && <ArrowUpDown className='ml-2 h-4 w-4 text-muted-foreground' />}
    </Button>
  )
}
