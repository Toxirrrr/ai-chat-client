<script setup>
defineProps({
  label: { type: String, required: true },
  active: Boolean,
  disabled: Boolean,
});
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    class="btn-icon disabled:opacity-40 disabled:cursor-not-allowed"
    :class="active ? 'bg-brand-50 text-brand-600 hover:bg-brand-100' : ''"
  >
    <slot />
  </button>
</template>
