# Архитектура

## Слоистая (layered) архитектура

```
HTTP request
     │
     ▼
┌─────────────┐    routes/       Только декларация эндпоинтов.
│   Routes    │                  Никакой логики, только asyncHandler + контроллер.
└─────┬───────┘
      │
      ▼
┌─────────────┐    controllers/  Парсинг req → вызов сервиса → формирование ответа.
│ Controllers │                  Без бизнес-логики и без обращений к БД.
└─────┬───────┘
      │
      ▼
┌─────────────┐    services/     Вся бизнес-логика, валидация, вызовы внешних API.
│  Services   │                  Бросает ApiError при проблемах.
└─────┬───────┘
      │
      ▼
┌─────────────┐    repositories/ Только Prisma-запросы. Не знает про req/res.
│ Repositories│
└─────┬───────┘
      │
      ▼
┌─────────────┐    config/prisma.js
│   Prisma    │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ PostgreSQL  │
└─────────────┘
```

## Принципы

1. **Однонаправленный поток зависимостей** — слой никогда не вызывает «выше» себя.
2. **Один обязанность на слой** — контроллер не знает про SQL, репозиторий не знает про HTTP.
3. **Маленькие файлы** — один модуль = одна задача. Нет «god-файлов».
4. **Централизованная обработка ошибок** — сервисы кидают `ApiError`, middleware форматирует ответ.
5. **`async/await` + `try/catch`** — никаких `.then()` цепочек.
6. **Конфиг — единая точка** — все `process.env.*` читаются только в `config/env.js`.

## Поток обработки запроса (пример: `POST /api/v1/chat`)

1. **`app.js`** — `express.json()` парсит тело, CORS, прокидывает в роуты.
2. **`routes/chat.routes.js`** — матчит `POST /` → `asyncHandler(chatController.create)`.
3. **`controllers/chatController.js#create`** — берёт `req.body.userMessage`, вызывает `chatService.sendMessage`.
4. **`services/chatService.js#sendMessage`**:
   - Валидирует через `isNonEmptyString`.
   - Зовёт `aiService.generateReply(text)` → HTTP в Gemini.
   - Зовёт `messageRepository.create({...})`.
5. **`repositories/messageRepository.js#create`** — `prisma.message.create(...)`.
6. **Контроллер** заворачивает результат в `success(res, { message }, 201)`.
7. Если в любом месте брошен `ApiError` или иной `Error` — попадает в **`middlewares/errorHandler.js`** и возвращается унифицированный `{ success: false, message }`.

## Обработка ошибок

`utils/ApiError.js` предоставляет фабрики:

```js
ApiError.badRequest('userMessage must be a non-empty string'); // 400
ApiError.notFound('Message not found');                        // 404
ApiError.badGateway('AI provider timed out');                  // 502
ApiError.internal('...');                                      // 500
```

Middleware `errorHandler` дополнительно ловит Prisma-ошибки (`P2025` → 404, остальные `P*` → 500).

## Ответы API

**Успех:**
```json
{ "success": true, "data": { ... } }
```

**Ошибка:**
```json
{ "success": false, "message": "..." }
```

## Что *не* входит в архитектуру (намеренно)

- **DI-контейнер** — оверкил для этого размера.
- **TypeScript** — задача требует JS.
- **Repository-интерфейсы и абстракции** — Prisma уже даёт типизацию и абстракцию.
- **Шину событий / очереди** — нет асинхронных задач кроме AI-запроса.
