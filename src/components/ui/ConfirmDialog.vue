<script setup>
import BaseButton from './BaseButton.vue';

defineProps({
  open: Boolean,
  title: { type: String, default: 'Подтвердить действие' },
  message: { type: String, default: 'Вы уверены?' },
  confirmText: { type: String, default: 'Удалить' },
  cancelText: { type: String, default: 'Отмена' },
  variant: { type: String, default: 'danger' }, // danger | primary
  loading: Boolean,
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-40 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        @keydown.esc="emit('cancel')"
      >
        <div
          class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          @click="emit('cancel')"
        />
        <div
          class="relative card w-full max-w-md p-6 animate-slide-up"
        >
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <p class="mt-2 text-slate-600 text-sm leading-relaxed">{{ message }}</p>

          <div class="mt-6 flex justify-end gap-2">
            <BaseButton variant="ghost" :disabled="loading" @click="emit('cancel')">
              {{ cancelText }}
            </BaseButton>
            <BaseButton :variant="variant" :loading="loading" @click="emit('confirm')">
              {{ confirmText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
