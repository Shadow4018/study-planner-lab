import type { Priority, TaskFilter } from '../types/task'

export const priorityLabels: Record<Priority, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
}

export const filterLabels: Record<TaskFilter, string> = {
  all: 'Всі',
  completed: 'Виконані',
  active: 'Не виконані',
}

export const priorityOptions: Priority[] = ['low', 'medium', 'high']

export const filterOptions: TaskFilter[] = ['all', 'completed', 'active']
