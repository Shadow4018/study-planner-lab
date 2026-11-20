import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { AsyncStatus } from '../hooks/useAsyncData'
import type { NewTaskData, Task, TaskFilter } from '../types/task'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastData {
  id: number
  message: string
  variant: ToastVariant
}

export interface TaskContextValue {
  // ── server state ──
  tasks: Task[]
  total: number
  status: AsyncStatus
  errorMessage: string | null
  retry: () => void

  // ── client/UI state ──
  page: number
  totalPages: number
  goToPage: (page: number) => void
  filter: TaskFilter
  setFilter: Dispatch<SetStateAction<TaskFilter>>
  selectedId: number | null
  selectTask: (id: number) => void
  closeDetails: () => void
  /** id завдань, для яких зараз виконується запит (кнопки блокуються). */
  busyIds: number[]
  toast: ToastData | null
  dismissToast: () => void

  // ── операції (через taskRepository) ──
  createTask: (data: NewTaskData) => Promise<boolean>
  toggleTask: (id: number) => Promise<boolean>
  renameTask: (id: number, title: string) => Promise<boolean>
  deleteTask: (id: number) => Promise<boolean>
}

export const TaskContext = createContext<TaskContextValue | null>(null)
