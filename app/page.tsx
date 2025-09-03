'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, LayoutList, Kanban, BarChart3, Zap, Shield, Play } from 'lucide-react'
// import { useAuth } from '@/hooks/useAuth'
import { brand } from '@/config/brand'
import { toast } from 'sonner'

// import { Donation } from '@/components/Donation'

const Landing = () => {
  const router = useRouter()
  // const { signInAnonymously } = useAuth()

  // const handleTryNow = async () => {
  //   const { error } = await signInAnonymously()
  //   if (error) {
  //     toast.error('Failed to start trial. Please try again.')
  //   } else {
  //     toast.success('Welcome to your free trial!')
  //     router.push('/')
  //   }
  // }

  const handleTryNow = () => {
    toast.success('This will work eventually..')
  }

  const features = [
    {
      icon: LayoutList,
      title: 'List View',
      description: 'Organize tasks in a clean, prioritized list format',
    },
    {
      icon: Kanban,
      title: 'Kanban Board',
      description: 'Visualize workflow with drag-and-drop task boards',
    },
    {
      icon: BarChart3,
      title: 'Timeline View',
      description: 'Track project progress with Gantt-style timelines',
    },
    {
      icon: Zap,
      title: 'Quick Actions',
      description: 'Rapid task creation and bulk operations',
    },
  ]

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-subtle via-background to-accent-subtle'>
      {/* Header */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container flex h-16 items-center justify-between'>
          <h1 className='text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>{brand.name}</h1>
          <div className='flex items-center gap-3'>
            <Button asChild variant='ghost'>
              <Link href='/auth'>Sign In</Link>
            </Button>
            <Button asChild>
              <Link href='/auth?tab=signup'>Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='container py-16 md:py-24'>
        <div className='text-center'>
          <Badge variant='success' className='mb-4'>
            <Shield className='mr-1 h-3 w-3' />
            GDPR Compliant & Secure
          </Badge>
          <h1 className='text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent'>
            Organize Your Tasks,
            <br />
            Amplify Your Productivity
          </h1>
          <p className='text-xl text-muted-foreground mb-8 max-w-3xl mx-auto'>
            {brand.description}. Switch between list, kanban, and timeline views to match your workflow and boost your productivity.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button asChild size='lg' variant='outline' className='gap-2 w-full sm:w-auto'>
              <Link href='/auth'>Sign In</Link>
            </Button>
            <Button asChild size='lg' className='gap-2 w-full sm:w-auto'>
              <Link href='/auth?tab=signup'>
                Create Account
                <CheckCircle className='h-5 w-5' />
              </Link>
            </Button>
            <Button size='lg' variant='secondary' className='gap-2 w-full sm:w-auto' onClick={handleTryNow}>
              <Play className='h-5 w-5' />
              Try Free - No Signup
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className='container py-16'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4'>Multiple Ways to View Your Work</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Switch between different views to match your workflow and preferences. Each view is designed to help you focus on what matters most.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className='text-center hover:shadow-lg transition-shadow'>
                <CardHeader>
                  <div className='mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
                    <Icon className='h-6 w-6 text-primary' />
                  </div>
                  <CardTitle className='text-lg'>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Free Forever Section */}
      {/* <Donation /> */}

      {/* Benefits Section */}
      <section className='container py-16'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h2 className='text-3xl font-bold mb-6'>Built for Modern Teams</h2>
            <ul className='space-y-4'>
              {[
                'Create and organize tasks with categories and priorities',
                'Multiple view modes to match your workflow',
                'Quick actions for rapid task management',
                'Secure authentication and data protection',
                'GDPR compliant with full data control',
              ].map((benefit, index) => (
                <li key={index} className='flex items-start gap-3'>
                  <CheckCircle className='h-5 w-5 text-green-600 mt-0.5 flex-shrink-0' />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className='relative'>
            <div className='bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-8 backdrop-blur-sm border'>
              <div className='text-center'>
                <div className='mb-4'>
                  <div className='w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center'>
                    <LayoutList className='h-8 w-8 text-primary-foreground' />
                  </div>
                </div>
                <h3 className='font-semibold mb-2'>Ready to get started?</h3>
                <p className='text-muted-foreground mb-4'>Join thousands of users who trust {brand.name} to organize their work.</p>
                <div className='space-y-2'>
                  <Button className='w-full' onClick={handleTryNow}>
                    <Play className='w-4 h-4 mr-2' />
                    Try Free - No Signup
                  </Button>
                  <Button asChild variant='outline' className='w-full'>
                    <Link href='/auth?tab=signup'>Create Account</Link>
                  </Button>
                  <Button asChild variant='ghost' size='sm' className='w-full'>
                    <Link href='/auth'>Already have an account? Sign In</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t bg-muted/30'>
        <div className='container py-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-muted-foreground'>
              © {new Date().getFullYear()} {brand.name}. Built with privacy and productivity in mind.
            </p>
            <p className='text-sm text-muted-foreground'>Created by {brand.attribution.name}</p>
            <div className='flex gap-4 text-sm text-muted-foreground'>
              <Button variant='ghost' size='sm'>
                Privacy Policy
              </Button>
              <Button variant='ghost' size='sm'>
                Terms of Service
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
