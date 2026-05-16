# Troubleshooting / FAQ

## `ERR_MODULE_NOT_FOUND: generated/prisma/index.js`

**Причина:** не запущен `prisma generate`.

```powershell
npm run prisma:generate
```

Если файл всё равно не появился — проверь, что в `schema.prisma` стоит:
```prisma
generator client {
  provider = "prisma-client-js"   ← важно: -js
  output   = "../generated/prisma"
}
```

> `provider = "prisma-client"` (без `-js`) генерирует TypeScript — для прямого
> запуска через `node` нужен именно `prisma-client-js`.

## `P1001: Can't reach database server at localhost:51214`

**Причина:** в `.env` старый `DATABASE_URL` (например, от `npx create-db`).

Замени на правильную строку:
```ini
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/aichat?schema=public"
```

## `P1012: The datasource property url is no longer supported`

**Причина:** Prisma 7 убрал `url` из `schema.prisma`. URL берётся из `prisma.config.ts`.

В `schema.prisma` должно быть:
```prisma
datasource db {
  provider = "postgresql"
}
```

## `psql is not recognized`

`psql` не в PATH. Используй полный путь:
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "..."
```

Или добавь `C:\Program Files\PostgreSQL\18\bin` в системный PATH.

## `AI provider error (429): quota exceeded`

Ключ Google AI выработал бесплатную квоту, либо ключ-плейсхолдер.
Создай новый: https://aistudio.google.com/app/apikey

## `AI provider error (401)` / `(403)`

- OpenAI: ключ невалидный или истёк.
- Google: неправильный ключ или ограничен по API.
- Проверь, что `AI_API_KEY` в `.env` без кавычек/пробелов.

## `AI provider timed out`

Запрос к AI занял больше `AI_TIMEOUT_MS` (по умолч. 30 сек). Увеличь:
```ini
AI_TIMEOUT_MS=60000
```

## `400 Bad Request: userMessage must be a non-empty string`

Тело запроса не парсится как JSON либо `userMessage` пустой.

PowerShell:
```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:3000/api/v1/chat `
  -ContentType 'application/json' `
  -Body '{"userMessage":"hi"}'
```

`curl.exe` на Windows капризничает с кавычками — лучше `Invoke-RestMethod` или Postman.

## CORS-ошибки на фронте

В `.env` укажи нужный origin:
```ini
CORS_ORIGIN=http://localhost:5173
```

Множественные домены сейчас не поддержаны — если нужно, замени `cors({ origin: env.corsOrigin })` в `app.js` на функцию-проверку.

## Миграция применилась, а таблицы нет

Возможно, ты в **другой БД**. Проверь:
```sql
SELECT current_database();
\dt
```

Сверь, что `DATABASE_URL` указывает именно на `aichat`.

## Удалить и пересоздать БД

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "DROP DATABASE aichat;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE aichat;"
npm run prisma:migrate -- --name init
```

Или через Prisma:
```powershell
npx prisma migrate reset
```

## Сервер не перезагружается после правок

`npm run dev` использует `node --watch`. Он следит за импортами **из точки входа**. Если файл подключается через динамический `import()` или вне графа — не подхватится.

Решение: явно подключи его через `import` сверху какого-нибудь модуля.

## Prisma Client устарел после правки `schema.prisma`

После любой правки схемы:
```powershell
npm run prisma:generate
```

Если изменилась структура таблиц — ещё и:
```powershell
npm run prisma:migrate -- --name <descriptive_name>
```
