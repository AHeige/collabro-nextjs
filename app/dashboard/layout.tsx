'use client'

import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className='container'>
      {/* Content */}
      <main className='flex-1 p-6'>{children}</main>
    </div>
  )
}
