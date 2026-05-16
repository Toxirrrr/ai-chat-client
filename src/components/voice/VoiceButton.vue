<script setup>
defineProps({
  recording: Boolean,
  supported: { type: Boolean, default: true },
  disabled: Boolean,
});

defineEmits(['toggle']);
</script>

<template>
  <button
    type="button"
    class="btn-icon relative shrink-0"
    :class="[
      recording ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : '',
      !supported ? 'opacity-40 cursor-not-allowed' : '',
    ]"
    :disabled="disabled || !supported"
    :aria-label="recording ? 'Остановить запись' : 'Начать запись'"
    :title="supported ? (recording ? 'Стоп' : 'Голосовой ввод') : 'Распознавание речи не поддерживается'"
    @click="$emit('toggle')"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
      <rect x="9" y="2" width="6" height="13" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
    </svg>

    <span
      v-if="recording"
      class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"
    />
  </button>
</template>
