'use client'

import { Column } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { Filter, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react'

interface TitleHeaderProps<TData> {
  column: Column<TData, unknown>
}

export function TitleHeader<TData>({ column }: TitleHeaderProps<TData>) {
  const isSorted = column.getIsSorted() as false | 'asc' | 'desc'
  const value = (column.getFilterValue() as string) ?? ''

  console.log(value)

  return (
    <div className='flex items-center gap-1'>
      {/* Sort button */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => column.toggleSorting(isSorted === 'asc')}
        aria-label={
          isSorted === 'asc'
            ? 'Sorted ascending. Click to sort descending'
            : isSorted === 'desc'
            ? 'Sorted descending. Click to clear sort'
            : 'Not sorted. Click to sort ascending'
        }
        className='flex items-center gap-1'
      >
        Title
        {isSorted === 'asc' && <ArrowUp className='h-3 w-3 text-foreground' />}
        {isSorted === 'desc' && <ArrowDown className='h-3 w-3 text-foreground' />}
        {!isSorted && <ArrowUpDown className='h-3 w-3 text-muted-foreground' />}
      </Button>

      {/* Filter dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button style={{ background: value ? 'bg-background' : '' }} variant='ghost' size='sm' aria-label='Filter Title'>
            <Filter className={`h-4 w-4`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='p-2 w-56 bg-background'>
          <div className='flex items-center gap-2'>
            <Input placeholder='Filter by title...' value={value} onChange={(e) => column.setFilterValue(e.target.value)} className='flex-1' />
            {value && (
              <Button variant='ghost' size='icon' onClick={() => column.setFilterValue('')} aria-label='Clear title filter'>
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
