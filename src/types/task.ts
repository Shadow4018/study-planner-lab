export type Priority = 'low' | 'medium' | 'high'

export type TaskFilter = 'all' | 'completed' | 'active'

export interface Task {
  id: number
  title: string
  description: string
  completed: boolean
  priority: Priority
  category: string
}

/** Дані, які користувач вводить у формі (id та completed задає застосунок). */
export type NewTaskData = Omit<Task, 'id' | 'completed'>
