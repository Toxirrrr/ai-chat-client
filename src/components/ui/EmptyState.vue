<script setup>
defineProps({
  title: { type: String, default: 'Начнём диалог' },
  subtitle: {
    type: String,
    default: 'Задай вопрос или продиктуй его голосом — AI ответит мгновенно.',
  },
  // Кликабельные подсказки. Если переданы — рендерятся ниже текста.
  suggestions: { type: Array, default: () => [] },
});

defineEmits(['suggestion']);
</script>

<template>
  <div class="flex flex-col items-center text-center max-w-lg mx-auto px-4 py-12 animate-fade-in">
    <div
      class="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center
             shadow-lg shadow-brand-600/30 mb-5"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-8 h-8"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </div>

    <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
      {{ title }}
    </h1>
    <p class="mt-3 text-slate-500 leading-relaxed">{{ subtitle }}</p>

    <div v-if="suggestions.length" class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
      <button
        v-for="s in suggestions"
        :key="s"
        type="button"
        class="text-left px-4 py-3 rounded-xl border border-slate-200 bg-white
               hover:border-brand-300 hover:bg-brand-50/50 transition text-sm text-slate-700"
        @click="$emit('suggestion', s)"
      >
        {{ s }}
      </button>
    </div>

    <slot />
  </div>
</template>
