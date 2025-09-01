'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Flex } from '@radix-ui/themes'
import { Text } from '@radix-ui/themes/components/callout'

import Link from 'next/link'

export default function Home() {
  return (
    <Flex direction={'row'} wrap={'wrap'} justify={'center'} style={{ textAlign: 'center' }}>
      <Text>Welcome to Collabro</Text>
      <Button>
        <Link href={'/auth'}>Login Page</Link>
      </Button>
    </Flex>
  )
}
