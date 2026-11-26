
export interface ApiTodo {
  id: number
  todo: string
  completed: boolean
  userId: number
}

export interface TodosResponse {
  todos: ApiTodo[]
  total: number
  skip: number
  limit: number
}

export interface ApiUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image: string
}

export interface ApiLoginResponse extends ApiUser {
  accessToken: string
  refreshToken: string
}
