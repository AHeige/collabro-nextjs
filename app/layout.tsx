import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { LoggedInHeader } from '@/components/headers/LoggedInHeader'
import { LoggedOutHeader } from '@/components/headers/LoggedOutHeader'
import { getAuthUserLite } from '@/lib/auth-server'
import { HeaderUser } from '@/types/auth'

export const metadata: Metadata = {
  title: 'Collabro',
  description: 'Project management tool',
}
// (valfritt) se till att detta kör Node:
export const runtime = 'nodejs'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const u = await getAuthUserLite()
  const headerUser: HeaderUser | null = u ? { id: u.id, name: u.name, email: u.email } : null

  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {headerUser ? <LoggedInHeader user={headerUser} /> : <LoggedOutHeader />}
        {children}
        <Toaster richColors />
      </body>
    </html>
  )
}
