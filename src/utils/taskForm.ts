import { DEFAULT_CATEGORY } from '../constants'
import type { TaskFormData } from '../schemas/taskSchema'
import type { NewTaskData, Task } from '../types/task'

/** Значення полів форми: порожні для create, з завдання для edit. */
export function toFormValues(task?: Task): TaskFormData {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    category: task?.category ?? '',
    priority: task?.priority ?? 'medium',
  }
}

/** Дані форми → вхід repository (порожня категорія замінюється на значення за замовчуванням). */
export function toTaskInput(data: TaskFormData): NewTaskData {
  return {
    title: data.title,
    description: data.description,
    category: data.category || DEFAULT_CATEGORY,
    priority: data.priority,
  }
}
