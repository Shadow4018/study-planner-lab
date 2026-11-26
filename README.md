# Study Planner

Навчальний застосунок для лабораторних робіт з React. Vite + React 19 + TypeScript, SCSS + BEM, ESLint.

- **Лаб. №8** — компоненти, props, `useState`, події, списки.
- **Лаб. №9** — `useReducer`, Context, `useEffect`, `localStorage`, custom hooks.
- **Лаб. №10** — REST API (DummyJSON), `fetch`, repository, loading/error/empty стани,
  пагінація, деталі, CRUD, `AbortController`.
- **Лаб. №11** — React Router 8 (Declarative Mode), форми React Hook Form + Zod,
  автентифікація й авторизація (DummyJSON `/auth/*`, Bearer token).

## Запуск

Потрібен Node.js 22.22 або новіший.

```bash
cp .env.example .env     # адреса API (VITE_API_URL=https://dummyjson.com)
npm install              # react-router, react-hook-form, zod, @hookform/resolvers
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
│   ├── useTaskContext.ts, useDocumentTitle.ts          # лаб. 10
│   ├── useAuth.ts, useAuthGuard.ts, useToast.ts,       # лаб. 11
│   │   useTaskQuery.ts
├── context/               # TaskProvider: server state + client/UI state + операції
├── components/            # (лаб. 10; у лаб. 11 TaskForm/TaskDetails замінено на TaskFormDialog і сторінку деталей)
├── pages/
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
результат запиту в `useAsyncData`. (У лаб. 11 фільтри переїхали в URL, а в `localStorage` лишився лише access token для відновлення сесії.)

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

## Лаб. №11 — routing, форми, авторизація

Парний варіант → **Declarative Mode**: `BrowserRouter`, `Routes`, `Route`, protected route
як компонент-обгортка (`ProtectedRoute`).

### Маршрути

| Адреса | Сторінка | Доступ |
|---|---|---|
| `/` | редирект на `/tasks` | всі |
| `/tasks` | список (`?status=&priority=&page=`) | всі |
| `/tasks/:taskId` | деталі (route param) | всі |
| `/login` | форма входу (RHF + Zod) | всі |
| `/profile` | профіль, Logout | **лише авторизовані** |
| `*` | NotFound (404) | всі |

Дерево маршрутів — `src/routes/AppRoutes.tsx`. `AppLayout` (шапка + навігація + `<Outlet />`)
— батьківський route для всіх сторінок; `TasksLayout` дає один `TaskProvider` для `/tasks` і
`/tasks/:taskId`, тому перехід список ↔ деталі не перезавантажує список.

### Route params і query params

- `:taskId` — **ідентифікує ресурс** (`useParams`), `/tasks/42`;
- `?status=completed&priority=high&page=2` — **стан представлення** списку (`useSearchParams`).
  Фільтри й сторінка живуть **лише в URL** (хук `useTaskQuery`), окремого `useState` немає:
  після reload чи копіювання посилання стан відновлюється. Значення за замовчуванням в URL не пишуться.
- Посилання «Деталі» переносить query списку (`/tasks/11?page=2`), тому «До списку» повертає
  на ту саму сторінку з тими самими фільтрами.

### Автентифікація та авторизація

- `AuthContext` / `AuthProvider`: `user`, `accessToken`, `isAuthenticated`, `isRestoring`,
  `login`, `logout`. Ззовні — `useAuth()`.
- `authRepository`: `POST /auth/login`, `GET /auth/me`. Тестовий акаунт: `emilys` / `emilyspass`.
- **Bearer token формується в одному місці** — `httpClient` (опція `token` → заголовок
  `Authorization: Bearer …`). Компоненти й repository заголовок не збирають.
- Перегляд списку й деталей відкритий; **create / edit / delete потребують входу**.
  Захист у два рівні, а не лише приховані кнопки:
  1. `useAuthGuard()` у UI: гість → toast + перехід на `/login` (з поверненням назад);
  2. `taskRepository` сам перевіряє `actor` **до** запиту й кидає `ApiError('auth')`;
     токен для POST/PATCH/DELETE іде в `httpClient`.
- `ProtectedRoute`: поки сесія відновлюється — Loading; немає входу → `<Navigate to="/login">`
  зі `state.from`; інакше `<Outlet />`. Після входу `LoginPage` повертає на `from`
  (лише внутрішні адреси).
- Відновлення сесії: access token у `localStorage`, при старті перевіряється `GET /auth/me`;
  недійсний токен очищається. **Ризик:** токен у `localStorage` доступний будь-якому скрипту
  сторінки (XSS); у production краще httpOnly-cookie. Refresh token flow не реалізовано.

### Форми

`TaskFormDialog` — **один** компонент для create (кнопка «+» на `/tasks`) і edit (кнопка
«Редагувати» на `/tasks/:taskId`): режим і початкові дані приходять через props
`{ open, mode, task?, onClose, onSubmit }`. Нативний `<dialog>` + `showModal()`: модальність,
фокус усередині, закриття по Escape й кнопкою «Скасувати», `aria-labelledby` на заголовок.
Валідація — Zod-схеми (`schemas/taskSchema.ts`, `schemas/authSchema.ts`) через
`@hookform/resolvers`; помилки під полями; під час запиту кнопка Submit заблокована, діалог не
закривається; успіх → діалог закривається, UI оновлюється, toast.

### createdBy / createdAt

DummyJSON таких полів не має, тому вони **client-owned metadata** (позначено в
`types/task.ts` та `taskRepository`): автора й дату ставить клієнт при створенні. Для завдань
із сервера значення `null` (в інтерфейсі — «невідомо»).

### Що змінилось відносно лаб. №10

- Новий маршрутизований каркас: `App` → `routes/AppRoutes`; сторінки `pages/*`, `layouts/*`.
- Фільтри та сторінка перенесені з `useLocalStorage`/`useState` в URL (`hooks/useTaskQuery`);
  `useLocalStorage` видалено.
- Панель деталей і inline-форма замінені на сторінку `/tasks/:taskId` і `TaskFormDialog`.
- Toast винесено в окремий глобальний `ToastProvider` (потрібен і Login, і guard).
- `Task` отримав `createdBy`, `createdAt`; `taskRepository.create/update/delete` приймають `actor`.
- `taskRepository` запам'ятовує зміни завдань із сервера на час сесії (DummyJSON не зберігає
  їх), щоб сторінка деталей після редагування/видалення показувала актуальні дані.

## Що показати на захисті

1. Гість: `/tasks` → `/tasks/42` → «Редагувати» → перехід на `/login`; у Network немає POST/PATCH/DELETE.
2. Login: порожні поля / пароль `123` (помилки Zod), неправильний пароль, потім `emilys`/`emilyspass`
   → повернення на `/tasks/42`.
3. «+» → `TaskFormDialog` (create), Escape, pending-стан; у Network `POST /todos/add` із `Authorization: Bearer`.
4. «Редагувати» на `/tasks/:taskId` — той самий діалог із заповненими полями; `PATCH /todos/:id` із Bearer.
5. Query params: фільтр і сторінка в URL, reload зберігає стан.
6. `/profile` у гостя → `/login`; після входу доступний; Logout → знову закритий.
7. Код: `routes/AppRoutes.tsx`, `routes/ProtectedRoute.tsx`, `context/AuthProvider.tsx`,
   `api/httpClient.ts` (Bearer), `components/TaskFormDialog.tsx`, `hooks/useTaskQuery.ts`.

## Git

```bash
git checkout -b feature/routing-auth
git commit -m "feat(lab-11): add routing and protected auth"
```
