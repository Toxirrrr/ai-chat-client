<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  loading: Boolean,
});

defineEmits(['update:modelValue', 'clear']);
</script>

<template>
  <div class="border-b border-slate-200 bg-white animate-slide-up">
    <div class="max-w-3xl mx-auto px-4 py-3">
      <div
        class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50
               focus-within:bg-white focus-within:border-brand-300
               focus-within:ring-4 focus-within:ring-brand-100 transition px-3 py-2"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-slate-400">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>

        <input
          :value="modelValue"
          type="text"
          placeholder="Поиск по сообщениям..."
          class="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
          @input="$emit('update:modelValue', $event.target.value)"
        />

        <div v-if="loading" class="w-4 h-4">
          <svg class="w-4 h-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="4" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
          </svg>
        </div>

        <button
          v-else-if="modelValue"
          type="button"
          class="text-slate-400 hover:text-slate-600 transition"
          aria-label="Очистить"
          @click="$emit('clear')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
