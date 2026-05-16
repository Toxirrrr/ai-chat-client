# AGENTS.md

## Project

AI Chat Frontend

Production-ready frontend for AI Chat application.

Tech stack:

- Vue 3
- Vite
- JavaScript
- Composition API
- Pinia
- Vue Router
- Axios
- Tailwind CSS

Backend API:

http://localhost:3000/api/v1

---

## Primary Goal

Build a scalable, maintainable, production-ready frontend.

Priorities:

1. Code quality
2. UX
3. Performance
4. Readability
5. Maintainability

Never prioritize speed over architecture.

---

## Architecture Rules

Use feature-driven modular architecture.

Folder structure:

src/
├── api/
├── components/
├── composables/
├── stores/
├── router/
├── views/
├── utils/
├── App.vue
└── main.js

---

## Component Rules

Always:

- Use Composition API only
- Use script setup only
- Keep components small
- One component = one responsibility
- Extract reusable UI
- Use props + emits correctly

Never:

- Create monolithic components
- Put business logic inside templates
- Duplicate UI logic
- Create components larger than 250 lines

---

## State Management Rules

Use Pinia.

Use store only for:

- chat messages
- loading states
- error states
- favorites
- stats

Never:

- Store temporary UI-only values globally
- Mix API logic with state mutations

---

## API Rules

Use Axios.

All API calls must be inside:

src/api/

Never call API directly from components.

Use service abstraction.

Example:

chatApi.js

Methods:

- getMessages()
- sendMessage()
- deleteMessage()
- searchMessages()
- toggleFavorite()
- getStats()

---

## Backend Contract

Available endpoints:

GET /health
GET /health/db

POST /chat
GET /chat
GET /chat/:id
DELETE /chat/:id

PATCH /chat/:id/favorite

GET /chat/search?q=
GET /chat/stats

Response format:

Success:

{
  "success": true,
  "data": {}
}

Error:

{
  "success": false,
  "message": "Error message"
}

Follow backend contract strictly. :contentReference[oaicite:1]{index=1}

Never invent fields.

---

## UI Rules

Design principles:

- Clean
- Minimal
- Modern
- Responsive

Support:

- Desktop
- Tablet
- Mobile

Always implement:

- loading states
- empty states
- error states
- disabled states

---

## Voice Input Rules

Use browser speech recognition API.

Requirements:

- start recording
- stop recording
- insert recognized text

If unsupported:

Show fallback UI.

Never crash UI.

---

## Error Handling

Always handle:

- API failures
- Network failures
- Validation errors
- Permission errors

Never ignore exceptions.

Always show user-friendly messages.

---

## Performance Rules

Always:

- Lazy load routes
- Debounce search
- Avoid unnecessary re-renders
- Keep watchers minimal

Never:

- Fetch data repeatedly without reason
- Create deep watchers without need

---

## Styling Rules

Use Tailwind CSS.

Always:

- mobile-first
- semantic spacing
- accessible colors
- keyboard accessibility

Never:

- Inline styles
- Hardcoded layout hacks

---

## Git Rules

Commit format:

feat:
fix:
refactor:
style:

Examples:

feat: implement chat history
fix: handle speech recognition errors
refactor: extract chat store logic

---

## Implementation Workflow

Always build in this order:

Step 1:
Project setup

Step 2:
Base layout

Step 3:
Chat UI

Step 4:
Backend integration

Step 5:
State management

Step 6:
Voice input

Step 7:
Search + favorites + stats

Step 8:
Optimization + polish

Never skip steps.

Before writing code:

Explain briefly what will be implemented.

Then generate production-ready code.