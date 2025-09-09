// app/not-found.tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Search, Home, MapPinX } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4'>
      <Card className='w-full max-w-lg overflow-hidden border-border/60 shadow-lg'>
        <div className='flex flex-col items-center gap-3 px-8 pb-6 pt-10 text-center'>
          <div className='relative'>
            <div className='absolute inset-0 rounded-full blur-md bg-gradient-to-tr from-primary/30 to-primary/10' />
            <MapPinX className='relative h-12 w-12 text-primary' />
          </div>
          <h1 className='text-xl font-semibold tracking-tight'>Sidan kunde inte hittas</h1>
          <p className='text-sm text-muted-foreground'>Länken kan vara felstavad eller så har innehållet flyttats.</p>
        </div>

        <Separator />

        <div className='px-8 py-6 grid gap-3 sm:grid-cols-2'>
          <Button asChild className='w-full'>
            <Link href='/'>
              <Home className='mr-2 h-4 w-4' /> Till startsidan
            </Link>
          </Button>
          <Button asChild variant='secondary' className='w-full'>
            <Link href='/auth'>
              <Search className='mr-2 h-4 w-4' /> Gå till inloggning
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
