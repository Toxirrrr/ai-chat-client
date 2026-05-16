import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { chatApi } from '@/api/chatApi';

const PAGE_LIMIT = 20;

const FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-3-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

export const useChatStore = defineStore('chat', () => {
  // --- state ---
  const messages = ref([]); // newest first (как из бэкенда)
  const pagination = ref({ page: 0, limit: PAGE_LIMIT, total: 0, totalPages: 0 });

  const isLoading = ref(false); // первая загрузка
  const isLoadingMore = ref(false);
  const isSending = ref(false);
  // Текст, отправленный пользователем, который ещё ждёт ответа AI.
  // Рендерится мгновенно как user-пузырь под typing-индикатором.
  const pendingUserMessage = ref(null);

  const stats = ref(null);
  const isLoadingStats = ref(false);

  const searchQuery = ref('');
  const searchResults = ref([]);
  const isSearching = ref(false);

  // Фильтр "только избранное" — отражается на listMessages.
  const favoritesOnly = ref(false);

  const lastError = ref(null);
  const selectedModel = ref(''); // '' means default

  // --- getters ---
  const hasMessages = computed(() => messages.value.length > 0);
  const hasMore = computed(
    () => pagination.value.page > 0 && pagination.value.page < pagination.value.totalPages,
  );
  const isSearchActive = computed(() => searchQuery.value.trim().length > 0);
  // Что показывать в списке: при активном поиске — результаты, иначе — историю.
  const visibleMessages = computed(() =>
    isSearchActive.value ? searchResults.value : messages.value,
  );

  // --- internal helpers ---
  const setError = (e) => {
    lastError.value = e?.message ?? String(e);
  };

  // --- actions ---
  // Параметры запроса с учётом активных фильтров.
  const buildListParams = (page) => ({
    page,
    limit: PAGE_LIMIT,
    ...(favoritesOnly.value ? { isFavorite: true } : {}),
  });

  const loadInitial = async () => {
    isLoading.value = true;
    lastError.value = null;
    try {
      const data = await chatApi.listMessages(buildListParams(1));
      messages.value = data.items ?? [];
      pagination.value = data.pagination ?? pagination.value;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const loadMore = async () => {
    if (!hasMore.value || isLoadingMore.value) return;
    isLoadingMore.value = true;
    try {
      const next = pagination.value.page + 1;
      const data = await chatApi.listMessages(buildListParams(next));
      messages.value = [...messages.value, ...(data.items ?? [])];
      pagination.value = data.pagination ?? pagination.value;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      isLoadingMore.value = false;
    }
  };

  const setFavoritesOnly = async (value) => {
    if (favoritesOnly.value === value) return;
    favoritesOnly.value = value;
    await loadInitial();
  };

  const send = async (text) => {
    const value = (text ?? '').trim();
    if (!value) throw new Error('Сообщение не может быть пустым');

    pendingUserMessage.value = value;
    isSending.value = true;
    lastError.value = null;

    let lastEx;
    // Пробуем основной запрос и список запасных моделей при quota-ошибке.
    // Бэкенд оборачивает 429 от Google в 502, поэтому проверяем оба варианта.
    const isQuotaError = (e) =>
      e.status === 429 ||
      (e.status === 502 && (e.message?.includes('429') || e.message?.includes('quota') || e.message?.includes('RESOURCE_EXHAUSTED')));

    // Порядок: выбранная модель -> модели из FALLBACK_MODELS (исключая выбранную).
    const others = FALLBACK_MODELS.filter(m => m !== selectedModel.value);
    const modelsToTry = [selectedModel.value, ...others];

    for (const model of modelsToTry) {
      try {
        const { message } = await chatApi.sendMessage(value, model || undefined);

        // Успех — обновляем состояние
        messages.value = [message, ...messages.value];
        pagination.value = {
          ...pagination.value,
          total: pagination.value.total + 1,
        };

        if (stats.value) {
          stats.value = {
            ...stats.value,
            total: (stats.value.total ?? 0) + 1,
            nonFavorites: (stats.value.nonFavorites ?? 0) + 1,
            lastMessageAt: message.createdAt,
          };
        }

        isSending.value = false;
        pendingUserMessage.value = null;
        return message;
      } catch (e) {
        lastEx = e;
        // Если это не quota-ошибка — прерываем сразу, не пробуем другие модели.
        if (!isQuotaError(e)) break;
        console.warn(`Model ${model || 'default'} quota exceeded, trying next...`);
      }
    }

    // Если дошли сюда — все попытки провалились или была критическая ошибка.
    isSending.value = false;
    pendingUserMessage.value = null;
    setError(lastEx);
    throw lastEx;
  };

  const remove = async (id) => {
    // Optimistic: убираем мгновенно из обоих списков, при ошибке восстанавливаем.
    const idxInList = messages.value.findIndex((m) => m.id === id);
    const idxInSearch = searchResults.value.findIndex((m) => m.id === id);
    const removedFromList = idxInList >= 0 ? messages.value[idxInList] : null;
    const removedFromSearch = idxInSearch >= 0 ? searchResults.value[idxInSearch] : null;

    if (removedFromList) messages.value.splice(idxInList, 1);
    if (removedFromSearch) searchResults.value.splice(idxInSearch, 1);

    try {
      await chatApi.deleteMessage(id);
      if (stats.value) {
        const wasFav = (removedFromList ?? removedFromSearch)?.isFavorite;
        stats.value = {
          ...stats.value,
          total: Math.max(0, (stats.value.total ?? 1) - 1),
          favorites: Math.max(0, (stats.value.favorites ?? 0) - (wasFav ? 1 : 0)),
          nonFavorites: Math.max(0, (stats.value.nonFavorites ?? 0) - (wasFav ? 0 : 1)),
        };
      }
    } catch (e) {
      // откат
      if (removedFromList) messages.value.splice(idxInList, 0, removedFromList);
      if (removedFromSearch) searchResults.value.splice(idxInSearch, 0, removedFromSearch);
      setError(e);
      throw e;
    }
  };

  const toggleFavorite = async (id) => {
    const flipIn = (arr) => {
      const i = arr.findIndex((m) => m.id === id);
      if (i < 0) return null;
      const updated = { ...arr[i], isFavorite: !arr[i].isFavorite };
      arr.splice(i, 1, updated);
      return { i, prev: arr[i], next: updated };
    };

    // Optimistic flip в обоих списках.
    const inList = flipIn(messages.value);
    const inSearch = flipIn(searchResults.value);
    const desired = (inList ?? inSearch)?.next.isFavorite;

    try {
      const { message } = await chatApi.toggleFavorite(id, desired);
      // Синхронизируем с серверным значением (на случай гонок).
      const syncIn = (arr) => {
        const i = arr.findIndex((m) => m.id === id);
        if (i >= 0) arr.splice(i, 1, message);
      };
      syncIn(messages.value);
      syncIn(searchResults.value);

      if (stats.value) {
        const delta = message.isFavorite ? 1 : -1;
        stats.value = {
          ...stats.value,
          favorites: Math.max(0, (stats.value.favorites ?? 0) + delta),
          nonFavorites: Math.max(0, (stats.value.nonFavorites ?? 0) - delta),
        };
      }

      // В режиме "только избранное" сообщение, ставшее не-избранным,
      // должно исчезнуть из списка.
      if (favoritesOnly.value && !message.isFavorite) {
        messages.value = messages.value.filter((m) => m.id !== id);
      }
    } catch (e) {
      // откат: вернуть прежние значения
      const revert = (arr, snap) => {
        if (!snap) return;
        const i = arr.findIndex((m) => m.id === id);
        if (i >= 0) arr.splice(i, 1, { ...arr[i], isFavorite: !snap.next.isFavorite });
      };
      revert(messages.value, inList);
      revert(searchResults.value, inSearch);
      setError(e);
      throw e;
    }
  };

  const setSearchQuery = (q) => {
    searchQuery.value = q ?? '';
  };

  const runSearch = async () => {
    const q = searchQuery.value.trim();
    if (!q) {
      searchResults.value = [];
      isSearching.value = false;
      return;
    }
    isSearching.value = true;
    try {
      const data = await chatApi.searchMessages({ q, page: 1, limit: PAGE_LIMIT });
      searchResults.value = data.items ?? [];
    } catch (e) {
      setError(e);
      searchResults.value = [];
      throw e;
    } finally {
      isSearching.value = false;
    }
  };

  const clearSearch = () => {
    searchQuery.value = '';
    searchResults.value = [];
    isSearching.value = false;
  };

  const loadStats = async () => {
    isLoadingStats.value = true;
    try {
      stats.value = await chatApi.getStats();
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      isLoadingStats.value = false;
    }
  };

  return {
    // state
    messages,
    pagination,
    isLoading,
    isLoadingMore,
    isSending,
    pendingUserMessage,
    stats,
    isLoadingStats,
    searchQuery,
    searchResults,
    isSearching,
    favoritesOnly,
    lastError,
    // getters
    hasMessages,
    hasMore,
    isSearchActive,
    visibleMessages,
    // actions
    loadInitial,
    loadMore,
    setFavoritesOnly,
    send,
    remove,
    toggleFavorite,
    setSearchQuery,
    runSearch,
    clearSearch,
    loadStats,
    // models
    selectedModel,
    fallbackModels: FALLBACK_MODELS,
  };
});
