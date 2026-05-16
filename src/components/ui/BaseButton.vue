<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | ghost | danger
  type: { type: String, default: 'button' },
  disabled: Boolean,
  loading: Boolean,
});

const classes = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  danger:
    'btn bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] shadow-sm shadow-rose-600/20',
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="classes[variant]"
  >
    <svg
      v-if="loading"
      class="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="4" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
    </svg>
    <slot />
  </button>
</template>
