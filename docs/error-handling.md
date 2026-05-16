# Обработка ошибок

## Унифицированный формат ответа

**Успех:**
```json
{ "success": true, "data": { ... } }
```

**Ошибка:**
```json
{ "success": false, "message": "Описание ошибки" }
```

Это гарантировано **всеми** эндпоинтами — даже 404, 500 и валидационные ошибки идут через тот же формат.

## Класс `ApiError`

Файл: `src/utils/ApiError.js`

```js
class ApiError extends Error {
  constructor(statusCode, message) { ... }

  static badRequest(msg)  // 400
  static notFound(msg)    // 404
  static badGateway(msg)  // 502
  static internal(msg)    // 500
}
```

Используется в сервисах:
```js
if (!isUuid(id)) throw ApiError.badRequest('Invalid id format');
const m = await repo.findById(id);
if (!m) throw ApiError.notFound('Message not found');
```

## Middleware `errorHandler`

Файл: `src/middlewares/errorHandler.js`

Порядок проверок:

1. **`ApiError`** → используется его `statusCode` и `message`.
2. **Prisma-ошибки** (любой `err.code` начинающийся с `P`):
   - `P2025` (запись не найдена) → 404 `"Resource not found"`
   - остальные → 500 `"Database error"`
3. **Любая другая ошибка** → 500 + `console.error(...)` (чтобы не терять stack-trace).

Регистрируется **последним** в `app.js`:
```js
app.use('/api/v1', routes);
app.use(notFound);       // 404 для несуществующих путей
app.use(errorHandler);   // финальный обработчик
```

## `asyncHandler` — почему это важно

Express 4 не ловит `Promise rejections` из async-роутов автоматически. Поэтому
все async-контроллеры обёрнуты в:

```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

Это передаёт ошибку в `next(err)` → попадает в `errorHandler`.

> Express 5 уже поддерживает async-обработку, но `asyncHandler` оставлен для ясности
> и совместимости — лишних накладных расходов нет.

## Коды ошибок: что когда возвращается

| Код | Когда                                                        |
| --- | ------------------------------------------------------------ |
| 400 | Невалидный `userMessage`, `id` не UUID, пустой `q`           |
| 404 | Маршрут не существует / запись не найдена / Prisma `P2025`   |
| 500 | Неожиданная ошибка / БД / необработанное исключение           |
| 502 | AI-провайдер вернул ошибку, таймаут, сеть упала              |

## Логирование

Сейчас минимальное:
- `[db]`, `[server]` — стартовые сообщения
- `[error]` — стек ошибок 500 в `console.error`

Для прода рекомендуется заменить на `pino` (или `winston`) с JSON-форматом и
correlation-id через middleware. Это **не сделано умышленно** — оверкил для текущего скоупа.

## Примеры ошибок клиенту

### 400
```json
{ "success": false, "message": "userMessage must be a non-empty string" }
```

### 404
```json
{ "success": false, "message": "Message not found" }
```

### 502 (AI)
```json
{ "success": false, "message": "AI provider error (429): {...quota exceeded...}" }
```

### 500 (внезапная ошибка)
```json
{ "success": false, "message": "Internal server error" }
```
(оригинальный stack уходит в `console.error`, клиенту не отдаётся.)
