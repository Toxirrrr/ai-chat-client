import { storeToRefs } from 'pinia';
import { useChatStore } from '@/stores/chatStore';
import { useToast } from '@/composables/useToast';

/**
 * Высокоуровневый composable для компонентов: оборачивает store
 * и добавляет UI-уведомления (toast) при ошибках/успехах.
 */
export const useChat = () => {
  const store = useChatStore();
  const toast = useToast();

  const refs = storeToRefs(store);

  // --- async обёртки с toast-обработкой ---
  const loadInitial = async () => {
    try {
      await store.loadInitial();
    } catch (e) {
      toast.error(`Не удалось загрузить историю: ${e.message}`);
    }
  };

  const loadMore = async () => {
    try {
      await store.loadMore();
    } catch (e) {
      toast.error(`Не удалось загрузить ещё: ${e.message}`);
    }
  };

  const send = async (text) => {
    try {
      await store.send(text);
    } catch (e) {
      toast.error(`Ошибка отправки: ${e.message}`);
      throw e; // даём вызывающему шанс восстановить состояние UI
    }
  };

  const remove = async (id) => {
    try {
      await store.remove(id);
      toast.success('Удалено');
    } catch (e) {
      toast.error(`Не удалось удалить: ${e.message}`);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      await store.toggleFavorite(id);
    } catch (e) {
      toast.error(`Не удалось обновить избранное: ${e.message}`);
    }
  };

  const runSearch = async () => {
    try {
      await store.runSearch();
    } catch (e) {
      toast.error(`Ошибка поиска: ${e.message}`);
    }
  };

  const loadStats = async () => {
    try {
      await store.loadStats();
    } catch (e) {
      toast.error(`Не удалось загрузить статистику: ${e.message}`);
    }
  };

  const setFavoritesOnly = async (value) => {
    try {
      await store.setFavoritesOnly(value);
    } catch (e) {
      toast.error(`Не удалось применить фильтр: ${e.message}`);
    }
  };

  return {
    // refs (реактивные)
    ...refs,
    // actions (с UI-обработкой)
    loadInitial,
    loadMore,
    send,
    remove,
    toggleFavorite,
    runSearch,
    loadStats,
    setFavoritesOnly,
    setSearchQuery: store.setSearchQuery,
    clearSearch: store.clearSearch,
    selectedModel: refs.selectedModel,
    fallbackModels: store.fallbackModels,
  };
};
