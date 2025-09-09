'use client'

import { flexRender, Table as ReactTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'

interface DataTableProps<TData> {
  table: ReactTable<TData>
}

export function DataTable<TData>({ table }: DataTableProps<TData>) {
  const filter = table.getState().globalFilter as string
  const visible = table.getVisibleLeafColumns().length

  return (
    <div className='py-1 space-y-4'>
      {/* 📋 Table with horizontal scroll */}
      <div className='overflow-x-auto rounded-md border'>
        <Table className='min-w-[900px]'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}

            {/* 👻 Ghost row */}
            <TableRow className='bg-muted/20'>
              <TableCell />
              <TableCell colSpan={Math.max(visible - 1, 1)}>
                <Input
                  placeholder='Add a new task...'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const title = e.currentTarget.value.trim()
                      e.currentTarget.value = ''
                      table.options.meta?.addRow?.({ title })
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
