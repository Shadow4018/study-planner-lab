import { useContext } from 'react'
import { TaskContext } from '../context/TaskContext'
import type { TaskContextValue } from '../context/TaskContext'

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext)

  if (context === null) {
    throw new Error(
      'useTaskContext потрібно викликати всередині <TaskProvider>. ' +
        'Обгорніть компонент у TaskProvider (див. main.tsx).',
    )
  }

  return context
}
