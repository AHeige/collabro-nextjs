'use client'

import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { CellContext } from '@tanstack/react-table'

export function EditableCell<TData>({ getValue, row, column, table }: CellContext<TData, unknown>) {
  const initialValue = getValue() as string
  const [value, setValue] = useState(initialValue)

  return (
    <Input
      value={value ?? ''}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => table.options.meta?.updateData(row.index, column.id, value)}
      className='w-full'
    />
  )
}
