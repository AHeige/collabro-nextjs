'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CellContext } from '@tanstack/react-table'
import { format } from 'date-fns'
import { useState } from 'react'

export function DateCell<TData>({ getValue, row, column, table }: CellContext<TData, unknown>) {
  const date = getValue() as Date
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' className='w-[140px] justify-start text-left font-normal'>
          {date ? format(date, 'yyyy-MM-dd') : 'Pick a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0 bg-popover' align='start'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={(d) => {
            setOpen(false)
            if (d) {
              table.options.meta?.updateData(row.index, column.id, d)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
