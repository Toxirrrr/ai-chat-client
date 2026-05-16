<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import MessageBubble from './MessageBubble.vue';
import TypingIndicator from './TypingIndicator.vue';
import Spinner from '@/components/ui/Spinner.vue';

const props = defineProps({
  // Бэкенд отдаёт newest-first. Для отображения переворачиваем —
  // старые сверху, новые снизу (привычная логика мессенджеров).
  messages: { type: Array, default: () => [] },
  pendingUserMessage: { type: String, default: null },
  isTyping: Boolean,
  isLoadingMore: Boolean,
  hasMore: Boolean,
  // Подсветка совпадений в текстах сообщений (при активном поиске).
  highlight: { type: String, default: '' },
});

const emit = defineEmits(['load-more', 'toggle-favorite', 'delete']);

const scrollEl = ref(null);
const isAtBottom = ref(true);

// Старые наверху, новые снизу.
const ordered = computed(() => [...props.messages].reverse());

const scrollToBottom = async (smooth = false) => {
  await nextTick();
  const el = scrollEl.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
};

const onScroll = () => {
  const el = scrollEl.value;
  if (!el) return;
  const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
  isAtBottom.value = distance < 80;
};

// Автоскролл — только если пользователь уже находится у дна.
// Иначе он читает старые сообщения и его не нужно дёргать.
watch(
  () => [props.messages.length, props.isTyping, props.pendingUserMessage],
  () => {
    if (isAtBottom.value) scrollToBottom();
  },
  { flush: 'post' },
);

onMounted(() => {
  scrollEl.value?.addEventListener('scroll', onScroll, { passive: true });
  scrollToBottom();
});
onBeforeUnmount(() => {
  scrollEl.value?.removeEventListener('scroll', onScroll);
});

defineExpose({ scrollToBottom });
</script>

<template>
  <div class="flex-1 relative min-h-0">
    <div ref="scrollEl" class="absolute inset-0 overflow-y-auto">
    <div class="max-w-3xl mx-auto px-4 py-6 min-h-full flex flex-col justify-end gap-4">
      <!-- "Load more" — наверху, потому что там самые старые -->
      <div v-if="hasMore" class="flex justify-center">
        <button
          type="button"
          class="btn-ghost text-sm"
          :disabled="isLoadingMore"
          @click="emit('load-more')"
        >
          <Spinner v-if="isLoadingMore" size="sm" />
          <span v-else>Загрузить ещё</span>
        </button>
      </div>

      <template v-for="m in ordered" :key="m.id">
        <MessageBubble
          role="user"
          :text="m.userMessage"
          :created-at="m.createdAt"
          :message-id="m.id"
          :highlight="highlight"
        />
        <MessageBubble
          role="ai"
          :text="m.aiResponse"
          :created-at="m.createdAt"
          :is-favorite="m.isFavorite"
          :message-id="m.id"
          :highlight="highlight"
          can-favorite
          can-delete
          @toggle-favorite="emit('toggle-favorite', $event)"
          @delete="emit('delete', $event)"
        />
      </template>

      <!-- Пузырь сообщения, который сейчас в полёте на бэкенд -->
      <MessageBubble
        v-if="pendingUserMessage"
        role="user"
        :text="pendingUserMessage"
        :created-at="new Date().toISOString()"
      />

      <TypingIndicator v-if="isTyping" />
    </div>
    </div>

    <Transition name="fade">
      <button
        v-if="!isAtBottom"
        type="button"
        class="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white border border-slate-200
               shadow-md text-slate-600 hover:bg-slate-50 transition flex items-center justify-center"
        aria-label="К последним сообщениям"
        @click="scrollToBottom(true)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 150ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
