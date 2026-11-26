import { httpClient } from '../api/httpClient'
import type { ApiLoginResponse, ApiUser } from '../api/types'
import type { AuthUser, Credentials } from '../types/auth'

/** Repository автентифікації: єдине місце, що знає endpoint-и /auth/* DummyJSON. */

export interface LoginResult {
  user: AuthUser
  accessToken: string
}

function toUser(dto: ApiUser): AuthUser {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    image: dto.image,
  }
}

export const authRepository = {
  async login(credentials: Credentials, signal?: AbortSignal): Promise<LoginResult> {
    const data = await httpClient.post<ApiLoginResponse>(
      '/auth/login',
      { username: credentials.username, password: credentials.password },
      { signal },
    )
    return { user: toUser(data), accessToken: data.accessToken }
  },

  async getCurrentUser(token: string, signal?: AbortSignal): Promise<AuthUser> {
    return toUser(await httpClient.get<ApiUser>('/auth/me', { token, signal }))
  },
}
