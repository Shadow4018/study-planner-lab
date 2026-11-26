import { createContext } from 'react'
import type { AsyncStatus } from '../hooks/useAsyncData'
import type { TaskPatch } from '../repositories/taskRepository'
import type { NewTaskData, Task } from '../types/task'

export interface TaskContextValue {
  // ── server state ──
  tasks: Task[]
  total: number
  status: AsyncStatus
  errorMessage: string | null
  retry: () => void

  // ── пагінація (значення з URL) ──
  page: number
  totalPages: number
  goToPage: (page: number) => void

  busyIds: number[]

  createTask: (data: NewTaskData) => Promise<void>
  updateTask: (id: number, patch: TaskPatch) => Promise<Task>
  toggleTask: (id: number) => Promise<boolean>
  deleteTask: (id: number) => Promise<boolean>
}

export const TaskContext = createContext<TaskContextValue | null>(null)
