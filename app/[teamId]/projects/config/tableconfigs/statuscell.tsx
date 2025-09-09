'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CellContext } from '@tanstack/react-table'

export function StatusCell<TData>({ getValue, row, column, table }: CellContext<TData, unknown>) {
  const value = getValue() as string

  return (
    <Select defaultValue={value} onValueChange={(val) => table.options.meta?.updateData(row.index, column.id, val)}>
      <SelectTrigger className='w-[140px]'>
        <SelectValue placeholder='Select status' />
      </SelectTrigger>
      <SelectContent className='bg-background'>
        <SelectItem value='Todo'>Todo</SelectItem>
        <SelectItem value='In Progress'>In Progress</SelectItem>
        <SelectItem value='Done'>Done</SelectItem>
      </SelectContent>
    </Select>
  )
}
