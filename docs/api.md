# API справочник

**Base URL:** `http://localhost:3000/api/v1`
**Content-Type:** `application/json`

Все ответы имеют единый формат — см. [error-handling.md](./error-handling.md).

## Health

### `GET /health`

Базовая проверка работоспособности.

**200 OK**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 13.07,
    "timestamp": "2026-05-16T10:20:56.238Z"
  }
}
```

### `GET /health/db`

Проверка соединения с БД (`SELECT 1`).

**200 OK**
```json
{
  "success": true,
  "data": { "status": "ok", "db": "postgresql", "latencyMs": 117 }
}
```

**500** — если БД недоступна.

---

## Chat

### `POST /chat`

Принимает сообщение пользователя, обращается к AI, сохраняет пару в БД.

**Request body:**
```json
{ 
  "userMessage": "Привет!",
  "model": "gemini-1.5-flash" 
}
```

**Валидация:**
- `userMessage` — строка, длина `1..8000`, после `trim()` не пустая.
- `model` — опциональная строка, идентификатор модели (например, `gemini-1.5-flash`, `gemini-2.0-flash`). Если не передано, используется модель по умолчанию.

**201 Created**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "8d6f...",
      "userMessage": "Привет!",
      "aiResponse": "Здравствуй! Чем могу помочь?",
      "isFavorite": false,
      "createdAt": "2026-05-16T10:25:00.000Z"
    }
  }
}
```

**Ошибки:**
- `400` — невалидный `userMessage`
- `502` — провайдер AI недоступен / вернул ошибку / таймаут

#### Пример (PowerShell):
```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:3000/api/v1/chat `
  -ContentType 'application/json' `
  -Body '{"userMessage":"Привет"}'
```

---

### `GET /chat`

Список сообщений с пагинацией.

**Query params:**

| Параметр     | Тип      | По умолч. | Описание                            |
| ------------ | -------- | --------- | ----------------------------------- |
| `page`       | int ≥ 1  | `1`       | Номер страницы                      |
| `limit`      | int 1–100| `20`      | Размер страницы                     |
| `isFavorite` | `true`/`false` | —   | Фильтр по избранному                |

**200 OK**
```json
{
  "success": true,
  "data": {
    "items": [ { "id": "...", "userMessage": "...", "aiResponse": "...", "isFavorite": false, "createdAt": "..." } ],
    "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
  }
}
```

#### Пример:
```
GET /api/v1/chat?page=2&limit=10&isFavorite=true
```

---

### `GET /chat/search`

Поиск по `userMessage` и `aiResponse` (case-insensitive substring).

**Query params:**

| Параметр | Тип    | Обяз. | Описание                |
| -------- | ------ | ----- | ----------------------- |
| `q`      | string | да    | Поисковый запрос        |
| `page`   | int    | нет   | Пагинация (см. выше)    |
| `limit`  | int    | нет   | Пагинация (см. выше)    |

**200 OK** — формат тот же, что у `GET /chat`.

**400** — если `q` пустой.

#### Пример:
```
GET /api/v1/chat/search?q=postgres&page=1&limit=10
```

---

### `GET /chat/stats`

Агрегированная статистика.

**200 OK**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "favorites": 5,
    "nonFavorites": 37,
    "lastMessageAt": "2026-05-16T10:25:00.000Z"
  }
}
```

---

### `GET /chat/:id`

Получить одно сообщение по UUID.

**200 OK**
```json
{ "success": true, "data": { "message": { ... } } }
```

**Ошибки:**
- `400` — `id` не UUID
- `404` — не найдено

---

### `PATCH /chat/:id/favorite`

Установить или переключить флаг `isFavorite`.

**Body (опционально):**
```json
{ "isFavorite": true }
```

- если `isFavorite` передан — устанавливает указанное значение
- если тело пустое — **переключает** текущее значение

**200 OK**
```json
{ "success": true, "data": { "message": { ...обновлённое сообщение... } } }
```

**Ошибки:**
- `400` — `id` не UUID
- `404` — не найдено

---

### `DELETE /chat/:id`

Удалить сообщение.

**200 OK**
```json
{ "success": true, "data": { "id": "8d6f..." } }
```

**Ошибки:**
- `400` — `id` не UUID
- `404` — не найдено

---

## Сводная таблица

| Метод  | Путь                    | Описание                         |
| ------ | ----------------------- | -------------------------------- |
| GET    | `/health`               | Health check                     |
| GET    | `/health/db`            | DB ping                          |
| POST   | `/chat`                 | Создать сообщение + ответ AI     |
| GET    | `/chat`                 | Список (пагинация + фильтр)      |
| GET    | `/chat/search?q=...`    | Поиск                            |
| GET    | `/chat/stats`           | Статистика                       |
| GET    | `/chat/:id`             | Одно сообщение                   |
| PATCH  | `/chat/:id/favorite`    | Установить / переключить избр.   |
| DELETE | `/chat/:id`             | Удалить                          |

> **Важно:** `/chat/search` и `/chat/stats` объявлены в роутере **до** `/chat/:id`,
> иначе Express поймал бы их как `id`.
