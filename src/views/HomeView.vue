<script setup>
import { onMounted, ref, watch } from 'vue';

import ChatHeader from '@/components/chat/ChatHeader.vue';
import ChatInput from '@/components/chat/ChatInput.vue';
import MessageList from '@/components/chat/MessageList.vue';
import MessageSkeleton from '@/components/chat/MessageSkeleton.vue';
import SearchBar from '@/components/chat/SearchBar.vue';
import StatsBar from '@/components/stats/StatsBar.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import OfflineBanner from '@/components/ui/OfflineBanner.vue';
import ToastContainer from '@/components/ui/ToastContainer.vue';

import { useChat } from '@/composables/useChat';
import { useSpeechRecognition } from '@/composables/useSpeechRecognition';
import { useToast } from '@/composables/useToast';

const chat = useChat();
const toast = useToast();

// --- UI-only state (не имеет смысла держать в Pinia) ---
const showSearch = ref(false);
const showStats = ref(false);
const input = ref('');
const pendingDeleteId = ref(null);

// --- Voice input ---
const speech = useSpeechRecognition({ lang: 'ru-RU', continuous: true });
const voiceSupported = speech.isSupported;
let baseInputBeforeRecording = '';

// Каждое новое распознавание дописывает к тому, что уже было в инпуте.
watch(speech.fullTranscript, (t) => {
  if (!speech.isRecording.value && !t) return;
  const sep = baseInputBeforeRecording && t ? ' ' : '';
  input.value = baseInputBeforeRecording + sep + t;
});

const VOICE_ERRORS = {
  'not-allowed': 'Доступ к микрофону запрещён. Разрешите в настройках браузера.',
  'service-not-allowed': 'Сервис распознавания недоступен.',
  'no-speech': 'Речь не распознана. Попробуй ещё раз.',
  'audio-capture': 'Микрофон недоступен.',
  network: 'Нет соединения для распознавания.',
};

watch(speech.error, (err) => {
  if (!err || err === 'aborted') return; // 'aborted' = пользователь сам остановил
  toast.error(VOICE_ERRORS[err] || `Ошибка распознавания: ${err}`);
});

// --- lifecycle ---
onMounted(async () => {
  await Promise.all([chat.loadInitial(), chat.loadStats()]);
});

// --- handlers ---
const onSubmit = async (text) => {
  // Очищаем инпут мгновенно — текст уже отрисуется как pending-пузырь.
  input.value = '';
  try {
    await chat.send(text);
  } catch {
    // Ошибки уже показаны через toast в useChat; вернём текст пользователю,
    // чтобы он мог отредактировать и переслать.
    input.value = text;
  }
};

const onAskDelete = (id) => { pendingDeleteId.value = id; };
const onConfirmDelete = async () => {
  const id = pendingDeleteId.value;
  pendingDeleteId.value = null;
  await chat.remove(id);
};

const onToggleVoice = () => {
  if (!speech.isSupported) {
    toast.info('Распознавание речи не поддерживается этим браузером.');
    return;
  }
  if (speech.isRecording.value) {
    speech.stop();
  } else {
    // Запоминаем то, что уже набрано, чтобы дописать распознанный текст в конец.
    baseInputBeforeRecording = input.value.trim();
    speech.start();
  }
};

// Подсказки для пустого экрана.
const SUGGESTIONS = [
  'Объясни, как работает Promise в JavaScript',
  'Сгенерируй идею для pet-проекта на Vue 3',
  'Сравни PostgreSQL и MongoDB одним абзацем',
  'Напиши SQL-запрос: топ-10 пользователей по числу заказов',
];

const onSuggestion = (text) => onSubmit(text);

// --- search: debounced trigger ---
let searchTimer;
watch(() => chat.searchQuery.value, (q) => {
  clearTimeout(searchTimer);
  if (!q.trim()) {
    chat.clearSearch();
    return;
  }
  searchTimer = setTimeout(() => chat.runSearch(), 300);
});

const onSearchInput = (q) => chat.setSearchQuery(q);
const onSearchClear = () => chat.clearSearch();
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50">
    <ChatHeader
      :search-active="showSearch"
      :stats-active="showStats"
      :favorites-only="chat.favoritesOnly.value"
      @toggle-search="showSearch = !showSearch"
      @toggle-stats="showStats = !showStats"
      @toggle-favorites="chat.setFavoritesOnly(!chat.favoritesOnly.value)"
    />

    <OfflineBanner />

    <SearchBar
      v-if="showSearch"
      :model-value="chat.searchQuery.value"
      :loading="chat.isSearching.value"
      @update:model-value="onSearchInput"
      @clear="onSearchClear"
    />

    <StatsBar v-if="showStats" :stats="chat.stats.value" :loading="chat.isLoadingStats.value" />

    <!-- Контент: загрузка / пусто / список -->
    <template v-if="chat.isLoading.value && !chat.hasMessages.value">
      <MessageSkeleton />
    </template>

    <template v-else-if="chat.visibleMessages.value.length > 0 || chat.pendingUserMessage.value">
      <MessageList
        :messages="chat.visibleMessages.value"
        :pending-user-message="chat.isSearchActive.value ? null : chat.pendingUserMessage.value"
        :is-typing="chat.isSending.value && !chat.isSearchActive.value"
        :is-loading-more="chat.isLoadingMore.value"
        :has-more="chat.hasMore.value && !chat.isSearchActive.value"
        :highlight="chat.isSearchActive.value ? chat.searchQuery.value : ''"
        @load-more="chat.loadMore"
        @toggle-favorite="chat.toggleFavorite"
        @delete="onAskDelete"
      />
    </template>

    <template v-else>
      <div class="flex-1 flex items-center justify-center">
        <EmptyState
          :title="
            chat.isSearchActive.value
              ? 'Ничего не найдено'
              : chat.favoritesOnly.value
                ? 'В избранном пусто'
                : 'Начнём диалог'
          "
          :subtitle="
            chat.isSearchActive.value
              ? 'Попробуй другой запрос.'
              : chat.favoritesOnly.value
                ? 'Нажми на звезду рядом с сообщением, чтобы добавить его сюда.'
                : 'Задай вопрос или продиктуй его голосом — AI ответит мгновенно.'
          "
          :suggestions="
            !chat.isSearchActive.value && !chat.favoritesOnly.value
              ? SUGGESTIONS
              : []
          "
          @suggestion="onSuggestion"
        />
      </div>
    </template>

    <ChatInput
      v-model="input"
      v-model:selected-model="chat.selectedModel.value"
      :models="chat.fallbackModels"
      :sending="chat.isSending.value"
      :recording="speech.isRecording.value"
      :voice-supported="voiceSupported"
      @submit="onSubmit"
      @toggle-voice="onToggleVoice"
    />

    <ConfirmDialog
      :open="pendingDeleteId !== null"
      title="Удалить сообщение?"
      message="Это действие необратимо."
      confirm-text="Удалить"
      variant="danger"
      @confirm="onConfirmDelete"
      @cancel="pendingDeleteId = null"
    />

    <ToastContainer />
  </div>
</template>
