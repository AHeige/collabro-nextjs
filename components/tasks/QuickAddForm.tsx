'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface QuickAddFormProps {
  onAdd: (task: { title: string; statusId: string }) => void
}

export function QuickAddForm({ onAdd }: QuickAddFormProps) {
  const [title, setTitle] = useState('')
  const [statusId, setStatusId] = useState('Todo')

  const handleSubmit = () => {
    if (!title.trim()) return
    onAdd({ title, statusId })
    setTitle('')
    setStatusId('Todo')
  }

  return (
    <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center'>
      <Input
        placeholder='New task title...'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className='sm:w-64'
      />
      <Select value={statusId} onValueChange={setStatusId}>
        <SelectTrigger className='sm:w-40'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent className='bg-background'>
          <SelectItem value='Todo'>Todo</SelectItem>
          <SelectItem value='In Progress'>In Progress</SelectItem>
          <SelectItem value='Done'>Done</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleSubmit}>Add Task</Button>
    </div>
  )
}
