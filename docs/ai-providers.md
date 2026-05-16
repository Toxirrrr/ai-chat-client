# AI-провайдеры

Сервис `src/services/aiService.js` поддерживает **Google Gemini** (по умолчанию)
и **OpenAI**-совместимые API. Выбор — через `AI_PROVIDER`.

## Общая логика

```
generateReply(userMessage, modelOverride)
  │
  ├─ если AI_API_KEY пустой → mockReply()  (для dev без ключа)
  │
  └─ switch (AI_PROVIDER)
        ├─ 'google' → callGoogle(userMessage, modelOverride || env.ai.model)
        └─ 'openai' → callOpenAI(userMessage, modelOverride || env.ai.model)
```

Все запросы идут через `callWithTimeout()` с `AbortController`, чтобы не зависать
дольше `AI_TIMEOUT_MS`.

## Google Gemini (по умолчанию)

### Настройка

```ini
AI_PROVIDER=google
AI_API_KEY=AIza...
AI_MODEL=gemini-2.0-flash
```

### Эндпоинт

```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}
```

### Тело запроса

```json
{
  "systemInstruction": { "parts": [{ "text": "You are a helpful assistant." }] },
  "contents": [
    { "role": "user", "parts": [{ "text": "<userMessage>" }] }
  ]
}
```

### Парсинг ответа

```js
data.candidates[0].content.parts.map(p => p.text).join('')
```

### Доступные модели

| Модель                | Описание                            |
| --------------------- | ----------------------------------- |
| `gemini-2.0-flash` ✅  | Быстрая и дешёвая (по умолч.)       |
| `gemini-2.5-flash`    | Новее, лучше качество               |
| `gemini-2.5-pro`      | Сильнейшая, медленнее               |
| `gemini-1.5-pro`      | Стабильная legacy                   |

Получить ключ: https://aistudio.google.com/app/apikey

## OpenAI / совместимые

### Настройка

```ini
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
# опционально, для прокси / OpenRouter / Together / локального LLM
AI_API_URL=https://openrouter.ai/api/v1/chat/completions
```

### Эндпоинт по умолчанию

```
POST https://api.openai.com/v1/chat/completions
```

### Тело запроса

Стандартный chat-completions формат:

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user",   "content": "<userMessage>" }
  ]
}
```

### Парсинг ответа

```js
data.choices[0].message.content
```

### Совместимые провайдеры (через `AI_API_URL`)

- **OpenRouter** — `https://openrouter.ai/api/v1/chat/completions`
- **Together AI** — `https://api.together.xyz/v1/chat/completions`
- **Groq** — `https://api.groq.com/openai/v1/chat/completions`
- **Локальный** (Ollama в OpenAI-режиме) — `http://localhost:11434/v1/chat/completions`

## Mock-режим

Если `AI_API_KEY` не задан — `generateReply` возвращает:

```
(<model> mock) You said: <userMessage>
```

Полезно для:
- Разработки фронта без расхода квот
- Юнит-тестов
- CI без секретов

## Обработка ошибок провайдера

Любая проблема с провайдером превращается в `ApiError.badGateway` (HTTP 502):

| Ситуация                        | Сообщение                                       |
| ------------------------------- | ----------------------------------------------- |
| HTTP не-2xx                     | `AI provider error (<status>): <первые 200 ch>` |
| Таймаут                         | `AI provider timed out`                         |
| Сеть / DNS / TLS                | `AI provider request failed: <message>`         |
| Ответ без ожидаемых полей       | `AI provider returned an invalid response`      |

Пример клиенту:

```json
{
  "success": false,
  "message": "AI provider error (429): { \"error\": { \"code\": 429, \"message\": \"You exceeded your current quota...\" } }"
}
```

## Расширение: добавить нового провайдера

1. Добавь функцию `callX(userMessage)` по образцу `callGoogle`/`callOpenAI`.
2. Допиши `case 'x':` в `switch (env.ai.provider)`.
3. Если нужен дефолтный URL/модель — добавь в `config/env.js`.
4. Обнови этот файл и `environment.md`.
