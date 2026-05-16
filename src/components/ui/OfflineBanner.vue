<script setup>
import { useOnline } from '@/composables/useOnline';
const { isOnline } = useOnline();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="!isOnline"
      class="bg-rose-50 border-b border-rose-200 text-rose-800 text-sm"
      role="status"
      aria-live="polite"
    >
      <div class="max-w-3xl mx-auto px-4 py-2 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
          <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
        </svg>
        Нет соединения с интернетом
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 200ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
