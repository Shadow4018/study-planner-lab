import { ApiError } from '../api/errors'
import { httpClient } from '../api/httpClient'
import type { ApiTodo, TodosResponse } from '../api/types'
import type { AuthActor } from '../types/auth'
import type { NewTaskData, Task } from '../types/task'

/**
 * Repository для Task: єдине місце, яке знає endpoint-и DummyJSON та формат DTO.
 * UI отримує й віддає лише доменну модель Task.
 */

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
  description?: string
  category?: string
  priority?: Task['priority']
}

interface GetAllParams {
  limit: number
  skip: number
  signal?: AbortSignal
}

// ── Авторизація ───────────────────────────────────────────────────────────

function requireActor(actor: AuthActor | null): AuthActor {
  if (actor === null) {
    throw new ApiError('auth', 'Потрібна авторизація')
  }
  return actor
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
    createdBy: null,
    createdAt: null,
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
const patches = new Map<number, TaskPatch>()
const removed = new Set<number>()

function isLocalId(id: number): boolean {
  return localTasks.has(id)
}

function fromServer(todo: ApiTodo): Task {
  const task = toTask(todo)
  const patch = patches.get(task.id)
  return patch ? { ...task, ...patch } : task
}

// ── Публічний API repository ──────────────────────────────────────────────

export const taskRepository = {
  async getAll({ limit, skip, signal }: GetAllParams): Promise<TaskPage> {
    const data = await httpClient.get<TodosResponse>(TODOS, {
      query: { limit, skip },
      signal,
    })
    return {
      tasks: data.todos.filter((todo) => !removed.has(todo.id)).map(fromServer),
      total: Math.max(0, data.total - removed.size),
      skip: data.skip,
      limit: data.limit,
    }
  },

  async getById(id: number, signal?: AbortSignal): Promise<Task> {
    const local = localTasks.get(id)
    if (local) return local
    if (removed.has(id)) throw new ApiError('http', 'Not Found', 404)

    return fromServer(await httpClient.get<ApiTodo>(`${TODOS}/${id}`, { signal }))
  },

  async create(data: NewTaskData, actor: AuthActor | null): Promise<Task> {
    const { token, username } = requireActor(actor)

    const created = await httpClient.post<ApiTodo>(
      `${TODOS}/add`,
      { todo: data.title, completed: false, userId: DEFAULT_USER_ID },
      { token },
    )

    const task: Task = {
      ...toTask(created),
      id: nextLocalId++,
      description: data.description,
      category: data.category,
      priority: data.priority,
      createdBy: username,
      createdAt: new Date().toISOString(),
    }
    localTasks.set(task.id, task)
    return task
  },

  async update(id: number, patch: TaskPatch, actor: AuthActor | null): Promise<Task> {
    const { token } = requireActor(actor)

    const local = localTasks.get(id)
    if (local) {
      const next = { ...local, ...patch }
      localTasks.set(id, next)
      return next
    }

    const updated = await httpClient.patch<ApiTodo>(
      `${TODOS}/${id}`,
      toApiPatch(patch),
      { token },
    )
    patches.set(id, { ...patches.get(id), ...patch })
    return fromServer(updated)
  },

  async delete(id: number, actor: AuthActor | null): Promise<void> {
    const { token } = requireActor(actor)

    if (isLocalId(id)) {
      localTasks.delete(id)
      return
    }

    await httpClient.delete(`${TODOS}/${id}`, { token })
    removed.add(id)
    patches.delete(id)
  },
}
