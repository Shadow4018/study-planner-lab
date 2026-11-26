import { useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { priorityOptions } from '../data/labels'
import type { PriorityFilter, TaskFilter } from '../types/task'
import { isTaskFilter } from '../utils/guards'

type QueryKey = 'status' | 'priority' | 'page'

function parsePriority(value: string | null): PriorityFilter {
  return priorityOptions.find((option) => option === value) ?? 'all'
}

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

export function useTaskQuery() {
  const [params, setParams] = useSearchParams()

  const rawStatus = params.get('status')
  const status: TaskFilter = isTaskFilter(rawStatus) ? rawStatus : 'all'
  const priority = parsePriority(params.get('priority'))
  const page = parsePage(params.get('page'))

  const update = useCallback(
    (changes: Partial<Record<QueryKey, string | null>>) => {
      setParams((previous) => {
        const next = new URLSearchParams(previous)
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === undefined) next.delete(key)
          else next.set(key, value)
        }
        return next
      })
    },
    [setParams],
  )

  const setStatus = useCallback(
    (value: TaskFilter) => update({ status: value === 'all' ? null : value }),
    [update],
  )
  const setPriority = useCallback(
    (value: PriorityFilter) => update({ priority: value === 'all' ? null : value }),
    [update],
  )
  const setPage = useCallback(
    (value: number) => update({ page: value <= 1 ? null : String(value) }),
    [update],
  )

  return { status, priority, page, setStatus, setPriority, setPage }
}
