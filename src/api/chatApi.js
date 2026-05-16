import { http } from './http';

// Все методы возвращают уже распакованные данные (см. http.js interceptor).
// Контракты соответствуют /api/v1 эндпоинтам бэкенда.

export const chatApi = {
  // --- Health ---
  health: () => http.get('/health'),
  healthDb: () => http.get('/health/db'),

  // --- Chat ---
  // POST /chat → { message: { id, userMessage, aiResponse, isFavorite, createdAt } }
  sendMessage: (userMessage, model) => http.post('/chat', { userMessage, model }),

  // GET /chat?page=&limit=&isFavorite= → { items, pagination }
  listMessages: ({ page = 1, limit = 20, isFavorite } = {}) =>
    http.get('/chat', {
      params: {
        page,
        limit,
        ...(typeof isFavorite === 'boolean' ? { isFavorite } : {}),
      },
    }),

  // GET /chat/:id → { message }
  getMessage: (id) => http.get(`/chat/${encodeURIComponent(id)}`),

  // DELETE /chat/:id → { id }
  deleteMessage: (id) => http.delete(`/chat/${encodeURIComponent(id)}`),

  // PATCH /chat/:id/favorite → { message }
  // body: { isFavorite: boolean } чтобы установить явно, либо {} чтобы переключить
  toggleFavorite: (id, isFavorite) =>
    http.patch(
      `/chat/${encodeURIComponent(id)}/favorite`,
      typeof isFavorite === 'boolean' ? { isFavorite } : {},
    ),

  // GET /chat/search?q=&page=&limit= → { items, pagination }
  searchMessages: ({ q, page = 1, limit = 20 }) =>
    http.get('/chat/search', { params: { q, page, limit } }),

  // GET /chat/stats → { total, favorites, nonFavorites, lastMessageAt }
  getStats: () => http.get('/chat/stats'),
};

export default chatApi;
