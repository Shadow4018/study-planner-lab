import { ApiError, isAbortError } from './errors'

type Query = Record<string, string | number>

interface RequestOptions {
  query?: Query
  body?: unknown
  signal?: AbortSignal
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

function buildUrl(path: string, query?: Query): string {
  const baseUrl = import.meta.env.VITE_API_URL
  if (!baseUrl) {
    throw new ApiError('config', 'Змінна середовища VITE_API_URL не задана')
  }

  const url = new URL(`${baseUrl.replace(/\/+$/, '')}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()
    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      return data.message
    }
  } catch {
  }
  return response.statusText || `HTTP ${response.status}`
}

async function request<T>(
  method: Method,
  path: string,
  { query, body, signal }: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, query)

  let response: Response
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ApiError('network', 'Не вдалося виконати запит до сервера')
  }

  if (!response.ok) {
    throw new ApiError('http', await readErrorMessage(response), response.status)
  }

  try {
    return (await response.json()) as T
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ApiError('parse', 'Відповідь сервера не є коректним JSON', response.status)
  }
}

export const httpClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, options),

  post: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...options, body }),

  patch: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PATCH', path, { ...options, body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('DELETE', path, options),
}
