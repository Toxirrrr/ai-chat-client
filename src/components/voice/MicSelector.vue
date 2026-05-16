<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useMicrophones } from '@/composables/useMicrophones';

defineProps({
  disabled: Boolean,
});

const mic = useMicrophones();
const open = ref(false);
const wrapEl = ref(null);

const togglePopover = async () => {
  open.value = !open.value;
  if (open.value) await mic.requestLabels();
};

const choose = async (id) => {
  await mic.select(id);
  open.value = false;
};

const onDocClick = (e) => {
  if (!open.value) return;
  if (wrapEl.value && !wrapEl.value.contains(e.target)) open.value = false;
};

onMounted(() => document.addEventListener('mousedown', onDocClick));
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick));
</script>

<template>
  <div v-if="mic.isSupported" ref="wrapEl" class="relative shrink-0">
    <button
      type="button"
      class="btn-icon w-7 h-10 px-0"
      :disabled="disabled"
      aria-haspopup="true"
      :aria-expanded="open"
      aria-label="Выбрать микрофон"
      title="Выбрать микрофон"
      @click="togglePopover"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <Transition name="pop">
      <div
        v-if="open"
        class="absolute bottom-full mb-2 left-0 z-20 w-72 card p-1 max-h-72 overflow-y-auto"
        role="listbox"
        aria-label="Доступные микрофоны"
      >
        <button
          type="button"
          class="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50"
          :class="mic.selectedId.value === 'default' ? 'bg-brand-50 text-brand-700' : ''"
          role="option"
          :aria-selected="mic.selectedId.value === 'default'"
          @click="choose('default')"
        >
          <span class="flex-1 text-sm">Системный по умолчанию</span>
          <svg
            v-if="mic.selectedId.value === 'default'"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </button>

        <div v-if="mic.devices.value.length === 0" class="px-3 py-2 text-xs text-slate-400">
          Микрофоны не найдены
        </div>

        <button
          v-for="d in mic.devices.value"
          :key="d.deviceId"
          type="button"
          class="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50"
          :class="mic.selectedId.value === d.deviceId ? 'bg-brand-50 text-brand-700' : ''"
          role="option"
          :aria-selected="mic.selectedId.value === d.deviceId"
          @click="choose(d.deviceId)"
        >
          <span class="flex-1 text-sm truncate" :title="d.label || d.deviceId">
            {{ d.label || `Микрофон (${d.deviceId.slice(0, 6)}...)` }}
          </span>
          <svg
            v-if="mic.selectedId.value === d.deviceId"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </button>

        <p
          v-if="!mic.labelsAvailable.value"
          class="px-3 py-2 text-[11px] text-slate-400 border-t border-slate-100 mt-1"
        >
          Разрешите доступ к микрофону, чтобы увидеть имена устройств.
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pop-enter-active, .pop-leave-active { transition: all 150ms ease; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(4px); }
</style>
