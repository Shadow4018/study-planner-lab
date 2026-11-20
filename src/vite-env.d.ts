/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Базовий URL REST API, наприклад https://dummyjson.com (без слеша в кінці). */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
