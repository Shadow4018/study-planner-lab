# Study Planner

Навчальний застосунок для лабораторних робіт з React. Vite + React 19 + TypeScript, SCSS + BEM, ESLint.

- **Лаб. №8** — компоненти, props, `useState`, події, списки.
- **Лаб. №9** — `useReducer`, Context, `useEffect`, `localStorage`, custom hooks.
- **Лаб. №10** — REST API (DummyJSON), `fetch`, repository, loading/error/empty стани,
  пагінація, деталі, CRUD, `AbortController`.

## Запуск

Потрібен Node.js 22.22 або новіший.

```bash
cp .env.example .env     # адреса API (VITE_API_URL=https://dummyjson.com)
npm install
npm run dev              # режим розробки
npm run lint
npm run build
```

Файл `.env` не комітиться (він у `.gitignore`), шаблон — `.env.example`.
Без `VITE_API_URL` застосунок покаже зрозумілу помилку конфігурації.

## Архітектура (лаб. №10)

```
UI-компоненти ──► Context/Provider ──► taskRepository ──► httpClient ──► fetch
 (components/)     (context/, hooks/)   (repositories/)       (api/)
```

```
src/
├── api/
│   ├── httpClient.ts      # fetch: URL з VITE_API_URL, JSON, перевірка response.ok, AbortSignal
│   ├── errors.ts          # ApiError, normalizeError, getErrorMessage, isAbortError
│   └── types.ts           # DTO формату DummyJSON (ApiTodo, TodosResponse)
├── repositories/
│   └── taskRepository.ts  # getAll / getById / create / update / delete, mapping DTO ↔ Task
├── hooks/
│   ├── useAsyncData.ts    # loading/success/error + скасування запитів (AbortController)
│   ├── useTaskPage.ts     # server state: сторінка завдань (limit/skip)
│   ├── useTaskDetails.ts  # server state: деталі одного завдання
│   ├── useTaskContext.ts, useLocalStorage.ts, useDocumentTitle.ts
├── context/               # TaskProvider: server state + client/UI state + операції
├── components/            # Header, TaskForm, TaskStats, TaskFilters, TaskList, TaskItem,
│                          # TaskDetails, Pagination, StatusMessage, Toast, ToastContainer
├── pages/TasksPage.tsx
└── utils/, data/, types/, styles/, constants.ts
```

**Розподіл відповідальності.** Компоненти не містять URL, `fetch` чи DTO — вони викликають
операції з Context. Provider викликає `taskRepository`. Repository знає endpoint-и й
перетворює `ApiTodo` на доменну модель `Task`. `httpClient` — єдине місце з `fetch`.

**Server state vs client/UI state.**

| Server state (з API) | Client/UI state |
|---|---|
| список завдань сторінки, `total` | номер сторінки, фільтр, вибране завдання |
| деталі завдання | режим редагування, підтвердження видалення |
| статус запиту: loading / success / error | toast, `isSubmitting` форми |

Дані завдань більше не зберігаються в `localStorage` і не дублюються: єдине джерело —
результат запиту в `useAsyncData`. У `localStorage` лишається лише UI-налаштування (фільтр).

**Стани інтерфейсу.** Loading (`Loading...`), error (`Помилка завантаження.` + «Спробувати ще»),
empty (`Завдань не знайдено.`), блокування кнопок під час запитів, toast про успіх і помилки.

**Скасування запитів.** `useAsyncData` створює `AbortController` для кожного запиту та
викликає `abort()` в cleanup `useEffect`: при швидкому перемиканні сторінок/завдань і при
unmount попередній запит скасовується, а скасування (`AbortError`) не показується як помилка.

**Операції.** Створення (`POST /todos/add`), оновлення (`PATCH /todos/:id`), видалення
(`DELETE /todos/:id`), деталі (`GET /todos/:id`), список (`GET /todos?limit=10&skip=N`).
Перемикання статусу — optimistic update з відкатом при помилці. Видалення — з
підтвердженням у інтерфейсі (без `alert`).

## Особливості DummyJSON

DummyJSON лише **симулює** зміни й нічого не зберігає, тому:

- після кожної успішної mutation клієнт сам оновлює state; після перезавантаження сторінки
  (або повторного завантаження сторінки списку) зміни зникають — це очікувана поведінка;
- `POST /todos/add` завжди повертає `id: 255`, а запису на сервері не створюється: щоб
  створені завдання мали унікальні id й працювали (деталі, статус, видалення), repository
  видає їм клієнтські id та тримає в пам'яті, не надсилаючи для них PATCH/DELETE/GET (вони б
  повернули 404). Для реального API цей блок не потрібен;
- API не має полів `description`, `priority`, `category` — це client-only metadata:
  в API вони не відправляються, для завдань з сервера мають значення за замовчуванням;
- фільтр «Всі / Виконані / Не виконані» застосовується до завантаженої сторінки.

## Що показати на захисті

1. Перезавантажити сторінку: `Loading...` → список із API (вкладка Network: `GET /todos?limit=10&skip=0`).
2. Пагінація; швидко натиснути «Вперед» кілька разів — у Network попередні запити `canceled`.
3. Вимкнути мережу (DevTools → Offline) → «Помилка завантаження» → увімкнути → «Спробувати ще».
4. «Деталі» → окремий запит `GET /todos/:id`.
5. Створити, відмітити, перейменувати, видалити завдання → відповідні запити й toast.
6. Код: `api/httpClient.ts`, `repositories/taskRepository.ts`, `hooks/useAsyncData.ts`.

## Git

```bash
git checkout -b feature/rest-api
git commit -m "feat(lab-10): integrate rest api"
```
