# База данных

## Схема (Prisma)

Файл: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Message {
  id          String   @id @default(uuid()) @db.Uuid
  userMessage String   @db.Text
  aiResponse  String   @db.Text
  isFavorite  Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([createdAt])
  @@index([isFavorite])
}
```

### Поля

| Поле          | Тип        | Описание                                       |
| ------------- | ---------- | ---------------------------------------------- |
| `id`          | UUID v4    | PK, генерируется на стороне БД                 |
| `userMessage` | TEXT       | Сообщение пользователя                         |
| `aiResponse`  | TEXT       | Ответ от AI                                    |
| `isFavorite`  | BOOLEAN    | Избранное (по умолч. `false`)                  |
| `createdAt`   | TIMESTAMP  | Время создания (UTC)                           |

### Индексы

- `createdAt` — для сортировки списков (последние сверху)
- `isFavorite` — для фильтра в `GET /chat?isFavorite=true`

## Особенности Prisma 7

### 1. `url` вынесен из `schema.prisma`

В Prisma 7 строка подключения **больше не указывается** в `datasource`.
Она задаётся в `prisma.config.ts`:

```ts
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env['DATABASE_URL'] },
});
```

### 2. Driver adapter обязателен

`PrismaClient` теперь требует **adapter** для прямого подключения.
Используем `@prisma/adapter-pg` поверх `pg`:

```js
// src/config/prisma.js
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/index.js';
import { env } from './env.js';

const adapter = new PrismaPg({ connectionString: env.databaseUrl });

export const prisma = new PrismaClient({
  adapter,
  log: env.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
});
```

### 3. Выбор генератора

| Provider              | Output    | Когда выбирать                          |
| --------------------- | --------- | --------------------------------------- |
| `prisma-client-js` ✅  | `index.js`| Прямой запуск в Node без бандлера       |
| `prisma-client`       | `*.ts`    | Vite/Webpack/tsc/Bun — со сборкой       |

В этом проекте — **`prisma-client-js`**, потому что код запускается напрямую через `node`.

## Миграции

### Создать новую миграцию

```powershell
npm run prisma:migrate -- --name add_some_field
```

Команда:
1. Сравнит `schema.prisma` с состоянием БД.
2. Создаст SQL-файл в `prisma/migrations/<timestamp>_<name>/migration.sql`.
3. Применит его к БД.
4. Обновит `_prisma_migrations` (системная таблица).
5. Перегенерирует Prisma Client.

### Применить миграции в проде

```bash
npm run prisma:deploy
```

Не интерактивная — только применяет уже существующие миграции.

### Сбросить БД (dev only!)

```powershell
npx prisma migrate reset
```

Удалит все данные, прогонит все миграции с нуля.

## Полезные операции через `psql`

```sql
-- Подключиться
\c aichat

-- Посмотреть таблицы
\dt

-- Описание таблицы
\d "Message"

-- Количество записей
SELECT COUNT(*) FROM "Message";

-- Последние 10
SELECT id, "userMessage", "createdAt" FROM "Message" ORDER BY "createdAt" DESC LIMIT 10;
```

## Бэкап / восстановление

```powershell
# Дамп
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -d aichat -f backup.sql

# Восстановление
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d aichat -f backup.sql
```
