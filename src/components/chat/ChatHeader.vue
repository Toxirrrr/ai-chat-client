<script setup>
import IconButton from '@/components/ui/IconButton.vue';

defineProps({
  searchActive: Boolean,
  statsActive: Boolean,
  favoritesOnly: Boolean,
});

defineEmits(['toggle-search', 'toggle-stats', 'toggle-favorites']);
</script>

<template>
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0">
    <div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h1 class="font-semibold tracking-tight text-slate-800">
          AI Assistant
        </h1>
      </div>

      <div class="flex items-center gap-1">
        <!-- Search -->
        <IconButton
          label="Поиск"
          :active="searchActive"
          @click="$emit('toggle-search')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </IconButton>

        <!-- Stats -->
        <IconButton
          label="Статистика"
          :active="statsActive"
          @click="$emit('toggle-stats')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <path d="M18 20V10" />
            <path d="M12 20V4" />
            <path d="M6 20v-6" />
          </svg>
        </IconButton>

        <!-- Favorites -->
        <IconButton
          label="Избранное"
          :active="favoritesOnly"
          @click="$emit('toggle-favorites')"
        >
          <svg viewBox="0 0 24 24" :fill="favoritesOnly ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </IconButton>
      </div>
    </div>
  </header>
</template>
