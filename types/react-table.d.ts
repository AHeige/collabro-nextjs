// types/react-table.d.ts
import { Task, Status } from '@prisma/client'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => Promise<void>
    addRow: (row: { title: string }) => Promise<void>
    mutate: (key: string, updater?: (old: Partial<Task>[] | undefined) => Partial<Task>[] | undefined, opts?: { revalidate?: boolean }) => Promise<void> | void
    statuses: Pick<Status, 'id' | 'name'>[]
  }
}
