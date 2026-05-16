import { ref } from 'vue';

// Глобальный реактивный список тостов. Один на всё приложение.
const toasts = ref([]);
let nextId = 1;

const push = (type, message, timeout = 3500) => {
  const id = nextId++;
  toasts.value.push({ id, type, message });
  if (timeout > 0) {
    setTimeout(() => dismiss(id), timeout);
  }
  return id;
};

const dismiss = (id) => {
  toasts.value = toasts.value.filter((t) => t.id !== id);
};

export const useToast = () => ({
  toasts,
  dismiss,
  success: (msg, t) => push('success', msg, t),
  error: (msg, t) => push('error', msg, t),
  info: (msg, t) => push('info', msg, t),
});
