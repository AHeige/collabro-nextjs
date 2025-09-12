// Simple in-process event emitter you can later bridge to WS/Redis
type EventName = 'task.created' | 'task.updated' | 'task.deleted'
type Listener = (payload: unknown) => void

const listeners = new Map<EventName, Set<Listener>>()

export function on(event: EventName, fn: Listener) {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(fn)
  return () => listeners.get(event)!.delete(fn)
}

export function emit(event: EventName, payload: unknown) {
  const subs = listeners.get(event)
  if (!subs) return
  for (const fn of subs) {
    try {
      fn(payload)
    } catch (e) {
      console.error(e)
      throw new Error('Something whent wrong')
    }
  }
}
