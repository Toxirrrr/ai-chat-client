# Установка и запуск

## Требования

- **Node.js** ≥ 20 (используется ESM и нативный `fetch`)
- **PostgreSQL** ≥ 14 (локально или удалённо)
- **npm** ≥ 10

## 1. Клонирование и установка зависимостей

```powershell
cd server
npm install
```

Установятся: `express`, `cors`, `dotenv`, `@prisma/client`, `@prisma/adapter-pg`, `pg`, `prisma` (dev).

## 2. Конфигурация `.env`

Скопируй шаблон и подставь свои значения:

```powershell
Copy-Item .env.example .env
```

Минимально нужно:

```ini
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/aichat?schema=public"
AI_API_KEY=AIza...   # из https://aistudio.google.com/app/apikey
```

Полный список переменных — см. [environment.md](./environment.md).

## 3. Создание базы данных

### Вариант A: через `psql`

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE aichat;"
```

(Замени `18` на свою версию Postgres.)

### Вариант B: через pgAdmin

ПКМ по `Databases` → `Create` → `Database…` → имя `aichat`.

## 4. Генерация Prisma Client

```powershell
npm run prisma:generate
```

Создаст `server/generated/prisma/index.js` (Client). Папка в `.gitignore`.

## 5. Применение миграции

```powershell
npm run prisma:migrate -- --name init
```

Создаст таблицу `Message` и сохранит миграцию в `prisma/migrations/`.

## 6. Запуск сервера

**Dev** (с авто-перезагрузкой через `node --watch`):

```powershell
npm run dev
```

**Prod:**

```powershell
npm start
```

Ожидаемый вывод:

```
[db] connected
[server] listening on http://localhost:3000 (development)
```

## 7. Проверка

```powershell
Invoke-RestMethod http://localhost:3000/api/v1/health
Invoke-RestMethod http://localhost:3000/api/v1/health/db

Invoke-RestMethod -Method Post `
  -Uri http://localhost:3000/api/v1/chat `
  -ContentType 'application/json' `
  -Body '{"userMessage":"Привет"}'
```

## Деплой в продакшн (общая схема)

```bash
npm ci --omit=dev
npm run prisma:generate
npm run prisma:deploy   # применяет уже существующие миграции, без интерактива
NODE_ENV=production npm start
```

Перед стартом убедись, что заданы:
- `DATABASE_URL`
- `AI_API_KEY`
- `PORT` (если не 3000)
- `CORS_ORIGIN` (домен фронтенда вместо `*`)
