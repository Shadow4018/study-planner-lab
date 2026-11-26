export type Priority = 'low' | 'medium' | 'high'

export type TaskFilter = 'all' | 'completed' | 'active'

/** Фільтр за пріоритетом у URL: `all` (параметра немає) або один із пріоритетів. */
export type PriorityFilter = Priority | 'all'

export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: string
  /**
   * CLIENT-OWNED metadata: DummyJSON не має цих полів, тому їх задає клієнт
   * (а не сервер) під час створення завдання. Для завдань, отриманих із
   * сервера, автор і дата невідомі — тут `null`.
   */
  createdBy: string | null
  /** CLIENT-OWNED metadata, ISO-рядок дати (див. createdBy). */
  createdAt: string | null
}

/** Дані, які користувач вводить у формі (решту задає застосунок). */
export type NewTaskData = Pick<
  Task,
  'title' | 'description' | 'category' | 'priority'
>
