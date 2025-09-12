import { Task, Priority, User } from '@prisma/client'
import { CellContext } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

/** Title cell */
type TitleCellProps = CellContext<Partial<Task>, unknown> & {
  initialValue: string
}
export function TitleCell({ initialValue, row, column, table }: TitleCellProps) {
  const [value, setValue] = useState(initialValue)

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        if (value !== initialValue) {
          table.options.meta?.updateData(row.index, column.id, value)
        }
      }}
      className='w-full'
    />
  )
}

/** Status cell */
type StatusCellProps = CellContext<Partial<Task>, unknown> & {
  value: string | null
  statuses: { id: string; name: string }[]
}
export function StatusCell({ value, row, column, table, statuses }: StatusCellProps) {
  return (
    <Select defaultValue={value ?? undefined} onValueChange={(v) => table.options.meta?.updateData(row.index, column.id, v)}>
      <SelectTrigger className='w-[140px]'>
        <SelectValue placeholder='Select status' />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Priority cell */
type PriorityCellProps = CellContext<Partial<Task>, unknown> & {
  value: Priority
}
export function PriorityCell({ value, row, column, table }: PriorityCellProps) {
  return (
    <Select defaultValue={value} onValueChange={(v) => table.options.meta?.updateData(row.index, column.id, v)}>
      <SelectTrigger className='w-[120px]'>
        <SelectValue placeholder='Priority' />
      </SelectTrigger>
      <SelectContent className='bg-background'>
        <SelectItem value='LOW'>Low</SelectItem>
        <SelectItem value='MEDIUM'>Medium</SelectItem>
        <SelectItem value='HIGH'>High</SelectItem>
      </SelectContent>
    </Select>
  )
}

/** Date cell */
type DateCellProps = CellContext<Partial<Task>, unknown> & {
  value: string | null
}
export function DateCell({ value, row, column, table }: DateCellProps) {
  const [date, setDate] = useState<Date | null>(value ? new Date(value) : null)

  useEffect(() => {
    setDate(value ? new Date(value) : null)
  }, [value])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='w-[140px] justify-start text-left font-normal'>
          {date ? format(date, 'yyyy-MM-dd') : <span className='text-muted-foreground'>Pick date</span>}
          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='p-0 bg-background'>
        <Calendar
          mode='single'
          selected={date ?? undefined}
          onSelect={(d) => {
            if (d) {
              setDate(d)
              table.options.meta?.updateData(row.index, column.id, d?.toISOString())
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/** Assignee cell */
type AssigneeCellProps = CellContext<Partial<Task>, unknown> & {
  value: string | null
  users: Pick<User, 'id' | 'name'>[]
}
export function AssigneeCell({ value, row, column, table, users }: AssigneeCellProps) {
  return (
    <Select defaultValue={value ?? undefined} onValueChange={(v) => table.options.meta?.updateData(row.index, column.id, v)}>
      <SelectTrigger className='w-[160px]'>
        <SelectValue placeholder='Assign user' />
      </SelectTrigger>
      <SelectContent className='bg-background'>
        {users.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            {u.name ?? u.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
