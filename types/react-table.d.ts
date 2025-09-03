import { TableMeta } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends object> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}
