# ToDoX — Архітектурна документація

## 1. Призначення системи

ToDoX — це модульна система управління планами та задачами з підтримкою багатого опису задач через блоки (text, image, checklist, code). Архітектура поділена на незалежні backend-модулі та frontend-застосунок на Next.js, об’єднані строгими API-контрактами.

Система реалізує:

* Багатомодульний backend з CQRS та Clean Architecture
* Frontend на Next.js (App Router) з feature-based структурою
* Уніфікований формат блоків задач, спільний для backend і frontend

---

## 2. Загальна архітектурна картина

### 2.1 Логічна схема

```
[ Next.js Frontend ]
        |
        |  HTTP / JSON
        v
[ ToDoX.API (Gateway) ]
        |
        +--> Account Module (Identity, Auth)
        |
        +--> Plans Module (Plans, Tasks, Blocks)
```

### Принципи

* Frontend не знає про внутрішню реалізацію backend і працює лише через HTTP-контракти
* Backend поділений на модулі з власними шарами:
  API → Application → Core → Infrastructure
* Усі залежності спрямовані всередину (Dependency Inversion)

---

## 3. Backend — Загальна архітектура

### 3.1 Структура Backend

```
Backend
 ├── Modules
 │    ├── AccountModule
 │    │    ├── Account.API
 │    │    ├── Account.Application
 │    │    ├── Account.Core
 │    │    └── Account.Infrastructure
 │    ├── PlansModule
 │    │    ├── Plans.API
 │    │    ├── Plans.Application
 │    │    ├── Plans.Core
 │    │    └── Plans.Infrastructure
 │    └── SharedModules
 │         └── ToDoX.Infrastructure
 └── ToDoX.API (composition root)
```

Кожен модуль — ізольована вертикаль:

* API — HTTP endpoints
* Application — CQRS, MediatR, валідація
* Core — доменна модель
* Infrastructure — EF Core, репозиторії, Identity

---

### 3.2 Потік запиту

```
HTTP → Endpoint → Command/Query → MediatR → Handler
     → Domain/Core → Infrastructure → Result → HTTP Response
```

Помилки повертаються через `FluentResults.Result` та мапляться у HTTP-коди в API-шарі.

---

## 4. Account Module — Аутентифікація і користувачі

### 4.1 Призначення

Account Module відповідає за:

* Реєстрацію користувачів
* Логін і refresh-токени
* Управління профілем
* Політики авторизації

---

### 4.2 API-контракти

Базовий шлях: `/account`

| Метод  | URL               | Призначення           |
| ------ | ----------------- | --------------------- |
| POST   | /account/login    | Аутентифікація        |
| POST   | /account/refresh  | Оновлення токена      |
| GET    | /account/by-email | Отримання користувача |
| POST   | /account          | Створення користувача |
| PUT    | /account/{id}     | Оновлення профілю     |
| DELETE | /account          | Видалення користувача |

---

### 4.3 Архітектура Application-шару

Використовується CQRS:

* Кожна операція — Command або Query
* Валідація виконується через MediatR Pipeline

Приклад:

```
AccountEndpoint → LoginCommand → LoginHandler → UserRepositoryServices
```

---

### 4.4 Доменні сутності

#### User

Розширює `IdentityUser`.

Поля:

* RegisteredAtUtc
* LastUpdatedAtUtc
* accountImage : UserImage

Value Object `UserImage` інкапсулює URL зображення.

---

### 4.5 Безпека

* Bearer Token Authentication
* Політики:

  * RequireAdmin — роль Admin
  * User — підписка Default / Pro / Business
  * PaidUser — Pro / Business

Паролі:

* Мінімум 12 символів
* Upper, Lower, Digit, NonAlphanumeric — обов’язкові

---

## 5. Plans Module — Плани і задачі

### 5.1 Призначення

Plans Module реалізує:

* CRUD для Plan
* CRUD для Task
* Підтримку блоків задач
* Валідацію структури блоків

---

### 5.2 API-контракти

#### Plans

| Метод  | URL                |
| ------ | ------------------ |
| GET    | /plans             |
| GET    | /plans/{id}        |
| POST   | /plans/Create      |
| PUT    | /plans/Update      |
| DELETE | /plans/Delete/{id} |

