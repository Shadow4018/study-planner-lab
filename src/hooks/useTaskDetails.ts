import { useCallback } from 'react'
import { taskRepository } from '../repositories/taskRepository'
import type { Task } from '../types/task'
import { useAsyncData } from './useAsyncData'
import type { AsyncResult } from './useAsyncData'

export function useTaskDetails(id: number): AsyncResult<Task> {
  const load = useCallback(
    (signal: AbortSignal) => taskRepository.getById(id, signal),
    [id],
  )
  return useAsyncData(load)
}
