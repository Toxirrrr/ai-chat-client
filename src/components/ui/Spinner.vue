<script setup>
defineProps({
  size: { type: String, default: 'md' }, // sm | md | lg
});

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
</script>

<template>
  <svg
    :class="['animate-spin text-brand-600', sizes[size]]"
    viewBox="0 0 24 24"
    fill="none"
    role="status"
    aria-label="Загрузка"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.2" stroke-width="4" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
  </svg>
</template>
