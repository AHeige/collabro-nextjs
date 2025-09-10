'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Sparkles } from 'lucide-react'

interface Props {
  name: string
  email: string
}

export default function Registered({ name, email }: Props) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4'>
      <Card className='w-full max-w-md overflow-hidden border-border/60 shadow-lg'>
        {/* Header */}
        <div className='relative flex flex-col items-center gap-3 px-6 pb-4 pt-8'>
          <div className='relative'>
            <div className='absolute inset-0 rounded-full blur-md bg-gradient-to-tr from-primary/30 to-primary/10' />
            <CheckCircle2 className='relative h-12 w-12 text-primary' />
          </div>
          <h1 className='text-xl font-semibold tracking-tight'>Välkommen {name}</h1>
          <h2 className='text-xl font-semibold tracking-tight'>Kontot har skapats!</h2>
          <p className='text-sm text-muted-foreground text-center'>Vi har skickat ett verifikationsmail till <span className='font-medium'>{email}</span>. Bekräfta din e-post för att börja använda Collabro.</p>
        </div>

        <Separator />

        {/* Email row */}
        {/* <div className='px-6 py-5'>
          <div className='flex items-center justify-between rounded-xl border bg-card px-3 py-2'>
            <div className='flex items-center gap-2 text-sm'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              <span className='font-medium'>{email}</span>
            </div>
            <Button variant='ghost' size='icon' onClick={copyEmail} aria-label='Copy email'>
              <Copy className='h-4 w-4' />
            </Button>
          </div> */}

        {/* Actions */}
        {/* <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2'>
            <Button onClick={openMail} className='w-full' variant='default'>
              Öppna mailapp
              <ExternalLink className='ml-2 h-4 w-4' />
            </Button>
            <Button onClick={resend} className='w-full' variant='secondary' disabled={resending}>
              {resending ? <>Skickar…</> : <>Skicka om verifikation</>}
            </Button>
          </div>
        </div> */}

        {/* <Separator /> */}

        {/* Footer hint */}
        <div className='flex items-center justify-between px-6 py-4 text-xs text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <Sparkles className='h-3.5 w-3.5' />
            Tips: Kolla även skräppost om mailet inte syns.
          </div>
          <Link href='/auth' className='underline hover:text-foreground'>
            Till inloggningen
          </Link>
        </div>
      </Card>
    </div>
  )
}
