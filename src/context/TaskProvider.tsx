import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { getErrorMessage, normalizeError } from '../api/errors'
import { FILTER_STORAGE_KEY, PAGE_SIZE } from '../constants'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTaskPage } from '../hooks/useTaskPage'
import { taskRepository } from '../repositories/taskRepository'
import type { TaskPage } from '../repositories/taskRepository'
import type { NewTaskData, Task, TaskFilter } from '../types/task'
import { isTaskFilter } from '../utils/guards'
import { TaskContext } from './TaskContext'
import type { TaskContextValue, ToastData, ToastVariant } from './TaskContext'

interface TaskProviderProps {
  children: ReactNode
}

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

export function TaskProvider({ children }: TaskProviderProps) {
  // ── client/UI state ─────────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useLocalStorage<TaskFilter>(
    FILTER_STORAGE_KEY,
    'all',
    isTaskFilter,
  )
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [busyIds, setBusyIds] = useState<number[]>([])
  const [toast, setToast] = useState<ToastData | null>(null)
  const toastSeq = useRef(0)

  // ── server state: сторінка завдань з API (з можливістю скасування) ──────
  const { status, data, error, retry, mutate } = useTaskPage(page)

  const tasks = data?.tasks ?? EMPTY_TASKS
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const errorMessage = error ? getErrorMessage(error) : null

  // ── toast ───────────────────────────────────────────────────────────────
  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      toastSeq.current += 1
      setToast({ id: toastSeq.current, message, variant })
    },
    [],
  )
  const dismissToast = useCallback(() => setToast(null), [])

  const reportError = useCallback(
    (cause: unknown) => {
      showToast(getErrorMessage(normalizeError(cause)), 'error')
    },
    [showToast],
  )

  const setBusy = useCallback((id: number, busy: boolean) => {
    setBusyIds((ids) =>
      busy ? [...ids, id] : ids.filter((current) => current !== id),
    )
  }, [])

  // ── навігація ───────────────────────────────────────────────────────────
  const goToPage = useCallback(
    (next: number) => setPage(Math.min(Math.max(1, next), totalPages)),
    [totalPages],
  )
  const selectTask = useCallback((id: number) => setSelectedId(id), [])
  const closeDetails = useCallback(() => setSelectedId(null), [])

  // ── операції: HTTP через repository, потім оновлення client state ───────
  const createTask = useCallback(
    async (input: NewTaskData) => {
      try {
        const task = await taskRepository.create(input)
        mutate(prependTask(task))
        showToast('Завдання створено')
        return true
      } catch (cause) {
        reportError(cause)
        return false
      }
    },
    [mutate, showToast, reportError],
  )

  // Optimistic update: інтерфейс змінюється одразу, а при помилці — відкочується.
  const toggleTask = useCallback(
    async (id: number) => {
      const current = tasks.find((t) => t.id === id)
      if (!current || busyIds.includes(id)) return false

      setBusy(id, true)
      mutate(patchTask(id, { completed: !current.completed }))
      try {
        const updated = await taskRepository.update(id, {
          completed: !current.completed,
        })
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
    [tasks, busyIds, mutate, setBusy, reportError],
  )

  const renameTask = useCallback(
    async (id: number, title: string) => {
      if (busyIds.includes(id)) return false

      setBusy(id, true)
      try {
        const updated = await taskRepository.update(id, { title })
        mutate(patchTask(id, { title: updated.title }))
        showToast('Назву змінено')
        return true
      } catch (cause) {
        reportError(cause)
        return false
      } finally {
        setBusy(id, false)
      }
    },
    [busyIds, mutate, setBusy, showToast, reportError],
  )

  const deleteTask = useCallback(
    async (id: number) => {
      if (busyIds.includes(id)) return false

      setBusy(id, true)
      try {
        await taskRepository.delete(id)
        mutate(removeTask(id))
        setSelectedId((current) => (current === id ? null : current))
        if (tasks.length === 1 && page > 1) setPage(page - 1)
        showToast('Завдання видалено')
        return true
      } catch (cause) {
        reportError(cause)
        return false
      } finally {
        setBusy(id, false)
      }
    },
    [busyIds, tasks.length, page, mutate, setBusy, showToast, reportError],
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
      filter,
      setFilter,
      selectedId,
      selectTask,
      closeDetails,
      busyIds,
      toast,
      dismissToast,
      createTask,
      toggleTask,
      renameTask,
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
      filter,
      setFilter,
      selectedId,
      selectTask,
      closeDetails,
      busyIds,
      toast,
      dismissToast,
      createTask,
      toggleTask,
      renameTask,
      deleteTask,
    ],
  )

  return <TaskContext value={value}>{children}</TaskContext>
}
