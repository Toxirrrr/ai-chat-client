<script setup>
import { useToast } from '@/composables/useToast';

const { toasts, dismiss } = useToast();

const styleByType = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  info: 'bg-slate-50 border-slate-200 text-slate-800',
};
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]"
      role="region"
      aria-live="polite"
    >
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="rounded-xl border px-4 py-3 shadow-sm flex items-start gap-3"
          :class="styleByType[t.type]"
        >
          <span class="flex-1 text-sm leading-relaxed">{{ t.message }}</span>
          <button
            type="button"
            class="opacity-60 hover:opacity-100 transition"
            :aria-label="`Закрыть уведомление`"
            @click="dismiss(t.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 class="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 200ms ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
