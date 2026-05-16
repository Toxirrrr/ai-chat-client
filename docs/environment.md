# Переменные окружения

Все переменные читаются единственный раз в `src/config/env.js` и доступны через
`import { env } from './config/env.js'`. Файл `.env` загружается через `dotenv/config`.

## Полный список

| Переменная        | По умолчанию                                                  | Описание                                                  |
| ----------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| `NODE_ENV`        | `development`                                                 | `development` \| `production` \| `test`                   |
| `PORT`            | `3000`                                                        | Порт HTTP-сервера                                         |
| `CORS_ORIGIN`     | `*`                                                           | Разрешённый origin для CORS (в проде — домен фронта)      |
| `DATABASE_URL`    | —                                                             | Строка подключения к PostgreSQL (**обязательно**)         |
| `AI_PROVIDER`     | `google`                                                      | `google` \| `openai`                                      |
| `AI_API_KEY`      | `''`                                                          | Ключ API. Если пусто — включается mock-режим              |
| `AI_MODEL`        | `gemini-2.0-flash` (google) / `gpt-4o-mini` (openai)          | Имя модели у провайдера                                   |
| `AI_API_URL`      | `''` (вычисляется по провайдеру)                              | Override эндпоинта (для прокси / совместимых API)         |
| `AI_TIMEOUT_MS`   | `30000`                                                       | Таймаут запроса к AI                                      |

## Формат `DATABASE_URL`

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Пример:
```
DATABASE_URL="postgresql://postgres:pass@localhost:5432/aichat?schema=public"
```

Если в пароле есть спецсимволы (`@`, `:`, `/`, `?`) — их нужно URL-encode.

## Получение Google AI ключа

1. Открой https://aistudio.google.com/app/apikey
2. `Create API key` → выбери проект
3. Скопируй ключ (формат `AIza...`)
4. Вставь в `.env`:
   ```
   AI_API_KEY=AIza...
   ```

## Mock-режим (для разработки без ключа)

Если `AI_API_KEY` пустой, `aiService.generateReply` возвращает:
```
(<model> mock) You said: <userMessage>
```

Удобно для разработки фронта без расхода квот.

## Безопасность

- **Никогда** не коммить `.env` в git (он уже в `.gitignore`).
- В прод используй секрет-менеджер (Doppler, Vault, AWS Secrets Manager и т.п.) либо ENV платформы (Heroku, Railway, Fly).
- Не логируй `AI_API_KEY` и `DATABASE_URL`.
