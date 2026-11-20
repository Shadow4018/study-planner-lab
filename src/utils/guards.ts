import { filterOptions } from '../data/labels'
import type { TaskFilter } from '../types/task'

export function isTaskFilter(value: unknown): value is TaskFilter {
  return (
    typeof value === 'string' && (filterOptions as string[]).includes(value)
  )
}
