import { httpClient } from '../api/httpClient'
import type { ApiTodo, TodosResponse } from '../api/types'
import type { NewTaskData, Task } from '../types/task'


const TODOS = '/todos'
const DEFAULT_USER_ID = 1

export interface TaskPage {
  tasks: Task[]
  total: number
  skip: number
  limit: number
}

export interface TaskPatch {
  title?: string
  completed?: boolean
}

interface GetAllParams {
  limit: number
  skip: number
  signal?: AbortSignal
}

// ── Mapping DTO - domain ──────────────────────────────────────────────────

function toTask(todo: ApiTodo): Task {
  return {
    id: todo.id,
    title: todo.todo,
    description: '',
    completed: todo.completed,
    priority: 'medium',
    category: 'General',
  }
}

function toApiPatch(patch: TaskPatch): Partial<Pick<ApiTodo, 'todo' | 'completed'>> {
  const body: Partial<Pick<ApiTodo, 'todo' | 'completed'>> = {}
  if (patch.title !== undefined) body.todo = patch.title
  if (patch.completed !== undefined) body.completed = patch.completed
  return body
}

const LOCAL_ID_START = 1_000_000
let nextLocalId = LOCAL_ID_START
const localTasks = new Map<number, Task>()

function isLocalId(id: number): boolean {
  return localTasks.has(id)
}

// ── Публічний API repository ──────────────────────────────────────────────

export const taskRepository = {
  async getAll({ limit, skip, signal }: GetAllParams): Promise<TaskPage> {
    const data = await httpClient.get<TodosResponse>(TODOS, {
      query: { limit, skip },
      signal,
    })
    return {
      tasks: data.todos.map(toTask),
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    }
  },

  /** Актуальні дані одного завдання. */
  async getById(id: number, signal?: AbortSignal): Promise<Task> {
    const local = localTasks.get(id)
    if (local) return local

    return toTask(await httpClient.get<ApiTodo>(`${TODOS}/${id}`, { signal }))
  },

  async create(data: NewTaskData): Promise<Task> {
    const created = await httpClient.post<ApiTodo>(`${TODOS}/add`, {
      todo: data.title,
      completed: false,
      userId: DEFAULT_USER_ID,
    })

    const task: Task = {
      ...toTask(created),
      id: nextLocalId++,
      description: data.description,
      category: data.category,
      priority: data.priority,
    }
    localTasks.set(task.id, task)
    return task
  },

  async update(id: number, patch: TaskPatch): Promise<Task> {
    const local = localTasks.get(id)
    if (local) {
      const next = { ...local, ...patch }
      localTasks.set(id, next)
      return next
    }

    return toTask(
      await httpClient.patch<ApiTodo>(`${TODOS}/${id}`, toApiPatch(patch)),
    )
  },

  async delete(id: number): Promise<void> {
    if (isLocalId(id)) {
      localTasks.delete(id)
      return
    }

    await httpClient.delete(`${TODOS}/${id}`)
  },
}
