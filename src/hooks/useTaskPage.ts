import { useCallback } from 'react'
import { PAGE_SIZE } from '../constants'
import { taskRepository } from '../repositories/taskRepository'
import type { TaskPage } from '../repositories/taskRepository'
import { useAsyncData } from './useAsyncData'
import type { AsyncResult } from './useAsyncData'

export function useTaskPage(page: number): AsyncResult<TaskPage> {
  const load = useCallback(
    (signal: AbortSignal) =>
      taskRepository.getAll({
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        signal,
      }),
    [page],
  )
  return useAsyncData(load)
}
