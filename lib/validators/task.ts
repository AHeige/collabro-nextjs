import { z } from 'zod'
import { Priority } from '@prisma/client'

export const taskBaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10_000).optional().nullable(),
  statusId: z.string().uuid().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.nativeEnum(Priority).optional().nullable(),
})

export const createTaskSchema = taskBaseSchema.extend({
  // title required for create
  title: z.string().min(1),
})

export const updateTaskSchema = taskBaseSchema.partial()