#### Tasks

| Метод  | URL                                   |
| ------ | ------------------------------------- |
| GET    | /plans/{planId}/tasks                 |
| GET    | /plans/{planId}/tasks/{id}            |
| POST   | /plans/{planId}/tasks/Create          |
| PUT    | /plans/{planId}/tasks/{taskId}/Update |
| DELETE | /plans/{planId}/tasks/{taskId}/Delete |

---

### 5.3 Доменні сутності

#### PlanEntity

Поля:

* Id
* Name
* Description
* Tasks
* CreatedAt
* UpdatedAt

---

#### TaskEntity

Поля:

* Id
* PlanId
* Title
* IsCompleted
* Blocks
* CreatedAt
* UpdatedAt

Методи домену:

* AddTextBlock
* AddImageBlock
* AddCheckListBlock
* AddCodeBlock
* RemoveBlockAt

---

### 5.4 Модель блоків задач

Усі блоки наслідуються від `TaskDescriptionBlock`.

Підтримувані типи:

* text
* image
* checklist
* code

Загальні поля:

* Order — порядок у списку
* Row — рядок сітки
* Position — left | right | full

Приклад JSON:

```json
{
  "type": "text",
  "Row": 0,
  "Position": "full",
  "Order": 0,
  "richTextJson": "{...}"
}
```

---

### 5.5 TaskBlockUpdater

Доменний сервіс.

Алгоритм:

1. Видаляє всі існуючі блоки задачі
2. Пересоздає блоки з DTO

Призначення:

* Гарантувати детермінований порядок
* Усунути розсинхронізацію стану блоків

---

## 6. Frontend — Загальна архітектура

### 6.1 Технологічний стек

* Next.js (App Router)
* TypeScript
* TanStack React Query
* TipTap Rich Text
* dnd-kit (Drag & Drop)

---

### 6.2 Структура проєкту

```
app/
features/
shared/
```

Feature-based архітектура:

* кожна бізнес-область має власні api, model і ui

---

## 7. Frontend — Інтеграція з Backend

### 7.1 HTTP-клієнт

`shared/api/http.ts`

* Базовий URL: `NEXT_PUBLIC_API_URL`
* Уніфікована обробка помилок
* Усі запити повертають строго типізовані дані

---

### 7.2 React Query

* QueryKey:

  * `["plans"]`
  * `["plan", id]`
  * `["tasks", planId]`

* Інвалідація після create / update / delete

---

## 8. Rich Text і Code-підсистема

### 8.1 RichText

* TipTap
* JSON-документ, серіалізований у рядок

Компоненти:

* RichTextEditor
* RichTextViewer
* ReadOnlyRichText

---

### 8.2 Code-блоки

* highlight.js
* ts, js, csharp, json

Компоненти:

* CodeEditor
* CodeViewer

---

## 9. End-to-End потік

### Створення задачі

```
UI → POST /plans/{planId}/tasks/Create
   → MediatR Command
   → Handler
   → EF Core
   → SaveChanges
   → invalidateQueries(["tasks", planId])
```

---

### Редагування задачі

```
PUT /plans/{planId}/tasks/{taskId}/Update
→ Handler → TaskBlockUpdater
→ Повна пересборка блоків
→ SaveChanges
→ invalidateQueries
```

---

## 10. Гарантії архітектури

Система гарантує:

* Ізоляцію backend-модулів
* Відсутність витоків Infrastructure у Application
* Строгі DTO-контракти між frontend і backend
* Детерміновану модель блоків
* Повну синхронізацію стану через React Query

---

## 11. Рекомендації з розвитку

1. Додати версіонування API
2. Додати optimistic updates
3. Винести блоки в окремий bounded context
4. Додати аудит-логи змін
5. Додати автозбереження

---

## 12. Висновок

ToDoX — це повнофункціональна модульна система з:

* Чистою backend-архітектурою
* Сучасним frontend з rich UI
* Строгою моделлю даних задач і блоків

Документація описує систему як єдиний наскрізний контур:
від UI до бази даних.
