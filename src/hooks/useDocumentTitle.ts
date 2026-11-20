import { useEffect } from 'react'

/** Синхронізує заголовок вкладки браузера (зовнішня система) зі state. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
