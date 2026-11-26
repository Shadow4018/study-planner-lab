import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError, getErrorMessage, normalizeError } from '../api/errors'
import { PAGE_SIZE } from '../constants'
import { useAuth } from '../hooks/useAuth'
import { useTaskPage } from '../hooks/useTaskPage'
import { useTaskQuery } from '../hooks/useTaskQuery'
import { useToast } from '../hooks/useToast'
import { taskRepository } from '../repositories/taskRepository'
import type { TaskPage, TaskPatch } from '../repositories/taskRepository'
import type { AuthActor } from '../types/auth'
import type { NewTaskData, Task } from '../types/task'
import { TaskContext } from './TaskContext'
import type { TaskContextValue } from './TaskContext'

const replaceTask = (task: Task) => (page: TaskPage): TaskPage => ({
  ...page,
  tasks: page.tasks.map((t) => (t.id === task.id ? task : t)),
})

const patchTask =
  (id: number, changes: Partial<Task>) =>
  (page: TaskPage): TaskPage => ({
    ...page,
    tasks: page.tasks.map((t) => (t.id === id ? { ...t, ...changes } : t)),
  })

const removeTask = (id: number) => (page: TaskPage): TaskPage => ({
  ...page,
  tasks: page.tasks.filter((t) => t.id !== id),
  total: Math.max(0, page.total - 1),
})

const prependTask = (task: Task) => (page: TaskPage): TaskPage => ({
  ...page,
  tasks: [task, ...page.tasks],
  total: page.total + 1,
})

const EMPTY_TASKS: Task[] = []

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, logout } = useAuth()
  const { showToast } = useToast()
  const { page, setPage } = useTaskQuery()
  const [busyIds, setBusyIds] = useState<number[]>([])

  const actor = useMemo<AuthActor | null>(
    () =>
      user && accessToken ? { token: accessToken, username: user.username } : null,
    [user, accessToken],
  )

  // ── server state: сторінка завдань з API (з можливістю скасування) ──────
  const { status, data, error, retry, mutate } = useTaskPage(page)

  const tasks = data?.tasks ?? EMPTY_TASKS
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const errorMessage = error ? getErrorMessage(error) : null

  const handleFailure = useCallback(
    (cause: unknown) => {
      const apiError = normalizeError(cause)
      if (apiError instanceof ApiError && apiError.status === 401) logout()
      return apiError
    },
    [logout],
  )

  const reportError = useCallback(
    (cause: unknown) => {
      showToast(getErrorMessage(handleFailure(cause)), 'error')
    },
    [handleFailure, showToast],
  )

  const setBusy = useCallback((id: number, busy: boolean) => {
    setBusyIds((ids) =>
      busy ? [...ids, id] : ids.filter((current) => current !== id),
    )
  }, [])

  const goToPage = useCallback(
    (next: number) => setPage(Math.min(Math.max(1, next), totalPages)),
    [setPage, totalPages],
  )

  // ── операції: HTTP через repository, потім оновлення client state ───────
  const createTask = useCallback(
    async (input: NewTaskData) => {
      try {
        const task = await taskRepository.create(input, actor)
        mutate(prependTask(task))
        showToast('Завдання створено')
      } catch (cause) {
        throw handleFailure(cause)
      }
    },
    [actor, mutate, showToast, handleFailure],
  )

  const updateTask = useCallback(
    async (id: number, patch: TaskPatch) => {
      try {
        const updated = await taskRepository.update(id, patch, actor)
        mutate(replaceTask(updated))
        showToast('Завдання оновлено')
        return updated
      } catch (cause) {
        throw handleFailure(cause)
      }
    },
    [actor, mutate, showToast, handleFailure],
  )

  // Optimistic update: інтерфейс змінюється одразу, а при помилці — відкочується.
  const toggleTask = useCallback(
    async (id: number) => {
      const current = tasks.find((t) => t.id === id)
      if (!current || busyIds.includes(id)) return false

      setBusy(id, true)
      mutate(patchTask(id, { completed: !current.completed }))
      try {
        const updated = await taskRepository.update(
          id,
          { completed: !current.completed },
          actor,
        )
        mutate(replaceTask(updated))
        return true
      } catch (cause) {
        mutate(patchTask(id, { completed: current.completed }))
        reportError(cause)
        return false
      } finally {
        setBusy(id, false)
      }
    },
    [tasks, busyIds, actor, mutate, setBusy, reportError],
  )

  const deleteTask = useCallback(
    async (id: number) => {
      if (busyIds.includes(id)) return false

      setBusy(id, true)
      try {
        await taskRepository.delete(id, actor)
        const wasOnPage = tasks.some((t) => t.id === id)
        mutate(removeTask(id))
        if (wasOnPage && tasks.length === 1 && page > 1) setPage(page - 1)
        showToast('Завдання видалено')
        return true
      } catch (cause) {
        reportError(cause)
        return false
      } finally {
        setBusy(id, false)
      }
    },
    [busyIds, actor, tasks, page, mutate, setBusy, setPage, showToast, reportError],
  )

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      total,
      status,
      errorMessage,
      retry,
      page,
      totalPages,
      goToPage,
      busyIds,
      createTask,
      updateTask,
      toggleTask,
      deleteTask,
    }),
    [
      tasks,
      total,
      status,
      errorMessage,
      retry,
      page,
      totalPages,
      goToPage,
      busyIds,
      createTask,
      updateTask,
      toggleTask,
      deleteTask,
    ],
  )

  return <TaskContext value={value}>{children}</TaskContext>
}
