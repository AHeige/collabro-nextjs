import { Task } from '@prisma/client'

interface TaskCardProps {
  task: Partial<Task>
  variant: 'list' | 'kanban' | 'gantt'
}

export const TaskCard = ({ task, variant }: TaskCardProps) => {
  switch (variant) {
    case 'list':
      return <TaskList task={task} />
    case 'kanban':
      return <TaskKanban task={task} />
    case 'gantt':
      return <TaskGantt task={task} />
    default:
      return null
  }
}

/* --- List View --- */
const TaskList = ({ task }: { task: Partial<Task> }) => (
  <div
    role='listitem'
    aria-label={`Task: ${task.title}, status ${task.statusId}`}
    className='flex items-center justify-between p-2 border-b rounded-md bg-white'
  >
    <span>{task.title}</span>
    <span className='text-sm text-muted-foreground'>{task.statusId}</span>
  </div>
)

/* --- Kanban View --- */
const TaskKanban = ({ task }: { task: Partial<Task> }) => (
  <article
    role='group'
    aria-roledescription='Kanban task card'
    aria-label={`${task.title}, status ${task.statusId}`}
    className='rounded-md shadow-sm bg-white p-3'
    tabIndex={0} // gör den fokusbar med tangentbord
  >
    <h4 className='text-base font-medium'>{task.title}</h4>
    {task.assigneeId && <p className='text-xs text-muted-foreground'>Assigned to {task.assigneeId}</p>}
  </article>
)

/* --- Gantt View --- */
const TaskGantt = ({ task }: { task: Partial<Task> }) => {
  // default values om vi inte har koordinater än
  const x = (task as any).x ?? 0
  const y = (task as any).y ?? 0
  const width = (task as any).width ?? 100

  return (
    <g role='group' aria-label={`Task: ${task.title}, from ${task.startDate} to ${task.endDate}`} tabIndex={0}>
      <rect x={x} y={y} width={width} height={20} rx={3} fill='var(--primary)'>
        <title>{`${task.title} (${task.statusId})`}</title>
      </rect>
    </g>
  )
}
