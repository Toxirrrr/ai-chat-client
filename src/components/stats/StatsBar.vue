<script setup>
import { computed } from 'vue';

const props = defineProps({
  stats: { type: Object, default: null },
  loading: Boolean,
});

const lastFormatted = computed(() => {
  if (!props.stats?.lastMessageAt) return '—';
  const d = new Date(props.stats.lastMessageAt);
  return d.toLocaleString();
});
</script>

<template>
  <div class="border-b border-slate-200 bg-slate-50/60 animate-slide-up">
    <div class="max-w-3xl mx-auto px-4 py-3 grid grid-cols-3 gap-3 text-sm">
      <div class="card p-3">
        <div class="text-slate-500 text-xs">Всего</div>
        <div class="mt-0.5 text-xl font-semibold">
          <span v-if="loading">—</span>
          <span v-else>{{ stats?.total ?? 0 }}</span>
        </div>
      </div>
      <div class="card p-3">
        <div class="text-slate-500 text-xs">Избранное</div>
        <div class="mt-0.5 text-xl font-semibold text-amber-500">
          <span v-if="loading">—</span>
          <span v-else>{{ stats?.favorites ?? 0 }}</span>
        </div>
      </div>
      <div class="card p-3">
        <div class="text-slate-500 text-xs">Последнее</div>
        <div class="mt-0.5 text-sm font-medium truncate" :title="lastFormatted">
          {{ lastFormatted }}
        </div>
      </div>
    </div>
  </div>
</template>
