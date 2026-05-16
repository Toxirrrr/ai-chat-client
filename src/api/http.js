import axios from "axios";

// В dev запросы идут через Vite proxy (vite.config.js → /api/v1 -> :3000).
const baseURL = "https://api.toxirrrr.uz/api/v1";

export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});

// --- Response interceptor ---
// Бэкенд всегда отвечает { success, data | message }.
// Разворачиваем data, чтобы вызывающий код получал чистую полезную нагрузку.
http.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === "object" && "success" in payload) {
      if (payload.success) return payload.data ?? {};
      // Сервер вернул 2xx, но success=false (на всякий случай).
      throw buildError(
        payload.message || "Request failed",
        response.status,
        payload,
      );
    }
    return payload;
  },
  (error) => {
    // Сеть / таймаут / DNS — нет ответа от сервера.
    if (!error.response) {
      const msg =
        error.code === "ECONNABORTED"
          ? "Сервер не отвечает (таймаут)"
          : "Нет соединения с сервером";
      return Promise.reject(buildError(msg, 0, null, error));
    }

    const { status, data } = error.response;
    const message =
      data?.message ||
      (status === 404 ? "Не найдено" : `Ошибка сервера (${status})`);

    return Promise.reject(buildError(message, status, data, error));
  },
);

const buildError = (message, status, data, cause) => {
  const err = new Error(message);
  err.status = status;
  err.data = data;
  if (cause) err.cause = cause;
  return err;
};

export default http;
