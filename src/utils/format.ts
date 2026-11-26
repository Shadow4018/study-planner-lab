/** Дата й час для інтерфейсу; null → «невідомо» (завдання з сервера не мають дати). */
export function formatDateTime(iso: string | null): string {
  if (iso === null) return 'невідомо'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'невідомо'
  return date.toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' })
}
