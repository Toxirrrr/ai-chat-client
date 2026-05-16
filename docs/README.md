# AI Chat — Backend Documentation

Backend для AI-чата на **Node.js + Express 5 + PostgreSQL + Prisma 7**.
Поддерживает **Google Gemini** и **OpenAI**-совместимые провайдеры.

## Содержание

- [Архитектура](./architecture.md) — слои, поток запроса, принципы
- [Установка и запуск](./setup.md) — пошаговая настройка локально
- [Переменные окружения](./environment.md) — все ENV-переменные
- [API справочник](./api.md) — все эндпоинты с примерами
- [База данных](./database.md) — схема, миграции, Prisma 7 особенности
- [AI-провайдеры](./ai-providers.md) — Google Gemini, OpenAI, mock-режим
- [Обработка ошибок](./error-handling.md) — формат ответов, коды ошибок
- [Структура проекта](./project-structure.md) — что где лежит
- [FAQ / Troubleshooting](./troubleshooting.md) — частые проблемы

## Быстрый старт

```powershell
# 1. Установка
npm install

# 2. .env (скопируй .env.example → .env и подставь свои значения)
#    DATABASE_URL=postgresql://postgres:pass@localhost:5432/aichat?schema=public
#    AI_API_KEY=AIza... (Google AI Studio)

# 3. Создай БД
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE aichat;"

# 4. Сгенерируй Prisma Client и применить миграцию
npm run prisma:generate
npm run prisma:migrate -- --name init

# 5. Запуск
npm run dev
```

Сервер слушает на `http://localhost:3000`. База API — `/api/v1`.

## Технологии

| Слой              | Технология                       |
| ----------------- | -------------------------------- |
| Runtime           | Node.js ≥ 20 (ESM)               |
| Web framework     | Express 5                        |
| ORM               | Prisma 7 (`prisma-client-js`)    |
| Driver adapter    | `@prisma/adapter-pg` + `pg`      |
| База данных       | PostgreSQL 14+                   |
| AI                | Google Gemini / OpenAI (HTTP)    |
| Конфиг            | `dotenv`                         |
| CORS              | `cors`                           |

## Скрипты

| Команда                              | Описание                              |
| ------------------------------------ | ------------------------------------- |
| `npm run dev`                        | Запуск с авто-перезагрузкой           |
| `npm start`                          | Прод-запуск                           |
| `npm run prisma:generate`            | Сгенерировать Prisma Client           |
| `npm run prisma:migrate -- --name X` | Создать и применить миграцию (dev)    |
| `npm run prisma:deploy`              | Применить миграции (prod, без правок) |
