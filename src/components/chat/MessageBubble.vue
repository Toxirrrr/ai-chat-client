<script setup>
import { computed, ref } from 'vue';
import HighlightedText from '@/components/ui/HighlightedText.vue';

const props = defineProps({
  role: { type: String, required: true }, // 'user' | 'ai'
  text: { type: String, required: true },
  createdAt: { type: String, default: null },
  isFavorite: { type: Boolean, default: false },
  messageId: { type: String, default: null },
  highlight: { type: String, default: '' },
  canFavorite: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const emit = defineEmits(['toggle-favorite', 'delete']);

const isUser = computed(() => props.role === 'user');

const timeLabel = computed(() => {
  if (!props.createdAt) return '';
  const d = new Date(props.createdAt);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

// Разбиваем сообщение на текстовые блоки и блоки с кодом
const blocks = computed(() => {
  const text = props.text || '';
  const result = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    result.push({ type: 'code', lang: match[1] || 'code', content: match[2] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    result.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return result;
});

const copiedIndex = ref(-1);

const copyCode = async (content, index) => {
  try {
    await navigator.clipboard.writeText(content);
    copiedIndex.value = index;
    setTimeout(() => {
      if (copiedIndex.value === index) copiedIndex.value = -1;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
};

const showContextMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
let pressTimer = null;

const openMenu = (x, y) => {
  if (!props.canFavorite && !props.canDelete) return;

  const menuWidth = 220;
  const menuHeight = 110;
  const safeX = Math.min(x, window.innerWidth - menuWidth - 16);
  const safeY = Math.min(y, window.innerHeight - menuHeight - 16);
  
  menuPosition.value = { x: Math.max(16, safeX), y: Math.max(16, safeY) };
  showContextMenu.value = true;
};

const closeMenu = () => {
  showContextMenu.value = false;
};

const onContextMenu = (e) => {
  openMenu(e.clientX, e.clientY);
};

const startPress = (e) => {
  if (pressTimer) clearTimeout(pressTimer);
  pressTimer = setTimeout(() => {
    const touch = e.touches[0];
    openMenu(touch.clientX, touch.clientY);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
  }, 500);
};

const cancelPress = () => {
  if (pressTimer) clearTimeout(pressTimer);
};

const handleFavorite = () => {
  emit('toggle-favorite', props.messageId);
  closeMenu();
};

const handleDelete = () => {
  emit('delete', props.messageId);
  closeMenu();
};
</script>

<template>
  <div
    class="flex animate-slide-up"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[90%] sm:max-w-[80%] flex flex-col gap-1 group relative"
      @touchstart="startPress"
      @touchend="cancelPress"
      @touchmove="cancelPress"
      @touchcancel="cancelPress"
      @contextmenu.prevent="onContextMenu"
    >
      <div
        class="rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed break-words"
        :class="
          isUser
            ? 'bg-brand-600 text-white rounded-br-md'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm'
        "
      >
        <template v-for="(b, i) in blocks" :key="i">
          <!-- Text blocks -->
          <div v-if="b.type === 'text'" class="whitespace-pre-wrap"><HighlightedText :text="b.content" :query="highlight" /></div>
          
          <!-- Code blocks -->
          <div v-else-if="b.type === 'code'" class="my-3 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 font-mono text-[13px] shadow-sm">
            <div class="flex items-center justify-between px-4 py-1.5 bg-slate-800/80 text-slate-400 text-[11px] uppercase tracking-wider">
              <span>{{ b.lang }}</span>
              <button
                type="button"
                @click.stop="copyCode(b.content, i)"
                class="hover:text-white flex items-center gap-1.5 transition-colors focus:outline-none"
                :title="'Копировать код'"
              >
                <svg v-if="copiedIndex === i" class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span v-if="copiedIndex === i" class="text-emerald-400 font-medium">Скопировано</span>
                <span v-else>Копировать</span>
              </button>
            </div>
            <div class="p-4 overflow-x-auto text-slate-50" @contextmenu.stop>
              <pre><code><HighlightedText :text="b.content" :query="highlight" /></code></pre>
            </div>
          </div>
        </template>
      </div>

      <div
        class="flex items-center gap-2 px-1 text-[11px] text-slate-400"
        :class="isUser ? 'justify-end' : 'justify-start'"
      >
        <span>{{ timeLabel }}</span>

        <template v-if="canFavorite">
          <!-- Desktop hover button -->
          <button
            type="button"
            class="opacity-0 group-hover:opacity-100 focus:opacity-100 transition hover:text-amber-500 hidden sm:block"
            :class="isFavorite ? 'opacity-100 text-amber-500' : ''"
            :aria-label="isFavorite ? 'Убрать из избранного' : 'В избранное'"
            @click.stop="handleFavorite"
          >
            <svg viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'"
                 stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </template>

        <template v-if="canDelete">
          <!-- Desktop hover button -->
          <button
            type="button"
            class="opacity-0 group-hover:opacity-100 focus:opacity-100 transition hover:text-rose-500 hidden sm:block"
            aria-label="Удалить"
            @click.stop="handleDelete"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
            </svg>
          </button>
        </template>
      </div>
    </div>
  </div>

  <!-- Context Menu Overlay (Teleported to body) -->
  <Teleport to="body">
    <div
      v-if="showContextMenu"
      class="fixed inset-0 z-[100]"
      @click.prevent.stop="closeMenu"
      @touchstart.prevent.stop="closeMenu"
      @contextmenu.prevent="closeMenu"
    ></div>

    <div
      v-if="showContextMenu"
      class="fixed z-[101] bg-white shadow-xl rounded-xl border border-slate-200 py-1.5 flex flex-col min-w-[200px] animate-fade-in origin-top-left"
      :style="{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }"
    >
      <button
        v-if="canFavorite"
        @click.stop="handleFavorite"
        class="flex items-center gap-3 px-4 py-3 text-[14px] text-slate-700 hover:bg-slate-50 hover:text-amber-600 transition-colors w-full text-left focus:outline-none focus:bg-slate-50"
      >
        <svg viewBox="0 0 24 24" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 shrink-0">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span class="font-medium">{{ isFavorite ? 'Убрать из избранного' : 'В избранное' }}</span>
      </button>

      <button
        v-if="canDelete"
        @click.stop="handleDelete"
        class="flex items-center gap-3 px-4 py-3 text-[14px] text-rose-600 hover:bg-rose-50 transition-colors w-full text-left focus:outline-none focus:bg-rose-50"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 shrink-0">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
        </svg>
        <span class="font-medium">Удалить сообщение</span>
      </button>
    </div>
  </Teleport>
</template>
