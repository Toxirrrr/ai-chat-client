# Структура проекта

```
server/
├── docs/                       ← эта документация
│
├── prisma/
│   ├── schema.prisma           ← модели БД
│   └── migrations/             ← SQL-миграции
│
├── generated/prisma/           ← Prisma Client (gitignored)
│
├── src/
│   ├── config/
│   │   ├── env.js              ← единая точка чтения process.env
│   │   └── prisma.js           ← Prisma Client + driver adapter (pg)
│   │
│   ├── routes/
│   │   ├── index.js            ← объединяет /health и /chat под /api/v1
│   │   ├── health.routes.js    ← GET /health, GET /health/db
│   │   └── chat.routes.js      ← все /chat эндпоинты
│   │
│   ├── controllers/
│   │   ├── healthController.js ← health, dbHealth
│   │   └── chatController.js   ← create, list, getOne, remove, search, stats
│   │
│   ├── services/
│   │   ├── healthService.js    ← getHealth, getDbHealth (SELECT 1)
│   │   ├── chatService.js      ← бизнес-логика чата + пагинация
│   │   └── aiService.js        ← Google Gemini / OpenAI HTTP вызовы
│   │
│   ├── repositories/
│   │   └── messageRepository.js ← Prisma-запросы по Message
│   │
│   ├── middlewares/
│   │   ├── errorHandler.js     ← централизованная обработка ошибок
│   │   └── notFound.js         ← 404 для несуществующих путей
│   │
│   ├── utils/
│   │   ├── ApiError.js         ← кастомный класс ошибки + фабрики
│   │   ├── asyncHandler.js     ← обёртка для async-роутов
│   │   ├── response.js         ← success() / failure() хелперы
│   │   └── validators.js       ← isUuid, isNonEmptyString, toInt, toBool
│   │
│   ├── app.js                  ← Express app: middleware + routes
│   └── server.js               ← bootstrap + graceful shutdown
│
├── .env                        ← локальные секреты (gitignored)
├── .env.example                ← шаблон
├── .gitignore
├── package.json
├── prisma.config.ts            ← URL для миграций (Prisma 7)
└── README.md
```

## Зачем такое разделение

### `config/`
Всё, что про окружение и инфраструктуру. Ровно одно место чтения `process.env`.

### `routes/`
Декларация: метод, путь, обработчик. Никакой логики.

### `controllers/`
Тонкий слой: достать данные из `req`, вызвать сервис, вернуть `success(...)`.
Здесь **нельзя**: SQL, бизнес-правила, прямые вызовы внешних API.

### `services/`
Сердце приложения. Знает про доменные правила, валидацию, оркестрацию вызовов
репозиториев и внешних API. Возвращает чистые данные/доменные объекты.

### `repositories/`
Изолируют Prisma. Если завтра менять ORM — изменения только тут.

### `middlewares/`
Кросс-функциональные слои Express: логирование, ошибки, аутентификация (когда появится).

### `utils/`
Маленькие чистые функции без зависимостей от Express/Prisma.

## Правила именования

- Файлы — `camelCase`, кроме классов: `ApiError.js`.
- Роуты — `<feature>.routes.js`.
- Контроллеры/сервисы/репозитории — `<feature>Controller.js` и т.д.
- Экспорты — **named** (`export const x = ...`); `default` остаётся для обратной совместимости.
