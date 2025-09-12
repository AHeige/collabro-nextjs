import { Status, Task } from '@prisma/client'

export type CollabroTableMeta = {
  updateData: (rowIndex: number, columnId: string, value: unknown) => Promise<void>
  addRow: (row: { title: string }) => Promise<void>
  mutate: (key: string, updater?: (old: Partial<Task>[] | undefined) => Partial<Task>[] | undefined, opts?: { revalidate?: boolean }) => Promise<void> | void
  statuses: Pick<Status, 'id' | 'name'>[] // ✅ lägg till här
}
